import type { Student, Course } from "@/lib/types";

export const students: Student[] = [
  {
    studentId: "650610001",
    firstName: "Matt",
    lastName: "Damon",
    program: "CPE",
    status: "Active",
    enrolledCourses: [],
  },
  {
    studentId: "650610002",
    firstName: "Cillian",
    lastName: "Murphy",
    program: "CPE",
    status: "Active",
    enrolledCourses: ["261207", "261497"],
  },
  {
    studentId: "650610003",
    firstName: "Emily",
    lastName: "Blunt",
    program: "ISNE",
    status: "Active",
    enrolledCourses: ["269101", "261497"],
  },
  {
    studentId: "650610004",
    firstName: "Florence",
    lastName: "Pugh",
    program: "ISNE",
    status: "Active",
    enrolledCourses: [],
  },
  {
    studentId: "650610005",
    firstName: "Robert",
    lastName: "Downey",
    program: "CPE",
    status: "Inactive",
    enrolledCourses: [],
  },
  {
    studentId: "650610006",
    firstName: "Zendaya",
    lastName: "Coleman",
    program: "ISNE",
    status: "Active",
    enrolledCourses: [],
  },
];

export const courses: Course[] = [
  {
    courseCode: "261207",
    courseTitle: "Basic Computer Engineering Lab",
    instructors: ["Dome", "Chanadda"],
  },
  {
    courseCode: "261497",
    courseTitle: "Full Stack Development",
    instructors: ["Dome", "Nirand", "Chanadda"],
  },
  {
    courseCode: "269101",
    courseTitle: "Introduction to Information Systems and Network Engineering",
    instructors: ["KENNETH COSH"],
  },
];
