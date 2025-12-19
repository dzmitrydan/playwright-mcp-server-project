### Use the Playwright MCP for Test Creation
Use the Playwright MCP browser tools to record new test actions, then save them as a proper Playwright test file. 
Once all steps are completed in the browser you must then refactor this generated script to match the existing project patterns. This includes:
- Moving logic into the appropriate Page Object Models
- Using existing Page Objects

After refactoring, present the final version of the new test file only.
Run the test using the following command to validate it: `npx playwright <test new_test_file.spec.ts> --headed --project=Chromium` to ensure it passes and works as intended. 
If there are issue try to fix them by 1 attempt.