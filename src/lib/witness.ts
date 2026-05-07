export type WitnessDescription = {
  gender: "male" | "female";
  age_range: "10-20" | "20-30" | "30-40" | "40-50" | "50-60" | "60+";
  skin_tone: "fair" | "light" | "medium" | "tan" | "dark";
  face_shape: "oval" | "round" | "square" | "long" | "heart";
  eyes: "almond" | "round" | "narrow" | "hooded";
  eye_color: "brown" | "blue" | "green" | "hazel";
  eyebrows: "thin" | "thick" | "arched" | "straight";
  nose: "straight" | "wide" | "pointed" | "flat";
  lips: "thin" | "medium" | "full";
  hair_color: "black" | "brown" | "blonde" | "red" | "gray" | "bald";
  hair_style: "short" | "medium" | "long" | "curly" | "wavy" | "bald";
  facial_hair: "none" | "stubble" | "goatee" | "full beard" | "mustache";
  glasses: boolean;
  scar: boolean;
  tattoo: boolean;
  observation_quality: "poor" | "fair" | "good" | "excellent";
};

export const DEFAULT_DESCRIPTION: WitnessDescription = {
  gender: "male",
  age_range: "30-40",
  skin_tone: "medium",
  face_shape: "oval",
  eyes: "almond",
  eye_color: "brown",
  eyebrows: "straight",
  nose: "straight",
  lips: "medium",
  hair_color: "brown",
  hair_style: "short",
  facial_hair: "none",
  glasses: false,
  scar: false,
  tattoo: false,
  observation_quality: "good",
};

export function buildPrompt(d: WitnessDescription, extra?: string): string {
  const traits = [
    `${d.gender}, approx ${d.age_range} years old`,
    `${d.skin_tone} skin tone`,
    `${d.face_shape} face shape`,
    `${d.eyes} ${d.eye_color} eyes`,
    `${d.eyebrows} eyebrows`,
    `${d.nose} nose`,
    `${d.lips} lips`,
    d.hair_style === "bald" ? "bald" : `${d.hair_style} ${d.hair_color} hair`,
    d.facial_hair !== "none" ? d.facial_hair : null,
    d.glasses ? "wearing glasses" : null,
    d.scar ? "visible facial scar" : null,
    d.tattoo ? "small face tattoo" : null,
  ].filter(Boolean).join(", ");

  const extraNote = extra && extra.trim().length > 0 ? ` Additional witness notes: ${extra.trim()}.` : "";
  return `Forensic black-and-white pencil sketch portrait of a suspect, frontal view, neutral expression, plain background, hand-drawn graphite shading, police composite style. Subject: ${traits}.${extraNote} High detail, realistic proportions, no color, no text.`;
}
