;; Certification Issuance Contract

;; Define data structures
(define-non-fungible-token certificates uint)

(define-map certificate-data
  { certificate-id: uint }
  {
    recipient: principal,
    course-id: uint,
    issue-date: uint,
    expiration-date: (optional uint)
  }
)

(define-data-var next-certificate-id uint u1)

;; Error codes
(define-constant err-unauthorized (err u100))
(define-constant err-certificate-not-found (err u101))

;; Functions
(define-public (issue-certificate (recipient principal) (course-id uint) (expiration-date (optional uint)))
  (let
    ((certificate-id (var-get next-certificate-id)))
    (try! (nft-mint? certificates certificate-id recipient))
    (map-set certificate-data
      { certificate-id: certificate-id }
      {
        recipient: recipient,
        course-id: course-id,
        issue-date: block-height,
        expiration-date: expiration-date
      }
    )
    (var-set next-certificate-id (+ certificate-id u1))
    (ok certificate-id)
  )
)

(define-public (revoke-certificate (certificate-id uint))
  (let
    ((certificate (unwrap! (map-get? certificate-data { certificate-id: certificate-id }) err-certificate-not-found)))
    (try! (nft-burn? certificates certificate-id (get recipient certificate)))
    (map-delete certificate-data { certificate-id: certificate-id })
    (ok true)
  )
)

(define-read-only (get-certificate-info (certificate-id uint))
  (map-get? certificate-data { certificate-id: certificate-id })
)

(define-read-only (is-certificate-valid (certificate-id uint))
  (match (map-get? certificate-data { certificate-id: certificate-id })
    certificate (match (get expiration-date certificate)
      expiration-date (< block-height expiration-date)
      true
    )
    false
  )
)

