# AI Human E2E Orchestrator API Documentation

## Overview

The AI Human Orchestrator runs comprehensive multi-scenario E2E tests simulating real human behavior across all user types and booking flows.

## Endpoints

### 1. Run Full Orchestration

**POST** `/api/run-full-e2e`

Runs complete AI Human E2E orchestration covering all scenarios.

#### Scenarios Tested

1. **Book Now** - Immediate booking with instant chat creation
2. **Scheduled Booking** - Future booking with countdown timer
3. **Slider Booking** - Price negotiation flow
4. **Chat System** - Messages with audio/vibration notifications
5. **Notifications** - Push notifications with delivery verification
6. **Commissions** - Revenue protection and commission integrity (CRITICAL)
7. **Countdown Timer** - Auto-acceptance on timeout
8. **Dashboards** - Admin & Therapist dashboard functionality

#### Response

```typescript
{
  status: 'GO' | 'NO-GO' | 'WARNING',
  orchestrationComplete: boolean,
  totalScenarios: number,
  passedScenarios: number,
  failedScenarios: number,
  scenarios: {
    bookNow: { status: string; duration: number },
    scheduled: { status: string; duration: number },
    slider: { status: string; duration: number },
    chat: { status: string; duration: number },
    notifications: { status: string; duration: number },
    commissions: { status: string; duration: number },
    countdown: { status: string; duration: number },
    dashboards: { status: string; duration: number }
  },
  revenueProtected: boolean,
  sev1Failures: number,
  sev2Failures: number,
  autoRetryAttempts: number,
  fixedMinorFailures: number,
  executiveSummary: string,
  timestamp: string,
  totalDuration: number
}
```

#### Features

- ✅ **Multi-User Simulation** - Customer, Therapist, Admin
- ✅ **Multiple Booking Types** - Book Now, Scheduled, Slider
- ✅ **Chat System** - Messages, audio, vibration
- ✅ **Revenue Protection** - Commission verification (SEV-1)
- ✅ **Auto-Retry** - Automatically retries and fixes minor failures
- ✅ **AI Diagnosis** - Root cause analysis on failures
- ✅ **Executive Summary** - Business-level reporting

#### Example

```bash
curl -X POST http://localhost:3000/api/run-full-e2e
```

```json
{
  "status": "GO",
  "orchestrationComplete": true,
  "totalScenarios": 8,
  "passedScenarios": 8,
  "failedScenarios": 0,
  "scenarios": {
    "bookNow": { "status": "PASSED", "duration": 5234 },
    "scheduled": { "status": "PASSED", "duration": 4567 },
    "slider": { "status": "PASSED", "duration": 4890 },
    "chat": { "status": "PASSED", "duration": 6123 },
    "notifications": { "status": "PASSED", "duration": 3456 },
    "commissions": { "status": "PASSED", "duration": 7890 },
    "countdown": { "status": "PASSED", "duration": 2345 },
    "dashboards": { "status": "PASSED", "duration": 5678 }
  },
  "revenueProtected": true,
  "sev1Failures": 0,
  "sev2Failures": 0,
  "autoRetryAttempts": 0,
  "fixedMinorFailures": 0,
  "executiveSummary": "✅ All 8 scenarios passed successfully!",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "totalDuration": 45283
}
```

---

### 2. Get Orchestration Status

**GET** `/api/orchestration-status`

Get status of last orchestration run.

#### Response

```typescript
{
  status: 'IDLE' | 'RUNNING' | 'COMPLETE',
  message: string,
  lastRun: Date | null
}
```

#### Example

```bash
curl http://localhost:3000/api/orchestration-status
```

---

### 3. Run Specific Scenario

**POST** `/api/run-scenario`

Run a single scenario instead of full orchestration.

#### Request Body

```json
{
  "scenario": "bookNow" | "scheduled" | "slider" | "chat" | "notifications" | "commissions" | "countdown" | "dashboards"
}
```

#### Response

```typescript
{
  scenario: string,
  status: 'PASSED' | 'FAILED',
  results: any
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/run-scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario": "commissions"}'
```

```json
{
  "scenario": "commissions",
  "status": "PASSED",
  "results": { ... }
}
```

---

## Auto-Retry Logic

The orchestrator includes intelligent auto-retry:

1. **Detects Minor Failures** - SEV-2/SEV-3 failures only
2. **Retries Automatically** - Runs failed tests once more
3. **Fixes Minor Issues** - Network glitches, timing issues
4. **Reports Fixed Count** - Shows how many failures were auto-fixed

### Example with Auto-Retry

```json
{
  "status": "GO",
  "passedScenarios": 8,
  "failedScenarios": 0,
  "autoRetryAttempts": 1,
  "fixedMinorFailures": 2,
  "executiveSummary": "✅ Auto-retry fixed 2 minor failures. All scenarios now passing."
}
```

---

## Revenue Protection

The orchestrator enforces **SEV-1 revenue protection rules**:

### Commission Verification Checks

