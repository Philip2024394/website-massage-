#!/usr/bin/env node

/**
 * Achievement System Collections Setup for Appwrite
 * 
 * This script creates the required collections for the Indastreet Achievement System.
 * 
 * COLLECTIONS TO CREATE:
 * 1. achievements_collection_id - Achievement definitions
 * 2. therapist_achievements_collection_id - Achievement assignments
 * 
 * Run this script ONCE in your Appwrite database before using the achievement system.
 */

import { Client, Databases, ID, Permission, Role, IndexType } from 'node-appwrite';

// Type definitions for attribute configuration
interface AttributeConfig {
  key: string;
  type: 'string' | 'boolean' | 'datetime' | 'enum' | 'url';
  size?: number;
  required?: boolean;
  default?: string | boolean;
  array?: boolean;
  elements?: string[];
}

const APPWRITE_CONFIG = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664',
  databaseId: '68f76ee1000e64ca8d05',
  apiKey: process.env.APPWRITE_API_KEY // Set this in your environment
};

async function setupAchievementCollections() {
  if (!APPWRITE_CONFIG.apiKey) {
    console.error('❌ Error: APPWRITE_API_KEY environment variable is required');
    console.log('\nGet your API key from:');
    console.log(`https://cloud.appwrite.io/console/project-${APPWRITE_CONFIG.projectId}/overview/keys`);
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
    return;
  }

  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey);

  const databases = new Databases(client);

  console.log('🏆 Setting up Indastreet Achievement System Collections...\n');

  try {
    // ============================
    // 1. ACHIEVEMENTS COLLECTION
    // ============================
    console.log('📋 Creating achievements collection...');
    
    const achievementsCollection = await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      'achievements_collection_id',
      'Achievements',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Achievements collection created');

    // Add attributes to achievements collection
    const achievementAttributes: AttributeConfig[] = [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'badgeUrl', type: 'url', required: true },
      { key: 'category', type: 'enum', elements: ['professional', 'experience', 'specialization', 'community', 'verified', 'performance'], required: true },
      { key: 'rarity', type: 'enum', elements: ['common', 'uncommon', 'rare', 'epic', 'legendary'], required: true },
      { key: 'dateEarned', type: 'datetime', required: true },
      { key: 'isVisible', type: 'boolean', required: true, default: true },
      { key: 'requirementsMet', type: 'string', array: true, size: 500 }
    ];

    for (const attr of achievementAttributes) {
      console.log(`   Adding attribute: ${attr.key}`);
      
      if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          APPWRITE_CONFIG.databaseId,
          achievementsCollection.$id,
          attr.key,
          attr.required || false,
          attr.default !== undefined ? (attr.default as boolean) : undefined,
          attr.array || false
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          APPWRITE_CONFIG.databaseId,
          achievementsCollection.$id,
          attr.key,
          attr.required || false,
          undefined, // no default for datetime
          attr.array || false
        );
      } else if (attr.type === 'enum') {
        await databases.createEnumAttribute(
          APPWRITE_CONFIG.databaseId,
          achievementsCollection.$id,
          attr.key,
          attr.elements || [],
          attr.required || false,
          attr.default !== undefined ? (attr.default as string) : undefined,
          attr.array || false
        );
      } else if (attr.type === 'url') {
        await databases.createUrlAttribute(
          APPWRITE_CONFIG.databaseId,
          achievementsCollection.$id,
          attr.key,
          attr.required || false,
          attr.default !== undefined ? (attr.default as string) : undefined,
          attr.array || false
        );
      } else {
        // Default to string attribute
        await databases.createStringAttribute(
          APPWRITE_CONFIG.databaseId,
          achievementsCollection.$id,
          attr.key,
          attr.size || 255,
          attr.required || false,
          attr.default !== undefined ? (attr.default as string) : undefined,
          attr.array || false
        );
      }
    }

    // ============================
    // 2. THERAPIST ACHIEVEMENTS COLLECTION
    // ============================
    console.log('\n📋 Creating therapist achievements collection...');
    
    const therapistAchievementsCollection = await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      'therapist_achievements_collection_id',
      'Therapist Achievements',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    console.log('✅ Therapist achievements collection created');

    // Add attributes to therapist achievements collection
    const therapistAchievementAttributes: AttributeConfig[] = [
      { key: 'therapistId', type: 'string', size: 36, required: true },
      { key: 'achievementId', type: 'string', size: 36, required: true },
      { key: 'dateAwarded', type: 'datetime', required: true },
      { key: 'awardedBy', type: 'string', size: 36, required: true }, // admin user ID
      { key: 'isActive', type: 'boolean', required: true, default: true },
      { key: 'notes', type: 'string', size: 1000, required: false } // optional admin notes
    ];

    for (const attr of therapistAchievementAttributes) {
      console.log(`   Adding attribute: ${attr.key}`);
      
      if (attr.type === 'boolean') {
        await databases.createBooleanAttribute(
          APPWRITE_CONFIG.databaseId,
          therapistAchievementsCollection.$id,
          attr.key,
          attr.required || false,
          attr.default !== undefined ? (attr.default as boolean) : undefined,
          attr.array || false
        );
      } else if (attr.type === 'datetime') {
        await databases.createDatetimeAttribute(
          APPWRITE_CONFIG.databaseId,
          therapistAchievementsCollection.$id,
          attr.key,
          attr.required || false,
          undefined, // no default for datetime
          attr.array || false
        );
      } else {
        // Default to string attribute
        await databases.createStringAttribute(
          APPWRITE_CONFIG.databaseId,
          therapistAchievementsCollection.$id,
          attr.key,
          attr.size || 255,
          attr.required || false,
          attr.default !== undefined ? (attr.default as string) : undefined,
          attr.array || false
        );
      }
    }

    // Create indexes for better query performance
    console.log('\n📑 Creating indexes...');
    
    // Index for therapist achievements by therapist ID
    await databases.createIndex(
      APPWRITE_CONFIG.databaseId,
      therapistAchievementsCollection.$id,
      'therapistId_index',
      IndexType.Key,
      ['therapistId']
    );

    // Index for achievements by category
    await databases.createIndex(
      APPWRITE_CONFIG.databaseId,
      achievementsCollection.$id,
      'category_index',
      IndexType.Key,
      ['category']
    );

    // Index for active achievements
    await databases.createIndex(
      APPWRITE_CONFIG.databaseId,
      therapistAchievementsCollection.$id,
      'active_achievements_index',
      IndexType.Key,
      ['isActive', 'therapistId']
    );

    console.log('✅ Indexes created');

    console.log('\n🎉 Achievement System Setup Complete!\n');
    console.log('📊 Collections Created:');
    console.log(`   • Achievements: ${achievementsCollection.$id}`);
    console.log(`   • Therapist Achievements: ${therapistAchievementsCollection.$id}`);
    console.log('\n✅ You can now use the Achievement System in your application!');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Update lib/appwrite.ts COLLECTIONS with the real collection IDs above');
    console.log('2. Seed the achievements collection with default achievement badges');
    console.log('3. Test the achievement assignment functionality in the admin dashboard');

  } catch (error: any) {
    console.error('❌ Error setting up collections:', error);
    
    if (error?.message?.includes('Collection with the requested ID already exists')) {
      console.log('\n💡 Collections may already exist. Check your Appwrite dashboard.');
    }
    
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
    return;
  }
}

