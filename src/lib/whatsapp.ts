import type { DoorModel } from "../types/model";

/** رقم واتساب الشركة بصيغة دولية (بدون + وبدون أصفار بادئة) */
export const WHATSAPP_NUMBER = "9647751420001";

/**
 * يبني رابط واتساب مع رسالة جاهزة تحتوي اسم ورقم الموديل.
 * يُستخدم في زر "استفسار عن هذا الموديل".
 */
export function buildModelInquiryLink(model: DoorModel): string {
  const message = `مرحباً، أريد الاستفسار عن موديل: ${model.name} (كود الموديل: ${model.modelNumber})`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** رابط واتساب عام (بدون رسالة عن موديل محدد) - يُستخدم في الهيدر/الفوتر وزر التواصل العائم */
export function buildGeneralWhatsAppLink(): string {
  const message = "مرحباً، أريد الاستفسار عن أبواب ميكا.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
