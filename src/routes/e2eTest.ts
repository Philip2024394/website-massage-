/**
 * E2E Test API Route
 * 
 * Triggers E2E tests programmatically and returns results with AI diagnosis
 */

import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const router = Router();

interface TestResult {
  status: 'GO' | 'NO-GO' | 'WARNING';
  totalTests: number;
  passed: number;
  failed: number;
  sev1Failures: number;
  sev2Failures: number;
  deploymentBlocked: boolean;
  executiveSummary: string;
  details: any[];
  timestamp: string;
  duration: number;
}

/**
 * POST /api/run-e2e-test
 * 
 * Runs E2E tests and returns results with AI diagnosis
 */
router.post('/run-e2e-test', async (req: any, res: any) => {
  const startTime = Date.now();
  
  try {
    console.log('🤖 Starting E2E test run...');

    // Run E2E tests with JSON reporter
    const testCommand = 'npx playwright test e2e-tests/flows/booking-flow.spec.ts --reporter=json';
    
    let testOutput: any;
    let testError = false;

    try {
      const { stdout } = await execAsync(testCommand, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });
      testOutput = stdout;
    } catch (error: any) {
      // Tests failed - capture output anyway
      testOutput = error.stdout || error.message;
      testError = true;
      console.warn('⚠️ E2E tests failed:', error.message);
    }

    // Parse test results
    let results: any;
    try {
      results = JSON.parse(testOutput);
    } catch (parseError: any) {
      console.error('❌ Failed to parse test output:', parseError);
      return res.status(500).json({
        status: 'NO-GO',
        message: 'Failed to parse test results',
        error: parseError.message
      });
    }

    // Extract stats
    const totalTests = results.suites?.reduce((acc: number, suite: any) => {
      return acc + suite.specs?.reduce((specAcc: number, spec: any) => {
        return specAcc + (spec.tests?.length || 0);
      }, 0);
    }, 0) || 0;

    const failed = results.suites?.reduce((acc: number, suite: any) => {
      return acc + suite.specs?.reduce((specAcc: number, spec: any) => {
        return specAcc + spec.tests?.filter((t: any) => t.status === 'failed').length;
      }, 0);
    }, 0) || 0;

    const passed = totalTests - failed;

    // Run AI diagnosis if tests failed
    let sev1Count = 0;
    let sev2Count = 0;
    let executiveSummary = '';

    if (failed > 0) {
      console.log('🤖 Running AI failure diagnosis...');
      
      try {
        // Run diagnostic script
        const { stdout: diagOutput } = await execAsync(
          'npx tsx e2e-tests/scripts/diagnose-failures.ts',
          { cwd: process.cwd() }
        );
        
        // Count SEV-1 and SEV-2 failures
        const sev1Matches = diagOutput.match(/SEV-1/g);
        const sev2Matches = diagOutput.match(/SEV-2/g);
        sev1Count = sev1Matches ? sev1Matches.length : 0;
        sev2Count = sev2Matches ? sev2Matches.length : 0;

        // Generate executive report
        const { stdout: execReport } = await execAsync(
          'npx tsx e2e-tests/scripts/generate-executive-report.ts',
          { cwd: process.cwd() }
        );
        executiveSummary = execReport;
      } catch (diagError) {
        console.error('⚠️ AI diagnosis failed:', diagError);
        executiveSummary = 'AI diagnosis unavailable - check test logs';
      }
    }

    // Determine deployment status
    const deploymentBlocked = sev1Count > 0;
    const status: TestResult['status'] = 
      failed === 0 ? 'GO' : 
      deploymentBlocked ? 'NO-GO' : 
      'WARNING';

    const duration = Date.now() - startTime;

    const response: TestResult = {
      status,
      totalTests,
      passed,
      failed,
      sev1Failures: sev1Count,
      sev2Failures: sev2Count,
      deploymentBlocked,
      executiveSummary: executiveSummary || `${passed}/${totalTests} tests passed`,
      details: results.suites || [],
      timestamp: new Date().toISOString(),
      duration
    };

    console.log(`✅ E2E test run complete: ${status} (${duration}ms)`);

    // Return appropriate status code
    if (deploymentBlocked) {
      return res.status(403).json(response);
    } else if (failed > 0) {
      return res.status(200).json(response);
    } else {
      return res.status(200).json(response);
    }

  } catch (err: any) {
    console.error('❌ E2E test route error:', err);
    res.status(500).json({
      status: 'NO-GO',
      message: err.message,
      error: err.stack
    });
  }
});

