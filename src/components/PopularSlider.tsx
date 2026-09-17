import { useState } from "react";
import { Link } from "react-router-dom";
import type { DoorModel } from "../types/model";

const PER_PAGE = 2;

/**
 * سلايدر "الأكثر طلباً هذا الشهر" بالصفحة الرئيسية - يعرض كل الموديلات التجريبية
 * صفحتين في كل مرة (مطابقة لسلوك المعاينة المعتمدة)، مع أسهم تنقّل ونقاط صفحات.
 */
export default function PopularSlider({ models }: { models: DoorModel[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(models.length / PER_PAGE);
  const start = page * PER_PAGE;
  const pageItems = models.slice(start, start + PER_PAGE);

  function goPrev() {
    setPage((p) => (p - 1 + totalPages) % totalPages);
  }
  function goNext() {
    setPage((p) => (p + 1) % totalPages);
  }

  return (
    <div>
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={goPrev}
          aria-label="الموديلات السابقة"
          data-ambient-hover
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xl text-ink transition hover:border-brand hover:text-brand"
        >
          ‹
        </button>

        <div className="grid flex-1 grid-cols-2 gap-5">
          {pageItems.map((m) => (
            <Link
              key={m.id}
              to={`/model/${m.id}`}
              data-ambient-hover
              className="door-glow relative block aspect-[3/4] overflow-hidden rounded-[20px] border border-border bg-surface transition hover:-translate-y-[3px]"
            >
              <img
                src={m.images[0]}
                alt={`باب ${m.name} - موديل ${m.modelNumber}`}
                loading="lazy"
                data-ambient-safe
                className="image-fade-bottom h-full w-full object-contain"
              />
              <div className="absolute bottom-4 right-[18px] max-w-[75%]">
                <p className="font-display text-[19px] font-extrabold text-white [text-shadow:0_2px_10px_rgba(0,0,0,.5)]">
                  {m.modelNumber}
                </p>
                {m.styleLabel && (
                  <p className="mt-0.5 text-[12.5px] text-white/80 [text-shadow:0_2px_8px_rgba(0,0,0,.5)]">
                    {m.styleLabel}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="الموديلات التالية"
          data-ambient-hover
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xl text-ink transition hover:border-brand hover:text-brand"
        >
          ›
        </button>
      </div>

      <div className="mt-[22px] flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPage(i)}
            aria-label={`صفحة ${i + 1}`}
            className={`h-[7px] rounded-full transition-all ${
              i === page ? "w-5 bg-brand" : "w-[7px] bg-ink/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
