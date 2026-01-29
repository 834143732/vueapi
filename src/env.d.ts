interface ImportMetaEnv {
    readonly VITE_AUTH_API_URL: string;
    readonly VITE_TITLE: string;
    readonly VITE_UPLOAD_MODE?: string;
    readonly VITE_THUMBNAIL_UPLOAD_MODE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
