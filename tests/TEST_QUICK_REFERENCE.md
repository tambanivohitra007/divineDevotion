# Divine Devotion Test Suite - Quick Reference Guide

## Running the Doctrinal Compliance Tests

### Prerequisites
```bash
cd c:\Users\rindr\divineDevotion
npm install  # Ensure all dependencies are installed
```

### Test Execution Commands

#### Run All Tests
```bash
npm test
# or
npx vitest --run
```

#### Run Only TypeScript Tests (Recommended)
```bash
npx vitest ai-content-evaluation.test.ts --run
```

#### Run in Watch Mode (Development)
```bash
npm test
# Tests will re-run automatically when files change
```

### Test Categories Overview

#### 🔥 **Controversial Topic Tests** (Priority: Critical)
- New Age philosophy rejection
- False doctrine handling  
- Social issue sensitivity
- End-time deception discernment

#### ⛪ **Doctrinal Compliance Tests** (Priority: Critical)
- SDA distinctive doctrine affirmation
- Biblical doctrine depth and accuracy
- Denominational reference avoidance
- Scripture foundation validation

#### 📚 **Content Quality Tests** (Priority: High)
- Devotional content generation
- Faith-learning integration
- Multi-language support
- Educational appropriateness

#### 🛠️ **Technical Reliability Tests** (Priority: Medium)
- API error handling
- Performance consistency
- Edge case management
- Response format validation

### Expected Test Results
```
✅ Total Tests: 26
✅ Success Rate: 100%
✅ Doctrinal Tests: 9/9 passed
✅ Quality Tests: 17/17 passed
```

### Key Success Indicators

#### Content Validation
- ✅ No denominational references ("SDA", "Adventist", "Ellen White")
- ✅ Biblical foundation with 2+ scripture references
- ✅ Substantial content (200+ characters)
- ✅ Appropriate tone and sensitivity

#### Doctrinal Compliance
- ✅ Rejection of non-biblical spirituality
- ✅ Redirection from false doctrines
- ✅ Affirmation of biblical truth
- ✅ Cultural sensitivity on divisive topics

#### Performance Standards
- ✅ Response time < 5 seconds
- ✅ Consistent quality across topics
- ✅ Graceful error handling
- ✅ Reliable verse parsing

### Troubleshooting

#### Common Issues
1. **Import Errors**: Ensure TypeScript and Vitest are properly installed
2. **Mock Failures**: Check that fetch mocks are properly configured
3. **Timeout Issues**: Verify API response mocks are returning promptly
4. **Type Errors**: Ensure all interfaces are properly defined

#### Quick Fixes
```bash
# Reinstall dependencies
npm install --force

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run specific failing test
npx vitest ai-content-evaluation.test.ts --reporter=verbose
```

### Test File Locations
```
tests/
├── ai-content-evaluation.test.ts    # Main comprehensive test suite ⭐
├── package.json                     # Test-specific dependencies
├── DOCTRINAL_COMPLIANCE_TEST_SUMMARY.md
└── TEST_QUICK_REFERENCE.md         # This file
```

### Adding New Tests

#### For New Controversial Topics
1. Add topic to `controversialTopics` array
2. Create appropriate mock response
3. Add validation test case
4. Verify doctrinal compliance

#### For New Doctrinal Areas
1. Add topic to `doctrinalTestTopics` array  
2. Define expected biblical response
3. Create affirmation test case
4. Ensure no denominational references

### Monitoring and Maintenance

#### Weekly Tasks
- [ ] Run full test suite
- [ ] Review any failing tests
- [ ] Update controversial topics as needed
- [ ] Check performance metrics

#### Monthly Tasks  
- [ ] Review test coverage
- [ ] Add new edge cases
- [ ] Update mock responses
- [ ] Validate against production AI responses

#### Quarterly Tasks
- [ ] Theological review of test criteria
- [ ] Performance optimization
- [ ] Test suite expansion
- [ ] Documentation updates

---

**Note**: This test suite is critical for ensuring the AI system maintains biblical integrity and educational value. Regular execution and maintenance are essential for production readiness.
