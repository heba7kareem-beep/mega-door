import type { DoorModel } from "../types/model";

// المسار الفعلي يتغيّر حسب مكان النشر (حالياً GitHub Pages بمسار فرعي) - استخدام
// BASE_URL هنا يخلي الصور تشتغل صح بأي مسار نشر بدون تعديل يدوي لاحقاً.
const IMG = `${import.meta.env.BASE_URL}images/models/`;

/**
 * موديلات حقيقية من صور تصوير فعلي لأبواب ميكا (مصدرها مجلد أرشيف الصور E:\ميكا،
 * بعد قصّ لوحة الشعار/التواصل الجانبية والإبقاء على الصورة الفوتوغرافية فقط).
 *
 * ⚠️ الحقول غير المؤكدة (الخامة، المقاس الدقيق، المواصفات، الاستخدام، "الأكثر طلباً")
 * غير موجودة عمداً - لم تُخمَّن، وتُترك فارغة بانتظار المعلومات الحقيقية من فريق ميكا
 * (تُراجع وتُضاف موديلاً موديلاً). الحقول الموجودة فقط هي المؤكدة فعلياً: الاسم،
 * القسم، الصورة الحقيقية، ولون accent المُستخرج آلياً من بكسلات الصورة نفسها (وليس
 * وصفاً تسويقياً للون - يُستخدم داخلياً فقط لتأثيرات الواجهة).
 */
export const demoModels: DoorModel[] = [
  {
    id: "md-105",
    modelNumber: "MD-105",
    name: "باب أقواس عصرية",
    category: "interior",
    images: [`${IMG}md-105-1.jpg`],
    isPopular: false,
    accent: "#50311e",
    styleLabel: "تصميم أقواس",
  },
  {
    id: "md-106",
    modelNumber: "MD-106",
    name: "باب كلاسيك لوحين",
    category: "interior",
    images: [`${IMG}md-106-1.jpg`],
    isPopular: false,
    accent: "#5a3d26",
    styleLabel: "تصميم كلاسيك",
  },
  {
    id: "md-107",
    modelNumber: "MD-107",
    name: "باب كلاسيك مُطعّم",
    category: "interior",
    images: [`${IMG}md-107-1.jpg`],
    isPopular: false,
    accent: "#664532",
    styleLabel: "تصميم مُطعّم",
  },
  {
    id: "md-108",
    modelNumber: "MD-108",
    name: "باب هندسي مثلثات",
    category: "interior",
    images: [`${IMG}md-108-1.jpg`],
    isPopular: false,
    accent: "#492b16",
    styleLabel: "تصميم هندسي",
  },
  {
    id: "md-109",
    modelNumber: "MD-109",
    name: "باب مربعات متداخلة",
    category: "interior",
    images: [`${IMG}md-109-1.jpg`],
    isPopular: false,
    accent: "#624b3e",
    styleLabel: "تصميم مربعات",
  },
  {
    id: "md-110",
    modelNumber: "MD-110",
    name: "باب غرافيتي مودرن",
    category: "interior",
    images: [`${IMG}md-110-1.jpg`],
    isPopular: false,
    accent: "#3a3a3c",
    styleLabel: "غرافيتي مودرن",
  },
];

/**
 * دوال مساعدة عامة (pure) تعمل على أي لائحة موديلات تُمرَّر لها - تُستخدم إما مع
 * `demoModels` مباشرة، أو (بمعظم صفحات الموقع) مع النسخة الحيّة القادمة من
 * `useModels()` في `src/lib/modelsStore.ts` بحيث تنعكس تعديلات لوحة الإدارة فوراً.
 */
export function getModelById(models: DoorModel[], id: string): DoorModel | undefined {
  return models.find((m) => m.id === id);
}

export function getModelsByCategory(models: DoorModel[], category: DoorModel["category"]): DoorModel[] {
  return models.filter((m) => m.category === category);
}

export function getPopularModels(models: DoorModel[]): DoorModel[] {
  return models.filter((m) => m.isPopular);
}

export function searchModels(models: DoorModel[], query: string): DoorModel[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return models.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.modelNumber.toLowerCase().includes(q) ||
      (m.material ?? "").toLowerCase().includes(q) ||
      (m.color ?? "").toLowerCase().includes(q)
  );
}
