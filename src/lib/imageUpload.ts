import { supabase } from "./supabaseClient";
import { fileToResizedBlob } from "./imageResize";

/**
 * يصغّر ملف صورة ويرفعه فعلياً إلى Supabase Storage (bucket عام "site-images")
 * ويعيد رابطه العام النهائي - يُستخدم من لوحة الإدارة لرفع صور الموديلات
 * وصورة الهيرو، بحيث تظهر الصورة الجديدة لكل زوار الموقع فوراً بعد الحفظ.
 */
export async function uploadImage(file: File, folder: "models" | "site"): Promise<string> {
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