// Seed default achievements
async function seedDefaultAchievements() {
  console.log('\n🌱 Seeding default achievements...');

  if (!APPWRITE_CONFIG.apiKey) {
    console.error('❌ Error: APPWRITE_API_KEY environment variable is required');
    if (typeof process !== 'undefined') {
      process.exit(1);
    }
    return;
  }

  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey);

  const databases = new Databases(client);

  const defaultAchievements: any[] = [
    {
      name: 'Identity Verified',
      description: 'Government ID verified and authenticated by Indastreet',
      badgeUrl: 'https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565',
      category: 'verified',
      rarity: 'common',
      dateEarned: new Date().toISOString(),
      isVisible: true
    },
    {
      name: 'Certified Professional',
      description: 'Verified professional massage therapy certification',
      badgeUrl: 'https://ik.imagekit.io/7grri5v7d/professional-cert-badge.png',
      category: 'professional',
      rarity: 'uncommon',
      dateEarned: new Date().toISOString(),
      isVisible: true
    },
    {
      name: '3+ Years Experience',
      description: 'Successfully completed over 3 years of massage therapy service',
      badgeUrl: 'https://ik.imagekit.io/7grri5v7d/experience-3yr-badge.png',
      category: 'experience',
      rarity: 'uncommon',
      dateEarned: new Date().toISOString(),
      isVisible: true
    },
    {
      name: 'Balinese Specialist',
      description: 'Expert in traditional Balinese massage techniques and therapy',
      badgeUrl: 'https://ik.imagekit.io/7grri5v7d/balinese-specialist-badge.png',
      category: 'specialization',
      rarity: 'rare',
      dateEarned: new Date().toISOString(),
      isVisible: true
    },
    {
      name: 'Top Rated Therapist',
      description: 'Maintained 4.8+ average rating with 50+ reviews',
      badgeUrl: 'https://ik.imagekit.io/7grri5v7d/top-rated-badge.png',
      category: 'performance',
      rarity: 'epic',
      dateEarned: new Date().toISOString(),
      isVisible: true
    },
    {
      name: 'Community Leader',
      description: 'Active contributor to therapist community and mentorship',
      badgeUrl: 'https://ik.imagekit.io/7grri5v7d/community-leader-badge.png',
      category: 'community',
      rarity: 'legendary',
      dateEarned: new Date().toISOString(),
      isVisible: true
    }
  ];

  try {
    for (const achievement of defaultAchievements) {
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        'achievements_collection_id',
        ID.unique(),
        achievement
      );
      console.log(`   ✅ Created: ${achievement.name}`);
    }

    console.log(`\n🎯 Successfully seeded ${defaultAchievements.length} default achievements!`);
  } catch (error: any) {
    console.error('❌ Error seeding achievements:', error);
  }
}

// Main execution
if (typeof require !== 'undefined' && require.main === module) {
  setupAchievementCollections()
    .then(() => {
      // Optionally seed default achievements
      if (typeof process !== 'undefined' && process.argv && process.argv.includes('--seed')) {
        return seedDefaultAchievements();
      }
    })
    .catch(console.error);
}

export { setupAchievementCollections, seedDefaultAchievements };