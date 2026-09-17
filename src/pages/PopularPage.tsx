import { useEffect } from "react";
import { getPopularModels } from "../data/models";
import { useModels } from "../lib/modelsStore";
import CategorySection from "../components/CategorySection";
import { setPageSEO } from "../lib/seo";

export default function PopularPage() {
  useEffect(() => {
    setPageSEO({
      title: "الأكثر طلباً | ميكا للأبواب",
      description: "أبرز موديلات الأبواب الداخلية والخارجية الأكثر طلباً لدى زبائن ميكا في بغداد.",
      path: "/popular",
    });
  }, []);

  const allModels = useModels();
  const models = getPopularModels(allModels);

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
          <h1 className="font-display text-3xl font-extrabold text-ink">الأكثر طلباً</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            الموديلات التي يختارها أغلب زبائننا، من الأبواب الداخلية والخارجية.
          </p>
        </div>
      </div>
      <CategorySection title={`${models.length} موديل`} models={models} />
    </div>
  );
}
