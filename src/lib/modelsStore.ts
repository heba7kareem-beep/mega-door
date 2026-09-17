import { useSyncExternalStore } from "react";
import type { DoorModel } from "../types/model";
import { demoModels as seedModels } from "../data/models";

/**
 * مخزن بيانات الموديلات - يُستخدم من لوحة الإدارة (`/admin`) والموقع العام معاً.
 *
 * ⚠️ هذه مرحلة مؤقتة: البيانات تُحفظ محلياً في متصفح الزائر (localStorage) فقط،
 * وليست على سيرفر أو قاعدة بيانات مشتركة. أي تعديل من لوحة الإدارة يظهر فقط على
 * نفس المتصفح/الجهاز الذي سُوّي منه. لاحقاً عند ربط Supabase يصير هذا المخزن
 * قاعدة بيانات حقيقية مشتركة بين كل الأجهزة.
 */

const STORAGE_KEY = "megadoor_models_v1";

type Listener = () => void;
let listeners: Listener[] = [];
let cache: DoorModel[] | null = null;

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readInitial(): DoorModel[] {
  if (!hasStorage()) return seedModels;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as DoorModel[];
    }
  } catch (err) {
    console.error("تعذّرت قراءة بيانات الموديلات المحفوظة بالمتصفح، سيتم استخدام البيانات الافتراضية.", err);
  }
  return seedModels;
}

function persist(models: DoorModel[]) {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch (err) {
    console.error("تعذّر حفظ بيانات الموديلات بالمتصفح (قد تكون مساحة التخزين المحلي ممتلئة).", err);
  }
}

function emitChange() {
  listeners.forEach((l) => l());
}

export function getModelsSnapshot(): DoorModel[] {
  if (cache === null) cache = readInitial();
  return cache;
}

export function subscribeModels(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function setModels(models: DoorModel[]) {
  cache = models;
  persist(models);
  emitChange();
}

/** يقرأ لائحة الموديلات الحالية ويعيد رسم أي مكوّن يستخدمه عند أي تعديل (إضافة/تعديل/حذف). */
export function useModels(): DoorModel[] {
  return useSyncExternalStore(subscribeModels, getModelsSnapshot, () => seedModels);
}

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "model";
}

function uniqueId(base: string, existing: DoorModel[]): string {
  const taken = new Set(existing.map((m) => m.id));
  let id = slugify(base);
  let i = 2;
  while (taken.has(id)) {
    id = `${slugify(base)}-${i}`;
    i++;
  }
  return id;
}

export function addModel(data: Omit<DoorModel, "id">): DoorModel {
  const current = getModelsSnapshot();
  const id = uniqueId(data.modelNumber || data.name, current);
  const model: DoorModel = { ...data, id };
  setModels([model, ...current]);
  return model;
}

export function updateModel(id: string, data: Omit<DoorModel, "id">): void {
  const current = getModelsSnapshot();
  setModels(current.map((m) => (m.id === id ? { ...data, id } : m)));
}

export function deleteModel(id: string): void {
  const current = getModelsSnapshot();
  setModels(current.filter((m) => m.id !== id));
}

/** يمسح كل تعديلات لوحة الإدارة المحفوظة بهذا المتصفح ويرجّع البيانات التجريبية الأصلية. */
export function resetModelsToDefaults(): void {
  setModels(seedModels);
}
