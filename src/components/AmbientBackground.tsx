import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * طبقة خلفية حية دائمة التحرك بروح النجارة (غبار خشب، براية نادرة، مسمار/برغي
 * نادر، لمعة معدنية نادرة). ثابتة الموضع فوق كامل الشاشة خلف المحتوى (z-0)،
 * لا تتفاعل مع الماوس مباشرة (pointer-events: none)، وتتجنب صناديق الأمان
 * المعلّمة بـ [data-ambient-safe] حتى لا تغطي أي صورة/نص/زر.
 *
 * الكثافة تختلف حسب القسم الظاهر حالياً عبر [data-ambient-density] (rich/
 * moderate/low/minimal)، وتتفاعل بشكل مؤقت وناعم مع: التمرير، دخول قسم جديد
 * للشاشة، المرور فوق عناصر [data-ambient-hover]، النقر على أزرار/روابط،
 * وحركة الماوس (parallax خفيف جداً). كل حدث نادر له فاصل زمني عشوائي مستقل
 * حتى لا تظهر الحركة كحلقة متكررة ملحوظة.
 */

type ParticleKind = "dust" | "shaving" | "hardware" | "glint";

interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  age: number;
  life: number;
  parallax: boolean;
  swayPhase: number;
  swayAmp: number;
  outline?: { x: number; y: number }[];
  fillColor?: string;
  edgeColor?: string;
  texU?: number;
  texV?: number;
}

// يبني شكل لفة نشارة خشب واقعي: شريط بعرض شبه ثابت يلتف حلزونياً (نصف قطر
// يتناقص كل ما اتجهنا للداخل - مثل اللفات بالصورة المرجعية) بدل قوس بسيط، مع
// اهتزاز خفيف بالحواف (ليست هندسية مثالية). هذا المضلّع يُستخدم لاحقاً كقناع
// (clip) تُرسم داخله صورة نسيج خشب حقيقية بدل تعبئته بلون مرسوم مسطّح.
function buildShavingOutline(size: number, turns: number): { x: number; y: number }[] {
  const segments = 16;
  const outerR = size;
  const innerR = size * (turns > 0.6 ? 0.35 : 0.6);
  // عرض أكبر نسبياً وطرف ما يرفّ لصفر - حتى تبين كشريحة خشب فيها سماكة حقيقية
  // وليست خيط/شعرة رفيعة.
  const maxHalfWidth = size * 0.3;
  const top: { x: number; y: number }[] = [];
  const bottom: { x: number; y: number }[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * turns * Math.PI * 2;
    const r = outerR - (outerR - innerR) * t;
    const taper = 0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.1));
    const halfWidth = maxHalfWidth * taper;
    const jitter = (Math.random() - 0.5) * size * 0.02;
    const rr = r + jitter;
    const cx = Math.cos(angle) * rr;
    const cy = Math.sin(angle) * rr;
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    top.push({ x: cx + nx * halfWidth, y: cy + ny * halfWidth });
    bottom.push({ x: cx - nx * halfWidth, y: cy - ny * halfWidth });
  }

  const midAngle = (turns * Math.PI * 2) / 2;
  const midR = (outerR + innerR) / 2;
  const offsetX = Math.cos(midAngle) * midR * 0.85;
  const offsetY = Math.sin(midAngle) * midR * 0.85;
  const shift = (arr: { x: number; y: number }[]) => arr.map((p) => ({ x: p.x - offsetX, y: p.y - offsetY }));

  return [...shift(top), ...shift(bottom).reverse()];
}

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const DENSITY_BY_TIER: Record<string, number> = {
  rich: 1,
  moderate: 0.55,
  low: 0.32,
  minimal: 0.16,
};

