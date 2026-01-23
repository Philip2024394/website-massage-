/**
 * 📊 E2E TEST REPORT GENERATOR
 * 
 * Purpose: Generate comprehensive JSON report with:
 * - Pass/fail per step
 * - Screenshots on failure
 * - Test duration
 * - Audio/vibration event logs
 */

import fs from 'fs';
import path from 'path';
import { TestResult } from '@playwright/test/reporter';

export interface E2ETestReport {
  name: string;
  description: string;
  severity: string;
  testSuites: TestSuiteReport[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  startTime: string | null;
  endTime: string | null;
  duration: number;
}

export interface TestSuiteReport {
  name: string;
  tests: TestCaseReport[];
  passed: number;
  failed: number;
  duration: number;
}

export interface TestCaseReport {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  audioEvents?: number;
  vibrationEvents?: number;
  notificationEvents?: number;
}

/**
 * Generate E2E test report
 */
export function generateTestReport(results: TestResult[]): E2ETestReport {
  const report: E2ETestReport = {
    name: 'E2E Test Report',
    description: 'AI-assisted end-to-end testing for booking + chat + notification flow',
    severity: 'SEV-0',
    testSuites: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    startTime: null,
    endTime: null,
    duration: 0
  };

  // Group tests by suite
  const suites = new Map<string, TestCaseReport[]>();

  for (const result of results) {
    // Extract suite name from test location or use default
    const suiteName = 'E2E Tests';
    
    if (!suites.has(suiteName)) {
      suites.set(suiteName, []);
    }

    const testCase: TestCaseReport = {
      name: 'Test Case',
      status: result.status as any,
      duration: result.duration,
      error: result.error?.message,
      screenshots: result.attachments
        .filter(a => a.contentType === 'image/png')
        .map(a => a.path || '')
    };

    suites.get(suiteName)!.push(testCase);

    // Update summary
    report.summary.total++;
    if (result.status === 'passed') report.summary.passed++;
    if (result.status === 'failed') report.summary.failed++;
    if (result.status === 'skipped') report.summary.skipped++;
  }

  // Build suite reports
  for (const [suiteName, tests] of suites) {
    const suiteReport: TestSuiteReport = {
      name: suiteName,
      tests,
      passed: tests.filter(t => t.status === 'passed').length,
      failed: tests.filter(t => t.status === 'failed').length,
      duration: tests.reduce((sum, t) => sum + t.duration, 0)
    };

    report.testSuites.push(suiteReport);
  }

  // Calculate total duration
  report.duration = report.testSuites.reduce((sum, s) => sum + s.duration, 0);

  return report;
}

/**
 * Save report to JSON file
 */
export function saveReport(report: E2ETestReport, outputPath: string): void {
  const dir = path.dirname(outputPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`✅ Test report saved to: ${outputPath}`);
}

/**
 * Print summary to console
 */
export function printSummary(report: E2ETestReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 E2E TEST REPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`✅ Passed: ${report.summary.passed}`);
  console.log(`❌ Failed: ${report.summary.failed}`);
  console.log(`⏭️  Skipped: ${report.summary.skipped}`);
  console.log(`⏱️  Duration: ${(report.duration / 1000).toFixed(2)}s`);
  console.log('='.repeat(60));

  // Print failed tests
  if (report.summary.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    for (const suite of report.testSuites) {
      for (const test of suite.tests) {
        if (test.status === 'failed') {
          console.log(`   - ${suite.name} > ${test.name}`);
          if (test.error) {
            console.log(`     Error: ${test.error}`);
          }
          if (test.screenshots && test.screenshots.length > 0) {
            console.log(`     Screenshots: ${test.screenshots.join(', ')}`);
          }
        }
      }
    }
  }

  console.log('\n');
}
