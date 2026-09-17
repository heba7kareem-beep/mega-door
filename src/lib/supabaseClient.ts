import { createClient } from "@supabase/supabase-js";

/**
 * إعداد عميل Supabase لتسجيل الدخول الحقيقي للوحة الإدارة (Supabase Auth).
 *
 * الرابط والمفتاح أدناه "publishable" علناً بالتصميم - نفس فكرة مفتاح anon بمشاريع
 * Supabase: مصمَّم ليكون ضمن كود الواجهة الأمامية العام (أي متصفح يقدر يشوفه)، ولا
 * يعطي أي صلاحية وصول للبيانات بحد ذاته. التحقق الحقيقي من الهوية (البريد وكلمة
 * المرور) يصير بالكامل على سيرفرات Supabase نفسها عبر signInWithPassword، وليس أي
 * قيمة مخزَّنة هنا بالكود - هذا الفرق الجوهري عن الحماية القديمة بكلمة مرور ثابتة
 * بالمتصفح.
 *
 * مشروع Supabase: mega-door (ref: ecyxhlkkvjhensgymgdw، منطقة eu-central-1).
 */
const SUPABASE_URL = "https://ecyxhlkkvjhensgymgdw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GrybiRkE_gvw_a5y0-jDVg_CqD82ivD";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
