import { useSyncExternalStore } from "react";

export interface DoorCategoryInfo {
  /** المعرّف = جزء الرابط، مثال: interior → /interior. لا يتغيّر بعد الإنشاء. */
  id: string;
  /** اسم القسم كما يظهر بالقائمة العلوية وعنوان الصفحة وجدول لوحة الإدارة */
  label: string;
  /** وصف قصير يظهر تحت عنوان صفحة القسم ويُستخدم كوصف SEO لها */
  description: string;
}

const STORAGE_KEY = "megadoor_categories_v1";

const seedCategories: DoorCategoryInfo[] = [
  {
    id: "interior",
    label: "الأبواب الداخلية والصحيات",
    description:
      "تشكيلة أبواب داخلية وصحيات بخامات خشبية وزجاجية متعددة تناسب غرف النوم والمكاتب والصالات.",
  },
  {
    id: "exterior",
    label: "الأبواب الخارجية",
    description:
      "أبواب خارجية حديدية عالية الأمان بتصاميم كلاسيكية وعصرية تناسب المداخل الرئيسية والفلل.",
  },
  {
    id: "partitions",
    label: "القواطع الداخلية",
    description: "قواطع داخلية بتصاميم خشبية وزجاجية عصرية لفصل المساحات المفتوحة دون إغلاقها بالكامل.",
  },
];

type Listener = () => void;
let listeners: Listener[] = [];
let cache: DoorCategoryInfo[] | null = null;

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readInitial(): DoorCategoryInfo[] {
  if (!hasStorage()) return seedCategories;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedCategories;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return seedCategories;
  } catch {
    return seedCategories;
  }
}

function persist(categories: DoorCategoryInfo[]) {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // مساحة التخزين ممتلئة أو غير متاحة - نتجاهل بصمت، القيم تبقى بالذاكرة لهذه الجلسة فقط
  }
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getCategoriesSnapshot(): DoorCategoryInfo[] {
  if (cache === null) cache = readInitial();
  return cache;
}

export function subscribeCategories(listener: Listener): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function setCategories(categories: DoorCategoryInfo[]) {
  cache = categories;
  persist(categories);
  emitChange();
}

export function useCategories(): DoorCategoryInfo[] {
  return useSyncExternalStore(subscribeCategories, getCategoriesSnapshot, () => seedCategories);
}

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "section";
}

/** مسارات ثابتة بالموقع لا يجوز أن يتصادم معها معرّف قسم جديد (وإلا صار غير قابل للوصول) */
const RESERVED_SLUGS = ["admin", "popular", "search", "model", "design-your-door"];

function uniqueId(base: string, existing: DoorCategoryInfo[]): string {
  let candidate = base;
  let n = 2;
  while (RESERVED_SLUGS.includes(candidate) || existing.some((c) => c.id === candidate)) {
    candidate = `${base}-${n}`;
    n++;
  }
  return candidate;
}

export function addCategory(data: { label: string; description: string }): DoorCategoryInfo {
  const current = getCategoriesSnapshot();
  const id = uniqueId(slugify(data.label), current);
  const record: DoorCategoryInfo = { id, label: data.label, description: data.description };
  setCategories([...current, record]);
  return record;
}

/** تعديل الاسم والوصف فقط - المعرّف (رابط الصفحة) لا يتغيّر بعد الإنشاء حتى لا تنكسر الروابط المفهرسة. */
export function updateCategory(id: string, data: { label: string; description: string }): void {
  const current = getCategoriesSnapshot();
  setCategories(current.map((c) => (c.id === id ? { ...c, label: data.label, description: data.description } : c)));
}

export function deleteCategory(id: string): void {
  const current = getCategoriesSnapshot();
  setCategories(current.filter((c) => c.id !== id));
}

export function getCategoryById(categories: DoorCategoryInfo[], id: string): DoorCategoryInfo | undefined {
  return categories.find((c) => c.id === id);
}
