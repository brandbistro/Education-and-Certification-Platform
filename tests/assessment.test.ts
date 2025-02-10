import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for assessments and results
const assessments = new Map()
const assessmentResults = new Map()
let nextAssessmentId = 1

// Mock functions to simulate contract behavior
function createAssessment(courseId: number, title: string, passingScore: number, totalQuestions: number) {
  const assessmentId = nextAssessmentId++
  assessments.set(assessmentId, { courseId, title, passingScore, totalQuestions })
  return assessmentId
}

function submitAssessmentResult(assessmentId: number, student: string, score: number) {
  const assessment = assessments.get(assessmentId)
  if (!assessment) throw new Error("Assessment not found")
  if (score > assessment.totalQuestions) throw new Error("Invalid score")
  
  assessmentResults.set(`${assessmentId}-${student}`, {
    score,
    passed: score >= assessment.passingScore,
    timestamp: Date.now(),
  })
  return true
}

function getAssessmentInfo(assessmentId: number) {
  return assessments.get(assessmentId)
}

function getAssessmentResult(assessmentId: number, student: string) {
  return assessmentResults.get(`${assessmentId}-${student}`)
}

describe("Assessment Contract", () => {
  beforeEach(() => {
    assessments.clear()
    assessmentResults.clear()
    nextAssessmentId = 1
  })
  
  it("should create an assessment", () => {
    const assessmentId = createAssessment(1, "Blockchain Basics Quiz", 70, 100)
    expect(assessmentId).toBe(1)
    const assessment = getAssessmentInfo(assessmentId)
    expect(assessment).toBeDefined()
    expect(assessment.title).toBe("Blockchain Basics Quiz")
    expect(assessment.passingScore).toBe(70)
  })
  
  it("should submit assessment result", () => {
    const assessmentId = createAssessment(1, "Blockchain Basics Quiz", 70, 100)
    const result = submitAssessmentResult(assessmentId, "student1", 80)
    expect(result).toBe(true)
    const assessmentResult = getAssessmentResult(assessmentId, "student1")
    expect(assessmentResult).toBeDefined()
    expect(assessmentResult.score).toBe(80)
    expect(assessmentResult.passed).toBe(true)
  })
  
  it("should not submit invalid assessment result", () => {
    const assessmentId = createAssessment(1, "Blockchain Basics Quiz", 70, 100)
    expect(() => submitAssessmentResult(assessmentId, "student1", 101)).toThrow("Invalid score")
  })
  
  it("should mark assessment as failed when score is below passing score", () => {
    const assessmentId = createAssessment(1, "Blockchain Basics Quiz", 70, 100)
    submitAssessmentResult(assessmentId, "student1", 60)
    const assessmentResult = getAssessmentResult(assessmentId, "student1")
    expect(assessmentResult.passed).toBe(false)
  })
})

