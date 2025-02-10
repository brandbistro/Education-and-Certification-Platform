;; Course Management Contract

;; Define data structures
(define-map courses
  { course-id: uint }
  {
    instructor: principal,
    title: (string-utf8 64),
    max-students: uint,
    enrolled-students: uint
  }
)

(define-map enrollments
  { course-id: uint, student: principal }
  { enrolled: bool }
)

(define-data-var next-course-id uint u1)

;; Error codes
(define-constant err-not-instructor (err u100))
(define-constant err-course-full (err u101))
(define-constant err-already-enrolled (err u102))
(define-constant err-not-enrolled (err u103))
(define-constant err-course-not-found (err u104))

;; Functions
(define-public (create-course (title (string-utf8 64)) (max-students uint))
  (let
    ((course-id (var-get next-course-id)))
    (map-set courses
      { course-id: course-id }
      {
        instructor: tx-sender,
        title: title,
        max-students: max-students,
        enrolled-students: u0
      }
    )
    (var-set next-course-id (+ course-id u1))
    (ok course-id)
  )
)

(define-public (enroll-in-course (course-id uint))
  (let
    ((course (unwrap! (map-get? courses { course-id: course-id }) err-course-not-found)))
    (asserts! (< (get enrolled-students course) (get max-students course)) err-course-full)
    (asserts! (is-none (map-get? enrollments { course-id: course-id, student: tx-sender })) err-already-enrolled)
    (map-set enrollments
      { course-id: course-id, student: tx-sender }
      { enrolled: true }
    )
    (map-set courses
      { course-id: course-id }
      (merge course { enrolled-students: (+ (get enrolled-students course) u1) })
    )
    (ok true)
  )
)

(define-public (unenroll-from-course (course-id uint))
  (let
    ((course (unwrap! (map-get? courses { course-id: course-id }) err-course-not-found))
     (enrollment (unwrap! (map-get? enrollments { course-id: course-id, student: tx-sender }) err-not-enrolled)))
    (map-delete enrollments { course-id: course-id, student: tx-sender })
    (map-set courses
      { course-id: course-id }
      (merge course { enrolled-students: (- (get enrolled-students course) u1) })
    )
    (ok true)
  )
)

(define-read-only (get-course-info (course-id uint))
  (map-get? courses { course-id: course-id })
)

(define-read-only (is-enrolled (course-id uint) (student principal))
  (default-to false (get enrolled (map-get? enrollments { course-id: course-id, student: student })))
)

