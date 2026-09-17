import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// إعدادات Vite لمشروع ميكا للأبواب
// base: "/mega-door/" مطلوب لأن الموقع منشور حالياً على GitHub Pages بمسار فرعي
// (github.io/mega-door) وليس بجذر الدومين - يتغيّر لـ "/" فقط لو ربطنا دومين مخصص
// (megadoor.iq) لاحقاً بدل رابط GitHub Pages الفرعي.
export default defineConfig({
  plugins: [react()],
  base: "/mega-door/",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
