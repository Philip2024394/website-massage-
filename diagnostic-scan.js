#!/usr/bin/env node

/**
 * URGENT THERAPIST DASHBOARD ROUTING DIAGNOSTIC SCAN
 * Comprehensive analysis of routing system to find bugs preventing therapist dashboard access
 */

import fs from 'fs';
import path from 'path';

console.log('🚨 URGENT THERAPIST DASHBOARD ROUTING DIAGNOSTIC SCAN');
console.log('=' * 60);

// 1. Check PWA Manifest Configuration
console.log('\n1. 📱 PWA MANIFEST ANALYSIS');
try {
    const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
    console.log(`✅ Start URL: ${manifest.start_url}`);
    console.log(`✅ Display Mode: ${manifest.display}`);
    console.log(`✅ Scope: ${manifest.scope}`);
    
    if (manifest.start_url.includes('pwa=true&page=status')) {
        console.log('✅ PWA routing configured correctly');
    } else {
        console.log('❌ PWA routing NOT configured for therapist status');
    }
} catch (error) {
    console.log('❌ Failed to read manifest.json:', error.message);
}

// 2. Check AppRouter.tsx routing configuration
console.log('\n2. 🚦 APPROUTER ROUTING ANALYSIS');
try {
    const appRouter = fs.readFileSync('AppRouter.tsx', 'utf8');
    
    // Check for therapist routes
    const therapistRoutes = [
        'therapist-status',
        'therapist-dashboard', 
        'therapist-bookings',
        'status'
    ];
    
    let foundRoutes = [];
    let missingRoutes = [];
    
    therapistRoutes.forEach(route => {
        if (appRouter.includes(`case '${route}':`)) {
            foundRoutes.push(route);
        } else {
            missingRoutes.push(route);
        }
    });
    
    console.log('✅ Found Routes:', foundRoutes.join(', '));
    if (missingRoutes.length > 0) {
        console.log('❌ Missing Routes:', missingRoutes.join(', '));
    }
    
    // Check if therapistRoutes is imported
    if (appRouter.includes("import { therapistRoutes }")) {
        console.log('✅ therapistRoutes imported correctly');
    } else {
        console.log('❌ therapistRoutes NOT imported');
    }
    
} catch (error) {
    console.log('❌ Failed to read AppRouter.tsx:', error.message);
}

// 3. Check therapist dashboard component files
console.log('\n3. 📁 THERAPIST DASHBOARD COMPONENTS CHECK');
const therapistFiles = [
    'apps/therapist-dashboard/src/pages/TherapistOnlineStatus.tsx',
    'apps/therapist-dashboard/src/pages/TherapistDashboard.tsx',
    'apps/therapist-dashboard/src/App.tsx',
    'router/routes/therapistRoutes.tsx'
];

therapistFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} MISSING`);
    }
});

// 4. Check URL mapping configuration
console.log('\n4. 🗺️ URL MAPPER ANALYSIS');
try {
    const urlMapper = fs.readFileSync('utils/urlMapper.ts', 'utf8');
    
    const statusMappings = [
        'therapist-status',
        'therapistStatus',
        'status'
    ];
    
    let foundMappings = [];
    statusMappings.forEach(mapping => {
        if (urlMapper.includes(`'${mapping}':`)) {
            foundMappings.push(mapping);
        }
    });
    
    console.log('✅ Found URL Mappings:', foundMappings.join(', '));
    
    if (urlMapper.includes('/dashboard/therapist/status')) {
        console.log('✅ Status dashboard URL mapping found');
    } else {
        console.log('❌ Status dashboard URL mapping MISSING');
    }
    
} catch (error) {
    console.log('❌ Failed to read urlMapper.ts:', error.message);
}

// 5. Check authentication flow
console.log('\n5. 🔐 AUTHENTICATION FLOW CHECK');
try {
    const mainApp = fs.readFileSync('App.tsx', 'utf8');
    
    if (mainApp.includes('PWA.*detection') || mainApp.includes('pwa=true')) {
        console.log('✅ PWA detection code found in main App.tsx');
    } else {
        console.log('❌ PWA detection MISSING in main App.tsx');
    }
    
    if (mainApp.includes('therapist-status')) {
        console.log('✅ Therapist status routing found in main App.tsx');  
    } else {
        console.log('❌ Therapist status routing MISSING in main App.tsx');
    }
    
} catch (error) {
    console.log('❌ Failed to read main App.tsx:', error.message);
}

// 6. Check hook and state management
console.log('\n6. 🎣 HOOKS & STATE MANAGEMENT CHECK');
try {
    const useAppState = fs.readFileSync('hooks/useAppState.ts', 'utf8');
    
    if (useAppState.includes('therapist-status')) {
        console.log('✅ Therapist status handling found in useAppState');
    } else {
        console.log('❌ Therapist status handling MISSING in useAppState'); 
    }
    
    if (useAppState.includes('/dashboard/therapist/status')) {
        console.log('✅ Hash routing for therapist status found');
    } else {
        console.log('❌ Hash routing for therapist status MISSING');
    }
    
} catch (error) {
    console.log('❌ Failed to read useAppState.ts:', error.message);
}

console.log('\n' + '=' * 60);
console.log('🏁 DIAGNOSTIC SCAN COMPLETE');
console.log('Check the ❌ items above for bugs preventing therapist dashboard access');
console.log('=' * 60);