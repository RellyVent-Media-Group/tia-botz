# API Clients Test Suite

## Overview

This directory contains comprehensive tests for the social media API clients (Instagram and TikTok). The test suite verifies:

- ✅ API client instantiation and configuration
- ✅ Successful API calls (when credentials are configured)
- ✅ Graceful error handling and fallback behavior
- ✅ Integration with the main application

## Quick Start

### Run Tests

```bash
# Run all tests
npm test

# Run with watch mode (auto-restart on file changes)
npm run test:watch

# Run security audit
npm run audit

# Attempt to fix vulnerabilities
npm run audit:fix

# Full security check
npm run security:check
```

## Test Categories

### 1. Instagram Graph API Client Tests
Tests for the low-level Instagram Graph API client (`src/platforms/instagram-graph-api.js`):

- `Instagram client instantiation` - Verify client creates with valid credentials
- `Instagram client missing credentials` - Verify proper error handling
- `Instagram getUser` - Test user information retrieval
- `Instagram getMedia` - Test media (posts) retrieval
- `Instagram userInsights` - Test user analytics retrieval

### 2. Instagram Integration Tests
Tests for the high-level Instagram wrapper (`src/platforms/instagram.js`):

- `initInstagramClient` - Test initialization function
- `postToInstagram` - Test posting functionality
- `getInstagramUser` - Test user retrieval
- `Graceful fallback - no credentials` - Test fallback mode when credentials missing

### 3. TikTok Integration Tests
Tests for the TikTok integration (`src/platforms/tiktok.js`):

- `initTikTokClient` - Test initialization function
- `postToTikTok` - Test posting functionality
- `getTikTokUser` - Test user retrieval
- `TikTok graceful fallback - no credentials` - Test fallback mode

### 4. Integration Tests
Tests for system integration:

- `Multiple sequential posts` - Test concurrent posting
- `Error handling - invalid content` - Test error handling with bad inputs

## Configuration

### Environment Variables

Create a `.env.test` file for test-specific configuration:

```bash
# Instagram
INSTAGRAM_ACCESS_TOKEN=your_test_token
INSTAGRAM_USER_ID=your_test_user_id
FACEBOOK_PAGE_ID=your_test_page_id

# TikTok
TIKTOK_ACCESS_TOKEN=your_test_token
TIKTOK_API_KEY=your_test_api_key
```

**Note**: Without valid credentials, tests will:
- Skip credential-required tests (marked as `SKIP`)
- Test fallback behavior
- Still pass all non-credential tests

### Test Behavior Without Credentials

The test suite is designed to work **even without valid API credentials**:

- ✅ All client instantiation tests pass
- ✅ All error handling tests pass
- ✅ All fallback mode tests pass
- ⏭️  API call tests are skipped (not failed)
- ✅ You can still verify the code structure and error handling

## Running Specific Tests

To run a specific test, modify the `runAllTests()` function in `api-clients.test.js` to call only the tests you want.

Example:
```javascript
async function runAllTests() {
  // Only run Instagram tests
  await testInstagramClientInstantiation();
  await testInstagramClientMissingCredentials();
}
```

## Test Output

### Sample Output (With Credentials)
```
==================================================
API Clients Test Suite
==================================================

Configuration:
  Instagram: ✅ Configured
  TikTok: ❌ Not configured

Running Instagram Graph API Client Tests...

✅ PASS: Instagram client instantiation
✅ PASS: Instagram client missing credentials
✅ PASS: Instagram getUser
✅ PASS: Instagram getMedia
✅ PASS: Instagram userInsights

Running Instagram Integration Tests...

✅ PASS: initInstagramClient
✅ PASS: postToInstagram
✅ PASS: getInstagramUser
✅ PASS: Graceful fallback - no credentials

Running TikTok Integration Tests...

⏭️  SKIP: initTikTokClient (No credentials configured)
⏭️  SKIP: postToTikTok (No credentials configured)
⏭️  SKIP: getTikTokUser (No credentials configured)
✅ PASS: TikTok graceful fallback - no credentials

Running Integration Tests...

✅ PASS: Multiple sequential posts
✅ PASS: Error handling - invalid content

==================================================
Test Results Summary
==================================================
Total:  13
Passed: 11
Failed: 0
Skipped: 2
Duration: 2.45s
==================================================
```

