# Branch Protection Rules

Configure these rules in GitHub Settings > Branches:

## Main Branch
- Require pull request reviews before merging (at least 1)
- Require status checks to pass before merging:
  - lint-frontend
  - prettier-check
  - lint-contracts
  - test-frontend
  - test-contracts
  - type-check
  - build-frontend
  - build-contracts
- Require branches to be up to date before merging
- Do not allow bypassing the above settings
- Restrict who can push to matching branches (admin only)
- Do not allow force pushes
- Do not allow deletions

## Develop Branch
- Require pull request reviews before merging (at least 1)
- Require status checks to pass before merging:
  - lint-frontend
  - prettier-check
  - test-frontend
  - test-contracts
  - type-check
  - build-frontend
- Require branches to be up to date before merging
- Do not allow force pushes