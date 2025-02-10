;; Assessment Contract

;; Define data structures
(define-map assessments
  { assessment-id: uint }
  {
    course-id: uint,
    title: (string-utf8 64),
    passing-score: uint,
    total-questions: uint
  }
)

(define-map assessment-results
  { assessment-id: uint, student: principal }
  {
    score: uint,
    passed: bool,
    timestamp: uint
  }
)

(define-data-var next-assessment-id uint u1)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-assessment-not-found (err u101))
(define-constant err-invalid-score (err u102))

;; Functions
(define-public (create-assessment (course-id uint) (title (string-utf8 64)) (passing-score uint) (total-questions uint))
  (let
    ((assessment-id (var-get next-assessment-id)))
    (map-set assessments
      { assessment-id: assessment-id }
      {
        course-id: course-id,
        title: title,
        passing-score: passing-score,
        total-questions: total-questions
      }
    )
    (var-set next-assessment-id (+ assessment-id u1))
    (ok assessment-id)
  )
)

(define-public (submit-assessment-result (assessment-id uint) (score uint))
  (let
    ((assessment (unwrap! (map-get? assessments { assessment-id: assessment-id }) err-assessment-not-found)))
    (asserts! (<= score (get total-questions assessment)) err-invalid-score)
    (map-set assessment-results
      { assessment-id: assessment-id, student: tx-sender }
      {
        score: score,
        passed: (>= score (get passing-score assessment)),
        timestamp: block-height
      }
    )
    (ok true)
  )
)

(define-read-only (get-assessment-info (assessment-id uint))
  (map-get? assessments { assessment-id: assessment-id })
)

(define-read-only (get-assessment-result (assessment-id uint) (student principal))
  (map-get? assessment-results { assessment-id: assessment-id, student: student })
)

