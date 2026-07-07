// ── Types ─────────────────────────────────────────────────────────────
export type CourseType = "uas-tuton" | "uas-tmk" | "uas-tuweb";
export type Difficulty = "Easy" | "Medium" | "Difficult";

export interface GradeBand {
  grade: string; // A, A-, B+, ...
  min: number; // batas bawah (inklusif)
  gpa: number; // bobot IPK 0–4
  desc: string; // deskripsi
}

// ── Konfigurasi tipe mata kuliah (bobot) ──────────────────────────────
export const COURSE_TYPES: Record<
  CourseType,
  { label: string; uasWeight: number; compWeight: number; compLabel: string }
> = {
  "uas-tuton": {
    label: "UAS + Tuton (70% UAS, 30% Tuton)",
    uasWeight: 0.7,
    compWeight: 0.3,
    compLabel: "Tuton",
  },
  "uas-tmk": {
    label: "UAS + TMK (80% UAS, 20% TMK)",
    uasWeight: 0.8,
    compWeight: 0.2,
    compLabel: "TMK",
  },
  "uas-tuweb": {
    label: "UAS + TUWEB (50% UAS, 50% TUWEB)",
    uasWeight: 0.5,
    compWeight: 0.5,
    compLabel: "TUWEB",
  },
};

// ── Skala nilai per tingkat kesulitan ─────────────────────────────────
// Ambang bawah tiap grade. Difficulty lebih sulit = ambang lebih rendah
// (lebih longgar). Ubah angka `min` di `MINS` kalau skala berbeda.
const DESC: Record<string, string> = {
  A: "Excellent (Sangat Baik)",
  "A-": "Excellent (Sangat Baik)",
  "B+": "Good (Baik)",
  B: "Good (Baik)",
  "C+": "Fair (Cukup)",
  C: "Fair (Cukup)",
  D: "Poor (Kurang)",
  E: "Fail (Gagal)",
};

const GPA: Record<string, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "C+": 2.3,
  C: 2.0,
  D: 1.0,
  E: 0.0,
};

// urutan grade dari tertinggi ke terendah
const ORDER = ["A", "A-", "B+", "B", "C+", "C", "D", "E"] as const;

// ambang bawah tiap grade per difficulty
const MINS: Record<Difficulty, Record<string, number>> = {
  Easy: { A: 80, "A-": 75, "B+": 70, B: 65, "C+": 60, C: 55, D: 40, E: 0 },
  Medium: { A: 75, "A-": 70, "B+": 65, B: 60, "C+": 55, C: 50, D: 35, E: 0 },
  Difficult: { A: 70, "A-": 65, "B+": 60, B: 55, "C+": 50, C: 45, D: 30, E: 0 },
};

export function gradeScale(difficulty: Difficulty): GradeBand[] {
  return ORDER.map((g) => ({
    grade: g,
    min: MINS[difficulty][g],
    gpa: GPA[g],
    desc: DESC[g],
  }));
}

// batas atas (untuk tampilan "80-100") — turunan dari min grade di atasnya
export function scaleRanges(difficulty: Difficulty) {
  const bands = gradeScale(difficulty);
  return bands.map((b, i) => ({
    ...b,
    max: i === 0 ? 100 : bands[i - 1].min - 1,
  }));
}

// ── Perhitungan ───────────────────────────────────────────────────────
export function uasScore(correct: number, total: number): number {
  if (!total) return 0;
  return (correct / total) * 100;
}

export function finalScore(
  type: CourseType,
  uas: number,
  comp: number,
): number {
  const { uasWeight, compWeight } = COURSE_TYPES[type];
  return uas * uasWeight + comp * compWeight;
}

export function resolveGrade(score: number, difficulty: Difficulty): GradeBand {
  const bands = gradeScale(difficulty);
  return bands.find((b) => score >= b.min) ?? bands[bands.length - 1];
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
