import { Link } from "react-router-dom";
import type { DoorModel } from "../types/model";
import { buildModelInquiryLink } from "../lib/whatsapp";
import { trackContact } from "../lib/metaPixel";

/**
 * بطاقة موديل تُستخدم بكل مكان يظهر فيه (صفحات الأقسام، الأكثر طلباً،
 * البحث). الصورة والتفاصيل تودي لصفحة الموديل، وزر واتساب منفصل تحتها
 * يرسل استفسار مباشر عن هذا الموديل بالذات بدون المرور بصفحة التفاصيل -
 * كل موديل بكل قسم يوصل لواتساب مباشرة، ما فيه سلة شراء بالموقع.
 */
export default function ProductCard({ model }: { model: DoorModel }) {
  const subtitle = [model.material, model.color, model.dimensions].filter(Boolean).join(" · ");

  return (
    <div className="door-glow group overflow-hidden rounded-2xl border border-silver/25 bg-surface transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <Link to={`/model/${model.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-canvas">
          <img
            src={model.images[0]}
            alt={`باب ${model.name} - موديل ${model.modelNumber}`}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
          {model.isPopular && (
            <span className="absolute top-3 right-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
              الأكثر طلباً
            </span>
          )}
        </div>
        <div className="p-5 pb-3">
          <p className="text-xs font-medium text-muted">{model.modelNumber}</p>
          <h3 className="mt-1 font-display text-base font-bold text-ink">{model.name}</h3>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
      </Link>
      <div className="px-5 pb-5">
        <a
          href={buildModelInquiryLink(model)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackContact("product_card")}
          className="flex w-full items-center justify-center gap-1.5 rounded-full bg-whatsapp px-3 py-2 text-xs font-bold text-white transition hover:brightness-105"
        >
          استفسر عبر واتساب
        </a>
      </div>
    </div>
  );
}
