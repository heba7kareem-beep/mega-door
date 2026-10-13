import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabaseClient";

/**
 * يحجب محتوى لوحة الإدارة خلف تسجيل دخول حقيقي عبر Supabase Auth (بريد + كلمة مرور).
 * التحقق يصير بالكامل على سيرفر Supabase - لا توجد أي كلمة مرور مخزَّنة بكود الواجهة.
 * لا يوجد نموذج "إنشاء حساب" عمداً: المستخدم الوحيد المسموح له يُنشأ يدوياً من لوحة
 * تحكم Supabase (Authentication → Users)، وتسجيل الدخول العام معطّل من إعدادات
 * المشروع حتى لا يقدر أي زائر ينشئ حساب لنفسه.
 */
/** أقصى مدة ننتظرها للتحقق من الجلسة المحفوظة قبل ما نعرض نموذج الدخول مباشرة. */
const SESSION_CHECK_TIMEOUT_MS = 6000;

export default function AdminLoginGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    // getSession ممكن يتأخر كثير (أو يعلّق) إذا كانت هناك جلسة قديمة منتهية ومحاولة
    // تجديدها عبر الشبكة بطيئة أو فاشلة - سابقاً هذا كان يخلّي الصفحة سوداء فارغة. هسه:
    // أي خطأ أو تأخير أكثر من SESSION_CHECK_TIMEOUT_MS يعرض نموذج الدخول مباشرة.
    const timeout = window.setTimeout(() => {
      if (cancelled || resolved) return;
      setSessionCheckFailed(true);
      setSession((current) => (current === undefined ? null : current));
    }, SESSION_CHECK_TIMEOUT_MS);

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        resolved = true;
        if (cancelled) return;
        if (sessionError) {
          console.error("تعذّر التحقق من جلسة الدخول المحفوظة.", sessionError);
          setSessionCheckFailed(true);
        }
        setSession(data.session ?? null);
      })
      .catch((err) => {
        resolved = true;
        if (cancelled) return;
        console.error("تعذّر التحقق من جلسة الدخول المحفوظة.", err);
        setSessionCheckFailed(true);
        setSession(null);
      })
      .finally(() => window.clearTimeout(timeout));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      resolved = true;
      setSession(newSession);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) setError(`تعذّر الدخول: ${signInError.message} (${signInError.status ?? "?"})`);
  }

  // لسا ما تحقّقنا من الجلسة المحفوظة (أول تحميل) - نعرض حالة تحميل واضحة بدل صفحة فارغة
  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4" role="status" aria-live="polite">
        <p className="text-sm text-muted">جارِ التحقق من الدخول...</p>
      </div>
    );
  }

  if (session) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <h1 className="mb-1 font-display text-lg font-extrabold text-ink">دخول لوحة الإدارة</h1>
        <p className="mb-5 text-sm text-muted">حساب مخصّص لإدارة ميكا فقط - سجّل دخولك للمتابعة.</p>
        {sessionCheckFailed && (
          <p className="mb-4 rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-muted">
            تعذّر التحقق من جلسة الدخول السابقة (ممكن الاتصال بطيء). سجّل دخولك من جديد.
          </p>
        )}
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-bold text-muted">البريد الإلكتروني</span>
          <input
            type="email"
            autoFocus
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold text-muted">كلمة المرور</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "جارِ التحقق..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
