# Playwright MCP Server Project

## Description

### 1. Playwright MCP 

### 2. Playwright Test Agents
- planner
```
Generate a test plan for the Google Cloud Compute Engine (go to https://cloud.google.com/products/calculator > ckick Add to estimate > select Compute Engine) and save it as google-cloud-compute-engine-test-plan in the specs folde
```
- generator

- healer


---

## Initiate the Project
Install project dependency
```bash
npm install
```

## Run Tests

```bash
npx playwright test --headed
```

Runs the tests only on Desktop Chrome:
```bash
npx playwright test --project=chromium
```

---
```bash
npx playwright test tests/saucedemo-sorting.spec --headed --project=chromium
```

```bash
npx playwright test tests/google-cloud-calculator.spec.ts --headed
<<<<<<< Updated upstream
=======
```

```bash
npx playwright test tests/google-cloud-calculator.spec.ts  --project=chromium --headed
>>>>>>> Stashed changes
```