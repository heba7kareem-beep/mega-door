import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { setPageSEO } from "../lib/seo";
import { useModels } from "../lib/modelsStore";
import { getModelById } from "../data/models";
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
 * صفحة مستقلة كاملة لتخصيص الباب - يوصلها الزبون من طريقين:
 * 1) بطاقة تعريفية بسيطة بالصفحة الرئيسية (بدون موديل محدد).
 * 2) زر "صمم هذا الباب" بصفحة تفاصيل موديل معين (?model=<id>) - عندها تفتح
 *    الصفحة مباشرة بصورة نفس الموديل ومقاسه معبّى مسبقاً، ويبقى للزبون يختار
 *    بس اللون والقياس المناسبين له، بدل ما يبدي من معاينة عامة.
 *
 * الخيارات الثلاثة بالأعلى (لون جاهز/موديل جاهز/تصميم مخصص) تظهر فقط لمن
 * وصل بدون موديل محدد سلفاً - مالها داعي إذا الزبون أصلاً اختار موديله.
 */
export default function DesignYourDoorPage() {
  const configuratorRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const models = useModels();
  const modelId = searchParams.get("model");
  const preselectedModel = modelId ? getModelById(models, modelId) : undefined;

  useEffect(() => {
    setPageSEO({
      title: preselectedModel
        ? `تخصيص ${preselectedModel.name} - ${preselectedModel.modelNumber} | ميكا للأبواب`
        : "صمم بابك بنفسك | ميكا للأبواب",
      description: preselectedModel
        ? `اختر اللون والقياس المناسبين لموديل ${preselectedModel.name} (${preselectedModel.modelNumber}) ونحن نصنعه لك.`
        : "اختر لون بابك، أو تصفّح موديلاتنا الجاهزة، أو صمم تفاصيل مخصصة بالكامل - اللون والخامة والقياس.",
      path: "/design-your-door",
    });
  }, [preselectedModel]);

  function scrollToConfigurator() {
    configuratorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:py-20">
      <nav className="mb-6 text-xs text-muted">
        <Link to="/" className="hover:text-brand">
          الرئيسية
        </Link>
        {" / "}
        <span className="text-ink">صمم بابك بنفسك</span>
      </nav>

      <h1 className="font-display text-[clamp(26px,4vw,38px)] font-extrabold text-ink">صمم بابك بنفسك</h1>

      {preselectedModel ? (
        <p className="mt-2 max-w-[55ch] text-sm leading-6 text-muted">
          اخترتِ موديل <span className="font-bold text-ink">{preselectedModel.name}</span> (
          {preselectedModel.modelNumber}) - عدّلي اللون والقياس أدناه حسب طلبك، أو{" "}
          <Link to="/design-your-door" className="text-brand underline">
            ابدئي من الصفر بدون موديل محدد
          </Link>
          .
        </p>
      ) : (
        <p className="mt-2 max-w-[55ch] text-sm leading-6 text-muted">
          اختر الطريقة التي تناسبك: لون جاهز، موديل من كتالوجنا، أو تصميم مخصص بالكامل - ونحن نصنعه لك.
        </p>
      )}

      {!preselectedModel && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {paths.map((p) =>
            p.to ? (
              <Link
                key={p.title}
                to={p.to}
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
                className="block rounded-[18px] border border-silver/25 bg-surface p-5 text-right transition hover:-translate-y-[2px]"
              >
                <p className="font-display text-base font-extrabold text-ink">{p.title}</p>
                <p className="mt-1.5 text-[13px] leading-5 text-muted">{p.desc}</p>
              </button>
            )
          )}
        </div>
      )}

      <div ref={configuratorRef} className="mt-10 scroll-mt-24">
        <DoorConfigurator preselectedModel={preselectedModel} />
      </div>
    </div>
  );
}
