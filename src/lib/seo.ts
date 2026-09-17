const SITE_BASE = "https://megadoor.iq";
const DEFAULT_OG_IMAGE = `${SITE_BASE}/images/brand/mega-door-logo.png`;

function setMetaTag(selector: string, attr: string, attrValue: string, content: string) {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/**
 * يحدّث عنوان الصفحة، meta description، og:title/description/image، ورابط canonical
 * بشكل ديناميكي بدون مكتبات إضافية. يُستدعى من كل صفحة عند تحميلها.
 *
 * `image` اختياري: مسار نسبي (يبدأ بـ /) أو رابط مطلق لصورة الصفحة نفسها (مثال: صورة
 * الموديل بصفحة تفاصيله) لتظهر بمعاينة الرابط عند مشاركته بواتساب/فيسبوك. إن لم يُمرَّر
 * تُستخدم صورة الشعار الافتراضية حتى لا تبقى صورة صفحة سابقة عالقة بعد تنقل SPA.
 */
export function setPageSEO(params: { title: string; description: string; path?: string; image?: string }) {
  document.title = params.title;

  setMetaTag('meta[name="description"]', "name", "description", params.description);
  setMetaTag('meta[property="og:title"]', "property", "og:title", params.title);
  setMetaTag('meta[property="og:description"]', "property", "og:description", params.description);

  const absoluteImage = params.image
    ? params.image.startsWith("http")
      ? params.image
      : `${SITE_BASE}${params.image}`
    : DEFAULT_OG_IMAGE;
  setMetaTag('meta[property="og:image"]', "property", "og:image", absoluteImage);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", params.path ? `${SITE_BASE}${params.path}` : SITE_BASE);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement("meta");
    ogUrl.setAttribute("property", "og:url");
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute("content", params.path ? `${SITE_BASE}${params.path}` : SITE_BASE);
}
