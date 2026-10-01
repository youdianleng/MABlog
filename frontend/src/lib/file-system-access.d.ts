/**
 * Chromium's File System Access additions that TypeScript's DOM library does not ship yet,
 * because the directory picker and handle permissions are still a WICG draft.
 * Only the members MAblog uses are declared. Callers must feature-detect `showDirectoryPicker`.
 */

type FileSystemPermissionMode = "read" | "readwrite";

interface FileSystemHandlePermissionDescriptor {
  mode?: FileSystemPermissionMode;
}

interface FileSystemHandle {
  queryPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  requestPermission?(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
}

interface DirectoryPickerOptions {
  /** Lets the browser remember the last folder used for this purpose. */
  id?: string;
  mode?: FileSystemPermissionMode;
  startIn?: "desktop" | "documents" | "downloads" | FileSystemHandle;
}

interface Window {
  showDirectoryPicker?(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
}
