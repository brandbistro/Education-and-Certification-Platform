import { describe, it, expect, beforeEach } from "vitest"

// Mock storage for certificates
const certificates = new Map()
let nextCertificateId = 1

// Mock functions to simulate contract behavior
function issueCertificate(recipient: string, courseId: number, expirationDate?: number) {
  const certificateId = nextCertificateId++
  certificates.set(certificateId, {
    recipient,
    courseId,
    issueDate: Date.now(),
    expirationDate,
  })
  return certificateId
}

function revokeCertificate(certificateId: number) {
  if (!certificates.has(certificateId)) throw new Error("Certificate not found")
  certificates.delete(certificateId)
  return true
}

function getCertificateInfo(certificateId: number) {
  return certificates.get(certificateId)
}

function isCertificateValid(certificateId: number) {
  const certificate = certificates.get(certificateId)
  if (!certificate) return false
  if (!certificate.expirationDate) return true
  return Date.now() < certificate.expirationDate
}

describe("Certification Issuance Contract", () => {
  beforeEach(() => {
    certificates.clear()
    nextCertificateId = 1
  })
  
  it("should issue a certificate", () => {
    const certificateId = issueCertificate("student1", 1)
    expect(certificateId).toBe(1)
    const certificate = getCertificateInfo(certificateId)
    expect(certificate).toBeDefined()
    expect(certificate.recipient).toBe("student1")
    expect(certificate.courseId).toBe(1)
  })
  
  it("should issue a certificate with expiration date", () => {
    const expirationDate = Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year from now
    const certificateId = issueCertificate("student1", 1, expirationDate)
    const certificate = getCertificateInfo(certificateId)
    expect(certificate.expirationDate).toBe(expirationDate)
  })
  
  it("should revoke a certificate", () => {
    const certificateId = issueCertificate("student1", 1)
    const result = revokeCertificate(certificateId)
    expect(result).toBe(true)
    expect(getCertificateInfo(certificateId)).toBeUndefined()
  })
  
  it("should check if a certificate is valid", () => {
    const certificateId = issueCertificate("student1", 1)
    expect(isCertificateValid(certificateId)).toBe(true)
    
    const expiredCertificateId = issueCertificate("student2", 2, Date.now() - 1000) // Expired 1 second ago
    expect(isCertificateValid(expiredCertificateId)).toBe(false)
  })
  
  it("should return false for non-existent certificate", () => {
    expect(isCertificateValid(999)).toBe(false)
  })
})

