import m1 from "@/assets/mugshot-1.jpg";
import m2 from "@/assets/mugshot-2.jpg";
import m3 from "@/assets/mugshot-3.jpg";
import m4 from "@/assets/mugshot-4.jpg";
import m5 from "@/assets/mugshot-5.jpg";
import m6 from "@/assets/mugshot-6.jpg";
import type { WitnessDescription } from "./witness";

export type Mugshot = {
  id: string;
  name: string;
  image: string;
  attrs: Partial<WitnessDescription>;
  record: string;
};

export const MUGSHOTS: Mugshot[] = [
  { id: "DR-1041", name: "John Reeves", image: m1, record: "Aggravated theft, 2021",
    attrs: { gender: "male", age_range: "30-40", skin_tone: "light", hair_color: "brown", hair_style: "short", eyes: "almond", eye_color: "brown", facial_hair: "none", glasses: false } },
  { id: "DR-2287", name: "Marina Holst", image: m2, record: "Fraud, 2019",
    attrs: { gender: "female", age_range: "40-50", skin_tone: "light", hair_color: "brown", hair_style: "wavy", eyes: "almond", eye_color: "hazel", facial_hair: "none", glasses: false } },
  { id: "DR-3390", name: "Dario Velez", image: m3, record: "Assault, 2023",
    attrs: { gender: "male", age_range: "20-30", skin_tone: "tan", hair_color: "black", hair_style: "curly", eyes: "almond", eye_color: "brown", facial_hair: "goatee", glasses: false } },
  { id: "DR-4112", name: "Walter Krause", image: m4, record: "Robbery, 2018",
    attrs: { gender: "male", age_range: "40-50", skin_tone: "light", hair_color: "bald", hair_style: "bald", eyes: "narrow", eye_color: "blue", facial_hair: "goatee", glasses: false } },
  { id: "DR-5503", name: "Elena Park", image: m5, record: "Identity theft, 2022",
    attrs: { gender: "female", age_range: "30-40", skin_tone: "fair", hair_color: "blonde", hair_style: "long", eyes: "almond", eye_color: "hazel", facial_hair: "none", glasses: false } },
  { id: "DR-6678", name: "Henry Ashford", image: m6, record: "Embezzlement, 2017",
    attrs: { gender: "male", age_range: "60+", skin_tone: "fair", hair_color: "gray", hair_style: "short", eyes: "hooded", eye_color: "blue", facial_hair: "none", glasses: true } },
];

const W: Partial<Record<keyof WitnessDescription, number>> = {
  gender: 18, age_range: 14, skin_tone: 10, hair_color: 12, hair_style: 8,
  eyes: 6, eye_color: 6, facial_hair: 10, glasses: 8, face_shape: 4, nose: 2, lips: 2,
};

export function scoreMatch(d: WitnessDescription, m: Mugshot): number {
  let total = 0, hit = 0;
  for (const k in W) {
    const w = W[k as keyof WitnessDescription]!;
    total += w;
    const a = (d as any)[k];
    const b = (m.attrs as any)[k];
    if (b === undefined) continue;
    if (a === b) hit += w;
    else if (typeof a === "string" && typeof b === "string") {
      // partial credit for adjacent age ranges
      if (k === "age_range") {
        const ages = ["10-20","20-30","30-40","40-50","50-60","60+"];
        if (Math.abs(ages.indexOf(a) - ages.indexOf(b)) === 1) hit += w * 0.5;
      }
    }
  }
  const base = total ? hit / total : 0;
  const reliability = { poor: 0.7, fair: 0.85, good: 0.95, excellent: 1 }[d.observation_quality];
  // soften and add a tiny noise so two mugshots rarely tie
  return Math.min(0.99, base * reliability * (0.92 + (Math.abs(hashStr(m.id)) % 100) / 1500));
}

function hashStr(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h; }

export function rankMatches(d: WitnessDescription) {
  return MUGSHOTS
    .map((m) => ({ ...m, similarity: scoreMatch(d, m) }))
    .sort((a, b) => b.similarity - a.similarity);
}
