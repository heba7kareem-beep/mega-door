import { supabase } from "./supabaseClient";
import { fileToResizedBlob } from "./imageResize";

/**
 * يصغّر ملف صورة ويرفعه فعلياً إلى Supabase Storage (bucket عام "site-images")
 * ويعيد رابطه العام النهائي.
 *
 * "models" و"site" يُستخدمان من لوحة الإدارة (يتطلبان تسجيل دخول - انظر
 * سياسات RLS). "custom-designs" يُستخدم من نموذج "صمم تفاصيل باب مخصصة
 * بالكامل" العام - له سياسة رفع خاصة تسمح لأي زائر (بدون تسجيل دخول) يرفع
 * صورة تصميمه، محصورة بهذا المجلد فقط.
 */
export async function uploadImage(file: File, folder: "models" | "site" | "custom-designs"): Promise<string> {
  const { blob, contentType } = await fileToResizedBlob(file);
  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("site-images").upload(path, blob, {
    contentType,
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("site-images").getPublicUrl(path);
  return data.publicUrl;
}
