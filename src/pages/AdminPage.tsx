import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useModels, addModel, updateModel, deleteModel } from "../lib/modelsStore";
import { useCategories, getCategoryById } from "../lib/categoriesStore";
import { setPageSEO } from "../lib/seo";
import { supabase } from "../lib/supabaseClient";
import ModelForm, { type ModelFormValues } from "../components/admin/ModelForm";
import CategoryManager from "../components/admin/CategoryManager";
import SpecTemplateManager from "../components/admin/SpecTemplateManager";
import SiteSettingsManager from "../components/admin/SiteSettingsManager";
import AdminLoginGate from "../components/admin/AdminLoginGate";

type View = { mode: "list" } | { mode: "add" } | { mode: "edit"; id: string };

export default function AdminPage() {
  const models = useModels();
  const categories = useCategories();
  const [view, setView] = useState<View>({ mode: "list" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setPageSEO({
      title: "لوحة الإدارة | ميكا للأبواب",
      description: "لوحة إدارة داخلية لإضافة وتعديل موديلات أبواب ميكا.",
      path: "/admin",
    });
  }, []);

  const editingModel = view.mode === "edit" ? models.find((m) => m.id === view.id) : undefined;

  async function handleAdd(values: ModelFormValues) {
    await addModel(values);
    setView({ mode: "list" });
  }

  async function handleEdit(values: ModelFormValues) {
    if (view.mode === "edit") {
      await updateModel(view.id, values);
      setView({ mode: "list" });
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`متأكد تريد حذف "${name}"؟ لا يمكن التراجع عن هذا.`)) return;
    setDeletingId(id);
    try {
      await deleteModel(id);
    } catch (err) {
      console.error(err);
      window.alert("تعذّر حذف الموديل. تأكد من اتصالك بالإنترنت وجرّب مرة أخرى.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLoginGate>
      <div className="min-h-screen bg-canvas">
        <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-ink">لوحة إدارة الموديلات</h1>
              <p className="mt-1 text-sm text-muted">
                إضافة وتعديل وحذف موديلات الأبواب، ورفع وترتيب الصور، وتحديد الأكثر طلباً.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm font-medium text-muted transition hover:text-brand">
                الرجوع للموقع
              </Link>
              <button
                type="button"
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium text-muted transition hover:text-red-300"
              >
                تسجيل خروج
              </button>
            </div>
          </div>

        {view.mode === "list" && (
          <>
            <SiteSettingsManager />
            <CategoryManager models={models} />
            <SpecTemplateManager />

            <div className="mb-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setView({ mode: "add" })}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              >
                + إضافة موديل جديد
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[640px] text-right text-sm">
                <thead className="bg-surface text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">الصورة</th>
                    <th className="px-3 py-2.5 font-bold">كود الموديل</th>
                    <th className="px-3 py-2.5 font-bold">الاسم</th>
                    <th className="px-3 py-2.5 font-bold">القسم</th>
                    <th className="px-3 py-2.5 font-bold">السعر</th>
                    <th className="px-3 py-2.5 font-bold">الأكثر طلباً</th>
                    <th className="px-3 py-2.5 font-bold" />
                  </tr>
                </thead>
                <tbody>
                  {models.map((m) => (
                    <tr key={m.id} className="border-t border-border">
                      <td className="px-3 py-2.5">
                        <div className="h-12 w-10 overflow-hidden rounded-md border border-border bg-canvas">
                          {m.images[0] && <img src={m.images[0]} alt="" className="h-full w-full object-contain" />}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-ink">{m.modelNumber}</td>
                      <td className="px-3 py-2.5 text-ink">{m.name}</td>
                      <td className="px-3 py-2.5 text-muted">{getCategoryById(categories, m.category)?.label ?? m.category}</td>
                      <td className="px-3 py-2.5 text-muted">
                        {m.price != null ? m.price.toLocaleString("ar-IQ") : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {m.isPopular ? (
                          <span className="rounded-full bg-brand/20 px-2 py-0.5 text-xs font-bold text-brand-dark">
                            نعم
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setView({ mode: "edit", id: m.id })}
                            className="rounded-full border border-border px-3 py-1 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id, m.name)}
                            disabled={deletingId === m.id}
                            className="rounded-full border border-border px-3 py-1 text-xs font-bold text-red-300 transition hover:border-red-400 disabled:opacity-50"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {models.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-muted">
                        لا توجد موديلات بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view.mode === "add" && (
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7">
            <h2 className="mb-5 text-lg font-bold text-ink">إضافة موديل جديد</h2>
            <ModelForm onSubmit={handleAdd} onCancel={() => setView({ mode: "list" })} />
          </div>
        )}

        {view.mode === "edit" && editingModel && (
          <div className="rounded-xl border border-border bg-surface p-5 sm:p-7">
            <h2 className="mb-5 text-lg font-bold text-ink">تعديل: {editingModel.name}</h2>
            <ModelForm initial={editingModel} onSubmit={handleEdit} onCancel={() => setView({ mode: "list" })} />
          </div>
        )}
        </div>
      </div>
    </AdminLoginGate>
  );
}
