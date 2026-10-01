/**
 * Browser-local storage of the folder where MAblog may save Markdown files.
 *
 * The folder is chosen with the File System Access directory picker (Chromium desktop browsers).
 * The resulting handle never reveals a full path; it grants access only inside that folder. It is
 * kept in IndexedDB, which can store handles, under a per-account key so different accounts on
 * one browser keep separate folders. Nothing is sent to the server. Browsers usually require the
 * user to re-approve write access in a later session, so callers check permission before use.
 */

const DATABASE_NAME = "mablog-local";
const DATABASE_VERSION = 1;
const STORE_NAME = "directory-handles";
// Shared picker id: the browser reopens the picker in the last folder chosen for MAblog Markdown.
const PICKER_ID = "mablog-markdown";

/** Whether this browser can pick and keep a writable folder. */
export function isDirectoryPickerSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.showDirectoryPicker === "function" &&
    typeof indexedDB !== "undefined"
  );
}

/** IndexedDB key for one account's Markdown folder. */
function storageKey(userId: string): string {
  return `markdown:${userId}`;
}

/** Open (and on first use create) the local database that holds directory handles. */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise(
    /** Resolve with the opened database or reject with the IndexedDB error. */ (
      resolve,
      reject,
    ) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = /** Create the handle store on first open. */ () => {
        request.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = /** Hand back the ready database. */ () => resolve(request.result);
      request.onerror = /** Surface open failures (private mode, blocked storage). */ () =>
        reject(request.error);
    },
  );
}

/** Run one request against the handle store and close the database afterwards. */
async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>(
      /** Resolve with the request result once the transaction completes. */ (resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const request = action(transaction.objectStore(STORE_NAME));
        transaction.oncomplete = /** Report the stored or read value. */ () =>
          resolve(request.result);
        transaction.onerror = /** Report a failed read or write. */ () => reject(transaction.error);
      },
    );
  } finally {
    database.close();
  }
}

/** Return the saved folder for an account, or null when none is saved or storage is unavailable. */
export async function loadMarkdownDirectory(
  userId: string,
): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await withStore<FileSystemDirectoryHandle | undefined>(
      "readonly",
      /** Read this account's handle. */ (store) => store.get(storageKey(userId)),
    );
    return handle ?? null;
  } catch {
    return null;
  }
}

/** Remember an account's folder in this browser. Throws if browser storage is unavailable. */
export async function saveMarkdownDirectory(
  userId: string,
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  await withStore(
    "readwrite",
    /** Store or replace this account's handle. */ (store) => store.put(handle, storageKey(userId)),
  );
}

/** Forget an account's folder in this browser. The folder and its files are not touched. */
export async function forgetMarkdownDirectory(userId: string): Promise<void> {
  await withStore(
    "readwrite",
    /** Remove this account's handle. */ (store) => store.delete(storageKey(userId)),
  );
}

/**
 * Open the browser's folder picker with read-write access.
 *
 * Must be called from a user gesture (a click). Returns null when the user cancels the picker;
 * other failures (for example a system folder the browser refuses) are thrown.
 */
export async function pickMarkdownDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!window.showDirectoryPicker) throw new Error("Folder selection is not supported");
  try {
    return await window.showDirectoryPicker({ id: PICKER_ID, mode: "readwrite" });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    throw error;
  }
}

/**
 * Check, and optionally request, write permission for a saved folder.
 *
 * Requesting shows a browser prompt and therefore must happen inside a user gesture. Browsers
 * without permission methods are treated as granted because they only hand out live handles.
 */
export async function markdownDirectoryPermission(
  handle: FileSystemDirectoryHandle,
  request = false,
): Promise<PermissionState> {
  const descriptor = { mode: "readwrite" as const };
  if (!handle.queryPermission) return "granted";
  const current = await handle.queryPermission(descriptor);
  if (current === "granted" || !request || !handle.requestPermission) return current;
  return handle.requestPermission(descriptor);
}

// A plain file name: no folders, no leading dot, ending in .md. Keeps writes inside the chosen folder.
const MARKDOWN_FILENAME = /^[A-Za-z0-9][A-Za-z0-9._-]*\.md$/;

/**
 * Create or replace one Markdown file directly inside the chosen folder.
 *
 * The caller must already hold write permission (see `markdownDirectoryPermission`). Existing
 * content is replaced only after the new content is fully written, because the browser commits a
 * writable stream atomically on close.
 *
 * @throws Error for an unsafe file name, or the browser's DOMException when writing fails.
 */
export async function writeMarkdownFile(
  directory: FileSystemDirectoryHandle,
  filename: string,
  content: string,
): Promise<void> {
  if (!MARKDOWN_FILENAME.test(filename)) throw new Error(`Unsafe Markdown file name: ${filename}`);
  const file = await directory.getFileHandle(filename, { create: true });
  const writable = await file.createWritable();
  try {
    await writable.write(content);
    await writable.close();
  } catch (error) {
    await writable.abort();
    throw error;
  }
}
