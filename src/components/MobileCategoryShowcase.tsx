import { Link } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

const BASE = import.meta.env.BASE_URL;

// صور تمثيلية حقيقية لكل قسم (لا رسومات توضيحية) - بانتظار صور حقيقية مخصّصة
// لقسم "القواطع" تحديداً (لا توجد بعد في أرشيف الصور)، فتُستخدم صورة الهيرو
// كبديل مؤقت أمين بدل اختراع/استخدام صورة لا تمثّل القسم فعلاً.
const categoryImages: Record<string, string> = {
  interior: `${BASE}images/models/md-108-1.jpg`,
  exterior: `${BASE}images/brand/exterior-category.jpg`,
  partitions: `${BASE}images/brand/hero-door.jpg`,
};

/**
 * صف بطاقات كبيرة قابلة للسحب أفقياً - بديل روابط الأقسام المحذوفة من الهيدر
 * بالهاتف (انظر Header.tsx). يظهر فقط تحت lg لأن الحاسبة تعرض الأقسام كاملة
 * بالهيدر نفسه.
 */
export default function MobileCategoryShowcase() {
  const categories = useCategories();

  return (
    <section className="lg:hidden" data-ambient-density="moderate">
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 sm:px-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            to={`/${c.id}`}
            data-ambient-hover
            className="door-glow relative block aspect-[4/5] w-[78%] shrink-0 snap-center overflow-hidden rounded-[20px] border border-silver/25 bg-surface"
          >
            <img
              src={categoryImages[c.id] ?? categoryImages.partitions}
              alt={c.label}
              loading="lazy"
              data-ambient-safe
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-5 py-5">
              <p className="font-display text-lg font-extrabold text-white">{c.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
