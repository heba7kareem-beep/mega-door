import type { DoorModel } from "../types/model";
import ProductCard from "./ProductCard";

export default function CategorySection({
  title,
  subtitle,
  models,
}: {
  title: string;
  subtitle?: string;
  models: DoorModel[];
}) {
  return (
    <section className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:py-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-canvas px-3 py-1 text-xs font-bold text-muted">
            {title}
          </span>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {models.map((model) => (
          <ProductCard key={model.id} model={model} />
        ))}
      </div>
    </section>
  );
}
