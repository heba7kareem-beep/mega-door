import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { setPageSEO } from "../lib/seo";
import DoorConfigurator from "../components/DoorConfigurator";

const paths = [
  {
    title: "اختر لون جاهز",
    desc: "شاهد ألواننا العصرية واختر ما يناسب ذوقك مباشرة",
  },
  {
    title: "اختر من موديلاتنا الجاهزة",
    desc: "تصفّح الموديلات المتوفرة وحدّد لونها وقياسها",
    to: "/interior",
  },
  {
    title: "صمّم تفاصيل مخصصة بالكامل",
    desc: "اللون، الخامة، التصميم، والقياس - كله حسب طلبك",
  },
];

/**
 * صفحة مستقلة كاملة لتخصيص الباب - وصلت إليها بطاقة تعريفية بسيطة بالصفحة
 * الرئيسية (صورة + عبارة فقط، بدون تفاصيل). الخيارات الثلاثة بالأعلى توضّح
 * طرق التخصيص المتاحة: لون جاهز أو تصميم مخصص بالكامل يستخدمان نفس أداة
 * التخصيص أدناه، بينما اختيار موديل جاهز يوجّه لتصفّح الكتالوج.
 */
export default function DesignYourDoorPage() {
  const configuratorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPageSEO({
      title: "صمم بابك بنفسك | ميكا للأبواب",
      description: "اختر لون بابك، أو تصفّح موديلاتنا الجاهزة، أو صمم تفاصيل مخصصة بالكامل - اللون والخامة والقياس.",
      path: "/design-your-door",
    });
  }, []);

  function scrollToConfigurator() {
    configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:py-20" data-ambient-safe>
      <nav className="mb-6 text-xs text-muted">
        <Link to="/" className="hover:text-brand">
          الرئيسية
        </Link>
        {" / "}
        <span className="text-ink">صمم بابك بنفسك</span>
      </nav>

      <h1 className="font-display text-[clamp(26px,4vw,38px)] font-extrabold text-ink">صمم بابك بنفسك</h1>
      <p className="mt-2 max-w-[55ch] text-sm leading-6 text-muted">
        اختر الطريقة التي تناسبك: لون جاهز، موديل من كتالوجنا، أو تصميم مخصص بالكامل - ونحن نصنعه لك.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {paths.map((p) =>
          p.to ? (
            <Link
              key={p.title}
              to={p.to}
              data-ambient-hover
              className="block rounded-[18px] border border-silver/25 bg-surface p-5 transition hover:-translate-y-[2px]"
            >
              <p className="font-display text-base font-extrabold text-ink">{p.title}</p>
              <p className="mt-1.5 text-[13px] leading-5 text-muted">{p.desc}</p>
            </Link>
          ) : (
            <button
              key={p.title}
              type="button"
              onClick={scrollToConfigurator}
              data-ambient-hover
              className="block rounded-[18px] border border-silver/25 bg-surface p-5 text-right transition hover:-translate-y-[2px]"
            >
              <p className="font-display text-base font-extrabold text-ink">{p.title}</p>
              <p className="mt-1.5 text-[13px] leading-5 text-muted">{p.desc}</p>
            </button>
          )
        )}
      </div>

      <div ref={configuratorRef} className="mt-10 scroll-mt-24">
        <DoorConfigurator />
      </div>
    </div>
  );
}
