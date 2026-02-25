# Google Cloud Compute Engine Test Plan

## Application Overview

This test plan covers the user flow for estimating costs using the Google Cloud Pricing Calculator for Compute Engine. It includes happy path, edge cases, and negative scenarios for adding and configuring Compute Engine resources in the calculator UI.

## Test Scenarios

### 1. Compute Engine Estimation Flow

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add Compute Engine to Estimate (Happy Path)

**File:** `tests/google-cloud-compute-engine/happy-path.spec.ts`

**Steps:**
  1. Navigate to https://cloud.google.com/products/calculator.
    - expect: The Google Cloud Pricing Calculator page loads.
  2. Dismiss the cookie consent dialog if present.
    - expect: The calculator UI is fully accessible.
  3. Click the 'Add to estimate' button.
    - expect: A dialog appears with a list of Google Cloud products.
  4. Select 'Compute Engine' and click 'Add item'.
    - expect: The Compute Engine configuration panel appears.
  5. Configure the following: Number of instances: 1, Machine Family: General Purpose, Series: N4, Machine type: n4-standard-2, vCPUs: 2, Memory: 8 GiB, Boot disk: Hyperdisk Balanced, Size: 10 GiB, Region: Iowa (us-central1), OS: Free: Debian, CentOS, CoreOS, Ubuntu or BYOL, Provisioning Model: Regular, Committed use: None.
    - expect: The configuration fields are set as specified.
  6. Click 'Add to estimate' or equivalent to add the configured Compute Engine to the estimate.
    - expect: The estimate summary updates with the Compute Engine cost.

#### 1.2. Field Validation and Error Handling

**File:** `tests/google-cloud-compute-engine/validation.spec.ts`

**Steps:**
  1. Attempt to set the number of instances to 0.
    - expect: An error message is shown or the field is reset to a valid value.
  2. Enter a negative value for boot disk size.
    - expect: An error message is shown or the field is reset to a valid value.
  3. Leave required fields (e.g., Machine Family) blank and try to add to estimate.
    - expect: The user is prevented from proceeding and an error is shown.

#### 1.3. Edge Cases and Advanced Options

**File:** `tests/google-cloud-compute-engine/edge-cases.spec.ts`

**Steps:**
  1. Set the number of instances to a high value (e.g., 1000).
    - expect: The UI accepts the value or displays a relevant warning or error.
  2. Change the provisioning model to 'Spot (Preemptible VM)'.
    - expect: The estimate updates to reflect the new pricing model.
  3. Change the region to a different location (e.g., 'Frankfurt (europe-west3)').
    - expect: The estimate updates to reflect the new region.
  4. Toggle 'Advanced settings' and review available options.
    - expect: Advanced configuration options are displayed and can be interacted with.

### 2. Check CSV file

**File:** `tests/google-cloud-compute-engine/edge-cases.spec.ts`

**Steps:**

1. Navigate to https://cloud.google.com/products/calculator/.
2. Wait until the "Add to estimate" button is visible.
3. Click "Add to estimate".
4. Select "Compute Engine" from the product list.
5. Wait for the Compute Engine configuration form to appear.
6. Set Number of instances to 3.
7. Open Operating System / Software dropdown.
8. Select "Paid: Ubuntu Pro".
9. In Provisioning Model, select "Regular".
10. Wait until the Estimated monthly cost value updates.
11. Capture the Estimated monthly cost value from the summary.
12. Click "Download CSV".
13. Wait for the file download event.
14. Save the file to the configured downloads directory.
15. Open the CSV file.
16. Extract the total price value from the CSV.
17. Normalize currency formatting (remove symbols, commas).
18. Compare the CSV price with the captured estimate.
