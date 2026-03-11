# Playwright MCP Server Project

## Description

### 1. Playwright MCP 

### 2. Playwright Test Agents
- planner
- generator
- healer

---

## Initiate the Project
Create tsconfig.json
```bash
npx tsc --init
```

Install project dependency
```bash
npm install
```

---

## Run Tests

```bash
npx playwright test --headed
```

Runs the tests only on Desktop Chrome:
```bash
npx playwright test --project=chromium
```

```bash
npx playwright test tests/saucedemo-sorting.spec --headed --project=chromium
```

```bash
npx playwright test tests/saucedemo-sorting.spec --headed
```

```bash
npx playwright test tests/test.spec.ts  --project=chromium --headed
```

```bash
npx playwright test tests/google-cloud-calculator.spec.ts  --project=chromium --headed
```
```bash
npx playwright test google-cloud-calculator.spec --project=chromium --grep "Test 2" --headed
```

```bash
npx playwright show-report
```