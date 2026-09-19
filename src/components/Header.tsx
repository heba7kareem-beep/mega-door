import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

// رابط نشط: خلفية "pill" خفيفة + لون مميز (مو باللون فقط)، وhover بتغيّر لوني تدريجي للروابط غير النشطة
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ${
    isActive ? "bg-brand/15 text-brand" : "text-ink/70 hover:bg-white/5 hover:text-ink"
  }`;

export default function Header() {
  const categories = useCategories();

  // روابط التنقل ظاهرة دائماً (بدون همبرغر) بكل القياسات. بما إن dir=rtl:
  // ترتيب flex الطبيعي يبدأ أقصى اليمين. بالفون نخلي الشعار آخر عنصر
  // بصرياً (order-last) فيطلع أقصى اليسار، والروابط تاخذ الحيز المتبقي
  // مع سحب أفقي عند الحاجة. بالحاسبة (lg) نرجع الشعار لأول عنصر
  // (order-first) فيطلع أقصى اليمين كالسابق، والروابط تتوسط الهيدر.
  const navLinks = [
    { to: "/", label: "الرئيسية", end: true },
    ...categories.map((c) => ({ to: `/${c.id}`, label: c.label, end: false })),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-[0_1px_14px_rgba(0,0,0,0.28)]">
      <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link
          to="/"
          className="order-last flex shrink-0 items-center gap-2 lg:order-first"
          aria-label="ميكا للأبواب - الرئيسية"
        >
          <span className="hidden font-display text-base font-extrabold tracking-tight text-ink sm:inline">
            MEGA DOOR
          </span>
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-12 w-12 object-contain"
          />
        </Link>

        <nav
          className="scrollbar-hide flex min-w-0 flex-1 items-center gap-2 overflow-x-auto lg:justify-center"
          aria-label="أقسام الموقع"
        >
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
