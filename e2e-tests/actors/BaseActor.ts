/**
 * 🧑 BASE AI ACTOR CLASS
 * 
 * Foundation for Customer, Therapist, and Admin actors.
 * Provides common behavior, state tracking, and instrumentation.
 * 
 * All actors:
 * - Log every action
 * - Capture screenshots
 * - Record timestamps
 * - Monitor network requests
 * - Track database state
 * - Verify UI consistency
 */

import { Page, BrowserContext } from '@playwright/test';
import { databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';

export interface ActorAction {
    name: string;
    timestamp: number;
    duration?: number;
    success: boolean;
    error?: string;
    screenshot?: string;
    networkRequests?: string[];
}

export interface ActorState {
    userId: string;
    role: 'customer' | 'therapist' | 'admin';
    actions: ActorAction[];
    observations: Record<string, any>;
    databaseState: Record<string, any>;
    uiState: Record<string, any>;
}

export abstract class BaseActor {
    protected page: Page;
    protected context: BrowserContext;
    protected state: ActorState;
    protected networkLog: string[] = [];

    constructor(
        page: Page,
        context: BrowserContext,
        userId: string,
        role: 'customer' | 'therapist' | 'admin'
    ) {
        this.page = page;
        this.context = context;
        this.state = {
            userId,
            role,
            actions: [],
            observations: {},
            databaseState: {},
            uiState: {}
        };

        this.setupNetworkMonitoring();
        this.setupConsoleLogging();
    }

    /**
     * Setup network request monitoring
     */
    private setupNetworkMonitoring(): void {
        this.page.on('request', request => {
            const url = request.url();
            if (url.includes('appwrite.io') || url.includes('/api/')) {
                this.networkLog.push(`[${new Date().toISOString()}] ${request.method()} ${url}`);
            }
        });

        this.page.on('response', response => {
            const url = response.url();
            if (url.includes('appwrite.io') || url.includes('/api/')) {
                this.networkLog.push(`[${new Date().toISOString()}] ${response.status()} ${url}`);
            }
        });
    }

    /**
     * Setup console message logging
     */
    private setupConsoleLogging(): void {
        this.page.on('console', msg => {
            console.log(`[${this.state.role.toUpperCase()}] ${msg.type()}: ${msg.text()}`);
        });

        this.page.on('pageerror', error => {
            console.error(`[${this.state.role.toUpperCase()}] Page error:`, error);
        });
    }

    /**
     * Execute an action with full logging and error handling
     */
    protected async executeAction<T>(
        name: string,
        action: () => Promise<T>
    ): Promise<T> {
        const startTime = Date.now();
        const actionLog: ActorAction = {
            name,
            timestamp: startTime,
            success: false,
            networkRequests: []
        };

        try {
            console.log(`[${this.state.role.toUpperCase()}] Starting action: ${name}`);
            
            const result = await action();
            
            const endTime = Date.now();
            actionLog.duration = endTime - startTime;
            actionLog.success = true;
            actionLog.networkRequests = [...this.networkLog];
            
            // Take screenshot on success
            actionLog.screenshot = await this.page.screenshot({
                path: `e2e-tests/reports/screenshots/${this.state.role}-${name}-${startTime}.png`
            }).then(buffer => `${this.state.role}-${name}-${startTime}.png`);

            console.log(`[${this.state.role.toUpperCase()}] ✅ ${name} completed in ${actionLog.duration}ms`);
            
            this.state.actions.push(actionLog);
            this.networkLog = []; // Clear for next action
            
            return result;
        } catch (error: any) {
            const endTime = Date.now();
            actionLog.duration = endTime - startTime;
            actionLog.success = false;
            actionLog.error = error.message;
            actionLog.networkRequests = [...this.networkLog];

            // Take screenshot on failure
            try {
                actionLog.screenshot = await this.page.screenshot({
                    path: `e2e-tests/reports/screenshots/${this.state.role}-${name}-${startTime}-FAIL.png`
                }).then(buffer => `${this.state.role}-${name}-${startTime}-FAIL.png`);
            } catch (screenshotError) {
                console.warn(`Failed to capture failure screenshot:`, screenshotError);
            }

            console.error(`[${this.state.role.toUpperCase()}] ❌ ${name} failed after ${actionLog.duration}ms:`, error.message);
            
            this.state.actions.push(actionLog);
            this.networkLog = [];
            
            throw error;
        }
    }

    /**
     * Observe and record UI state
     */
    protected async observeUI(element: string): Promise<any> {
        return await this.executeAction(`observe-${element}`, async () => {
            const elementHandle = await this.page.locator(element).first();
            const isVisible = await elementHandle.isVisible().catch(() => false);
            const text = isVisible ? await elementHandle.textContent() : null;
            
            this.state.uiState[element] = {
                visible: isVisible,
                text,
                timestamp: Date.now()
            };

            return this.state.uiState[element];
        });
    }

    /**
     * Verify database state matches UI
     */
    protected async verifyDatabaseState(collectionId: string, documentId: string): Promise<any> {
        return await this.executeAction(`verify-db-${collectionId}`, async () => {
            const document = await databases.getDocument(DATABASE_ID, collectionId, documentId);
            
            this.state.databaseState[documentId] = {
                ...document,
                verifiedAt: Date.now()
            };

            return document;
        });
    }

    /**
     * Wait for element with timeout
     */
    protected async waitForElement(selector: string, timeout: number = 10000): Promise<void> {
        await this.page.waitForSelector(selector, { timeout, state: 'visible' });
    }

    /**
     * Wait for network idle
     */
    protected async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
        await this.page.waitForLoadState('networkidle', { timeout });
    }

    /**
     * Capture full actor state
     */
    public async captureState(): Promise<ActorState> {
        // Update UI state snapshot
        const url = this.page.url();
        const title = await this.page.title();
        
        return {
            ...this.state,
            observations: {
                ...this.state.observations,
                currentUrl: url,
                pageTitle: title,
                capturedAt: Date.now()
            }
        };
    }

    /**
     * Get action history
     */
    public getActionHistory(): ActorAction[] {
        return this.state.actions;
    }

    /**
     * Get network log
     */
    public getNetworkLog(): string[] {
        return this.networkLog;
    }

    /**
     * Abstract methods to be implemented by subclasses
     */
    abstract login(email: string, password: string): Promise<void>;
    abstract navigate(path: string): Promise<void>;
}
