/**
 * AI Failure Diagnosis CLI Tool
 * 
 * Analyzes test failures and generates reports
 */

import { FailureAnalyzer, FailureContext } from '../intelligence/FailureAnalyzer';
import { RevenueGuard } from '../verification/RevenueGuard';
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
          error?: {
            message: string;
            stack: string;
          };
        }>;
      }>;
    }>;
  }>;
}

async function main() {
  console.log('🤖 AI Failure Analyzer - Starting diagnostic scan...\n');

  // Find test result files
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    console.error('❌ No test results found. Run tests first.');
    process.exit(1);
  }

  const analyzer = new FailureAnalyzer();
  const revenueGuard = new RevenueGuard();
  
  const files = fs.readdirSync(testResultsDir, { recursive: true }) as string[];
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  if (jsonFiles.length === 0) {
    console.error('❌ No JSON test result files found.');
    process.exit(1);
  }

  console.log(`📊 Found ${jsonFiles.length} test result files\n`);

  let totalFailures = 0;
  let sev1Failures = 0;
  let sev2Failures = 0;

  // Analyze each test result file
  for (const file of jsonFiles) {
    const filePath = path.join(testResultsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      const results: TestResultFile = JSON.parse(content);
      
      for (const suite of results.suites) {
        for (const spec of suite.specs) {
          for (const test of spec.tests) {
            if (test.status === 'failed') {
              totalFailures++;
              
              const error = test.results[0]?.error;
              if (!error) continue;

              console.log(`\n${'='.repeat(80)}`);
              console.log(`🔍 Analyzing: ${spec.title}`);
              console.log(`${'='.repeat(80)}\n`);

              // Analyze the failure
              const errorObj = new Error(error.message);
              const diagnosis = await FailureAnalyzer.analyze(
                errorObj,
                {
                  error: errorObj,
                  testName: spec.title,
                  databaseState: {}
                }
              );

              // Count by severity
              if (diagnosis.severity === 'SEV-1') {
                sev1Failures++;
              } else if (diagnosis.severity === 'SEV-2') {
                sev2Failures++;
              }

              // Display diagnosis
              console.log(`🎯 Root Cause: ${diagnosis.rootCause}`);
              console.log(`📊 Category: ${diagnosis.category}`);
              console.log(`🚨 Severity: ${diagnosis.severity}`);
              console.log(`💯 Confidence: ${diagnosis.confidence}%`);
              console.log(`💼 Business Impact: ${diagnosis.businessImpact}`);
              console.log(`\n💡 Recommendation: ${diagnosis.recommendation}`);
              
              if (diagnosis.codeSnippet) {
                console.log(`\n📝 Code Example:`);
                console.log('```typescript');
                console.log(diagnosis.codeSnippet);
                console.log('```');
              }

              console.log(`\n🔧 Fix Steps:`);
              diagnosis.fixSteps.forEach((step, i) => {
                console.log(`  ${i + 1}. ${step}`);
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`⚠️ Could not parse ${file}:`, error);
    }
  }

  // Summary
  console.log(`\n\n${'='.repeat(80)}`);
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log(`${'='.repeat(80)}\n`);
  console.log(`Total Failures: ${totalFailures}`);
  console.log(`SEV-1 (Revenue Critical): ${sev1Failures} 🚨`);
  console.log(`SEV-2 (User Experience): ${sev2Failures} ⚠️`);
  
  if (sev1Failures > 0) {
    console.log(`\n🚨 DEPLOYMENT BLOCKED - SEV-1 failures must be fixed!`);
    process.exit(1);
  } else if (sev2Failures > 0) {
    console.log(`\n⚠️  WARNING - SEV-2 failures should be fixed before deployment`);
    process.exit(0);
  } else {
    console.log(`\n✅ No critical failures detected`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Diagnostic failed:', error);
  process.exit(1);
});
