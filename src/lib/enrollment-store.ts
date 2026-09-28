import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** เพิ่มวิชาใหม่ */
  addCourse: (course: Course) => void;
  /** ลบวิชา พร้อมเอารหัสวิชานั้นออกจาก enrolledCourses ของนักศึกษาทุกคน */
  removeCourse: (courseCode: string) => void;
  /** ลบผู้สอนคนหนึ่งออกจากวิชา */
  removeInstructor: (courseCode: string, instructor: string) => void;
  /** ลงทะเบียนวิชาให้นักศึกษาหลายคนพร้อมกัน (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  /** ยกเลิกการลงทะเบียนของนักศึกษาหนึ่งคนในวิชานั้น */
  unenroll: (studentId: string, courseCode: string) => void;
  /** ลบนักศึกษา */
  removeStudent: (studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter((c) => c !== courseCode),
          })),
        })),

      removeInstructor: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode
              ? {
                  ...c,
                  instructors: (c.instructors ?? []).filter(
                    (i) => i !== instructor,
                  ),
                }
              : c,
          ),
        })),

      enrollStudents: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((s) =>
            studentIds.includes(s.studentId) &&
            !s.enrolledCourses.includes(courseCode)
              ? { ...s, enrolledCourses: [...s.enrolledCourses, courseCode] }
              : s,
          ),
        })),

      unenroll: (studentId, courseCode) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.studentId === studentId
              ? {
                  ...s,
                  enrolledCourses: s.enrolledCourses.filter(
                    (c) => c !== courseCode,
                  ),
                }
              : s,
          ),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),
    }),
    {
      name: "lab16-2569-680610670",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
