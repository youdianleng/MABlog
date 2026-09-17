"""SSRF-resistant HTTPS retrieval with redirect, robots, size, and media limits."""

from dataclasses import dataclass
import ipaddress
import socket
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser

import httpx

from ...config import NEWS_CRAWLER_USER_AGENT, NEWS_FETCH_MAX_BYTES, NEWS_FETCH_MAX_REDIRECTS, NEWS_FETCH_TIMEOUT_SECONDS

ALLOWED_MEDIA_TYPES = {
    "text/html",
    "text/plain",
    "text/markdown",
    "application/pdf",
    "application/xhtml+xml",
}


class SafeFetchError(RuntimeError):
    """Represent a content-safe fetch rejection or transient network failure."""


@dataclass(frozen=True)
class FetchedDocument:
    """Bounded bytes and response metadata from one validated public HTTPS URL."""

    url: str
    canonical_url: str
    media_type: str
    body: bytes


def canonical_url(url: str) -> str:
    """Normalize host casing, the default port, fragments, and an empty path for deduplication."""
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError as error:
        raise SafeFetchError("unsafe_port") from error
    hostname = (parsed.hostname or "").lower()
    netloc = hostname if port in {None, 443} else f"{hostname}:{port}"
    return urlunsplit(("https", netloc, parsed.path or "/", parsed.query, ""))


def validate_public_https(url: str) -> str:
    """Reject credentials, non-HTTPS schemes, nonstandard ports, and non-public resolved addresses."""
    try:
        parsed = urlsplit(url)
        port = parsed.port
    except ValueError as error:
        raise SafeFetchError("unsafe_port") from error
    if parsed.scheme.lower() != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise SafeFetchError("unsafe_url")
    if port not in {None, 443}:
        raise SafeFetchError("unsafe_port")
    try:
        addresses = {item[4][0] for item in socket.getaddrinfo(parsed.hostname, 443, type=socket.SOCK_STREAM)}
    except socket.gaierror as error:
        raise SafeFetchError("dns_failure") from error
    if not addresses:
        raise SafeFetchError("dns_empty")
    for address in addresses:
        value = ipaddress.ip_address(address)
        if not value.is_global or value.is_private or value.is_loopback or value.is_link_local or value.is_multicast or value.is_reserved or value.is_unspecified:
            raise SafeFetchError("unsafe_address")
    return canonical_url(url)


def _robots_allowed(client: httpx.Client, url: str) -> bool:
    """Honor an available robots file while treating absence or transport failure as no rule."""
    parsed = urlsplit(url)
    robots_url = f"https://{parsed.hostname}/robots.txt"
    try:
        validate_public_https(robots_url)
        response = client.get(robots_url, headers={"User-Agent": NEWS_CRAWLER_USER_AGENT})
    except (httpx.HTTPError, SafeFetchError):
        return True
    if response.status_code != 200 or len(response.content) > 512_000:
        return True
    parser = RobotFileParser()
    parser.set_url(robots_url)
    parser.parse(response.text.splitlines())
    return parser.can_fetch(NEWS_CRAWLER_USER_AGENT, url)


def fetch_public_document(url: str) -> FetchedDocument:
    """Fetch a bounded supported document and revalidate every redirect destination."""
    current = validate_public_https(url)
    timeout = httpx.Timeout(NEWS_FETCH_TIMEOUT_SECONDS)
    with httpx.Client(timeout=timeout, follow_redirects=False, trust_env=False) as client:
        if not _robots_allowed(client, current):
            raise SafeFetchError("robots_disallowed")
        for redirect_count in range(NEWS_FETCH_MAX_REDIRECTS + 1):
            validate_public_https(current)
            try:
                with client.stream("GET", current, headers={"User-Agent": NEWS_CRAWLER_USER_AGENT, "Accept": ", ".join(sorted(ALLOWED_MEDIA_TYPES))}) as response:
                    if response.status_code in {301, 302, 303, 307, 308}:
                        if redirect_count >= NEWS_FETCH_MAX_REDIRECTS:
                            raise SafeFetchError("too_many_redirects")
                        location = response.headers.get("location")
                        if not location:
                            raise SafeFetchError("redirect_without_location")
                        current = validate_public_https(urljoin(current, location))
                        continue
                    if response.status_code >= 500 or response.status_code == 429:
                        raise SafeFetchError(f"fetch_http_{response.status_code}")
                    if response.status_code >= 400:
                        raise SafeFetchError(f"fetch_rejected_{response.status_code}")
                    media_type = response.headers.get("content-type", "").split(";", 1)[0].strip().lower()
                    if media_type not in ALLOWED_MEDIA_TYPES:
                        raise SafeFetchError("unsupported_media_type")
                    length = int(response.headers.get("content-length", "0") or 0)
                    if length > NEWS_FETCH_MAX_BYTES:
                        raise SafeFetchError("body_too_large")
                    body = bytearray()
                    for chunk in response.iter_bytes():
                        body.extend(chunk)
                        if len(body) > NEWS_FETCH_MAX_BYTES:
                            raise SafeFetchError("body_too_large")
                    return FetchedDocument(url=current, canonical_url=canonical_url(current), media_type=media_type, body=bytes(body))
            except httpx.HTTPError as error:
                raise SafeFetchError("fetch_transport_error") from error
    raise SafeFetchError("fetch_unreachable")
