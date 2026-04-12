# Playwright TypeScript Project

## Description

### 1. Playwright MCP Server

### 2. Playwright Test Agents
- planner
- generator
- healer

### 3. Data-driven approach
- JSON
- CSV
- EXCEL

### 4. PowerShell Tests

PowerShell script + CSV/Excel + Playwright

Data Driven Testing
Test data (CSV / Excel)
↓
Script execution
↓
Validation
↓
Report


Excel → PowerShell → Playwright → HTML Report → CI

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

```bash
npm install --no-audit
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

```bash
npx playwright show-report --port 8997
```

```bash
npx playwright codegen test tests/google-cloud-calculator-estimate-cost.spec.ts --headed --debug
```
