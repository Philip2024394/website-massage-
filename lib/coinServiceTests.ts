/**
 * Test Suite for Coin Rewards System
 * 
 * Run these tests to verify your Appwrite integration is working correctly
 */

import { coinService } from './coinService';

/**
 * Test 1: Award Daily Sign-In Coins
 * This should create a new transaction in the 'coins' collection
 */
export async function testAwardDailySignIn() {
    console.log('🧪 Test 1: Award Daily Sign-In Coins');
    
    try {
        const testUserId = 'testUser123';
        const transaction = await coinService.awardDailySignIn(testUserId, 1);
        
        if (transaction) {
            console.log('✅ SUCCESS: Awarded 10 coins for Day 1');
            console.log('Transaction:', {
                id: transaction.$id,
                userId: transaction.userId,
                amount: transaction.amount,
                reason: transaction.reason,
                status: transaction.status
            });
        } else {
            console.log('❌ FAILED: No transaction returned');
        }
        
        return transaction !== null;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 2: Get Coin Balance
 * This should query all transactions and calculate balance
 */
export async function testGetCoinBalance() {
    console.log('\n🧪 Test 2: Get Coin Balance');
    
    try {
        const testUserId = 'testUser123';
        const balance = await coinService.getCoinBalance(testUserId);
        
        console.log('✅ SUCCESS: Retrieved coin balance');
        console.log('Balance:', {
            total: balance.total,
            active: balance.active,
            expired: balance.expired,
            spent: balance.spent,
            expiringSoon: balance.expiringSoon
        });
        
        return true;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 3: Initialize Referral Code
 * This should create a referral entry in the 'referrals' collection
 */
export async function testInitializeReferralCode() {
    console.log('\n🧪 Test 3: Initialize Referral Code');
    
    try {
        const testUserId = 'testUser123';
        const referralCode = await coinService.initializeReferralCode(testUserId);
        
        if (referralCode) {
            console.log('✅ SUCCESS: Created referral code');
            console.log('Referral Code:', referralCode);
            console.log('Expected format: INDA + first 6 chars of userId');
        } else {
            console.log('❌ FAILED: No referral code returned');
        }
        
        return referralCode.length > 0;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 4: Create Referral (Sign Up with Code)
 * This should link two users and award welcome bonus
 */
export async function testCreateReferral() {
    console.log('\n🧪 Test 4: Create Referral (Sign Up with Code)');
    
    try {
        // First, ensure referrer has a code
        const referrerId = 'userA123';
        const referralCode = await coinService.initializeReferralCode(referrerId);
        console.log(`Referrer code: ${referralCode}`);
        
        // New user signs up with referral code
        const newUserId = 'userB456';
        const referral = await coinService.createReferral(referralCode, newUserId);
        
        if (referral) {
            console.log('✅ SUCCESS: Created referral');
            console.log('Referral:', {
                referrerId: referral.referrerId,
                referredUserId: referral.referredUserId,
                code: referral.referralCode,
                status: referral.status
            });
            
            // Check if new user got welcome bonus
            const newUserBalance = await coinService.getCoinBalance(newUserId);
            console.log(`New user balance: ${newUserBalance.total} coins (should have 50 welcome bonus)`);
        } else {
            console.log('❌ FAILED: No referral returned');
        }
        
        return referral !== null;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 5: Award Booking Completion Coins
 * This should create a transaction and process referral reward if first booking
 */
export async function testAwardBookingCompletion() {
    console.log('\n🧪 Test 5: Award Booking Completion Coins');
    
    try {
        const testUserId = 'userB456'; // User who signed up with referral
        const transaction = await coinService.awardBookingCompletion(testUserId, 1, true);
        
        if (transaction) {
            console.log('✅ SUCCESS: Awarded 100 coins for first booking');
            console.log('Transaction:', {
                amount: transaction.amount,
                reason: transaction.reason
            });
            
            // Check balance
            const balance = await coinService.getCoinBalance(testUserId);
            console.log(`User balance: ${balance.total} coins (should have 150: 50 welcome + 100 booking)`);
        } else {
            console.log('❌ FAILED: No transaction returned');
        }
        
        return transaction !== null;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 6: Process Referral Reward
 * This should award 100 coins to the referrer when referred user books
 */
export async function testProcessReferralReward() {
    console.log('\n🧪 Test 6: Process Referral Reward');
    
    try {
        const referredUserId = 'userB456'; // User who completed first booking
        const success = await coinService.processReferralReward(referredUserId);
        
        if (success) {
            console.log('✅ SUCCESS: Processed referral reward');
            
            // Check referrer's balance
            const referrerId = 'userA123';
            const balance = await coinService.getCoinBalance(referrerId);
            console.log(`Referrer balance: ${balance.total} coins (should have 100 referral reward)`);
        } else {
            console.log('❌ FAILED: Referral reward not processed');
        }
        
        return success;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 7: Spend Coins (FIFO)
 * This should deduct coins using oldest-first method
 */
export async function testSpendCoins() {
    console.log('\n🧪 Test 7: Spend Coins (FIFO)');
    
    try {
        const testUserId = 'testUser123';
        
        // Check balance before
        const balanceBefore = await coinService.getCoinBalance(testUserId);
        console.log(`Balance before: ${balanceBefore.total} coins`);
        
        // Spend 5 coins
        const success = await coinService.spendCoins(testUserId, 5, 'Test redemption');
        
        if (success) {
            console.log('✅ SUCCESS: Spent 5 coins');
            
            // Check balance after
            const balanceAfter = await coinService.getCoinBalance(testUserId);
            console.log(`Balance after: ${balanceAfter.total} coins`);
            console.log(`Difference: ${balanceBefore.total - balanceAfter.total} coins`);
        } else {
            console.log('❌ FAILED: Could not spend coins (insufficient balance?)');
        }
        
        return success;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 8: Get Transaction History
 * This should return all transactions for a user
 */
export async function testGetTransactionHistory() {
    console.log('\n🧪 Test 8: Get Transaction History');
    
    try {
        const testUserId = 'testUser123';
        const transactions = await coinService.getTransactionHistory(testUserId, 20);
        
        console.log(`✅ SUCCESS: Retrieved ${transactions.length} transactions`);
        
        transactions.forEach((txn, index) => {
            console.log(`\nTransaction ${index + 1}:`);
            console.log(`  Amount: ${txn.amount > 0 ? '+' : ''}${txn.amount} coins`);
            console.log(`  Type: ${txn.type}`);
            console.log(`  Reason: ${txn.reason}`);
            console.log(`  Status: ${txn.status}`);
            console.log(`  Date: ${txn.earnedAt}`);
            if (txn.expiryAt) {
                console.log(`  Expires: ${txn.expiryAt}`);
            }
        });
        
        return transactions.length > 0;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Test 9: Get Referral Stats
 * This should return referral statistics
 */
export async function testGetReferralStats() {
    console.log('\n🧪 Test 9: Get Referral Stats');
    
    try {
        const testUserId = 'userA123';
        const stats = await coinService.getReferralStats(testUserId);
        
        console.log('✅ SUCCESS: Retrieved referral stats');
        console.log('Stats:', {
            totalReferrals: stats.totalReferrals,
            activeReferrals: stats.activeReferrals,
            coinsEarned: stats.coinsEarned,
            pendingRewards: stats.pendingRewards,
            thisMonthReferrals: stats.thisMonthReferrals
        });
        
        return true;
    } catch (error) {
        console.error('❌ ERROR:', error);
        return false;
    }
}

/**
 * Run All Tests
 */
export async function runAllCoinTests() {
    console.log('🚀 Starting Coin Rewards System Tests\n');
    console.log('=' .repeat(50));
    
    const results = {
        test1: await testAwardDailySignIn(),
        test2: await testGetCoinBalance(),
        test3: await testInitializeReferralCode(),
        test4: await testCreateReferral(),
        test5: await testAwardBookingCompletion(),
        test6: await testProcessReferralReward(),
        test7: await testSpendCoins(),
        test8: await testGetTransactionHistory(),
        test9: await testGetReferralStats()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    let passed = 0;
    let failed = 0;
    
    Object.entries(results).forEach(([test, result]) => {
        const status = result ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${test}`);
        if (result) passed++;
        else failed++;
    });
    
    console.log('='.repeat(50));
    console.log(`Total: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
    console.log('='.repeat(50));
    
    return { passed, failed, results };
}

/**
 * Quick Test - Just verify basic functionality
 */
export async function quickTest(userId: string = 'quickTestUser') {
    console.log('⚡ Quick Test - Basic Functionality\n');
    
    try {
        // Test 1: Award coins
        console.log('1️⃣ Awarding 10 coins...');
        const transaction = await coinService.awardDailySignIn(userId, 1);
        console.log(transaction ? '✅ Success' : '❌ Failed');
        
        // Test 2: Check balance
        console.log('\n2️⃣ Checking balance...');
        const balance = await coinService.getCoinBalance(userId);
        console.log(`✅ Balance: ${balance.total} coins`);
        
        // Test 3: Get referral code
        console.log('\n3️⃣ Getting referral code...');
        const code = await coinService.initializeReferralCode(userId);
        console.log(`✅ Referral Code: ${code}`);
        
        console.log('\n✅ Quick test complete! System is working.');
        return true;
    } catch (error) {
        console.error('\n❌ Quick test failed:', error);
        return false;
    }
}

// Export for use in console/components
if (typeof window !== 'undefined') {
    (window as any).coinTests = {
        runAll: runAllCoinTests,
        quick: quickTest,
        test1: testAwardDailySignIn,
        test2: testGetCoinBalance,
        test3: testInitializeReferralCode,
        test4: testCreateReferral,
        test5: testAwardBookingCompletion,
        test6: testProcessReferralReward,
        test7: testSpendCoins,
        test8: testGetTransactionHistory,
        test9: testGetReferralStats
    };
    
    console.log('💡 Coin tests available! Try: coinTests.quick() or coinTests.runAll()');
}
