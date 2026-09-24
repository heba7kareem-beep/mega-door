import type { DoorModel } from "../types/model";

/** رقم واتساب الشركة بصيغة دولية (بدون + وبدون أصفار بادئة).
 * ⚠️ مؤقتاً مبدّل لرقم اختبار (+9647866300946) بطلب صريح من العميلة لتجربة
 * طلبات "صمم تفاصيل باب مخصصة بالكامل" - يُطبَّق على كل روابط واتساب بالموقع
 * (الزر العائم، الفوتر، صفحات الأقسام الفارغة، الاستفسار عن موديل، وهذا النموذج).
 * الرقم الأصلي: 9647751420001 - أعيديه بمجرد ما تخلصين التجربة. */
export const WHATSAPP_NUMBER = "9647866300946";

/**
 * يبني رابط واتساب مع رسالة جاهزة تحتوي اسم ورقم الموديل ورابط صفحة الموديل
 * بالموقع (مو رابط الصورة مباشرة) - انظر ملاحظة مهمة أدناه.
 *
 * ⚠️ روابط صور Supabase Storage المباشرة ترجع بترويسة HTTP باسم
 * `X-Robots-Tag: none` (إعداد افتراضي من Supabase نفسه، ما نتحكم فيه من كود
 * الموقع) - هذي الترويسة تمنع أي زاحف محترم (بضمنه زاحف واتساب/فيسبوك) من
 * توليد معاينة لتلك الصورة، بغض النظر شنو نسوي بالكود. لهذا السبب رابط صورة
 * Supabase وحده ما يطلع كمعاينة، يطلع نص عادي بس.
 *
 * الحل: بدل ربط رسالة واتساب بالصورة مباشرة، نربطها بصفحة الموديل بموقعنا
 * (مثال: /model/a1) - هذي الصفحة عندها نسخة HTML ثابتة مبنية وقت النشر (انظر
 * scripts/generate-model-share-pages.mjs) فيها وسوم Open Graph صحيحة
 * (og:title/og:description/og:image) مكتوبة مباشرة بالـ HTML، يقرأها أي
 * زاحف بدون تشغيل جافاسكربت. GitHub Pages ما يضيف ترويسة X-Robots-Tag
 * إطلاقاً، فالصفحة نفسها قابلة للزحف بشكل طبيعي.
 *
 * ملاحظة: صورة og:image بهذي الصفحة الثابتة لسا رابط Supabase بحد ذاته
 * (نفس ترويسة X-Robots-Tag)، فمعاينة "الصورة المصغّرة تحديداً" غير مضمونة
 * 100%، بس العنوان والوصف مضمونين يطلعون صح بكل الحالات (تحسّن حقيقي عن
 * الوضع السابق بكل الأحوال).
 */
export function buildModelInquiryLink(model: DoorModel): string {
  const lines = [
    `مرحباً، أريد الاستفسار عن موديل: ${model.name} (كود الموديل: ${model.modelNumber})`,
    `رابط الموديل: ${window.location.origin}${import.meta.env.BASE_URL}model/${model.id}/`,
  ];
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/** رابط واتساب عام (بدون رسالة عن موديل محدد) - يُستخدم في الهيدر/الفوتر وزر التواصل العائم */
export function buildGeneralWhatsAppLink(): string {
  const message = "مرحباً، أريد الاستفسار عن أبواب ميكا.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * يبني رابط واتساب من بيانات نموذج "صمم تفاصيل باب مخصصة بالكامل": القياس
 * والملاحظات ورابط صورة التصميم (مرفوعة فعلياً لـ Supabase Storage قبل بناء
 * هذا الرابط - انظر imageUpload.ts) - واتساب يعرض معاينة الصورة تلقائياً
 * لما يكون رابطها بنص الرسالة.
 */
export function buildCustomDesignInquiryLink(params: {
  width: string;
  height: string;
  note: string;
  photoUrl: string | null;
  modelName?: string;
  modelNumber?: string;
}): string {
  const lines = ["مرحباً، أريد طلب تصميم باب مخصص:"];
  if (params.modelName) {
    lines.push(`الموديل الأساس: ${params.modelName}${params.modelNumber ? ` (${params.modelNumber})` : ""}`);
  }
  if (params.width && params.height) {
    lines.push(`القياس المطلوب: ${params.width}×${params.height} سم`);
  } else if (params.width || params.height) {
    lines.push(`القياس المطلوب: ${params.width || "؟"}×${params.height || "؟"} سم`);
  }
  if (params.note.trim()) {
    lines.push(`ملاحظات: ${params.note.trim()}`);
  }
  if (params.photoUrl) {
    lines.push(`صورة التصميم: ${params.photoUrl}`);
  }
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
