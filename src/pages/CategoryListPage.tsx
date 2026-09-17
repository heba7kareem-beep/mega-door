import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getModelsByCategory } from "../data/models";
import { useModels } from "../lib/modelsStore";
import { useCategories, getCategoryById } from "../lib/categoriesStore";
import CategorySection from "../components/CategorySection";
import { setPageSEO } from "../lib/seo";
import NotFoundPage from "./NotFoundPage";

/**
 * صفحة قسم واحد - تعمل لأي قسم موجود بلوحة الإدارة (وليس فقط الأقسام الثلاثة الافتراضية)
 * عبر مسار ديناميكي /:categorySlug. إذا لم يوجد قسم بهذا المعرّف تُعرض صفحة 404.
 */
export default function CategoryListPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const categories = useCategories();
  const category = categorySlug ? getCategoryById(categories, categorySlug) : undefined;

  const allModels = useModels();
  const models = category ? getModelsByCategory(allModels, category.id) : [];

  useEffect(() => {
    if (!category) return;
    setPageSEO({
      title: `${category.label} | ميكا للأبواب - بغداد`,
      description: category.description,
      path: `/${category.id}`,
    });
  }, [category]);

  if (!category) return <NotFoundPage />;

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-brand"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l7 7-7 7M22 12H2" />
            </svg>
            الرجوع إلى الصفحة الرئيسية
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-ink">{category.label}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{category.description}</p>
        </div>
      </div>
      {models.length > 0 ? (
        <CategorySection title={`${models.length} موديل متوفر`} models={models} />
      ) : (
        <p className="mx-auto max-w-content px-4 py-16 text-center text-muted sm:px-6">
          لا توجد موديلات في هذا القسم حالياً.
        </p>
      )}
    </div>
  );
}
