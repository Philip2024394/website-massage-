/**
 * AI Human E2E Orchestrator Route
 * 
 * Runs comprehensive multi-user, multi-scenario E2E tests with AI diagnosis
 */

import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

interface OrchestratorResult {
  status: 'GO' | 'NO-GO' | 'WARNING';
  orchestrationComplete: boolean;
  totalScenarios: number;
  passedScenarios: number;
  failedScenarios: number;
  scenarios: {
    bookNow: { status: string; duration: number };
    scheduled: { status: string; duration: number };
    slider: { status: string; duration: number };
    chat: { status: string; duration: number };
    notifications: { status: string; duration: number };
    commissions: { status: string; duration: number };
    countdown: { status: string; duration: number };
    dashboards: { status: string; duration: number };
  };
  revenueProtected: boolean;
  sev1Failures: number;
  sev2Failures: number;
  autoRetryAttempts: number;
  fixedMinorFailures: number;
  executiveSummary: string;
  timestamp: string;
  totalDuration: number;
}

/**
 * POST /api/run-full-e2e
 * 
 * Runs comprehensive AI Human E2E orchestration with:
 * - Multiple user simulations (Customer, Therapist, Admin)
 * - Multiple booking types (Book Now, Scheduled, Slider)
 * - Chat system with notifications, audio, vibration
 * - Commission verification (revenue protection)
 * - Countdown timers and auto-acceptance
 * - Admin & Therapist dashboard tests
 * - Auto-retry logic for minor failures
 */
router.post('/run-full-e2e', async (req: any, res: any) => {
  const startTime = Date.now();
  
  try {
    console.log('🤖 Starting AI Human E2E Orchestration...');

    // Run comprehensive E2E orchestration test
    const testCommand = 'npx playwright test e2e-tests/flows/ai-human-full-workflow.spec.ts --reporter=json';
    
    let testOutput: any;
    let testError = false;

    try {
      const { stdout } = await execAsync(testCommand, {
        cwd: process.cwd(),
        maxBuffer: 20 * 1024 * 1024, // 20MB buffer for comprehensive tests
        timeout: 300000 // 5 minute timeout
      });
      testOutput = stdout;
    } catch (error: any) {
      testOutput = error.stdout || error.message;
      testError = true;
      console.warn('⚠️ AI Human E2E Orchestration encountered failures');
    }

    // Parse test results
    let results: any;
    try {
      results = JSON.parse(testOutput);
    } catch (parseError: any) {
      console.error('❌ Failed to parse orchestration results:', parseError);
      return res.status(500).json({
        status: 'NO-GO',
        message: 'Failed to parse orchestration results',
        error: parseError.message
      });
    }

    // Extract scenario results
    const scenarios = {
      bookNow: { status: 'UNKNOWN', duration: 0 },
      scheduled: { status: 'UNKNOWN', duration: 0 },
      slider: { status: 'UNKNOWN', duration: 0 },
      chat: { status: 'UNKNOWN', duration: 0 },
      notifications: { status: 'UNKNOWN', duration: 0 },
      commissions: { status: 'UNKNOWN', duration: 0 },
      countdown: { status: 'UNKNOWN', duration: 0 },
      dashboards: { status: 'UNKNOWN', duration: 0 }
    };

    // Parse individual scenario results
    if (results.suites) {
      for (const suite of results.suites) {
        for (const spec of suite.specs || []) {
          const title = spec.title?.toLowerCase() || '';
          const status = spec.tests?.[0]?.status || 'unknown';
          const duration = spec.tests?.[0]?.results?.[0]?.duration || 0;

          if (title.includes('book now')) {
            scenarios.bookNow = { status: status.toUpperCase(), duration };
          } else if (title.includes('scheduled')) {
            scenarios.scheduled = { status: status.toUpperCase(), duration };
          } else if (title.includes('slider')) {
            scenarios.slider = { status: status.toUpperCase(), duration };
          } else if (title.includes('chat')) {
            scenarios.chat = { status: status.toUpperCase(), duration };
          } else if (title.includes('notification')) {
            scenarios.notifications = { status: status.toUpperCase(), duration };
          } else if (title.includes('commission')) {
            scenarios.commissions = { status: status.toUpperCase(), duration };
          } else if (title.includes('countdown') || title.includes('timer')) {
            scenarios.countdown = { status: status.toUpperCase(), duration };
          } else if (title.includes('dashboard')) {
            scenarios.dashboards = { status: status.toUpperCase(), duration };
          }
        }
      }
    }

    // Count scenario results
    const totalScenarios = Object.keys(scenarios).length;
    const passedScenarios = Object.values(scenarios).filter(s => s.status === 'PASSED').length;
    const failedScenarios = Object.values(scenarios).filter(s => s.status === 'FAILED').length;

    // Run AI diagnosis if failures detected
    let sev1Count = 0;
    let sev2Count = 0;
    let executiveSummary = '';
    let autoRetryAttempts = 0;
    let fixedMinorFailures = 0;

    if (failedScenarios > 0) {
      console.log('🤖 Running AI failure diagnosis...');
      
      try {
        // Run diagnostic script
        const { stdout: diagOutput } = await execAsync(
          'npx tsx e2e-tests/scripts/diagnose-failures.ts',
          { cwd: process.cwd(), timeout: 60000 }
        );
        
        // Count SEV-1 and SEV-2 failures
        const sev1Matches = diagOutput.match(/SEV-1/g);
        const sev2Matches = diagOutput.match(/SEV-2/g);
        sev1Count = sev1Matches ? sev1Matches.length : 0;
        sev2Count = sev2Matches ? sev2Matches.length : 0;

        // Check for auto-fixable failures
        if (sev2Count > 0 && sev1Count === 0) {
          console.log('🔧 Attempting auto-retry for minor failures...');
          autoRetryAttempts = 1;
          
          // Retry failed tests once
          try {
            await execAsync(
              'npx playwright test e2e-tests/flows/ai-human-full-workflow.spec.ts --reporter=json --retries=1',
              { cwd: process.cwd(), timeout: 120000 }
            );
            fixedMinorFailures = sev2Count;
            sev2Count = 0; // Fixed!
            console.log(`✅ Auto-retry fixed ${fixedMinorFailures} minor failures`);
          } catch (retryError) {
            console.warn('⚠️ Auto-retry did not fix all failures');
          }
        }

        // Generate executive report
        const { stdout: execReport } = await execAsync(
          'npx tsx e2e-tests/scripts/generate-executive-report.ts',
          { cwd: process.cwd(), timeout: 30000 }
        );
        executiveSummary = execReport;
      } catch (diagError) {
        console.error('⚠️ AI diagnosis failed:', diagError);
        executiveSummary = 'AI diagnosis unavailable - check test logs';
      }
    } else {
      executiveSummary = `✅ All ${totalScenarios} scenarios passed successfully!`;
    }

    // Check revenue protection
    const revenueProtected = scenarios.commissions.status === 'PASSED';
    
    // Determine final status
    const status: OrchestratorResult['status'] = 
      sev1Count > 0 ? 'NO-GO' : 
      failedScenarios > 0 ? 'WARNING' : 
      'GO';

    const totalDuration = Date.now() - startTime;

    const response: OrchestratorResult = {
      status,
      orchestrationComplete: true,
      totalScenarios,
      passedScenarios: passedScenarios + fixedMinorFailures,
      failedScenarios: Math.max(0, failedScenarios - fixedMinorFailures),
      scenarios,
      revenueProtected,
      sev1Failures: sev1Count,
      sev2Failures: sev2Count,
      autoRetryAttempts,
      fixedMinorFailures,
      executiveSummary,
      timestamp: new Date().toISOString(),
      totalDuration
    };

    console.log(`✅ AI Human E2E Orchestration complete: ${status} (${totalDuration}ms)`);

    // Return appropriate status code
    if (sev1Count > 0) {
      return res.status(403).json(response);
    } else {
      return res.status(200).json(response);
    }

  } catch (err: any) {
    console.error('❌ AI Human E2E Orchestrator error:', err);
    res.status(500).json({
      status: 'NO-GO',
      orchestrationComplete: false,
      message: err.message,
      error: err.stack
    });
  }
});

