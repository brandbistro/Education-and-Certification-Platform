import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for endorsements
const endorsements = new Map()
const userEndorsements = new Map()

// Mock functions to simulate contract behavior
function endorseSkill(endorser: string, endorsee: string, skill: string) {
  if (endorser === endorsee) throw new Error("Self-endorsement not allowed")
  const key = `${endorsee}-${skill}`
  const currentEndorsements = endorsements.get(key) || 0
  endorsements.set(key, currentEndorsements + 1)
  userEndorsements.set(`${endorser}-${endorsee}-${skill}`, true)
  return true
}

function revokeEndorsement(endorser: string, endorsee: string, skill: string) {
  const key = `${endorsee}-${skill}`
  const currentEndorsements = endorsements.get(key) || 0
  if (currentEndorsements > 0) {
    endorsements.set(key, currentEndorsements - 1)
  }
  userEndorsements.delete(`${endorser}-${endorsee}-${skill}`)
  return true
}

function getSkillEndorsements(endorsee: string, skill: string) {
  return endorsements.get(`${endorsee}-${skill}`) || 0
}

function hasEndorsed(endorser: string, endorsee: string, skill: string) {
  return userEndorsements.has(`${endorser}-${endorsee}-${skill}`)
}

describe("Skill Endorsement Contract", () => {
  beforeEach(() => {
    endorsements.clear()
    userEndorsements.clear()
  })
  
  it("should endorse a skill", () => {
    const result = endorseSkill("user1", "user2", "Blockchain")
    expect(result).toBe(true)
    expect(getSkillEndorsements("user2", "Blockchain")).toBe(1)
    expect(hasEndorsed("user1", "user2", "Blockchain")).toBe(true)
  })
  
  it("should not allow self-endorsement", () => {
    expect(() => endorseSkill("user1", "user1", "Blockchain")).toThrow("Self-endorsement not allowed")
  })
  
  it("should revoke an endorsement", () => {
    endorseSkill("user1", "user2", "Blockchain")
    const result = revokeEndorsement("user1", "user2", "Blockchain")
    expect(result).toBe(true)
    expect(getSkillEndorsements("user2", "Blockchain")).toBe(0)
    expect(hasEndorsed("user1", "user2", "Blockchain")).toBe(false)
  })
  
  it("should handle multiple endorsements", () => {
    endorseSkill("user1", "user2", "Blockchain")
    endorseSkill("user3", "user2", "Blockchain")
    expect(getSkillEndorsements("user2", "Blockchain")).toBe(2)
  })
  
  it("should not decrease endorsements below zero when revoking", () => {
    revokeEndorsement("user1", "user2", "Blockchain") // Revoking non-existent endorsement
    expect(getSkillEndorsements("user2", "Blockchain")).toBe(0)
  })
})

