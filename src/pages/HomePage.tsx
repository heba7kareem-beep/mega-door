import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useModels } from "../lib/modelsStore";
import { useCategories } from "../lib/categoriesStore";
import { useSiteSettings } from "../lib/siteSettingsStore";
import { setPageSEO } from "../lib/seo";
import PopularSlider from "../components/PopularSlider";
import MobileCategoryShowcase from "../components/MobileCategoryShowcase";

const features: { icon: "headset" | "shield" | "drop" | "mute"; label: string }[] = [
  { icon: "headset", label: "خدمة ما بعد البيع" },
  { icon: "shield", label: "ضمان 7 سنوات" },
  { icon: "drop", label: "مقاوم للرطوبة" },
  { icon: "mute", label: "عزل صوتي 90%" },
];

function FeatureIcon({ kind }: { kind: "headset" | "shield" | "drop" | "mute" }) {
  const paths: Record<typeof kind, ReactNode> = {
    headset: (
      <>
        <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
        <rect x="3" y="13" width="4" height="6" rx="1.5" />
        <rect x="17" y="13" width="4" height="6" rx="1.5" />
        <path d="M20 19a4 4 0 0 1-4 3h-2" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
    drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
    mute: (
      <>
        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
        <line x1="17" y1="9" x2="22" y2="15" />
        <line x1="22" y1="9" x2="17" y2="15" />
      </>
    ),
  };
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[kind]}
    </svg>
  );
}

export default function HomePage() {
  const models = useModels();
  const categories = useCategories();
  const { heroImageUrl } = useSiteSettings();
  const primaryCategoryPath = categories[0] ? `/${categories[0].id}` : "/interior";

  useEffect(() => {
    setPageSEO({
      title: "ميكا للأبواب | أبواب داخلية وخارجية وقواطع في بغداد والعراق",
      description:
        "تصفح كتالوج ميكا للأبواب: أبواب داخلية وخارجية وقواطع داخلية بتصاميم وقياسات متعددة في بغداد. استفسر مباشرة عبر واتساب.",
      path: "/",
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      {/* bg-canvas انحذفت هنا عمداً (مو تغيير لون - نفس لون body بالضبط) حتى تظهر طبقة
          الخلفية الثابتة (AmbientBackground: خطوط هندسية متحركة) من خلفه. */}
      <section className="overflow-hidden border-b border-border">
        <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            {/*
              ترتيب الـ DOM ثابت (الصورة أولاً) حتى يبقى ظهورها فوق النص على الجوال والتابلت
              (أقل من 1024px). من عرض 1024px فأكبر (lg) نستخدم order لعكس الأعمدة بصرياً فقط:
              النص (order-1) يشغل العمود الأول وهو أقصى اليمين في RTL، والصورة (order-2) تشغل
              العمود الثاني الأكبر مساحة (1.05fr) أقصى اليسار، لتبقى هي محور التركيز البصري.
            */}
            <div
              className="door-glow aspect-[4/5] overflow-hidden rounded-[22px] bg-surface lg:order-2 lg:aspect-video"
              data-ambient-safe
            >
              <img
                src={heroImageUrl || `${import.meta.env.BASE_URL}images/brand/hero-door.jpg`}
                alt="باب طي أنيق بتصميم موجي في مدخل منزل عصري"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="lg:order-1" data-ambient-safe>
              <p className="mb-3 flex items-center gap-2 text-[13px] font-extrabold text-brand-dark md:mb-4">
                <span className="inline-block h-[1.5px] w-[22px] bg-brand-dark" />
                أكثر من مجرد باب
              </p>
              <h1 className="text-balance font-display text-[clamp(30px,4.4vw,46px)] font-extrabold leading-[1.22] text-ink">
                الباب الذي يناسب حياتك
              </h1>
              <p className="mt-3.5 max-w-[40ch] text-[15.5px] text-muted md:mt-5">
                تصاميم عصرية .. جودة تدوم لبيوت أجمل وحياة أهدأ
              </p>
              <div className="mt-6 md:mt-9">
                <Link
                  to={primaryCategoryPath}
                  data-ambient-hover
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition hover:brightness-[1.06]"
                >
                  اكتشف الموديلات
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l-7 7 7 7M20 12H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* صف بطاقات الأقسام الكبيرة - بالهاتف فقط (بديل روابط الهيدر المحذوفة) */}
      <div className="pt-8">
        <MobileCategoryShowcase />
      </div>

      {/* الأكثر طلباً هذا الشهر */}
      <section className="py-16 lg:py-24" data-ambient-density="moderate">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="mb-10 text-right" data-ambient-safe>
            <h2 className="text-[clamp(28px,4vw,42px)] font-extrabold text-ink">الأكثر طلباً هذا الشهر</h2>
            <p className="mt-2.5 text-base text-muted">تصاميم مختارة لبيوت عصرية</p>
          </div>
          <PopularSlider models={models} />
        </div>
      </section>

      {/* صمم بابك بنفسك - بطاقة تعريفية بسيطة فقط (صورة + عبارة) تؤدي لصفحة
          مستقلة كاملة فيها كل خيارات التخصيص. خلفية نظيفة بلا أي جسيمات
          (data-ambient-safe يستثني كامل القسم من طبقة الخلفية الحية). */}
      <section className="py-16 lg:py-24" data-ambient-density="low" data-ambient-safe>
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <p className="mb-6 text-right font-display text-[clamp(24px,4vw,36px)] font-extrabold text-ink">
            صمم بابك بنفسك
          </p>
          <Link
            to="/design-your-door"
            data-ambient-hover
            className="door-glow group block aspect-[16/9] overflow-hidden rounded-[22px] bg-surface"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/models/md-108-1.jpg`}
              alt="صمم بابك بنفسك"
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
            />
          </Link>
        </div>
      </section>

      {/* مزايا سريعة */}
      <section className="py-16 lg:py-24" data-ambient-density="minimal">
        <div className="mx-auto max-w-content px-4 sm:px-6">
          <div className="features-grid text-center" data-ambient-safe>
            {features.map((f) => (
              <div key={f.icon}>
                <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-brand-dark text-brand-dark">
                  <FeatureIcon kind={f.icon} />
                </div>
                <p className="text-[11px] font-bold text-ink sm:text-[13px]">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
