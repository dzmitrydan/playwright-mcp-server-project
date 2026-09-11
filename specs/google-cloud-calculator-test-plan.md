# Google Cloud Calculator Test Plan

## Application Overview

This test plan covers the Google Cloud Pricing Calculator, focusing on estimate creation, product configuration, cost calculation, sharing/exporting, and error handling. The plan ensures comprehensive coverage of user flows, edge cases, and validation scenarios for both authenticated and unauthenticated users.

## Test Scenarios

### 1. Estimate Creation & Product Configuration

**Seed:** `tests/seed.spec.ts`

#### 1.1. Create a new estimate with default settings

**File:** `tests/google-cloud-calculator/estimate-creation.spec.ts`

**Steps:**
  1. Navigate to https://cloud.google.com/products/calculator.
    - expect: The calculator page loads successfully.
  2. Click 'Add to estimate' button.
    - expect: A new estimate is created and displayed in the estimate panel.

#### 1.2. Add and configure a product to estimate

**File:** `tests/google-cloud-calculator/product-selection.spec.ts`

**Steps:**
  1. Click 'Add to estimate' button.
    - expect: Product selection dialog appears.
  2. Select a product (e.g., Compute Engine) and configure options (region, machine type, etc.).
    - expect: Product is added to estimate with selected configuration.

#### 1.3. Remove a product from estimate

**File:** `tests/google-cloud-calculator/product-removal.spec.ts`

**Steps:**
  1. Add a product to estimate.
    - expect: Product appears in estimate panel.
  2. Remove the product from estimate.
    - expect: Product is removed and estimate updates accordingly.

### 2. Cost Calculation & Currency Handling

**Seed:** `tests/seed.spec.ts`

#### 2.1. Verify cost calculation updates with configuration changes

**File:** `tests/google-cloud-calculator/cost-calculation.spec.ts`

**Steps:**
  1. Add a product and configure options.
    - expect: Estimated cost updates based on configuration.
  2. Change product configuration (e.g., region, machine type).
    - expect: Estimated cost updates to reflect new configuration.

#### 2.2. Change currency and verify estimate updates

**File:** `tests/google-cloud-calculator/currency-selection.spec.ts`

**Steps:**
  1. Click 'Open currency selector' and select a different currency (e.g., EUR).
    - expect: Estimate updates to show cost in selected currency.

### 3. Sharing & Exporting Estimates

**Seed:** `tests/seed.spec.ts`

#### 3.1. Share estimate via dialog

**File:** `tests/google-cloud-calculator/share-estimate.spec.ts`

**Steps:**
  1. Add products to estimate.
    - expect: Estimate panel displays added products.
  2. Click 'Open Share Estimate dialog'.
    - expect: Share dialog opens (if enabled).

#### 3.2. Export estimate as CSV

**File:** `tests/google-cloud-calculator/export-estimate.spec.ts`

**Steps:**
  1. Add products to estimate.
    - expect: Estimate panel displays added products.
  2. Click 'Download estimate as .csv'.
    - expect: CSV file is downloaded with estimate details.

### 4. Error Handling & Validation

**Seed:** `tests/seed.spec.ts`

#### 4.1. Attempt to view billing account pricing without signing in

**File:** `tests/google-cloud-calculator/unauthenticated-pricing.spec.ts`

**Steps:**
  1. Click 'Sign in' link for billing account pricing.
    - expect: Redirect to Google sign-in page.

#### 4.2. Configure product with invalid options

**File:** `tests/google-cloud-calculator/invalid-config.spec.ts`

**Steps:**
  1. Select a product and enter invalid configuration (e.g., unsupported region).
    - expect: Error message is displayed and estimate is not updated.
