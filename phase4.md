PRAMĀṆA — FRONTEND PHASE 3
VERIFIER CONSOLE + END-TO-END DEMO

You are continuing as the Senior Frontend Engineer.

Phase 2 is complete.

Your goal now is to make the PRAMĀṆA frontend demonstrable from BOTH sides:

CITIZEN
and
VERIFIER.

At the end of this phase, a judge should be able to understand and experience the complete PRAMĀṆA workflow without needing technical explanation.

==================================================

1. FIRST
   \==================================================

Inspect the current implementation.

Read:

AGENTS.md
ARCHITECTURE.md
PROJECT_STATUS.md
DECISIONS.md

Review Phase 2 code.

Do not rewrite stable components.

Reuse the design system.

================================================== 2. VERIFIER CONSOLE
==================================================

Create the verifier experience.

Conceptual routes:

/verifier
/verifier/requests
/verifier/requests/new
/verifier/requests/:id
/verifier/verification/:id
/verifier/receipts

The verifier dashboard should show:

Active Requests
Pending Verifications
Completed Verifications
Recent Receipts

Keep the interface simple.

================================================== 3. CREATE REQUEST
==================================================

Build a request creation UI.

The verifier should be able to define:

Purpose
Context
Predicates
Expiry

Example:

Purpose:
EV Subsidy Eligibility

Predicates:

Annual income < ₹3,00,000
Residence state = Telangana
Permit status = Active

The UI must clearly show:

"You are asking the citizen to prove these conditions, not to upload the underlying documents."

================================================== 4. REQUEST PREVIEW
==================================================

Before sending:

Show a complete request preview.

Include:

Requester
Purpose
Requested predicates
Expiry
Disclosure
Consent template

Primary action:

Send Verification Request

================================================== 5. VERIFIER REQUEST STATUS
==================================================

Show lifecycle:

CREATED
SENT
AWAITING CONSENT
CONSENT GRANTED
PROOF RECEIVED
VERIFYING
VERIFIED

Also support failure states.

================================================== 6. VERIFICATION RESULT
==================================================

Create a verifier result page.

Show:

VERIFICATION SUCCESSFUL

Predicates:

✓ Income requirement satisfied
✓ Residence requirement satisfied
✓ Permit requirement satisfied

Then emphasize:

NO RAW CITIZEN ATTRIBUTES RECEIVED

The UI should visually reinforce the privacy architecture.

================================================== 7. MINIMAL STORAGE VISUALIZATION
==================================================

Create a small "What the verifier stores" panel.

Allowed:

✓ Verification status
✓ Timestamp
✓ Purpose
✓ Session/reference
✓ Receipt

Not stored:

✕ Raw income
✕ Full address
✕ Identity document
✕ Raw credential

This is an important educational part of the demo.

================================================== 8. WIRE / FLOW INSPECTOR
==================================================

Build a visual demo panel showing the protocol flow.

Example:

REQUEST

Verifier
↓
Request Contract
↓
Citizen Wallet
↓
Consent
↓
Proof
↓
Verifier
↓
Verification Result
↓
Receipt

Allow the judge to see the state transition.

Do NOT expose actual secrets.

Use synthetic protocol data only.

================================================== 9. END-TO-END DEMO MODE
==================================================

Create a dedicated:

/demo

route.

This should provide a guided demonstration.

Step 1
Verifier creates request

Step 2
Citizen receives request

Step 3
Citizen reviews request

Step 4
Citizen approves

Step 5
Proof generation

Step 6
Verifier receives proof

Step 7
Verification result

Step 8
Receipt generated

The entire demo should be deterministic.

Provide:

Restart Demo

button.

================================================== 10. TWO-PANEL DEMO
==================================================

Where useful, provide a desktop demonstration layout:

┌──────────────────────┬──────────────────────┐
│ VERIFIER │ CITIZEN │
│ │ │
│ Create Request │ Request Received │
│ ↓ │ ↓ │
│ Awaiting Consent │ Review Request │
│ ↓ │ ↓ │
│ Proof Received │ Give Consent │
│ ↓ │ ↓ │
│ Verified │ Proof Generated │
│ │ ↓ │
│ │ Receipt │
└──────────────────────┴──────────────────────┘

This can become the strongest live-demo screen.

On mobile, convert this to a sequential flow.

================================================== 11. DEMO SCRIPT
==================================================

The UI should naturally support this story:

"A government office needs to know whether this citizen qualifies.

Normally the citizen uploads documents.

With Pramāṇa, the verifier asks a bounded question.

The citizen sees exactly what is being requested.

The citizen gives consent.

The wallet produces a privacy-preserving proof.

The verifier receives the answer.

The verifier does not receive the underlying documents."

The UI should make this story visually obvious.

================================================== 12. PRODUCT POLISH
==================================================

Now perform a complete UX consistency pass.

Check:

Typography
Spacing
Colors
Buttons
Cards
Navigation
Icons
Loading
Errors
Empty states
Mobile layout
Desktop layout

Remove inconsistent components.

Create missing reusable primitives.

================================================== 13. ACCESSIBILITY
==================================================

Audit:

Keyboard navigation
Focus states
ARIA labels
Contrast
Dialogs
Form fields
Buttons
Screen-reader semantics

================================================== 14. PERFORMANCE
==================================================

Check:

bundle size
unnecessary dependencies
large assets
unnecessary renders
route loading

Do not optimize prematurely.

Fix obvious issues.

================================================== 15. TECHNICAL HONESTY
==================================================

Maintain:

DEMO MODE

where backend/cryptographic functionality is simulated.

Never present mock proof as actual cryptographic verification.

================================================== 16. VALIDATION
==================================================

Run:

pnpm typecheck
pnpm lint
pnpm test
pnpm build

Test the complete demo manually.

Test:

desktop
tablet
mobile

================================================== 17. FINAL RESULT
==================================================

At the end of this phase the frontend must provide:

✓ Landing page
✓ Citizen wallet
✓ Request flow
✓ Consent
✓ Proof-generation state
✓ Verification result
✓ Receipt
✓ Credentials
✓ History
✓ Verifier dashboard
✓ Request creation
✓ Request tracking
✓ Verification result
✓ Minimal-storage visualization
✓ Wire/flow inspector
✓ Complete demo mode
✓ Responsive design
✓ Accessible UI
✓ Error states
✓ Loading states

STOP after completing this phase.

Do not start production deployment work yet.
