;; Skill Endorsement Contract

;; Define data structures
(define-map endorsements
  { skill: (string-utf8 64), endorsee: principal }
  { endorsements: uint }
)

(define-map user-endorsements
  { endorser: principal, endorsee: principal, skill: (string-utf8 64) }
  { endorsed: bool }
)

;; Error codes
(define-constant err-already-endorsed (err u100))
(define-constant err-self-endorsement (err u101))

;; Functions
(define-public (endorse-skill (endorsee principal) (skill (string-utf8 64)))
  (let
    ((current-endorsements (default-to u0 (get endorsements (map-get? endorsements { skill: skill, endorsee: endorsee })))))
    (asserts! (not (is-eq tx-sender endorsee)) err-self-endorsement)
    (asserts! (is-none (map-get? user-endorsements { endorser: tx-sender, endorsee: endorsee, skill: skill })) err-already-endorsed)
    (map-set endorsements
      { skill: skill, endorsee: endorsee }
      { endorsements: (+ current-endorsements u1) }
    )
    (map-set user-endorsements
      { endorser: tx-sender, endorsee: endorsee, skill: skill }
      { endorsed: true }
    )
    (ok true)
  )
)

(define-public (revoke-endorsement (endorsee principal) (skill (string-utf8 64)))
  (let
    ((current-endorsements (default-to u0 (get endorsements (map-get? endorsements { skill: skill, endorsee: endorsee })))))
    (asserts! (is-some (map-get? user-endorsements { endorser: tx-sender, endorsee: endorsee, skill: skill })) err-already-endorsed)
    (map-set endorsements
      { skill: skill, endorsee: endorsee }
      { endorsements: (- current-endorsements u1) }
    )
    (map-delete user-endorsements { endorser: tx-sender, endorsee: endorsee, skill: skill })
    (ok true)
  )
)

(define-read-only (get-skill-endorsements (endorsee principal) (skill (string-utf8 64)))
  (default-to u0 (get endorsements (map-get? endorsements { skill: skill, endorsee: endorsee })))
)

(define-read-only (has-endorsed (endorser principal) (endorsee principal) (skill (string-utf8 64)))
  (is-some (map-get? user-endorsements { endorser: endorser, endorsee: endorsee, skill: skill }))
)