1. ✅ Commission created when booking accepted
2. ✅ Commission amount matches booking price
3. ✅ No duplicate commissions
4. ✅ No orphan commissions
5. ✅ Commission created within 5 seconds
6. ✅ Idempotency enforced

### Deployment Blocking

If `revenueProtected: false` or `sev1Failures > 0`:
- **Status Code**: 403 (Forbidden)
- **Status**: 'NO-GO'
- **Deployment**: BLOCKED

---

## Integration Examples

### Pre-Deployment Check

```typescript
// Before deploying, run full orchestration
app.post('/api/deploy', async (req, res) => {
  const orchestrationResponse = await fetch('http://localhost:3000/api/run-full-e2e', {
    method: 'POST'
  });
  
  const results = await orchestrationResponse.json();

  // Block if revenue at risk
  if (!results.revenueProtected || results.sev1Failures > 0) {
    return res.status(403).json({
      message: '🚨 DEPLOYMENT BLOCKED - Revenue at risk',
      reason: 'Commission verification failed',
      details: results
    });
  }

  // Allow with warning if minor failures
  if (results.failedScenarios > 0) {
    console.warn(`⚠️ Deploying with ${results.failedScenarios} non-critical failures`);
  }

  // Proceed with deployment
  // ... deployment logic ...
  
  res.json({ status: 'DEPLOYED', orchestration: results });
});
```

### Continuous Monitoring

```typescript
// Run orchestration every hour
setInterval(async () => {
  const response = await fetch('http://localhost:3000/api/run-full-e2e', {
    method: 'POST'
  });
  
  const results = await response.json();
  
  if (results.status === 'NO-GO') {
    console.error('🚨 CRITICAL: Orchestration failing!');
    // Send alerts
  } else if (results.status === 'WARNING') {
    console.warn('⚠️ Minor orchestration issues detected');
  } else {
    console.log('✅ Orchestration healthy');
  }
}, 3600000); // Every hour
```

### Quick Revenue Check

```typescript
// Before processing payment, verify revenue protection
app.post('/api/process-payment', async (req, res) => {
  // Run commission scenario only (faster)
  const commissionsResponse = await fetch('http://localhost:3000/api/run-scenario', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario: 'commissions' })
  });
  
  const results = await commissionsResponse.json();
  
  if (results.status !== 'PASSED') {
    return res.status(403).json({
      message: 'Payment processing unavailable - commission system unhealthy'
    });
  }

  // Process payment
  // ...
});
```

---

## Performance

| Scenario | Avg Duration | Timeout |
|----------|--------------|---------|
| Book Now | ~5 seconds | 30s |
| Scheduled | ~4 seconds | 30s |
| Slider | ~5 seconds | 30s |
| Chat | ~6 seconds | 30s |
| Notifications | ~3 seconds | 30s |
| Commissions | ~8 seconds | 30s |
| Countdown | ~2 seconds | 30s |
| Dashboards | ~5 seconds | 30s |
| **Full Orchestration** | **~45 seconds** | **5 minutes** |

---

## Status Codes

- **200**: Orchestration completed (check `status` field)
- **403**: Deployment BLOCKED (SEV-1 failures)
- **400**: Invalid request (missing scenario)
- **500**: Orchestration execution failed

---

## Best Practices

1. **Run full orchestration before major deployments**
2. **Use individual scenarios for quick checks**
3. **Trust the auto-retry logic** - it fixes transient issues
4. **Never bypass SEV-1 blocks** - revenue is at risk
5. **Monitor orchestration health** - run periodically
6. **Review executive summaries** - understand failures
7. **Prioritize commission scenario** - most critical

---

## Troubleshooting

### Orchestration Timeout

**Symptom**: Request times out after 5 minutes  
**Solution**: 
- Check if Playwright browsers are installed
- Verify test accounts exist
- Check Appwrite connection
- Run scenarios individually to isolate issue

### Revenue Protection Fails

**Symptom**: `revenueProtected: false`  
**Solution**:
- Check commission creation logic
- Verify Appwrite collection exists
- Run `pnpm test:e2e:diagnose` for AI analysis
- Review commission scenario logs

### Auto-Retry Not Fixing Failures

**Symptom**: `autoRetryAttempts: 1` but `fixedMinorFailures: 0`  
**Solution**:
- Check if failures are SEV-1 (cannot be auto-fixed)
- Review failure logs for root cause
- Run with `--headed` to see visual issues
- Check network/infrastructure health

---

## Local Testing

```bash
# Start your server
npm run dev

# Run full orchestration
curl -X POST http://localhost:3000/api/run-full-e2e

# Run specific scenario
curl -X POST http://localhost:3000/api/run-scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario": "commissions"}'

# Check status
curl http://localhost:3000/api/orchestration-status
```

---

*For more details on the E2E testing system, see [E2E_TEST_API_DOCS.md](./E2E_TEST_API_DOCS.md) and [AI_HUMAN_E2E_SYSTEM_README.md](../e2e-tests/AI_HUMAN_E2E_SYSTEM_README.md)*
