import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * يلتقط أي خطأ وقت التشغيل داخل لوحة الإدارة. بدونه، أي خطأ برندر اللوحة كان يمسح
 * التطبيق كله ويخلّي الصفحة سوداء فارغة بدون أي رسالة. خاص بلوحة الإدارة فقط - لا
 * يغيّر أي شيء بالموقع العام.
 */
export default class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("خطأ بلوحة الإدارة:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-right">
          <h1 className="mb-2 font-display text-lg font-extrabold text-ink">تعذّر فتح لوحة الإدارة</h1>
          <p className="mb-4 text-sm text-muted">صار خطأ غير متوقع أثناء تحميل اللوحة. جرّب تحديث الصفحة.</p>
          <p className="mb-4 break-words rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-muted" dir="ltr">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            تحديث الصفحة
          </button>
        </div>
      </div>
    );
  }
}
