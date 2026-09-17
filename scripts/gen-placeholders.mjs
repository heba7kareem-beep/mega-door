// يولّد صوراً توضيحية (SVG) بسيطة لكل موديل تجريبي إلى أن تُرسل الصور الحقيقية.
// تشغيل: node scripts/gen-placeholders.mjs
import { writeFileSync, mkdirSync } from "fs";

const outDir = new URL("../public/images/models/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const models = [
  { id: "md-101", label: "MD-101", accent: "#B08D57", panel: "raised" },
  { id: "md-102", label: "MD-102", accent: "#6B4A21", panel: "lines" },
  { id: "md-103", label: "MD-103", accent: "#9FB8C4", panel: "glass" },
  { id: "md-104", label: "MD-104", accent: "#A9762F", panel: "carved" },
  { id: "mx-201", label: "MX-201", accent: "#4B4B4E", panel: "security" },
  { id: "mx-202", label: "MX-202", accent: "#2E2A22", panel: "ornate" },
  { id: "mx-203", label: "MX-203", accent: "#8C8C8C", panel: "steel" },
  { id: "mx-204", label: "MX-204", accent: "#3B2A1A", panel: "heavy" },
];

function panelLines(style, accent) {
  switch (style) {
    case "glass":
      return `
        <rect x="70" y="60" width="160" height="260" rx="6" fill="#EAF2F5" stroke="${accent}" stroke-width="4"/>
        <line x1="70" y1="150" x2="230" y2="150" stroke="${accent}" stroke-width="3"/>
        <line x1="70" y1="240" x2="230" y2="240" stroke="${accent}" stroke-width="3"/>`;
    case "ornate":
      return `
        <rect x="66" y="56" width="80" height="120" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>
        <rect x="154" y="56" width="80" height="120" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>
        <rect x="66" y="196" width="168" height="130" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>
        <circle cx="150" cy="256" r="18" fill="none" stroke="${accent}" stroke-width="2"/>`;
    case "security":
      return `
        <rect x="70" y="60" width="160" height="260" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>
        <line x1="70" y1="130" x2="230" y2="130" stroke="${accent}" stroke-width="2"/>
        <line x1="70" y1="250" x2="230" y2="250" stroke="${accent}" stroke-width="2"/>
        <rect x="96" y="170" width="30" height="30" fill="${accent}" opacity="0.25"/>`;
    case "steel":
      return `
        <rect x="70" y="60" width="160" height="260" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>
        <line x1="70" y1="95" x2="230" y2="95" stroke="${accent}" stroke-width="1.5"/>
        <line x1="70" y1="290" x2="230" y2="290" stroke="${accent}" stroke-width="1.5"/>`;
    case "heavy":
      return `
        <rect x="66" y="56" width="168" height="270" rx="4" fill="none" stroke="${accent}" stroke-width="5"/>
        <rect x="86" y="76" width="128" height="230" rx="2" fill="none" stroke="${accent}" stroke-width="2"/>`;
    case "carved":
      return `
        <rect x="70" y="60" width="160" height="260" rx="6" fill="none" stroke="${accent}" stroke-width="3"/>
        <path d="M90 100 q60 30 120 0" fill="none" stroke="${accent}" stroke-width="2"/>
        <path d="M90 220 q60 -30 120 0" fill="none" stroke="${accent}" stroke-width="2"/>`;
    case "lines":
      return `
        <rect x="70" y="60" width="160" height="260" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>
        <line x1="70" y1="140" x2="230" y2="140" stroke="${accent}" stroke-width="2"/>
        <line x1="70" y1="220" x2="230" y2="220" stroke="${accent}" stroke-width="2"/>
        <line x1="150" y1="60" x2="150" y2="320" stroke="${accent}" stroke-width="2" opacity="0.5"/>`;
    default:
      return `
        <rect x="80" y="70" width="140" height="110" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>
        <rect x="80" y="200" width="140" height="110" rx="4" fill="none" stroke="${accent}" stroke-width="3"/>`;
  }
}

function svgFor(model, variant) {
  const { accent, panel } = model;
  const bg = "#F3EEE5";
  const frameOpacity = variant === 2 ? 0.85 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="600" height="800" role="img" aria-label="صورة توضيحية لموديل ${model.label}">
  <rect width="300" height="400" fill="${bg}"/>
  <rect x="20" y="20" width="260" height="360" rx="8" fill="none" stroke="#D8CFBE" stroke-width="1.5"/>
  <g opacity="${frameOpacity}">
    <rect x="60" y="45" width="180" height="330" rx="8" fill="${accent}" opacity="0.12"/>
    <rect x="60" y="45" width="180" height="330" rx="8" fill="none" stroke="${accent}" stroke-width="6"/>
    ${panelLines(panel, accent)}
    <circle cx="${variant === 1 ? 84 : 216}" cy="230" r="5" fill="${accent}"/>
  </g>
  <text x="150" y="392" text-anchor="middle" font-family="Tahoma, sans-serif" font-size="11" fill="#7A7267">صورة توضيحية مؤقتة</text>
  <text x="150" y="36" text-anchor="middle" font-family="Tahoma, sans-serif" font-size="13" font-weight="bold" fill="#241F1A">${model.label}</text>
</svg>`;
}

for (const model of models) {
  for (const variant of [1, 2]) {
    const svg = svgFor(model, variant);
    const filename = `${model.id}-${variant}.svg`;
    writeFileSync(new URL(filename, outDir), svg, "utf-8");
    console.log("wrote", filename);
  }
}
