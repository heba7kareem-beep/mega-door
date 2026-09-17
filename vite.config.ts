import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// إعدادات Vite لمشروع ميكا للأبواب
// base: "./" يجعل الروابط النسبية تعمل بشكل صحيح عند النشر على أي مسار فرعي
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
