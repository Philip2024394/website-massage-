# E2E Test API Documentation

## Overview

Backend API endpoints for triggering E2E tests programmatically and integrating with deployment pipelines.

## Endpoints

### 1. Run E2E Tests

**POST** `/api/run-e2e-test`

Runs the complete E2E test suite with AI failure diagnosis.

#### Response

```typescript
{
  status: 'GO' | 'NO-GO' | 'WARNING',
  totalTests: number,
  passed: number,
  failed: number,
  sev1Failures: number,      // Revenue-critical failures
  sev2Failures: number,      // User experience failures
  deploymentBlocked: boolean,
  executiveSummary: string,  // Markdown report
  details: any[],
  timestamp: string,
  duration: number
}
```

#### Status Codes

- **200**: Tests completed (check `deploymentBlocked` for deployment decision)
- **403**: Deployment BLOCKED (SEV-1 failures detected)
- **500**: Test execution failed

#### Example

```bash
curl -X POST http://localhost:3000/api/run-e2e-test
```

```json
{
  "status": "NO-GO",
  "totalTests": 6,
  "passed": 4,
  "failed": 2,
  "sev1Failures": 2,
  "sev2Failures": 0,
  "deploymentBlocked": true,
  "executiveSummary": "# 🚨 E2E Test Executive Summary\n\n## 📊 Test Results Overview\n...",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "duration": 15234
}
```

---

### 2. Revenue Guard Tests

**POST** `/api/run-revenue-guard`

Runs only revenue-critical tests (faster, focused on commission integrity).

#### Response

```typescript
{
  status: 'GO' | 'NO-GO',
  message: string,
  duration: number,
  results: any
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/run-revenue-guard
```

```json
{
  "status": "GO",
  "message": "✅ Revenue protection verified",
  "duration": 5432,
  "results": { ... }
}
```

---

### 3. Test Status

**GET** `/api/e2e-test-status`

Get the latest E2E test results (from previous run).

#### Response

```typescript
{
  status: 'SUCCESS' | 'UNKNOWN' | 'ERROR',
  lastRun: Date,
  results: any
}
```

#### Example

```bash
curl http://localhost:3000/api/e2e-test-status
```

---

### 4. Executive Report

**GET** `/api/e2e-reports/executive`

Get business-level executive summary (Markdown format).

#### Response

Markdown document with:
- Test results overview
- SEV-1 (Revenue Critical) failures
- SEV-2 (User Experience) failures
- Deployment decision
- Business impact assessment

#### Example

```bash
curl http://localhost:3000/api/e2e-reports/executive
```

---

### 5. Developer Report

**GET** `/api/e2e-reports/developer`

Get technical debugging information (Markdown format).

#### Response

Markdown document with:
- Error messages and stack traces
- AI root cause diagnosis
- Fix recommendations with code snippets
- Screenshot paths
- Debugging tips

#### Example

```bash
curl http://localhost:3000/api/e2e-reports/developer
```

---

## Integration Examples

### Deployment Pipeline

```typescript
// Before deployment, run E2E tests
app.post('/api/deploy', async (req, res) => {
  // 1. Run tests
  const testResponse = await fetch('http://localhost:3000/api/run-e2e-test', {
    method: 'POST'
  });
  
  const results = await testResponse.json();

  // 2. Block deployment if SEV-1 failures
  if (results.deploymentBlocked) {
    return res.status(403).json({
      message: '🚨 DEPLOYMENT BLOCKED',
      reason: 'Revenue-critical tests failed',
      sev1Failures: results.sev1Failures
    });
  }

  // 3. Proceed with deployment
  // ... deployment logic ...
  
  res.json({ status: 'DEPLOYED' });
});
```

### Pre-Release Check

```typescript
// CI/CD integration
const checkDeploymentReadiness = async () => {
  const response = await fetch('http://localhost:3000/api/run-revenue-guard', {
    method: 'POST'
  });
  
  const results = await response.json();
  
  if (results.status === 'NO-GO') {
    console.error('🚨 Revenue Guard failed - BLOCKING DEPLOYMENT');
    process.exit(1);
  }
  
  console.log('✅ Revenue protection verified - SAFE TO DEPLOY');
};
```

