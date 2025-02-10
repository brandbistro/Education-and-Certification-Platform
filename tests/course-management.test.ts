import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for courses and enrollments
const courses = new Map()
const enrollments = new Map()
let nextCourseId = 1

// Mock functions to simulate contract behavior
function createCourse(instructor: string, title: string, maxStudents: number) {
  const courseId = nextCourseId++
  courses.set(courseId, { instructor, title, maxStudents, enrolledStudents: 0 })
  return courseId
}

function enrollInCourse(courseId: number, student: string) {
  const course = courses.get(courseId)
  if (!course) throw new Error("Course not found")
  if (course.enrolledStudents >= course.maxStudents) throw new Error("Course is full")
  if (enrollments.get(`${courseId}-${student}`)) throw new Error("Already enrolled")
  
  course.enrolledStudents++
  courses.set(courseId, course)
  enrollments.set(`${courseId}-${student}`, true)
  return true
}

function unenrollFromCourse(courseId: number, student: string) {
  const course = courses.get(courseId)
  if (!course) throw new Error("Course not found")
  if (!enrollments.get(`${courseId}-${student}`)) throw new Error("Not enrolled")
  
  course.enrolledStudents--
  courses.set(courseId, course)
  enrollments.delete(`${courseId}-${student}`)
  return true
}

function getCourseInfo(courseId: number) {
  return courses.get(courseId)
}

function isEnrolled(courseId: number, student: string) {
  return enrollments.get(`${courseId}-${student}`) || false
}

describe("Course Management Contract", () => {
  beforeEach(() => {
    courses.clear()
    enrollments.clear()
    nextCourseId = 1
  })
  
  it("should create a course", () => {
    const courseId = createCourse("instructor1", "Blockchain 101", 20)
    expect(courseId).toBe(1)
    const course = getCourseInfo(courseId)
    expect(course).toBeDefined()
    expect(course.title).toBe("Blockchain 101")
    expect(course.enrolledStudents).toBe(0)
  })
  
  it("should enroll a student in a course", () => {
    const courseId = createCourse("instructor1", "Blockchain 101", 20)
    const result = enrollInCourse(courseId, "student1")
    expect(result).toBe(true)
    expect(isEnrolled(courseId, "student1")).toBe(true)
    const course = getCourseInfo(courseId)
    expect(course.enrolledStudents).toBe(1)
  })
  
  it("should not enroll a student in a full course", () => {
    const courseId = createCourse("instructor1", "Blockchain 101", 1)
    enrollInCourse(courseId, "student1")
    expect(() => enrollInCourse(courseId, "student2")).toThrow("Course is full")
  })
  
  it("should unenroll a student from a course", () => {
    const courseId = createCourse("instructor1", "Blockchain 101", 20)
    enrollInCourse(courseId, "student1")
    const result = unenrollFromCourse(courseId, "student1")
    expect(result).toBe(true)
    expect(isEnrolled(courseId, "student1")).toBe(false)
    const course = getCourseInfo(courseId)
    expect(course.enrolledStudents).toBe(0)
  })
  
  it("should not unenroll a student who is not enrolled", () => {
    const courseId = createCourse("instructor1", "Blockchain 101", 20)
    expect(() => unenrollFromCourse(courseId, "student1")).toThrow("Not enrolled")
  })
})

