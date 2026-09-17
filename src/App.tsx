import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CategoryListPage from "./pages/CategoryListPage";
import PopularPage from "./pages/PopularPage";
import ModelDetailPage from "./pages/ModelDetailPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminPage from "./pages/AdminPage";
import { trackPageView } from "./lib/metaPixel";

export default function App() {
  const location = useLocation();

  // تتبع PageView عند كل تغيير مسار (Meta Pixel)
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);

  return (
    <Routes>
      {/* لوحة الإدارة منشورة الآن مع الموقع العام - محمية بتسجيل دخول حقيقي عبر
          Supabase Auth (انظر AdminLoginGate.tsx)، يتحقق منه سيرفر Supabase نفسه،
          وليس بكلمة مرور مخزَّنة بكود الواجهة. */}
      <Route path="admin" element={<AdminPage />} />
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="popular" element={<PopularPage />} />
        <Route path="model/:id" element={<ModelDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        {/* مسار ديناميكي لأي قسم مُدار من لوحة الإدارة (وليس فقط الأقسام الثلاثة الافتراضية:
            /interior و /exterior و /partitions تستمر تعمل لأن معرّفاتها تبقى نفسها) */}
        <Route path=":categorySlug" element={<CategoryListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
