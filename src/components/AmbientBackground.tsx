/**
 * طبقة خلفية بصرية ثابتة فوق كامل الشاشة خلف المحتوى (z-0، pointer-events:
 * none): خطوط هندسية ناعمة متحركة بدرجات أزرق/فضي خافتة جداً (نفس ألوان
 * الهوية، بدون أي لون جديد) بدل الجسيمات المتناثرة سابقاً. حركة بطيئة
 * ومستمرة عبر CSS فقط (انظر .ambient-lines بـ index.css) - بدون أي منطق
 * JS، وتحترم prefers-reduced-motion تلقائياً.
 */
export default function AmbientBackground() {
  return <div aria-hidden="true" className="ambient-lines pointer-events-none fixed inset-0 z-0" />;
}
