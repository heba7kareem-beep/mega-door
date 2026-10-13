import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getModelById } from "../data/models";
import { useModels } from "../lib/modelsStore";
import { useCategories, getCategoryById } from "../lib/categoriesStore";
import { buildModelInquiryLink } from "../lib/whatsapp";
import { setPageSEO, toAbsoluteUrl } from "../lib/seo";
import { trackContact, trackViewContent } from "../lib/metaPixel";
import DragScroller from "../components/DragScroller";
import BottomBackBar from "../components/BottomBackBar";

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const models = useModels();
  const model = id ? getModelById(models, id) : undefined;
  const categories = useCategories();
  const categoryLabel = model ? getCategoryById(categories, model.category)?.label ?? model.category : "";
  const [activeImage, setActiveImage] = useState(0);

  // ===== سحب الصورة الكبيرة بالإصبع (swipe) =====
  // لمس + ماوس. touch-action: pan-y يخلي المتصفح يتكفّل بالسحب العمودي للصفحة،
  // واحنا ناخذ بس الحركة الأفقية.
  // الاتجاه (بطلب صريح): سحب الإصبع لليسار = الصورة التالية، ولليمين = السابقة.
  const imageCount = model?.images.length ?? 0;
  const imgRef = useRef<HTMLImageElement>(null);
  const swipeRef = useRef<{ id: number; x: number; y: number; lock: "x" | null } | null>(null);
  const busyRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const frameRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  // الصورة المصغّرة النشطة تبقى ظاهرة بالشريط (تمرير أفقي فقط، ما يحرك الصفحة)
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[activeImage] as HTMLElement | undefined;
    if (!strip || !thumb) return;
    const s = strip.getBoundingClientRect();
    const t = thumb.getBoundingClientRect();
    strip.scrollBy({ left: t.left + t.width / 2 - (s.left + s.width / 2), behavior: "smooth" });
  }, [activeImage]);

  // تحميل مسبق للصورة اللي قبلها واللي بعدها حتى السحب يطلع الصورة جاهزة
  useEffect(() => {
    if (!model) return;
    [activeImage - 1, activeImage + 1].forEach((i) => {
      if (i < 0 || i >= model.images.length) return;
      const img = new Image();
      img.decoding = "async";
      img.src = model.images[i];
      img.decode?.().catch(() => {});
    });
  }, [model, activeImage]);

  function onSwipeStart(e: ReactPointerEvent<HTMLDivElement>) {
    if (imageCount < 2 || busyRef.current) return;
    swipeRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, lock: null };
  }

  function onSwipeMove(e: ReactPointerEvent<HTMLDivElement>) {
    const s = swipeRef.current;
    if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.lock) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        swipeRef.current = null; // سحب عمودي: نخليه للصفحة
        return;
      }
      s.lock = "x";
      try {
        frameRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* بعض المتصفحات ترفض الالتقاط - السحب يشتغل بدونه */
      }
      // أداء: أثناء السحب نحرّك الصورة مباشرة بالـ DOM (بدون React re-render لكل حركة)
      // ونوقف أنيميشن التوهج حتى ما يعيد رسم الإطار بكل إطار.
      if (imgRef.current) imgRef.current.style.transition = "none";
      if (frameRef.current) frameRef.current.style.animationPlayState = "paused";
    }
    const target = activeImage + (dx > 0 ? -1 : 1);
    const atEdge = target < 0 || target >= imageCount;
    moveImage(atEdge ? dx * 0.3 : dx); // مقاومة بسيطة بأول وآخر صورة
  }

  function moveImage(x: number, animated = false) {
    const img = imgRef.current;
    if (!img) return;
    img.style.transition = animated ? "transform 180ms ease-out" : "none";
    img.style.transform = `translate3d(${x}px,0,0)`;
  }

  function onSwipeEnd(e: ReactPointerEvent<HTMLDivElement>) {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s || e.pointerId !== s.id || s.lock !== "x") return;
    const dx = e.clientX - s.x;
    const width = frameRef.current?.offsetWidth ?? 300;
    const dir = dx > 0 ? 1 : -1;
    const target = activeImage - dir;
    const passed = e.type === "pointerup" && Math.abs(dx) > Math.min(60, width * 0.18);

    const resumeGlow = () => {
      if (frameRef.current) frameRef.current.style.animationPlayState = "";
    };
    if (!passed || target < 0 || target >= imageCount) {
      moveImage(0, true); // ترجع لمكانها
      resumeGlow();
      return;
    }
    busyRef.current = true;
    moveImage(dir * width, true); // الصورة الحالية تطلع من الجهة اللي انسحبت لها
    timerRef.current = window.setTimeout(() => {
      moveImage(-dir * width); // الجديدة تبدي من الجهة الثانية
      setActiveImage(target);
      // مؤقت بدل requestAnimationFrame: rAF يتوقف إذا التبويب مخفي فالصورة تعلگ برة الإطار
      timerRef.current = window.setTimeout(() => {
        moveImage(0, true);
        busyRef.current = false;
        resumeGlow();
      }, 30);
    }, 180);
  }

  useEffect(() => {
    if (!model) return;
    const knownDetails = [model.material, model.color, model.dimensions ? `مقاس ${model.dimensions}` : null].filter(
      Boolean
    );
    const description = knownDetails.length
      ? `${model.name}، موديل ${model.modelNumber}: ${knownDetails.join("، ")}.${
          model.usage ? ` ${model.usage}.` : ""
        }`
      : `${model.name}، موديل ${model.modelNumber} من ميكا للأبواب - بغداد.`;

    setPageSEO({
      title: `${model.name} - ${model.modelNumber} | ميكا للأبواب`,
      description,
      path: `/model/${model.id}`,
      image: model.images[0],
    });
    trackViewContent({ modelNumber: model.modelNumber, modelName: model.name, category: model.category });
    setActiveImage(0);

    // Schema.org Product لهذا الموديل تحديداً
    const scriptId = "model-product-schema";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = scriptId;
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: model.name,
      sku: model.modelNumber,
      description: [model.material, model.color, model.dimensions].filter(Boolean).join(" - ") || undefined,
      category: categoryLabel,
      image: model.images.map(toAbsoluteUrl),
      brand: { "@type": "Brand", name: "ميكا للأبواب" },
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [model, categoryLabel]);

  if (!model) {
    return (
      <div className="mx-auto max-w-content px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-ink">لم يتم العثور على هذا الموديل</h1>
        <Link to="/" className="mt-4 inline-block text-brand underline">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:py-20">
      <BottomBackBar fallbackTo={`/${model.category}`} />
      <nav className="mb-6 text-xs text-muted">
        <Link to="/" className="hover:text-brand">
          الرئيسية
        </Link>
        {" / "}
        <Link to={`/${model.category}`} className="hover:text-brand">
          {categoryLabel}
        </Link>
        {" / "}
        <span className="text-ink">{model.name}</span>
      </nav>

      {/* grid-cols-1 = minmax(0,1fr): بدونه العمود بالموبايل ياخذ عرض الصورة الأصلي
          (1024px) والصفحة كلها تطلع أعرض من الشاشة وتنقص الصورة. */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* معرض الصور */}
        <div>
          <div
            ref={frameRef}
            data-swipe-gallery
            onPointerDown={onSwipeStart}
            onPointerMove={onSwipeMove}
            onPointerUp={onSwipeEnd}
            onPointerCancel={onSwipeEnd}
            style={{ touchAction: "pan-y pinch-zoom" }}
            className="aspect-[3/4] select-none overflow-hidden rounded-2xl border border-border bg-canvas shadow-[0_0_26px_2px_rgba(20,137,255,0.2)]"
          >
            <img
              ref={imgRef}
              src={model.images[activeImage]}
              alt={`صورة ${activeImage + 1} لباب ${model.name} - موديل ${model.modelNumber}`}
              draggable={false}
              decoding="async"
              style={{ willChange: "transform" }}
              className="h-full w-full object-contain"
            />
          </div>
          {model.images.length > 1 && (
            <DragScroller scrollerRef={thumbsRef} snap={false} className="mt-3 gap-3 pb-1">
              {model.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === activeImage ? "border-brand" : "border-border opacity-70"
                  }`}
                  aria-label={`عرض الصورة ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                </button>
              ))}
            </DragScroller>
          )}
        </div>

        {/* التفاصيل */}
        <div>
          {model.isPopular && (
            <span className="mb-3 inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
              الأكثر طلباً
            </span>
          )}
          <p className="text-sm font-medium text-muted">{model.modelNumber}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-ink">{model.name}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
            <div>
              <dt className="text-muted">القسم</dt>
              <dd className="mt-1 font-medium text-ink">{categoryLabel}</dd>
            </div>
            {model.material && (
              <div>
                <dt className="text-muted">النوع</dt>
                <dd className="mt-1 font-medium text-ink">{model.material}</dd>
              </div>
            )}
            {model.color && (
              <div>
                <dt className="text-muted">اللون</dt>
                <dd className="mt-1 font-medium text-ink">{model.color}</dd>
              </div>
            )}
            {model.dimensions && (
              <div>
                <dt className="text-muted">القياسات</dt>
                <dd className="mt-1 font-medium text-ink">{model.dimensions}</dd>
              </div>
            )}
          </dl>

          {model.specs && model.specs.length > 0 && (
            <div className="mt-5">
              <h2 className="text-sm font-bold text-ink">المواصفات</h2>
              <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted">
                {model.specs.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {model.usage && (
            <div className="mt-5">
              <h2 className="text-sm font-bold text-ink">أين يمكن استخدامه</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{model.usage}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={buildModelInquiryLink(model)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContact("model_detail_button")}
              className="flex items-center justify-center gap-2 rounded-full bg-whatsapp px-6 py-4 text-base font-bold text-white transition hover:brightness-105"
            >
              استفسر عن هذا الموديل عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