/**
 * GET /api/e2e-test-status
 * 
 * Get the latest E2E test results
 */
router.get('/e2e-test-status', async (req: any, res: any) => {
  try {
    // Check for latest test results
    const testResultsDir = path.join(process.cwd(), 'test-results');
    
    if (!fs.existsSync(testResultsDir)) {
      return res.json({
        status: 'UNKNOWN',
        message: 'No test results available'
      });
    }

    const files = fs.readdirSync(testResultsDir, { recursive: true }) as string[];
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      return res.json({
        status: 'UNKNOWN',
        message: 'No test result files found'
      });
    }

    // Get most recent file
    const mostRecent = jsonFiles
      .map(f => ({
        file: f,
        mtime: fs.statSync(path.join(testResultsDir, f)).mtime
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];

    const content = fs.readFileSync(
      path.join(testResultsDir, mostRecent.file),
      'utf8'
    );
    const results = JSON.parse(content);

    res.json({
      status: 'SUCCESS',
      lastRun: mostRecent.mtime,
      results
    });

  } catch (err: any) {
    console.error('❌ Error getting test status:', err);
    res.status(500).json({
      status: 'ERROR',
      message: err.message
    });
  }
});

/**
 * POST /api/run-revenue-guard
 * 
 * Run only revenue-critical tests
 */
router.post('/run-revenue-guard', async (req: any, res: any) => {
  const startTime = Date.now();
  
  try {
    console.log('💰 Starting Revenue Guard tests...');

    const testCommand = 'npx playwright test e2e-tests/flows/booking-flow.spec.ts --grep="REVENUE CRITICAL" --reporter=json';
    
    let testOutput: any;

    try {
      const { stdout } = await execAsync(testCommand, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024
      });
      testOutput = stdout;
    } catch (error: any) {
      testOutput = error.stdout || error.message;
      console.warn('⚠️ Revenue Guard tests failed');
    }

    const results = JSON.parse(testOutput);
    const duration = Date.now() - startTime;

    const hasFailures = results.suites?.some((suite: any) =>
      suite.specs?.some((spec: any) =>
        spec.tests?.some((t: any) => t.status === 'failed')
      )
    );

    res.json({
      status: hasFailures ? 'NO-GO' : 'GO',
      message: hasFailures 
        ? '🚨 REVENUE AT RISK - Critical tests failed'
        : '✅ Revenue protection verified',
      duration,
      results
    });

  } catch (err: any) {
    console.error('❌ Revenue Guard error:', err);
    res.status(500).json({
      status: 'NO-GO',
      message: 'Revenue Guard tests failed to run',
      error: err.message
    });
  }
});

/**
 * GET /api/e2e-reports/executive
 * 
 * Get executive summary report
 */
router.get('/e2e-reports/executive', async (req: any, res: any) => {
  try {
    const { stdout } = await execAsync(
      'npx tsx e2e-tests/scripts/generate-executive-report.ts',
      { cwd: process.cwd() }
    );

    res.setHeader('Content-Type', 'text/markdown');
    res.send(stdout);

  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to generate executive report',
      message: err.message
    });
  }
});

/**
 * GET /api/e2e-reports/developer
 * 
 * Get technical debug report
 */
router.get('/e2e-reports/developer', async (req: any, res: any) => {
  try {
    const { stdout } = await execAsync(
      'npx tsx e2e-tests/scripts/generate-developer-report.ts',
      { cwd: process.cwd() }
    );

    res.setHeader('Content-Type', 'text/markdown');
    res.send(stdout);

  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to generate developer report',
      message: err.message
    });
  }
});

export default router;
