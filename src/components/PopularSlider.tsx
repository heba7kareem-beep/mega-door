import ProductCard from "./ProductCard";
import type { DoorModel } from "../types/model";

/**
 * سلايدر "الأكثر طلباً هذا الشهر" بالصفحة الرئيسية - يستخدم نفس بطاقة
 * الموديل (ProductCard) المستخدمة بصفحات الأقسام بالضبط، حتى يطلع بنفس
 * القياس تماماً بدون أي فرق حجم بين القسمين.
 *
 * بالهاتف/التابلت (أقل من lg): سحب أفقي، بطاقة كبيرة بكل مرة (scroll-snap).
 * من lg فأكبر: نفس شبكة صفحات الأقسام (4 أعمدة) بدون أسهم أو ترقيم صفحات.
 */
export default function PopularSlider({ models }: { models: DoorModel[] }) {
  return (
    <div>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-1 lg:hidden">
        {models.map((m) => (
          <div key={m.id} className="w-[86%] shrink-0 snap-center sm:w-[60%]">
            <ProductCard model={m} />
          </div>
        ))}
      </div>

      <div className="hidden gap-4 sm:gap-6 lg:grid lg:grid-cols-4">
        {models.map((m) => (
          <ProductCard key={m.id} model={m} />
        ))}
      </div>
    </div>
  );
}
