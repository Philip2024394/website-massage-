/**
 * Developer Report Generator
 * 
 * Generates technical debugging information for developers
 */

import { FailureAnalyzer } from '../intelligence/FailureAnalyzer';
import fs from 'fs';
import path from 'path';

interface TestResultFile {
  suites: Array<{
    specs: Array<{
      title: string;
      tests: Array<{
        status: string;
        results: Array<{
          status: string;
          duration: number;
          error?: {
            message: string;
            stack: string;
          };
          attachments?: Array<{
            name: string;
            path: string;
          }>;
        }>;
      }>;
    }>;
  }>;
}

async function generateDeveloperReport() {
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    console.log('# ❌ E2E Test Results Not Available\n\nNo test results found. Please run E2E tests first.');
    return;
  }

  const analyzer = new FailureAnalyzer();
  const files = fs.readdirSync(testResultsDir, { recursive: true }) as string[];
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const failureDetails: Array<{
    test: string;
    duration: number;
    error: string;
    stack: string;
    diagnosis: any;
    screenshots: string[];
  }> = [];

  // Collect detailed failure information
  for (const file of jsonFiles) {
    const filePath = path.join(testResultsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      const results: TestResultFile = JSON.parse(content);
      
      for (const suite of results.suites) {
        for (const spec of suite.specs) {
          for (const test of spec.tests) {
            if (test.status === 'failed') {
              const result = test.results[0];
              if (!result?.error) continue;

              const errorObj = new Error(result.error.message);
              const diagnosis = await FailureAnalyzer.analyze(
                errorObj,
                { 
                  error: errorObj,
                  testName: spec.title,
                  databaseState: {}
                }
              );

              const screenshots = result.attachments
                ?.filter(a => a.name.includes('screenshot'))
                .map(a => a.path) || [];

              failureDetails.push({
                test: spec.title,
                duration: result.duration,
                error: result.error.message,
                stack: result.error.stack,
                diagnosis,
                screenshots
              });
            }
          }
        }
      }
    } catch (error) {
      // Skip unparseable files
    }
  }

  // Generate markdown report
  const report = `# 🔧 E2E Test Developer Report

## 📊 Failure Analysis

${failureDetails.length === 0 ? `
### ✅ No Failures Detected

All tests passed successfully!
` : failureDetails.map((failure, index) => `
---

### Failure #${index + 1}: ${failure.test}

**Duration:** ${failure.duration}ms

#### 🚨 Error Message
\`\`\`
${failure.error}
\`\`\`

#### 📚 Stack Trace
\`\`\`
${failure.stack}
\`\`\`

#### 🤖 AI Diagnosis

- **Root Cause:** ${failure.diagnosis.rootCause}
- **Category:** ${failure.diagnosis.category}
- **Severity:** ${failure.diagnosis.severity}
- **Confidence:** ${failure.diagnosis.confidence}%
- **Business Impact:** ${failure.diagnosis.businessImpact}

#### 💡 Recommendation

${failure.diagnosis.recommendation}

#### 🔧 Fix Steps

${failure.diagnosis.fixSteps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

${failure.diagnosis.codeSnippet ? `
#### 📝 Code Example

\`\`\`typescript
${failure.diagnosis.codeSnippet}
\`\`\`
` : ''}

${failure.screenshots.length > 0 ? `
#### 📸 Screenshots

${failure.screenshots.map(s => `- \`${s}\``).join('\n')}
` : ''}

`).join('\n')}

## 🔍 Debugging Tips

### For Missing Commission Errors:
1. Check \`lib/bookingService.ts:acceptBooking()\`
2. Verify commission creation happens BEFORE status update
3. Add transaction logging to trace execution flow
4. Check Appwrite console for commission collection

### For Chat Room Errors:
1. Verify chat room creation in \`createBooking()\`
2. Check Appwrite realtime subscription setup
3. Ensure chat collection permissions are correct
4. Test with \`test:e2e:headed\` to see UI state

### For Notification Errors:
1. Check notification creation in booking acceptance flow
2. Verify \`NOTIFICATIONS\` collection exists
3. Test notification delivery timing (<3 seconds)
4. Check realtime subscription for notification updates

### For Database State Mismatches:
1. Check for race conditions in async operations
2. Verify transaction boundaries
3. Add delay/retry logic for eventual consistency
4. Check Appwrite console for actual database state

## 🛠️ Testing Commands

\`\`\`bash
# Run specific test
pnpm test:e2e booking-flow.spec.ts

# Run with UI mode for debugging
pnpm test:e2e:ui

# Run with headed browser
pnpm test:e2e:headed

# Generate fresh reports
pnpm test:e2e:diagnose
pnpm test:e2e:report:executive
pnpm test:e2e:report:developer
\`\`\`

## 📅 Report Generated

${new Date().toLocaleString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric', 
  hour: '2-digit', 
  minute: '2-digit',
  timeZoneName: 'short'
})}

---

*This report was generated by the AI E2E Revenue Guard system*
`;

  console.log(report);
}

generateDeveloperReport().catch((error) => {
  console.error('❌ Report generation failed:', error);
  process.exit(1);
});
