# Contributing Guide

Thank you for your interest in contributing to the **ChiefPilot Social Media Automation** project! This document outlines how to contribute effectively.

---

## 📋 Table of Contents

1. [Getting Started](#-getting-started)
2. [Development Setup](#-development-setup)
3. [Code Style](#-code-style)
4. [Testing](#-testing)
5. [Security](#-security)
6. [Commit Guidelines](#-commit-guidelines)
7. [Pull Request Process](#-pull-request-process)
8. [Reporting Issues](#-reporting-issues)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- npm 9+
- Git
- Instagram Business Account (for API testing)
- TikTok Developer Account (optional, for TikTok testing)

### Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/24-Tak-14/tia-botz.git
cd tia-botz/automation/social-media

# Install dependencies
npm install
```

---

## 💻 Development Setup

### Install Dependencies

```bash
# Install production dependencies
npm install

# Install development dependencies (if any)
npm install --save-dev

# Install form-data for testing
npm install form-data
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

Required environment variables:
```bash
# Instagram (for Graph API)
INSTAGRAM_ACCESS_TOKEN=your_token_here
INSTAGRAM_USER_ID=your_instagram_user_id
FACEBOOK_PAGE_ID=your_facebook_page_id

# TikTok (optional)
TIKTOK_ACCESS_TOKEN=your_token_here
TIKTOK_API_KEY=your_api_key

# Application paths
CHARACTER_DATABASE_PATH=/path/to/character/database
VISUAL_ASSETS_PATH=/path/to/visual/assets
```

### Run the Application

```bash
# Start the application
npm start

# Run in development mode (auto-restart on changes)
npm run dev

# Run the scheduler
npm run schedule

# Post to Instagram (manual)
npm run post:instagram

# Post to TikTok (manual)
npm run post:tiktok
```

---

## 🎨 Code Style

### JavaScript/TypeScript

This project uses **ES Modules** (`"type": "module"` in package.json).

**Best Practices**:

1. **Use ESM imports/exports**
   ```javascript
   // ✅ Good
   import axios from 'axios';
   export { functionName };
   
   // ❌ Bad
   const axios = require('axios');
   module.exports = { functionName };
   ```

2. **Use JSDoc for documentation**
   ```javascript
   /**
    * Post to Instagram
    * @param {Object} content - Content to post
    * @param {string} content.caption - Post caption
    * @returns {Promise<boolean>} Success status
    */
   async function postToInstagram(content) {
     // implementation
   }
   ```

3. **Use meaningful variable names**
   ```javascript
   // ✅ Good
   const instagramUserId = process.env.INSTAGRAM_USER_ID;
   
   // ❌ Bad
   const id = process.env.INSTAGRAM_USER_ID;
   ```

4. **Error handling**
   ```javascript
   // ✅ Good
   try {
     const result = await apiCall();
     return result;
   } catch (error) {
     console.error('API call failed:', error.message);
     throw error;
   }
   
   // ❌ Bad
   try {
     const result = await apiCall();
     return result;
   } catch (error) {
     throw error;  // Missing logging
   }
   ```

5. **Async/await over promises**
   ```javascript
   // ✅ Good
   async function fetchData() {
     const data = await api.getData();
     return data;
   }
   
   // ❌ Bad
   function fetchData() {
     return api.getData().then(data => data);
   }
   ```

6. **Environment variable validation**
   ```javascript
   // ✅ Good
   if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
     throw new Error('INSTAGRAM_ACCESS_TOKEN is required');
   }
   
   // ❌ Bad
   const token = process.env.INSTAGRAM_ACCESS_TOKEN; // No validation
   ```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run security audit
npm run audit

# Full security check
npm run security:check
```

### Test Structure

Tests are located in the `tests/` directory:

```
tests/
├── api-clients.test.js  # Main test suite
└── README.md            # Test documentation
```

### Writing Tests

See [tests/README.md](tests/README.md) for detailed testing documentation.

**Test Categories**:
1. Instagram Graph API Client Tests
2. Instagram Integration Tests
3. TikTok Integration Tests
4. Integration Tests

### Test Without Credentials

The test suite works **without valid API credentials**:
- Tests that require credentials are **skipped** (not failed)
- All error handling and fallback tests still run
- You can verify code structure and logic

---

## 🔒 Security

### Security Guidelines

See [SECURITY.md](SECURITY.md) for comprehensive security documentation.

**Key Security Practices**:

1. **Never commit credentials**
   - `.env` is in `.gitignore`
   - Use environment variables, not hardcoded values
   - Use different credentials for dev vs prod

2. **Keep dependencies updated**
   - Regularly run `npm outdated`
   - Update dependencies promptly
   - Use npm overrides for vulnerable transitive deps

3. **Validate all inputs**
   - API inputs
   - User inputs
   - File uploads
   - Environment variables

4. **Handle errors securely**
   - Don't expose internal errors to users
   - Don't log sensitive data
   - Use graceful degradation

### Security Scanning

```bash
# Check for vulnerabilities
npm audit

# Get detailed report
npm audit --json

# Attempt fixes
npm audit fix

# Check for outdated packages
npm outdated
```

The repository has **automated security scanning** via GitHub Actions:
- Runs on every push and pull request
- Runs weekly for reports
- Fails on critical/high vulnerabilities

---

## 📝 Commit Guidelines

### Commit Messages

Use **conventional commits** format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (no functional changes)
- `refactor`: Code refactoring (no bug fixes or new features)
- `test`: Adding or modifying tests
- `chore`: Build process or auxiliary tool changes
- `security`: Security-related changes

**Examples**:
```bash
# Good
feat(instagram): add Graph API client
fix(tiktok): handle missing credentials gracefully
docs: update README with usage examples
security: add npm overrides for vulnerabilities

# Bad
updated stuff
fixed bug
```

### Atomic Commits

Each commit should represent **one logical change**:
- ✅ Add a single feature
- ✅ Fix a single bug
- ✅ Update a single dependency
- ❌ Multiple unrelated changes

### Commit Size

- Keep commits **small and focused**
- Aim for **< 400 lines changed** per commit
- If larger, consider splitting into multiple commits

---

## 🔄 Pull Request Process

### Before Submitting

1. **Run tests**
   ```bash
   npm test
   ```

2. **Check for vulnerabilities**
   ```bash
   npm audit
   ```

3. **Verify no breaking changes**
   ```bash
   npm start  # Test main functionality
   ```

4. **Update documentation** (if applicable)
   - Update README.md
   - Update relevant documentation
   - Add JSDoc comments

### Pull Request Template

Use this template for your PR:

```markdown
## Description

[Brief description of changes]

## Related Issues

[Link to any related issues]

## Changes

- [ ] Feature addition
- [ ] Bug fix
- [ ] Documentation update
- [ ] Dependency update
- [ ] Security improvement
- [ ] Test addition

## Testing

- [ ] All tests pass (`npm test`)
- [ ] No new vulnerabilities (`npm audit`)
- [ ] Application starts without errors
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No credentials committed
- [ ] No breaking changes
```

### Review Process

1. **Submit PR** to the appropriate branch
2. **Wait for CI** to pass all checks
3. **Address feedback** from reviewers
4. **Merge** once approved

**Required Approvals**: 1 (for most changes)

---

## 🐛 Reporting Issues

### Bug Reports

When reporting a bug, include:

1. **Description** - What happened?
2. **Steps to Reproduce** - How can we reproduce it?
3. **Expected Behavior** - What should have happened?
4. **Actual Behavior** - What actually happened?
5. **Environment** - Node.js version, OS, etc.
6. **Screenshots/Logs** - Any relevant output

### Feature Requests

When requesting a feature, include:

1. **Description** - What feature are you requesting?
2. **Use Case** - Why do you need this feature?
3. **Proposed Solution** (optional) - How could it be implemented?

### Security Issues

For **security vulnerabilities**, do **NOT** open a public issue. Instead:

1. Open a **private security advisory** via GitHub
2. Or email the maintainers directly

---

## 📚 Resources

### Documentation

- [README.md](../README.md) - Project overview
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Migration from old API
- [SECURITY.md](SECURITY.md) - Security practices
- [tests/README.md](tests/README.md) - Testing documentation

### Development Tools

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [ES Modules (ESM)](https://nodejs.org/api/esm.html)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [TikTok Developer Portal](https://developers.tiktok.com/)

### Community

- [GitHub Discussions](https://github.com/24-Tak-14/tia-botz/discussions) - General questions
- [GitHub Issues](https://github.com/24-Tak-14/tia-botz/issues) - Bug reports and feature requests

---

## 🎓 Learning Resources

### Node.js
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [The Node.js Way](https://github.com/thecodercoder/the-nodejs-way)

### JavaScript
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Standard JS Style Guide](https://standardjs.com/)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [Mocha Documentation](https://mochajs.org/)
- [Chai Documentation](https://www.chaijs.com/)

---

## 🙏 Acknowledgments

Thank you for contributing! Your help makes this project better for everyone.

---

*Document Version*: 1.0.0
*Last Updated*: 2026-09-24
