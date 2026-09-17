/** Render the approved black, gold, and crimson star-ring background behind the Discover hero. */
export function CelestialBackground() {
  return (
    <svg
      className="home-celestial-background"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="home-orbit-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c3a32" stopOpacity="0.08" />
          <stop offset="0.28" stopColor="#d19b4e" stopOpacity="0.56" />
          <stop offset="0.52" stopColor="#fff0ae" stopOpacity="0.9" />
          <stop offset="0.76" stopColor="#c77e3c" stopOpacity="0.48" />
          <stop offset="1" stopColor="#793137" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="home-orbit-crimson" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#6d2431" stopOpacity="0" />
          <stop offset="0.5" stopColor="#b94d4b" stopOpacity="0.48" />
          <stop offset="1" stopColor="#6d2431" stopOpacity="0" />
        </linearGradient>
        <g id="home-four-point-star">
          <path d="M 0 -18 C 3 -6 6 -3 19 0 C 6 3 3 6 0 19 C -3 6 -6 3 -19 0 C -6 -3 -3 -6 0 -18 Z" />
          <circle r="2.6" />
        </g>
        <g id="home-diamond-star">
          <path d="M 0 -12 L 5 -4 L 13 0 L 5 4 L 0 13 L -5 4 L -13 0 L -5 -4 Z" />
        </g>
      </defs>

      {/* The 1440 × 900 coordinate system keeps all three ellipses centered while the SVG scales responsively. */}
      <g className="home-orbit-system" fill="none" transform="rotate(-4 720 470)">
        <ellipse className="home-orbit home-orbit-outer" cx="720" cy="470" rx="682" ry="354" />
        <ellipse className="home-orbit home-orbit-middle" cx="720" cy="470" rx="526" ry="268" />
        <ellipse className="home-orbit home-orbit-inner" cx="720" cy="470" rx="354" ry="177" />
        <ellipse className="home-orbit-trace home-trace-outer" cx="720" cy="470" rx="682" ry="354" />
        <ellipse className="home-orbit-trace home-trace-middle" cx="720" cy="470" rx="526" ry="268" />
        <ellipse className="home-orbit-crimson" cx="720" cy="470" rx="430" ry="220" />
      </g>

      {/* Uneven origins place the static stars inside and outside the rings without a costly SVG blur filter. */}
      <g className="home-free-star home-star-one" transform="translate(186 164)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-diamond-star" />
      </g>
      <g className="home-free-star home-star-two" transform="translate(545 112)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-four-point-star" />
      </g>
      <g className="home-free-star home-star-three" transform="translate(1018 150)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-diamond-star" />
      </g>
      <g className="home-free-star home-star-four" transform="translate(1260 336)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-four-point-star" />
      </g>
      <g className="home-free-star home-star-five" transform="translate(246 454)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-four-point-star" />
      </g>
      <g className="home-free-star home-star-six" transform="translate(435 684)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-diamond-star" />
      </g>
      <g className="home-free-star home-star-seven" transform="translate(1124 704)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-diamond-star" />
      </g>
      <g className="home-free-star home-star-eight" transform="translate(762 610)">
        <circle className="home-star-seed" r="2.4" />
        <use className="home-star-glyph" href="#home-four-point-star" />
      </g>
    </svg>
  );
}
