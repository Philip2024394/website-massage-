#!/usr/bin/env node

/**
 * Appwrite Service Migration Script
 * Gradually extracts services from the monolithic appwriteService.ts
 */

const fs = require('fs');
const path = require('path');

const MONOLITH_FILE = path.join(__dirname, '../lib/appwriteService.ts');
const SERVICES_DIR = path.join(__dirname, '../lib/appwrite/services');

// Service extraction mappings
const SERVICE_MAPPINGS = {
  'therapistService': {
    startPattern: 'export const therapistService = {',
    domain: 'therapist',
    description: 'Therapist management and operations'
  },
  'placesService': {
    startPattern: 'export const placesService = {',
    domain: 'places', 
    description: 'Massage place management'
  },
  'bookingService': {
    startPattern: 'export const bookingService = {',
    domain: 'booking',
    description: 'Booking operations and management'
  },
  'paymentService': {
    startPattern: 'export const paymentService = {',
    domain: 'payment',
    description: 'Payment processing and management'
  },
  'reviewService': {
    startPattern: 'export const reviewService = {',
    domain: 'review',
    description: 'Reviews and ratings management'
  },
  'userService': {
    startPattern: 'export const userService = {',
    domain: 'user',
    description: 'User account management'
  },
  'membershipService': {
    startPattern: 'export const membershipService = {',
    domain: 'membership',
    description: 'Membership and subscription management'
  }
};

function findServiceBoundaries(content, serviceName) {
  const startPattern = SERVICE_MAPPINGS[serviceName].startPattern;
  const startIndex = content.indexOf(startPattern);
  
  if (startIndex === -1) {
    console.log(`❌ Service ${serviceName} not found`);
    return null;
  }
  
  // Find the end of the service object by counting braces
  let braceCount = 0;
  let inString = false;
  let inComment = false;
  let endIndex = startIndex;
  
  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    // Handle comments
    if (char === '/' && nextChar === '/' && !inString) {
      inComment = 'line';
      continue;
    }
    if (char === '/' && nextChar === '*' && !inString) {
      inComment = 'block';
      continue;
    }
    if (inComment === 'line' && char === '\n') {
      inComment = false;
      continue;
    }
    if (inComment === 'block' && char === '*' && nextChar === '/') {
      inComment = false;
      i++; // Skip next character
      continue;
    }
    if (inComment) continue;
    
    // Handle strings
    if (char === '"' || char === "'" || char === '`') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    
    // Count braces
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  return {
    start: startIndex,
    end: endIndex,
    content: content.substring(startIndex, endIndex)
  };
}

function extractService(serviceName) {
  console.log(`\n🔧 Extracting ${serviceName}...`);
  
  try {
    const monolithContent = fs.readFileSync(MONOLITH_FILE, 'utf8');
    const boundaries = findServiceBoundaries(monolithContent, serviceName);
    
    if (!boundaries) {
      return false;
    }
    
    const mapping = SERVICE_MAPPINGS[serviceName];
    const serviceFileName = `${mapping.domain}.service.ts`;
    const serviceFilePath = path.join(SERVICES_DIR, serviceFileName);
    
    // Create the service file content
    const serviceContent = `/**
 * ${mapping.description.charAt(0).toUpperCase() + mapping.description.slice(1)}
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

${boundaries.content};
`;
    
    // Ensure services directory exists
    if (!fs.existsSync(SERVICES_DIR)) {
      fs.mkdirSync(SERVICES_DIR, { recursive: true });
    }
    
    // Write the service file
    fs.writeFileSync(serviceFilePath, serviceContent);
    
    console.log(`✅ Service extracted to: ${serviceFilePath}`);
    console.log(`📦 Service size: ${Math.round(boundaries.content.length / 1024)}KB`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error extracting ${serviceName}:`, error.message);
    return false;
  }
}

function generateMigrationReport() {
  console.log('\n📊 MIGRATION PROGRESS REPORT');
  console.log('='.repeat(50));
  
  const monolithContent = fs.readFileSync(MONOLITH_FILE, 'utf8');
  const originalSize = Math.round(monolithContent.length / 1024);
  
  console.log(`📄 Original monolith size: ${originalSize}KB`);
  
  let extractedSize = 0;
  let extractedServices = 0;
  
  Object.keys(SERVICE_MAPPINGS).forEach(serviceName => {
    const boundaries = findServiceBoundaries(monolithContent, serviceName);
    if (boundaries) {
      const serviceSize = Math.round(boundaries.content.length / 1024);
      console.log(`🔧 ${serviceName}: ${serviceSize}KB`);
      extractedSize += serviceSize;
    }
  });
  
  const remainingSize = originalSize - extractedSize;
  const migrationProgress = Math.round((extractedSize / originalSize) * 100);
  
  console.log(`\n📈 Migration Progress:`);
  console.log(`Extractable: ${extractedSize}KB (${migrationProgress}%)`);
  console.log(`Remaining: ${remainingSize}KB`);
  
  if (migrationProgress > 80) {
    console.log(`🎉 Migration is ${migrationProgress}% complete!`);
  } else if (migrationProgress > 50) {
    console.log(`⚡ Good progress: ${migrationProgress}% migrated`);
  } else {
    console.log(`🚧 Early stages: ${migrationProgress}% migrated`);
  }
}

// Main execution
const command = process.argv[2];

if (command === 'extract') {
  const serviceName = process.argv[3];
  if (!serviceName) {
    console.log('Usage: node migration-script.cjs extract <serviceName>');
    console.log('Available services:', Object.keys(SERVICE_MAPPINGS).join(', '));
    process.exit(1);
  }
  
  if (!SERVICE_MAPPINGS[serviceName]) {
    console.log(`❌ Unknown service: ${serviceName}`);
    console.log('Available services:', Object.keys(SERVICE_MAPPINGS).join(', '));
    process.exit(1);
  }
  
  extractService(serviceName);
} else if (command === 'report') {
  generateMigrationReport();
} else if (command === 'extract-all') {
  console.log('🚀 Starting bulk extraction...');
  let successCount = 0;
  
  Object.keys(SERVICE_MAPPINGS).forEach(serviceName => {
    if (extractService(serviceName)) {
      successCount++;
    }
  });
  
  console.log(`\n✅ Extraction complete: ${successCount}/${Object.keys(SERVICE_MAPPINGS).length} services extracted`);
  generateMigrationReport();
} else {
  console.log('Appwrite Service Migration Tool');
  console.log('Commands:');
  console.log('  report              - Show migration progress');
  console.log('  extract <service>   - Extract specific service');
  console.log('  extract-all         - Extract all services');
  console.log('');
  console.log('Available services:', Object.keys(SERVICE_MAPPINGS).join(', '));
}