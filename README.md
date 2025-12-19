# Playwright MCP Server Project

## Description

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