### Sample Output (Without Credentials)
```
==================================================
API Clients Test Suite
==================================================

Configuration:
  Instagram: ❌ Not configured
  TikTok: ❌ Not configured

Running Instagram Graph API Client Tests...

⏭️  SKIP: Instagram client instantiation (No credentials configured)
✅ PASS: Instagram client missing credentials
⏭️  SKIP: Instagram getUser (No credentials configured)
⏭️  SKIP: Instagram getMedia (No credentials configured)
⏭️  SKIP: Instagram userInsights (No credentials configured)

Running Instagram Integration Tests...

✅ PASS: initInstagramClient
✅ PASS: postToInstagram
✅ PASS: getInstagramUser
✅ PASS: Graceful fallback - no credentials

...

==================================================
Test Results Summary
==================================================
Total:  15
Passed: 10
Failed: 0
Skipped: 5
Duration: 1.23s
==================================================
```

## Continuous Integration

The test suite is integrated with GitHub Actions:

- Runs on every push to `main` and `develop` branches
- Runs on every pull request to `main`
- Runs weekly on Mondays for security reporting

See `.github/workflows/security-audit.yml` for details.

## Writing New Tests

To add a new test:

1. Add a test function following the pattern:
```javascript
async function testNewFeature() {
  if (!TEST_CONFIG.instagram.enabled) {
    results.skip('Test name', 'No credentials configured');
    return;
  }

  await runTest('Test name', async () => {
    // Test code here
    const result = await someFunction();
    assert(result === expected, 'Error message');
  });
}
```

2. Call the test function in `runAllTests()`

3. Run `npm test` to verify

## Best Practices

### Test Structure
- Each test should be independent
- Use descriptive test names
- Test both success and error cases
- Clean up after tests (restore modified state)

### Assertions
Use the provided `assert()` function:
```javascript
assert(condition, message);
```

### Async Code
All tests are async-friendly:
```javascript
await runTest('Async test', async () => {
  const result = await asyncFunction();
  assert(result, 'Should have result');
});
```

### Error Handling
Test error cases explicitly:
```javascript
let errorThrown = false;
try {
  functionThatShouldThrow();
} catch (error) {
  errorThrown = true;
}
assert(errorThrown, 'Should have thrown an error');
```

## Troubleshooting

### "No credentials configured"
This is expected if you don't have API credentials set up. Tests will skip credential-required tests but still pass all other tests.

### Tests hanging
This might happen if:
- API calls are timing out
- Network issues
- Invalid credentials causing unexpected behavior

Solution: Check your network connection and API credentials.

### "Module not found" errors
Ensure you've run:
```bash
npm install
npm install form-data  # Required for file upload tests
```

## Files

| File | Purpose |
|------|---------|
| `api-clients.test.js` | Main test suite |
| `README.md` | This document |

## Dependencies

- `dotenv` - Load environment variables
- `form-data` - File upload testing (install separately)
- All platform modules being tested

## Performance Testing

For load testing, consider adding:

```javascript
// Example load test
async function testLoad() {
  const start = Date.now();
  const promises = [];
  
  for (let i = 0; i < 100; i++) {
    promises.push(postToInstagram({ ...mockContent, character: `Test ${i}` }));
  }
  
  await Promise.all(promises);
  const duration = Date.now() - start;
  
  console.log(`Completed 100 posts in ${duration}ms`);
  assert(duration < 30000, 'Load test should complete in < 30s');
}
```

## Security Testing

For security-specific tests, consider adding:

1. Input validation tests
2. Token expiration handling
3. Rate limiting tests
4. Error message security (no sensitive data leakage)

---

*Last updated: 2026-09-24*
*Test suite version: 1.0.0*
