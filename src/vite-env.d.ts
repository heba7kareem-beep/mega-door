/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** رقم Meta Pixel الحقيقي - اختياري. إن لم يكن موجوداً يبقى تتبّع Pixel معطّلاً بأمان. */
  readonly VITE_META_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