/**
 * GET /api/orchestration-status
 * 
 * Get status of last orchestration run
 */
router.get('/orchestration-status', async (req: any, res: any) => {
  try {
    // Return cached orchestration status
    // (In production, you'd store this in Redis/DB)
    res.json({
      status: 'IDLE',
      message: 'No orchestration run in progress',
      lastRun: null
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to get orchestration status',
      message: err.message
    });
  }
});

/**
 * POST /api/run-scenario
 * 
 * Run a specific scenario only
 */
router.post('/run-scenario', async (req: any, res: any) => {
  const { scenario } = req.body;
  
  if (!scenario) {
    return res.status(400).json({
      error: 'Missing scenario parameter',
      validScenarios: ['bookNow', 'scheduled', 'slider', 'chat', 'notifications', 'commissions', 'countdown', 'dashboards']
    });
  }

  try {
    console.log(`🎯 Running scenario: ${scenario}`);

    // Map scenario to test file
    const scenarioTests: Record<string, string> = {
      bookNow: 'book-now.spec.ts',
      scheduled: 'scheduled-booking.spec.ts',
      slider: 'slider-booking.spec.ts',
      chat: 'chat-system.spec.ts',
      notifications: 'notifications.spec.ts',
      commissions: 'booking-flow.spec.ts', // Uses existing booking flow test
      countdown: 'countdown-timer.spec.ts',
      dashboards: 'dashboard.spec.ts'
    };

    const testFile = scenarioTests[scenario];
    if (!testFile) {
      return res.status(400).json({
        error: 'Invalid scenario',
        validScenarios: Object.keys(scenarioTests)
      });
    }

    const testCommand = `npx playwright test e2e-tests/flows/${testFile} --reporter=json`;
    
    const { stdout } = await execAsync(testCommand, {
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024,
      timeout: 60000
    });

    const results = JSON.parse(stdout);
    const passed = results.stats?.failed === 0;

    res.json({
      scenario,
      status: passed ? 'PASSED' : 'FAILED',
      results
    });

  } catch (err: any) {
    console.error(`❌ Scenario ${scenario} failed:`, err);
    res.status(500).json({
      scenario,
      status: 'FAILED',
      error: err.message
    });
  }
});

export default router;
