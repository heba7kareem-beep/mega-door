/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Amiri", "Tajawal", "Tahoma", "serif"],
        body: ["Tajawal", "Tahoma", "sans-serif"],
      },
      colors: {
        // Dark theme مطابق للمرجع البصري الذي اعتمده العميل: خلفية داكنة + أزرق Accent فاتح
        ink: "#F4F6FB",
        surface: "#0F1424",
        canvas: "#05070D",
        muted: "#8B93A8",
        border: "#FFFFFF17",
        brand: {
          DEFAULT: "#1489FF",
          dark: "#59AAFF",
          soft: "#142544",
        },
        cta: {
          DEFAULT: "#D7BD93",
          ink: "#21170D",
        },
        silver: {
          DEFAULT: "#9AA1AC",
          light: "#C7CCD3",
          dark: "#565B66",
        },
        whatsapp: "#25D366",
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};
