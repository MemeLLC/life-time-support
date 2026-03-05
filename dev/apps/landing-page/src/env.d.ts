interface ImportMetaEnv {
  PUBLIC_GTM_CONTAINER_ID: string | undefined;
  PUBLIC_LINE_URL: string;
  PUBLIC_MAIL_SERVER_URL: string;
  PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