### Status Dashboard

```typescript
// Get latest test status for dashboard
app.get('/dashboard/e2e-status', async (req, res) => {
  const statusResponse = await fetch('http://localhost:3000/api/e2e-test-status');
  const status = await statusResponse.json();
  
  res.json({
    lastTestRun: status.lastRun,
    passed: status.results?.passed || 0,
    failed: status.results?.failed || 0,
    status: status.status
  });
});
```

---

## Response Status Interpretation

### `status: 'GO'`
- ✅ All tests passed
- ✅ No revenue violations
- ✅ Safe to deploy

### `status: 'WARNING'`
- ⚠️ Some tests failed (SEV-2 or SEV-3)
- ✅ No revenue-critical failures
- ⚠️ Safe to deploy, but UX issues present

### `status: 'NO-GO'`
- ❌ SEV-1 (Revenue Critical) failures detected
- ❌ Deployment BLOCKED
- ❌ DO NOT DEPLOY

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "ERROR",
  "message": "Human-readable error message",
  "error": "Technical error details"
}
```

---

## Security Considerations

1. **Authentication**: Add authentication middleware to protect these endpoints
2. **Rate Limiting**: Limit test execution frequency to prevent abuse
3. **CORS**: Configure CORS for production deployments
4. **Logging**: All test runs are logged with timestamps

Example security setup:

```typescript
import { authenticate, rateLimit } from './middleware';

// Protect E2E test endpoints
app.use('/api/run-e2e-test', authenticate, rateLimit);
app.use('/api/run-revenue-guard', authenticate, rateLimit);
```

---

## Performance

- **Full E2E Tests**: ~15-30 seconds
- **Revenue Guard Only**: ~5-10 seconds
- **Report Generation**: <1 second

---

## Monitoring

Monitor these metrics:

- Test execution time (duration)
- Pass/fail rate
- SEV-1 failure count (should be 0)
- Deployment blocks per day

---

## Troubleshooting

### Tests not running
- Check Playwright is installed: `npx playwright install`
- Verify test files exist in `e2e-tests/flows/`
- Check Node.js version (requires Node 18+)

### JSON parse errors
- Check test output format
- Verify `--reporter=json` flag
- Check buffer size (increase maxBuffer if needed)

### Deployment blocked incorrectly
- Review executive report: `GET /api/e2e-reports/executive`
- Check AI diagnosis: Run `pnpm test:e2e:diagnose` locally
- Verify SEV-1 failures are legitimate

---

## Local Testing

```bash
# Start your server
npm run dev

# Test the API
curl -X POST http://localhost:3000/api/run-e2e-test

# View reports
curl http://localhost:3000/api/e2e-reports/executive
curl http://localhost:3000/api/e2e-reports/developer
```

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run E2E Tests via API
  run: |
    curl -X POST http://localhost:3000/api/run-e2e-test \
      -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
      -o test-results.json
    
    # Check if deployment blocked
    if jq -e '.deploymentBlocked == true' test-results.json; then
      echo "🚨 DEPLOYMENT BLOCKED"
      exit 1
    fi
```

### GitLab CI

```yaml
e2e_test:
  script:
    - npm start &
    - sleep 5
    - curl -X POST http://localhost:3000/api/run-e2e-test > results.json
    - 'if [ $(jq -r .deploymentBlocked results.json) = "true" ]; then exit 1; fi'
```

---

## Best Practices

1. **Always run before deployment**
2. **Never bypass SEV-1 blocks**
3. **Monitor test execution time**
4. **Review executive reports weekly**
5. **Fix SEV-2 failures in next sprint**
6. **Keep test data clean**
7. **Use revenue guard for quick checks**

---

*For more details, see [AI_HUMAN_E2E_SYSTEM_README.md](../e2e-tests/AI_HUMAN_E2E_SYSTEM_README.md)*
