import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/categoriesStore";

export default function Header() {
  const categories = useCategories();

  // بطلب صريح: الأقسام تظهر جهة اليمين والشعار جهة اليسار (بكل الأحجام بما فيها
  // الهاتف)، لذا صار عنصر <nav> أول شيء بالـ DOM (يظهر أقصى اليمين بـ RTL)
  // والشعار آخر عنصر (يظهر أقصى اليسار). "الرئيسية" أول رابط بالقائمة حتى يكون
  // أول ما يُقرأ من اليمين.
  const navLinks = [
    { to: "/", label: "الرئيسية", end: true },
    ...categories.map((c) => ({ to: `/${c.id}`, label: c.label, end: false })),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/[0.86] backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <nav
          className="scrollbar-hide flex min-w-0 items-center gap-5 overflow-x-auto sm:gap-6"
          aria-label="أقسام الموقع"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }: { isActive: boolean }) =>
                `relative shrink-0 whitespace-nowrap pb-1 text-sm font-semibold transition ${
                  isActive
                    ? "text-brand after:absolute after:inset-x-0 after:-bottom-[3px] after:h-0.5 after:rounded-full after:bg-brand"
                    : "text-ink/70 hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="ميكا للأبواب - الرئيسية">
          <span className="hidden font-display text-base font-extrabold tracking-tight text-ink sm:inline">
            MEGA DOOR
          </span>
          <img
            src={`${import.meta.env.BASE_URL}images/brand/mega-door-logo.png`}
            alt="شعار ميكا للأبواب"
            className="h-14 w-14 object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