const DESKTOP_MAX_PARTICLES = 85;
const MOBILE_MAX_PARTICLES = 30;
// طبقة إضافية أوضح من رقائق الخشب فوق الغبار الناعم (وليست بديلة عنه)
const DESKTOP_MAX_SHAVINGS = 20;
const MOBILE_MAX_SHAVINGS = 7;
const KEEP_OUT_PADDING = 10;
const HERO_INTRO_KEY = "mega-door-ambient-hero-intro-shown";

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const triggerBoostRef = useRef<() => void>(() => {});
  const location = useLocation();
  const isFirstRoute = useRef(true);

  // انتقال حقيقي بين صفحات الموقع (الضغط على عنصر بالـ Navigation) - يشغّل نفس
  // boost الانتقال بين الأقسام حتى لو الصفحة الجديدة ما فيها عناصر [data-ambient-density]
  // بعد (مثل صفحات الأقسام/الموديل)، لأن المحرك نفسه ثابت ولا يُعاد إنشاؤه بين الصفحات.
  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }
    triggerBoostRef.current();
  }, [location.pathname]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const isMobile = window.innerWidth < 768 || coarsePointerQuery.matches;
    const maxParticles = isMobile ? MOBILE_MAX_PARTICLES : DESKTOP_MAX_PARTICLES;
    const maxShavings = isMobile ? MOBILE_MAX_SHAVINGS : DESKTOP_MAX_SHAVINGS;

    // نسيج خشب حقيقي (مقطوع من صورة باب حقيقية) يُستخدم كتعبئة لجسيمات النشارة
    // بدل لون مرسوم مسطّح - حتى تكون الخامة صورة فعلية لا رسماً توضيحياً.
    const woodTexture = new Image();
    let woodTextureReady = false;
    woodTexture.onload = () => {
      woodTextureReady = true;
    };
    woodTexture.src = `${import.meta.env.BASE_URL}images/brand/hero-door.jpg`;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    let keepOutRects: Rect[] = [];
    function recomputeKeepOutRects() {
      const nodes = document.querySelectorAll<HTMLElement>("[data-ambient-safe]");
      const rects: Rect[] = [];
      nodes.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > height + 50 || r.right < -50 || r.left > width + 50) return;
        rects.push({
          top: r.top - KEEP_OUT_PADDING,
          left: r.left - KEEP_OUT_PADDING,
          right: r.right + KEEP_OUT_PADDING,
          bottom: r.bottom + KEEP_OUT_PADDING,
        });
      });
      keepOutRects = rects;
    }
    recomputeKeepOutRects();

    function isInsideKeepOut(x: number, y: number): Rect | null {
      for (const r of keepOutRects) {
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return r;
      }
      return null;
    }

    const particles: Particle[] = [];

    function spawnDust(biasY?: "top" | "bottom") {
      let x = randRange(0, width);
      let y =
        biasY === "top"
          ? randRange(0, height * 0.3)
          : biasY === "bottom"
            ? randRange(height * 0.7, height)
            : randRange(0, height);
      let attempts = 0;
      while (isInsideKeepOut(x, y) && attempts < 5) {
        x = randRange(0, width);
        y = randRange(0, height);
        attempts++;
      }
      particles.push({
        kind: "dust",
        x,
        y,
        vx: randRange(-4, 4) / 60,
        vy: randRange(-10, -3) / 60,
        size: randRange(1, 2.6),
        baseOpacity: randRange(0.12, 0.32),
        opacity: 0,
        rotation: 0,
        rotSpeed: 0,
        age: 0,
        life: randRange(9000, 18000),
        parallax: Math.random() < 0.3,
        swayPhase: randRange(0, Math.PI * 2),
        swayAmp: randRange(4, 14),
      });
    }

    // رقائق الخشب: تُستخدم بطريقتين - إما كطبقة خلفية مستمرة وهادئة (بدون x/y،
    // تسلك سلوك الغبار لكن بشكل شريحة رفيعة واضحة)، أو كلمسة "accent" أوضح
    // وأسرع حركة عند نقطة محددة (انتقال قسم، نقرة، حدث نادر).
    function spawnShaving(x?: number, y?: number, biasY?: "top" | "bottom") {
      const accent = x !== undefined && y !== undefined;
      let px = x ?? randRange(0, width);
      let py =
        y ??
        (biasY === "top"
          ? randRange(0, height * 0.3)
          : biasY === "bottom"
            ? randRange(height * 0.7, height)
            : randRange(0, height));
      if (accent) {
        if (isInsideKeepOut(px, py)) return;
      } else {
        let attempts = 0;
        while (isInsideKeepOut(px, py) && attempts < 5) {
          px = randRange(0, width);
          py = randRange(0, height);
          attempts++;
        }
      }
      // توزيع أحجام طبيعي: كثير من الشظايا الصغيرة، وقلة من اللفات الكبيرة
      // الواضحة - مثل حطام نشارة حقيقي، وليس كل الرقائق بنفس الحجم تقريباً.
      const sizeBias = Math.pow(Math.random(), accent ? 1.1 : 1.6);
      const size = accent ? 10 + sizeBias * 16 : 6 + sizeBias * 15;
      // عدد لفات الالتفاف: فتحة بسيطة إلى لفة معتدلة - مو ملفوفة بإحكام مثل خيط/شعرة
      const turns = randRange(accent ? 0.28 : 0.22, accent ? 0.85 : 0.7);
      const outline = buildShavingOutline(size, turns);
      // إحداثيات نسبية (0..1) لمنطقة عشوائية من نسيج الخشب الحقيقي (صورة الهيرو)
      // تُقصّ لملء شكل هذه الرقاقة - كل رقاقة تاخذ جزء مختلف من الصورة فعلياً.
      const texU = randRange(0.24, 0.48);
      const texV = randRange(0.1, 0.75);
      // لون احتياطي فقط لحين تحميل صورة النسيج الحقيقية لأول مرة
      const hue = randRange(28, 38);
      const light = randRange(36, 54);
      particles.push({
        kind: "shaving",
        x: px,
        y: py,
        vx: randRange(-6, 6) / 60,
        vy: randRange(accent ? 5 : 2, accent ? 13 : 6) / 60,
        size,
        baseOpacity: randRange(accent ? 0.46 : 0.36, accent ? 0.68 : 0.52),
        opacity: 0,
        rotation: randRange(0, Math.PI * 2),
        rotSpeed: randRange(accent ? -0.7 : -0.28, accent ? 0.7 : 0.28) / 60,
        age: 0,
        life: accent ? randRange(2200, 3600) : randRange(8000, 15000),
        parallax: !accent && Math.random() < 0.25,
        swayPhase: randRange(0, Math.PI * 2),
        swayAmp: randRange(accent ? 10 : 5, accent ? 20 : 12),
        outline,
        texU,
        texV,
        fillColor: `hsla(${hue}, 30%, ${light}%, 1)`,
        edgeColor: `hsla(${hue}, 26%, ${Math.max(12, light - 22)}%, 0.55)`,
      });
    }

    function spawnHardware(x?: number, y?: number) {
      const px = x ?? randRange(width * 0.1, width * 0.9);
      const py = y ?? randRange(height * 0.15, height * 0.85);
      if (isInsideKeepOut(px, py)) return;
      particles.push({
        kind: "hardware",
        x: px,
        y: py,
        vx: randRange(-2, 2) / 60,
        vy: randRange(2, 5) / 60,
        size: randRange(3, 5),
        baseOpacity: randRange(0.35, 0.55),
        opacity: 0,
        rotation: randRange(0, Math.PI * 2),
        rotSpeed: randRange(-0.2, 0.2) / 60,
        age: 0,
        life: randRange(1300, 1800),
        parallax: false,
        swayPhase: 0,
        swayAmp: 0,
      });
    }

    function spawnGlint(x?: number, y?: number) {
      const px = x ?? randRange(width * 0.1, width * 0.9);
      const py = y ?? randRange(height * 0.1, height * 0.9);
      if (isInsideKeepOut(px, py)) return;
      particles.push({
        kind: "glint",
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        size: randRange(2, 4),
        baseOpacity: randRange(0.5, 0.75),
        opacity: 0,
        rotation: 0,
        rotSpeed: 0,
        age: 0,
        life: randRange(700, 1100),
        parallax: false,
        swayPhase: 0,
        swayAmp: 0,
      });
    }

    function spawnClickBurst(x: number, y: number) {
      const count = isMobile ? 3 : 5;
      for (let i = 0; i < count; i++) {
        const angle = randRange(0, Math.PI * 2);
        const speed = randRange(0.3, 1);
        particles.push({
          kind: "dust",
          x,
          y,
          vx: (Math.cos(angle) * speed) / 3,
          vy: (Math.sin(angle) * speed) / 3,
          size: randRange(1.2, 2.4),
          baseOpacity: randRange(0.3, 0.5),
          opacity: 0,
          rotation: 0,
          rotSpeed: 0,
          age: 0,
          life: randRange(500, 850),
          parallax: false,
          swayPhase: 0,
          swayAmp: 0,
        });
      }
      if (!isInsideKeepOut(x, y) && Math.random() < 0.45) spawnShaving(x, y);
    }

    function drawParticle(c: CanvasRenderingContext2D, p: Particle) {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rotation);
      c.globalAlpha = Math.max(0, Math.min(1, p.opacity));
      if (p.kind === "dust") {
        c.fillStyle = "rgba(196,158,110,1)";
        c.beginPath();
        c.arc(0, 0, p.size, 0, Math.PI * 2);
        c.fill();
      } else if (p.kind === "shaving" && p.outline && p.outline.length > 2) {
        // شريط نشارة خشب: مضلّع محسوب مسبقاً (حواف غير مثالية، سماكة متغيّرة)
        // يُستخدم كقناع، ويُملأ بجزء عشوائي من صورة باب حقيقية (نسيج خشب فعلي)
        // بدل أي لون أو تدرّج مرسوم - خامة حقيقية لا رسم توضيحي.
        c.beginPath();
        c.moveTo(p.outline[0].x, p.outline[0].y);
        for (let i = 1; i < p.outline.length; i++) c.lineTo(p.outline[i].x, p.outline[i].y);
        c.closePath();

        if (woodTextureReady) {
          c.save();
          c.clip();
          const natW = woodTexture.naturalWidth;
          const natH = woodTexture.naturalHeight;
          const cropSize = Math.max(40, p.size * 5);
          const sx = (p.texU ?? 0.3) * natW;
          const sy = (p.texV ?? 0.3) * natH;
          const drawSize = p.size * 2.6;
          c.drawImage(woodTexture, sx, sy, cropSize, cropSize, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          c.restore();
        } else {
          // لون احتياطي فقط لحين اكتمال تحميل صورة النسيج لأول مرة
          c.fillStyle = p.fillColor ?? "hsla(30,28%,42%,1)";
          c.fill();
        }

        c.lineWidth = Math.max(0.7, p.size * 0.05);
        c.strokeStyle = p.edgeColor ?? "hsla(30,26%,20%,0.6)";
        c.stroke();
      } else if (p.kind === "hardware") {
        c.fillStyle = "rgba(120,120,126,1)";
        c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        const grad = c.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = grad;
        c.beginPath();
        c.arc(0, 0, p.size, 0, Math.PI * 2);
        c.fill();
      } else {
        const grad = c.createRadialGradient(0, 0, 0, 0, 0, p.size * 3);
        grad.addColorStop(0, "rgba(255,248,225,0.9)");
        grad.addColorStop(1, "rgba(255,248,225,0)");
        c.fillStyle = grad;
        c.beginPath();
        c.arc(0, 0, p.size * 3, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }

    // ---- وضع تقليل الحركة: إطار ثابت هادئ واحد بدون أي حلقة أو مستمعات ----
    if (reduceMotionQuery.matches) {
      const baseCount = Math.round(maxParticles * 0.3);
      for (let i = 0; i < baseCount; i++) spawnDust();
      const baseShavingCount = Math.round(maxShavings * 0.3);
      for (let i = 0; i < baseShavingCount; i++) spawnShaving();
      function drawStatic() {
        ctx!.clearRect(0, 0, width, height);
        particles.forEach((p) => {
          p.opacity = p.baseOpacity * 0.6;
          drawParticle(ctx!, p);
        });
      }
      drawStatic();
      function onResizeStatic() {
        resize();
        recomputeKeepOutRects();
        drawStatic();
      }
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    // ---- تتبّع كثافة القسم الظاهر حالياً ----
    let currentDensityFactor = 0.3;
    const sectionEls = Array.from(document.querySelectorAll<HTMLElement>("[data-ambient-density]"));
    const visibleSections = new Map<Element, number>();

    function updateDensityFactor() {
      if (visibleSections.size === 0) return;
      let weighted = 0;
      let totalRatio = 0;
      visibleSections.forEach((ratio, el) => {
        const tier = (el as HTMLElement).dataset.ambientDensity || "moderate";
        const val = DENSITY_BY_TIER[tier] ?? 0.4;
        weighted += val * ratio;
        totalRatio += ratio;
      });
      if (totalRatio > 0) currentDensityFactor = weighted / totalRatio;
    }

    // ---- boost انتقال الأقسام: نبضة كثافة/سرعة قصيرة + لمسة بصرية واحدة مضمونة ----
    let transitionBoost = 0;

    function pickAccentPoint(rect?: Rect): { x: number; y: number } | null {
      const left = rect ? Math.max(rect.left, 0) : width * 0.08;
      const right = rect ? Math.min(rect.right, width) : width * 0.92;
      const top = rect ? Math.max(rect.top, 0) : height * 0.12;
      const bottom = rect ? Math.min(rect.bottom, height) : height * 0.88;
      if (right - left < 30 || bottom - top < 30) return null;
      for (let attempt = 0; attempt < 14; attempt++) {
        const x = randRange(left + 15, right - 15);
        const y = randRange(top + 15, bottom - 15);
        if (!isInsideKeepOut(x, y)) return { x, y };
      }
      return null;
    }

    function triggerTransitionBoost(rect?: Rect) {
      transitionBoost = 1;
      const point = pickAccentPoint(rect);
      if (point) {
        if (Math.random() < 0.5) spawnShaving(point.x, point.y);
        else spawnGlint(point.x, point.y);
      }
    }
    triggerBoostRef.current = () => triggerTransitionBoost();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const wasVisible = visibleSections.has(entry.target);
            visibleSections.set(entry.target, entry.intersectionRatio);
            if (!wasVisible) {
              const r = entry.target.getBoundingClientRect();
              triggerTransitionBoost({ top: r.top, left: r.left, right: r.right, bottom: r.bottom });
            }
          } else {
            visibleSections.delete(entry.target);
          }
        });
        updateDensityFactor();
      },
      { threshold: [0, 0.15, 0.4, 0.6, 0.9] }
    );
    sectionEls.forEach((el) => io.observe(el));

    for (let i = 0; i < maxParticles * currentDensityFactor; i++) spawnDust();
    for (let i = 0; i < maxShavings * currentDensityFactor; i++) spawnShaving();

    // ---- التمرير ----
    let lastScrollY = window.scrollY;
    let scrollBoost = 0;
    let scrollDirBias = 0;
    let lastScrollTime = performance.now();

    function onScroll() {
      const now = performance.now();
      const dt = Math.max(now - lastScrollTime, 1);
      const dy = window.scrollY - lastScrollY;
      const velocity = dy / dt;
      scrollBoost = Math.min(1, scrollBoost + Math.min(Math.abs(velocity) * 4, 1));
      scrollDirBias = Math.sign(velocity) || scrollDirBias;
      lastScrollY = window.scrollY;
      lastScrollTime = now;
      recomputeKeepOutRects();
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // ---- الماوس/التمرير فوق العناصر التفاعلية/النقر ----
    const mouse = { x: width / 2, y: height / 2, smoothX: width / 2, smoothY: height / 2 };
    const hoverBoost = { active: false, x: 0, y: 0 };

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (hoverBoost.active) {
        hoverBoost.x = e.clientX;
        hoverBoost.y = e.clientY;
      }
    }
    function onPointerOver(e: PointerEvent) {
      const target = e.target as HTMLElement;
      const hoverEl = target.closest("[data-ambient-hover]");
      if (hoverEl) {
        hoverBoost.active = true;
        hoverBoost.x = e.clientX;
        hoverBoost.y = e.clientY;
      }
    }
    function onPointerOut(e: PointerEvent) {
      const target = e.target as HTMLElement;
      const hoverEl = target.closest("[data-ambient-hover]");
      if (hoverEl) hoverBoost.active = false;
    }
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const el = target.closest("a,button,[data-ambient-hover]");
      if (el) spawnClickBurst(e.clientX, e.clientY);
    }
    function onResize() {
      resize();
      recomputeKeepOutRects();
    }

    if (!isMobile) window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerout", onPointerOut, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("resize", onResize);

    // ---- جدولة الأحداث النادرة بفواصل عشوائية مستقلة (بدون حلقة ثابتة) ----
    const timers: number[] = [];
    function scheduleShaving() {
      timers.push(
        window.setTimeout(
          () => {
            if (!document.hidden) {
              const point = pickAccentPoint();
              if (point) spawnShaving(point.x, point.y);
            }
            scheduleShaving();
          },
          randRange(9000, 19000)
        )
      );
    }
    function scheduleHardware() {
      timers.push(
        window.setTimeout(
          () => {
            if (!document.hidden) spawnHardware();
            scheduleHardware();
          },
          randRange(14000, 27000)
        )
      );
    }
    function scheduleGlint() {
      timers.push(
        window.setTimeout(
          () => {
            if (!document.hidden) spawnGlint();
            scheduleGlint();
          },
          randRange(8000, 20000)
        )
      );
    }
    scheduleShaving();
    scheduleHardware();
    scheduleGlint();

    // ---- مقدمة الهيرو لمرة واحدة فقط بكل جلسة ----
    const heroSection = document.querySelector('[data-ambient-density="rich"]') as HTMLElement | null;
    let introStart: number | null = null;
    if (heroSection && sessionStorage.getItem(HERO_INTRO_KEY) !== "1") {
      introStart = performance.now();
      sessionStorage.setItem(HERO_INTRO_KEY, "1");
    }

    let rafId = 0;
    let lastFrame = performance.now();
    let fpsAccumulator = 0;
    let fpsFrames = 0;
    let fpsCheckTime = performance.now();
    let perfScale = 1;

    function frame(now: number) {
      rafId = requestAnimationFrame(frame);
      if (document.hidden) return;

      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;

      fpsFrames++;
      fpsAccumulator += dt;
      if (now - fpsCheckTime > 2000) {
        const avgFps = 1000 / (fpsAccumulator / fpsFrames);
        if (avgFps < 40 && perfScale > 0.5) perfScale = 0.5;
        fpsAccumulator = 0;
        fpsFrames = 0;
        fpsCheckTime = now;
      }

      // نبضة الانتقال (بين الأقسام أو بين صفحات الموقع) تخفت تدريجياً خلال ~1.3 ثانية
      transitionBoost *= Math.exp(-dt / 480);

      scrollBoost *= 0.93;
      mouse.smoothX += (mouse.x - mouse.smoothX) * 0.05;
      mouse.smoothY += (mouse.y - mouse.smoothY) * 0.05;
      const parallaxOffsetX = ((mouse.smoothX - width / 2) / (width / 2)) * 6;
      const parallaxOffsetY = ((mouse.smoothY - height / 2) / (height / 2)) * 6;

      let introFactor = 1;
      let introGlintNow = false;
      if (introStart !== null) {
        const t = now - introStart;
        if (t < 3000) {
          if (t < 1000) introFactor = 1.8;
          else if (t < 2000) {
            introFactor = 1.3;
            introGlintNow = Math.floor(t) % 900 < 20;
          } else {
            introFactor = 1.8 - ((t - 2000) / 1000) * 0.8;
          }
        } else {
          introStart = null;
        }
      }
      if (introGlintNow && heroSection) {
        const r = heroSection.getBoundingClientRect();
        spawnGlint(r.left + r.width * 0.82, r.top + r.height * 0.4);
      }

      const targetDensity =
        Math.min(1.8, currentDensityFactor + scrollBoost * 0.6 + transitionBoost * 0.5) * introFactor * perfScale;
      const targetCount = Math.round(maxParticles * targetDensity);
      const targetShavingCount = Math.round(maxShavings * targetDensity);
      const scrollBias = scrollDirBias > 0 ? "top" : scrollDirBias < 0 ? "bottom" : undefined;
      let dustCount = 0;
      let shavingCount = 0;
      for (const p of particles) {
        if (p.kind === "dust") dustCount++;
        else if (p.kind === "shaving") shavingCount++;
      }
      while (dustCount < targetCount) {
        spawnDust(scrollBias);
        dustCount++;
      }
      while (shavingCount < targetShavingCount) {
        spawnShaving(undefined, undefined, scrollBias);
        shavingCount++;
      }

      ctx!.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age > p.life) {
          particles.splice(i, 1);
          continue;
        }
        const fadeIn = Math.min(1, p.age / 400);
        const fadeOut = Math.min(1, (p.life - p.age) / 500);
        p.opacity = p.baseOpacity * fadeIn * fadeOut;

        // أثناء Scroll/Click/انتقال قسم، رقائق الخشب تحديداً تلمع وتدور أوضح -
        // وليس فقط "عدد نقاط أكثر" كما كان سابقاً.
        const shavingKick = p.kind === "shaving" ? scrollBoost + transitionBoost : 0;
        if (shavingKick > 0) p.opacity = Math.min(1, p.opacity + shavingKick * 0.22);

        const speedMul = 1 + scrollBoost * 1.8 + transitionBoost * 1.1;
        p.swayPhase += dt / 900;
        const sway = Math.sin(p.swayPhase) * p.swayAmp * (dt / 1000);
        p.x += p.vx * dt * speedMul + sway * 0.02;
        p.y += p.vy * dt * speedMul - scrollDirBias * scrollBoost * 0.02 * dt;
        p.rotation += p.rotSpeed * dt * (1 + shavingKick * 2.4);

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        if (hoverBoost.active) {
          const dx = p.x - hoverBoost.x;
          const dy = p.y - hoverBoost.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 90) p.opacity = Math.min(1, p.opacity + (1 - dist / 90) * 0.4);
        }

        const keepOut = isInsideKeepOut(p.x, p.y);
        if (keepOut) {
          const cx = (keepOut.left + keepOut.right) / 2;
          const cy = (keepOut.top + keepOut.bottom) / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.hypot(dx, dy) || 1;
          p.x += (dx / dist) * 1.4;
          p.y += (dy / dist) * 1.4;
          continue;
        }

        if (p.parallax) {
          const origX = p.x;
          const origY = p.y;
          p.x += parallaxOffsetX;
          p.y += parallaxOffsetY;
          drawParticle(ctx!, p);
          p.x = origX;
          p.y = origY;
        } else {
          drawParticle(ctx!, p);
        }
      }
    }

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      timers.forEach((t) => clearTimeout(t));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerout", onPointerOut);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />;
}
