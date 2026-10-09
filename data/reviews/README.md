# Name reviews

- `review-001-*`: an AI playing a priest-scholar read all 694 records (kept/fixed/rejected each). Not a human review.
- `review-101/102/103-verdicts.json`: these reviewers assigned verdicts with keyword scripts instead of reading each record.
  Only their "fix" (and a few "keep") entries are kept (those name corrections look sound); their ~2,000 "reject" verdicts were dropped
  because they were not real reviews. Those names fall back to the automatic quality gate (`src/quality.js`).
- `chunks/`: input for the remaining full-name review, which has not been done yet.
