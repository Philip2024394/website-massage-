/**
 * E2E Test API Integration Example
 * 
 * Add this to your main Express app to enable E2E testing endpoints
 */

import express from 'express';
import e2eTestRouter from './e2eTest';

const app: any = express();

// Middleware
app.use(express.json());

// E2E Test Routes
app.use('/api', e2eTestRouter);

// Example usage in your deployment pipeline
app.post('/api/deploy', async (req: any, res: any) => {
  try {
    // Step 1: Run E2E tests before deployment
    const testResponse = await fetch('http://localhost:3000/api/run-e2e-test', {
      method: 'POST'
    });
    
    const testResults = await testResponse.json();

    // Step 2: Check deployment status
    if (testResults.deploymentBlocked) {
      return res.status(403).json({
        message: '🚨 DEPLOYMENT BLOCKED - SEV-1 failures detected',
        status: 'BLOCKED',
        reason: 'Revenue-critical tests failed',
        sev1Failures: testResults.sev1Failures,
        executiveSummary: testResults.executiveSummary
      });
    }

    // Step 3: Warn about SEV-2 failures
    if (testResults.failed > 0) {
      console.warn(`⚠️ Deploying with ${testResults.sev2Failures} SEV-2 failures`);
    }

    // Step 4: Proceed with deployment
    // ... your deployment logic here ...

    res.json({
      message: '✅ Deployment successful',
      status: 'DEPLOYED',
      testResults
    });

  } catch (error: any) {
    console.error('Deployment failed:', error);
    res.status(500).json({
      message: 'Deployment failed',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 E2E Test API available at http://localhost:${PORT}/api`);
});

export default app;
