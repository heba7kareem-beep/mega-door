import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { setPageSEO } from "../lib/seo";
import { useModels } from "../lib/modelsStore";
import { getModelById } from "../data/models";
import DoorConfigurator from "../components/DoorConfigurator";

/**
 * صفحة مستقلة كاملة لتخصيص الباب - يوصلها الزبون من طريقين:
 * 1) بطاقة تعريفية بسيطة بالصفحة الرئيسية (بدون موديل محدد).
 * 2) زر "صمم هذا الباب" بصفحة تفاصيل موديل معين (?model=<id>) - عندها تفتح
 *    الصفحة مباشرة بصورة نفس الموديل ومقاسه معبّى مسبقاً، ويبقى للزبون يختار
 *    بس القياس المناسب له، بدل ما يبدي من معاينة عامة.
 *
 * بطاقة "تصفّح موديلاتنا الجاهزة" تظهر فقط لمن وصل بدون موديل محدد سلفاً -
 * مالها داعي إذا الزبون أصلاً اختار موديله. لا يوجد خيار "لون جاهز" منفصل
 * بعد الآن - اللون صار يُذكر ضمن شرح التصميم بتبويب "التصاميم" نفسه.
 */
export default function DesignYourDoorPage() {
  const [searchParams] = useSearchParams();
  const models = useModels();
  const modelId = searchParams.get("model");
  const preselectedModel = modelId ? getModelById(models, modelId) : undefined;

  useEffect(() => {
    setPageSEO({
      title: preselectedModel
        ? `تخصيص ${preselectedModel.name} - ${preselectedModel.modelNumber} | ميكا للأبواب`
        : "صمم تفاصيل باب مخصصة بالكامل | ميكا للأبواب",
      description: preselectedModel
        ? `حدّد القياس المناسب لموديل ${preselectedModel.name} (${preselectedModel.modelNumber}) ونحن نصنعه لك.`
        : "ارفع صورة للتصميم الذي تريده، اشرح لنا التفاصيل واللون المفضل، وحدّد القياس - ونحن نصنعه لك بالضبط متل ما تريد.",
      path: "/design-your-door",
    });
  }, [preselectedModel]);

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:py-20">
      <nav className="mb-6 text-xs text-muted">
        <Link to="/" className="hover:text-brand">
          الرئيسية
        </Link>
        {" / "}
        <span className="text-ink">صمم تفاصيل باب مخصصة بالكامل</span>
      </nav>

      <h1 className="font-display text-[clamp(26px,4vw,38px)] font-extrabold text-ink">صمم تفاصيل باب مخصصة بالكامل</h1>

      {preselectedModel ? (
        <p className="mt-2 max-w-[55ch] text-sm leading-6 text-muted">
          اخترتِ موديل <span className="font-bold text-ink">{preselectedModel.name}</span> (
          {preselectedModel.modelNumber}) - حدّدي القياس أدناه حسب طلبك، أو{" "}
          <Link to="/design-your-door" className="text-brand underline">
            ابدئي من الصفر بدون موديل محدد
          </Link>
          .
        </p>
      ) : (
        <p className="mt-2 max-w-[55ch] text-sm leading-6 text-muted">
          تصفّحي موديلاتنا الجاهزة، أو ارفعي صورة واشرحي التفاصيل واللون المفضل وحدّدي القياس - ونحن نصنعه لك.
        </p>
      )}

      {!preselectedModel && (
        <Link
          to="/interior"
          className="mt-8 block max-w-sm rounded-[18px] border border-silver/25 bg-surface p-5 transition hover:-translate-y-[2px]"
        >
          <p className="font-display text-base font-extrabold text-ink">اختر من موديلاتنا الجاهزة</p>
          <p className="mt-1.5 text-[13px] leading-5 text-muted">تصفّح الموديلات المتوفرة وحدّد قياسها</p>
        </Link>
      )}

      <div className="mt-10">
        <DoorConfigurator preselectedModel={preselectedModel} />
      </div>
    </div>
  );
}
