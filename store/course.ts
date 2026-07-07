import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CourseType, Difficulty } from "../lib/grade";

export interface SavedCourse {
  id: string;
  name: string;
  courseType: CourseType;
  totalMcq: number;
  correct: number;
  compScore: number; // skor Tuton / TMK / TUWEB
  difficulty: Difficulty;
}

interface CourseState {
  courses: SavedCourse[];
  addCourse: (c: Omit<SavedCourse, "id">) => void;
  updateCourse: (id: string, c: Omit<SavedCourse, "id">) => void;
  removeCourse: (id: string) => void;
  clearAll: () => void;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      courses: [],
      addCourse: (c) =>
        set((s) => ({ courses: [...s.courses, { ...c, id: uid() }] })),
      updateCourse: (id, c) =>
        set((s) => ({
          courses: s.courses.map((x) => (x.id === id ? { ...c, id } : x)),
        })),
      removeCourse: (id) =>
        set((s) => ({ courses: s.courses.filter((x) => x.id !== id) })),
      clearAll: () => set({ courses: [] }),
    }),
    { name: "nilai-ut-courses" },
  ),
);
