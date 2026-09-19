import { useSyncExternalStore } from "react";
import { supabase } from "./supabaseClient";

/**
 * "قالب مواصفات" - مجموعة حقول مشتركة (النوع/الخامة، أين يُستخدم، نقاط المواصفات)
 * تُملأ مرة وحدة وتُستخدم لتعبئة نموذج إضافة موديل جديد تلقائياً، بدل إعادة كتابة
 * نفس المواصفات لكل موديل يشترك بها. اختيار القالب لا "يربط" الموديل بالقالب -
 * القيم تُنسخ لحقول الموديل نفسه وتبقى قابلة للتعديل بحرية بعدها.
 */
export interface SpecTemplate {
  id: string;
  /** اسم القالب كما يظهر بلوحة الإدارة، مثال: "باب داخلي قياسي" */
  name: string;
  material?: string;
  usage?: string;
  specs?: string[];
}

type Listener = () => void;
let listeners: Listener[] = [];
let cache: SpecTemplate[] = [];

type SpecTemplateRow = {
  id: string;
  name: string;
  material: string | null;
  usage: string | null;
  specs: string[] | null;
};

function rowToTemplate(row: SpecTemplateRow): SpecTemplate {
  return {
    id: row.id,
    name: row.name,
    material: row.material ?? undefined,
    usage: row.usage ?? undefined,
    specs: row.specs ?? undefined,
  };
}

function emitChange() {
  listeners.forEach((l) => l());
}

async function fetchSpecTemplates(): Promise<void> {
  const { data, error } = await supabase
    .from("spec_templates")
    .select("id,name,material,usage,specs")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("تعذّرت قراءة قوالب المواصفات من قاعدة البيانات.", error);
    return;
  }
  cache = (data ?? []).map(rowToTemplate);
  emitChange();
}
void fetchSpecTemplates();

export function getSpecTemplatesSnapshot(): SpecTemplate[] {
  return cache;
}

export function subscribeSpecTemplates(listener: Listener): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function useSpecTemplates(): SpecTemplate[] {
  return useSyncExternalStore(subscribeSpecTemplates, getSpecTemplatesSnapshot, () => []);
}

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "template";
}

function uniqueId(base: string, existing: SpecTemplate[]): string {
  const taken = new Set(existing.map((t) => t.id));
  let id = slugify(base);
  let i = 2;
  while (taken.has(id)) {
    id = `${slugify(base)}-${i}`;
    i++;
  }
  return id;
}

export type SpecTemplateInput = { name: string; material: string; usage: string; specs: string[] };

export async function addSpecTemplate(data: SpecTemplateInput): Promise<SpecTemplate> {
  const current = getSpecTemplatesSnapshot();
  const id = uniqueId(data.name, current);
  const { error } = await supabase.from("spec_templates").insert({
    id,
    name: data.name,
    material: data.material || null,
    usage: data.usage || null,
    specs: data.specs.length > 0 ? data.specs : null,
  });
  if (error) throw error;
  await fetchSpecTemplates();
  return { id, name: data.name, material: data.material, usage: data.usage, specs: data.specs };
}

export async function updateSpecTemplate(id: string, data: SpecTemplateInput): Promise<void> {
  const { error } = await supabase
    .from("spec_templates")
    .update({
      name: data.name,
      material: data.material || null,
      usage: data.usage || null,
      specs: data.specs.length > 0 ? data.specs : null,
    })
    .eq("id", id);
  if (error) throw error;
  await fetchSpecTemplates();
}

export async function deleteSpecTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("spec_templates").delete().eq("id", id);
  if (error) throw error;
  await fetchSpecTemplates();
}
