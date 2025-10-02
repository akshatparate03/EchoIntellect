/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_APPS_SCRIPT_URL?: string;
  // add other VITE_ vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
