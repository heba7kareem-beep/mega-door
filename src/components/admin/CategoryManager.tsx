import { useState, type FormEvent } from "react";
import { useCategories, addCategory, updateCategory, deleteCategory } from "../../lib/categoriesStore";
import type { DoorModel } from "../../types/model";

type View = { mode: "list" } | { mode: "add" } | { mode: "edit"; id: string };

/**
 * إدارة الأقسام (داخلية/خارجية/قواطع...) من لوحة الإدارة مباشرة - كل قسم جديد يُضاف من هنا
 * يصير له تلقائياً صفحة بالموقع على /<معرّف القسم> ورابط بالقائمة العلوية، دون أي تعديل بالكود.
 */
export default function CategoryManager({ models }: { models: DoorModel[] }) {
  const categories = useCategories();
  const [view, setView] = useState<View>({ mode: "list" });
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startAdd() {
    setLabel("");
    setDescription("");
    setError(null);
    setView({ mode: "add" });
  }

  function startEdit(id: string) {
    const c = categories.find((cat) => cat.id === id);
    if (!c) return;
    setLabel(c.label);
    setDescription(c.description);
    setError(null);
    setView({ mode: "edit", id });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError("اسم القسم مطلوب.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (view.mode === "add") {
        await addCategory({ label: label.trim(), description: description.trim() });
      } else if (view.mode === "edit") {
        await updateCategory(view.id, { label: label.trim(), description: description.trim() });
      }
      setView({ mode: "list" });
    } catch (err) {
      console.error(err);
      setError("تعذّر حفظ القسم. تأكد من اتصالك بالإنترنت وجرّب مرة أخرى.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    const usedBy = models.filter((m) => m.category === id).length;
    if (usedBy > 0) {
      window.alert(
        `ما تقدر تحذف "${name}" حالياً - فيه ${usedBy} موديل مرتبط بهذا القسم. غيّر قسم هذي الموديلات أولاً من نموذج تعديل الموديل، وبعدها احذف القسم.`
      );
      return;
    }
    if (!window.confirm(`متأكد تريد حذف قسم "${name}"؟`)) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
    } catch (err) {
      console.error(err);
      window.alert("تعذّر حذف القسم. تأكد من اتصالك بالإنترنت وجرّب مرة أخرى.");
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none";
  const labelClass = "mb-1.5 block text-xs font-bold text-muted";

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-ink">الأقسام</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            كل قسم تضيفه هنا يصير له تلقائياً صفحة بالموقع ورابط بالقائمة العلوية - تختاره بعدين
            لأي موديل من حقل "القسم" بنموذج الموديل.
          </p>
        </div>
        {view.mode === "list" && (
          <button
            type="button"
            onClick={startAdd}
            className="shrink-0 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
          >
            + إضافة قسم جديد
          </button>
        )}
      </div>

      {view.mode === "list" && (
        <ul className="divide-y divide-border">
          {categories.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-ink">{c.label}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {c.description || "بدون وصف"} · <span dir="ltr">/{c.id}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(c.id)}
                  className="rounded-full border border-border px-3 py-1 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.label)}
                  disabled={deletingId === c.id}
                  className="rounded-full border border-border px-3 py-1 text-xs font-bold text-red-300 transition hover:border-red-400 disabled:opacity-50"
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
          {categories.length === 0 && <li className="py-4 text-center text-xs text-muted">لا توجد أقسام بعد.</li>}
        </ul>
      )}

      {(view.mode === "add" || view.mode === "edit") && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <div>
            <label className={labelClass}>اسم القسم *</label>
            <input
              className={inputClass}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="مثال: أبواب حمامات"
            />
          </div>
          <div>
            <label className={labelClass}>وصف قصير (يظهر بأعلى صفحة القسم)</label>
            <input
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: أبواب مخصصة للحمامات مقاومة للرطوبة"
            />
          </div>
          {view.mode === "edit" && (
            <p className="text-xs text-muted">
              رابط الصفحة <span dir="ltr">/{view.id}</span> لا يتغيّر بعد الإنشاء حتى ما تنكسر الروابط.
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand px-5 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "...جارِ الحفظ" : "حفظ"}
            </button>
            <button
              type="button"
              onClick={() => setView({ mode: "list" })}
              className="rounded-full border border-border px-5 py-2 text-xs font-bold text-ink transition hover:border-brand hover:text-brand"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
