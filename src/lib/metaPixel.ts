/**
 * غلاف بسيط لـ Meta Pixel، وأحداث PageView / ViewContent / Contact جاهزة ومربوطة
 * بكل الموقع (App.tsx، ModelDetailPage.tsx، WhatsAppButton.tsx، Footer.tsx).
 *
 * التفعيل الفعلي معلّق على رقم Pixel حقيقي فقط - ما إن يتوفر:
 * أضِف ملف `.env` بجذر المشروع فيه سطر:
 *   VITE_META_PIXEL_ID=1234567890
 * وأعد تشغيل `npm run dev` أو `npm run build` - يشتغل تلقائياً بدون أي تعديل كود إضافي.
 *
 * كل الدوال أدناه "آمنة" حتى بدون رقم Pixel: إن لم يكن مُفعّلاً فلن تفعل شيئاً.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

/** يحقن سكربت Meta Pixel الرسمي ويهيّئه، فقط إذا كان VITE_META_PIXEL_ID موجوداً بالبيئة. */
export function initMetaPixel() {
  const pixelId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
  if (!pixelId || typeof window === "undefined" || window.fbq) return;

  /* eslint-disable */
  (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq!("init", pixelId);
}

export function trackPageView() {
  fbq("track", "PageView");
}

export function trackViewContent(params: { modelNumber: string; modelName: string; category: string }) {
  fbq("track", "ViewContent", {
    content_name: params.modelName,
    content_ids: [params.modelNumber],
    content_category: params.category,
  });
}

export function trackContact(source: string) {
  fbq("track", "Contact", { source });
}
