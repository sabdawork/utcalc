"use client";

import { Award, Calculator, Pencil, Save, Trash2, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import {
  COURSE_TYPES,
  type CourseType,
  type Difficulty,
  finalScore,
  resolveGrade,
  round2,
  scaleRanges,
  uasScore,
} from "@/lib/grade";
import { type SavedCourse, useCourseStore } from "@/store/course";

// ── Palette (dari brand guide techgroove) ─────────────────────────────
const C = {
  bg: "#EDEBE7",
  ink: "#111111",
  white: "#FFFFFF",
  violet: "#A970FF",
  luminous: "#C6E82C",
  lime: "#DDFF00",
  orange: "#FF9838",
} as const;

const MCQ_OPTIONS = [30, 35, 40, 45, 50];
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Difficult"];

// ── UI primitives (flat, no shadow, no radius) ────────────────────────
const border = "border-[3px] border-black";

function SectionCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${border} bg-white ${className}`}>{children}</div>;
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="block text-xs font-bold uppercase tracking-wide mb-1.5">
      {children}
    </span>
  );
}

const fieldBase = `w-full px-3 py-2.5 ${border} bg-white font-medium outline-none focus:border-[#A970FF]`;

// ── Blank form template ───────────────────────────────────────────────
type FormState = Omit<SavedCourse, "id">;
const blank: FormState = {
  name: "",
  courseType: "uas-tuton",
  totalMcq: 45,
  correct: 0,
  compScore: 0,
  difficulty: "Easy",
};

export default function App() {
  const { courses, addCourse, updateCourse, removeCourse, clearAll } =
    useCourseStore();

  const [form, setForm] = useState<FormState>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── Live perhitungan dari form ──────────────────────────────────────
  const calc = useMemo(() => {
    const cfg = COURSE_TYPES[form.courseType];
    const uas = uasScore(form.correct, form.totalMcq);
    const final = finalScore(form.courseType, uas, form.compScore);
    const band = resolveGrade(final, form.difficulty);
    return {
      cfg,
      uas: round2(uas),
      final: round2(final),
      band,
      accuracy: form.totalMcq ? (form.correct / form.totalMcq) * 100 : 0,
    };
  }, [form]);

  const ranges = useMemo(() => scaleRanges(form.difficulty), [form.difficulty]);

  const save = () => {
    const payload: FormState = {
      ...form,
      name: form.name.trim() || "Mata Kuliah Tanpa Nama",
    };
    if (editingId) updateCourse(editingId, payload);
    else addCourse(payload);
    setForm(blank);
    setEditingId(null);
  };

  const edit = (c: SavedCourse) => {
    const { id, ...rest } = c;
    setForm(rest);
    setEditingId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setForm(blank);
    setEditingId(null);
  };

  const avgGpa = useMemo(() => {
    if (!courses.length) return 0;
    const total = courses.reduce((sum, c) => {
      const uas = uasScore(c.correct, c.totalMcq);
      const final = finalScore(c.courseType, uas, c.compScore);
      return sum + resolveGrade(final, c.difficulty).gpa;
    }, 0);
    return round2(total / courses.length);
  }, [courses]);

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.ink }}>
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <header className="mb-8 flex items-center gap-4">
          <div
            className={`grid h-14 w-14 place-items-center ${border}`}
            style={{ background: C.lime }}
          >
            <Eyes />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold leading-none">
              Calculator Nilai UT
            </h1>
            <p className="text-sm font-medium opacity-70">
              Hitung nilai akhir & simpan banyak mata kuliah
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Kiri: Input ─────────────────────────────────────────── */}
          <SectionCard className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold uppercase">
              <Calculator size={18} aria-hidden="true" />
              Course Information
            </h2>

            <div className="space-y-5">
              <div>
                <Label>Nama Mata Kuliah</Label>
                <input
                  className={fieldBase}
                  placeholder="mis. Pengantar Statistika"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div>
                <Label>Course Type</Label>
                <select
                  className={fieldBase}
                  value={form.courseType}
                  onChange={(e) =>
                    set("courseType", e.target.value as CourseType)
                  }
                >
                  {(Object.keys(COURSE_TYPES) as CourseType[]).map((k) => (
                    <option key={k} value={k}>
                      {COURSE_TYPES[k].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* UAS MCQ block */}
              <div className={`${border} p-4`} style={{ background: C.violet }}>
                <h3 className="mb-3 text-sm font-extrabold uppercase text-white">
                  UAS · MCQ Section
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-white">
                      Total Soal MCQ
                    </span>
                    <select
                      className={fieldBase}
                      value={form.totalMcq}
                      onChange={(e) => {
                        const total = Number(e.target.value);
                        set("totalMcq", total);
                        if (form.correct > total) set("correct", total);
                      }}
                    >
                      {MCQ_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n} soal
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="mb-1.5 block text-xs font-bold uppercase text-white">
                      Jawaban Benar
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={form.totalMcq}
                      step={1}
                      className={fieldBase}
                      placeholder={`0 - ${form.totalMcq}`}
                      value={form.correct === 0 ? "" : form.correct}
                      onChange={(e) => {
                        const v = Math.max(
                          0,
                          Math.min(form.totalMcq, Number(e.target.value) || 0),
                        );
                        set("correct", v);
                      }}
                    />
                  </div>
                  <div className={`${border} bg-white p-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase">
                        Skor UAS
                      </span>
                      <span
                        className="text-lg font-extrabold"
                        style={{ color: C.violet }}
                      >
                        {calc.uas.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs font-medium opacity-70">
                      ({form.correct} ÷ {form.totalMcq}) × 100 ={" "}
                      {calc.uas.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>Skor {calc.cfg.compLabel} (0–100)</Label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  className={fieldBase}
                  placeholder={`Masukkan skor ${calc.cfg.compLabel}`}
                  value={form.compScore === 0 ? "" : form.compScore}
                  onChange={(e) => {
                    const v = Math.max(
                      0,
                      Math.min(100, Number(e.target.value) || 0),
                    );
                    set("compScore", v);
                  }}
                />
              </div>

              <div>
                <Label>Tingkat Kesulitan</Label>
                <select
                  className={fieldBase}
                  value={form.difficulty}
                  onChange={(e) =>
                    set("difficulty", e.target.value as Difficulty)
                  }
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className={`${border} p-4`}
                style={{ background: C.luminous }}
              >
                <h4 className="text-xs font-extrabold uppercase">
                  Bobot Saat Ini
                </h4>
                <p className="text-sm font-bold">
                  UAS: {calc.cfg.uasWeight * 100}% · {calc.cfg.compLabel}:{" "}
                  {calc.cfg.compWeight * 100}%
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={save}
                  type="button"
                  className={`flex-1 ${border} flex items-center justify-center gap-2 px-4 py-3 text-sm font-extrabold uppercase active:translate-y-[2px]`}
                  style={{ background: C.lime }}
                >
                  <Save size={16} aria-hidden="true" />
                  {editingId ? "Update Mata Kuliah" : "Simpan Mata Kuliah"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className={`${border} flex items-center justify-center gap-2 bg-white px-4 py-3 text-sm font-extrabold uppercase active:translate-y-[2px]`}
                  >
                    <X size={16} aria-hidden="true" />
                    Batal
                  </button>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Kanan: Hasil ────────────────────────────────────────── */}
          <SectionCard className="p-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-extrabold uppercase">
              <Award size={18} aria-hidden="true" />
              Grade Results
            </h2>

            <div className="space-y-5">
              <div className={`${border} p-5 text-center`}>
                <div className="text-xs font-bold uppercase opacity-70">
                  Final Score
                </div>
                <div className="text-5xl font-extrabold">
                  {calc.final.toFixed(2)}
                </div>
                <div className="text-xs font-medium opacity-60">out of 100</div>
              </div>

              <div
                className={`${border} p-5 text-center`}
                style={{ background: C.orange }}
              >
                <div className="text-6xl font-extrabold leading-none">
                  {calc.band.grade}
                </div>
                <div className="mt-2 text-base font-extrabold">
                  GPA: {calc.band.gpa.toFixed(1)}
                </div>
                <div className="text-sm font-bold">{calc.band.desc}</div>
              </div>

              {/* Breakdown */}
              <div className={`${border} p-4`}>
                <h4 className="mb-2 text-xs font-extrabold uppercase">
                  Calculation Breakdown
                </h4>
                <Row
                  label={`UAS (${calc.cfg.uasWeight * 100}%)`}
                  value={`${calc.uas.toFixed(2)} × ${calc.cfg.uasWeight} = ${round2(
                    calc.uas * calc.cfg.uasWeight,
                  ).toFixed(2)}`}
                />
                <Row
                  label={`${calc.cfg.compLabel} (${calc.cfg.compWeight * 100}%)`}
                  value={`${form.compScore.toFixed(2)} × ${
                    calc.cfg.compWeight
                  } = ${round2(form.compScore * calc.cfg.compWeight).toFixed(
                    2,
                  )}`}
                />
                <div className="mt-2 flex justify-between border-t-[3px] border-black pt-2 text-sm font-extrabold">
                  <span>Final Score</span>
                  <span>{calc.final.toFixed(2)}</span>
                </div>
              </div>

              {/* MCQ perf */}
              <div
                className={`${border} p-4`}
                style={{ background: C.luminous }}
              >
                <h4 className="mb-2 text-xs font-extrabold uppercase">
                  MCQ Performance
                </h4>
                <Row
                  label="Jawaban Benar"
                  value={`${form.correct} dari ${form.totalMcq}`}
                />
                <Row label="Akurasi" value={`${calc.accuracy.toFixed(1)}%`} />
                <Row label="Skor UAS" value={`${calc.uas.toFixed(2)}/100`} />
              </div>

              {/* Scale */}
              <div className={`${border} p-4`}>
                <h4 className="mb-2 text-xs font-extrabold uppercase">
                  Grade Scale ({form.difficulty})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {ranges.map((r) => {
                    const active = r.grade === calc.band.grade;
                    return (
                      <div
                        key={r.grade}
                        className={`flex justify-between border-[2px] border-black px-2 py-1.5 text-xs font-bold ${
                          active ? "" : "bg-white"
                        }`}
                        style={active ? { background: C.lime } : undefined}
                      >
                        <span>{r.grade}</span>
                        <span>
                          {r.min}-{r.max}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Mata kuliah tersimpan ───────────────────────────────────── */}
        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold uppercase">
              Mata Kuliah Tersimpan ({courses.length})
            </h2>
            <div className="flex items-center gap-3">
              <div
                className={`${border} px-4 py-2`}
                style={{ background: C.violet }}
              >
                <span className="text-xs font-bold uppercase text-white">
                  Rata-rata GPA:{" "}
                </span>
                <span className="text-base font-extrabold text-white">
                  {avgGpa.toFixed(2)}
                </span>
              </div>
              {courses.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className={`${border} flex items-center gap-1.5 bg-white px-3 py-2 text-xs font-extrabold uppercase active:translate-y-[2px]`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Hapus Semua
                </button>
              )}
            </div>
          </div>

          {courses.length === 0 ? (
            <SectionCard className="p-8 text-center text-sm font-medium opacity-70">
              Belum ada mata kuliah. Isi form lalu tekan &ldquo;Simpan Mata
              Kuliah&rdquo;.
            </SectionCard>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full ${border} border-collapse`}>
                <thead>
                  <tr style={{ background: C.lime }}>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-left text-xs font-extrabold uppercase`}
                    >
                      Nama Mata Kuliah
                    </th>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-left text-xs font-extrabold uppercase`}
                    >
                      Tipe
                    </th>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-right text-xs font-extrabold uppercase`}
                    >
                      Nilai UAS
                    </th>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-right text-xs font-extrabold uppercase`}
                    >
                      Nilai Komponen
                    </th>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-right text-xs font-extrabold uppercase`}
                    >
                      Final
                    </th>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-center text-xs font-extrabold uppercase`}
                    >
                      Grade
                    </th>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-right text-xs font-extrabold uppercase`}
                    >
                      GPA
                    </th>
                    <th
                      scope="col"
                      className={`${border} px-3 py-2.5 text-center text-xs font-extrabold uppercase`}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => {
                    const uas = uasScore(c.correct, c.totalMcq);
                    const final = round2(
                      finalScore(c.courseType, uas, c.compScore),
                    );
                    const band = resolveGrade(final, c.difficulty);
                    const typeCfg = COURSE_TYPES[c.courseType];
                    return (
                      <tr key={c.id} className="bg-white">
                        <td className={`${border} px-3 py-2.5`}>
                          <span className="text-sm font-extrabold">
                            {c.name}
                          </span>
                        </td>
                        <td className={`${border} px-3 py-2.5`}>
                          <div className="text-sm font-bold">
                            {typeCfg.compLabel}
                          </div>
                          <div className="text-xs font-medium opacity-60">
                            {c.difficulty}
                          </div>
                        </td>
                        <td
                          className={`${border} px-3 py-2.5 text-right text-sm font-bold tabular-nums`}
                        >
                          {round2(uas).toFixed(2)}
                        </td>
                        <td
                          className={`${border} px-3 py-2.5 text-right text-sm font-bold tabular-nums`}
                        >
                          <div className="text-xs font-medium opacity-60">
                            {typeCfg.compLabel}
                          </div>
                          {c.compScore.toFixed(2)}
                        </td>
                        <td
                          className={`${border} px-3 py-2.5 text-right text-sm font-bold tabular-nums`}
                        >
                          {final.toFixed(2)}
                        </td>
                        <td className={`${border} px-3 py-2.5 text-center`}>
                          <span
                            className="inline-block border-[2px] border-black px-2.5 py-1 text-sm font-extrabold"
                            style={{ background: C.lime }}
                          >
                            {band.grade}
                          </span>
                        </td>
                        <td
                          className={`${border} px-3 py-2.5 text-right text-sm font-bold tabular-nums`}
                        >
                          {band.gpa.toFixed(1)}
                        </td>
                        <td className={`${border} px-3 py-2.5`}>
                          <div className="flex gap-1.5 justify-center">
                            <button
                              type="button"
                              onClick={() => edit(c)}
                              className="border-[2px] border-black bg-white px-2 py-1.5 active:translate-y-[2px]"
                              aria-label={`Edit ${c.name}`}
                            >
                              <Pencil size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeCourse(c.id)}
                              className="border-[2px] border-black px-2 py-1.5 active:translate-y-[2px]"
                              style={{ background: C.orange }}
                              aria-label={`Hapus ${c.name}`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5 text-sm">
      <span className="font-medium opacity-70">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

// Logomark sederhana (dua mata) — mengikuti gaya brand
function Eyes() {
  return (
    <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden="true">
      {[9, 25].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="10" r="8" fill="#111" />
          <circle cx={cx} cy="10" r="4.2" fill="#fff" />
          <circle cx={cx} cy="10" r="2" fill="#111" />
        </g>
      ))}
    </svg>
  );
}
