import { databases } from '../appwrite/config';
import { DATABASE_ID } from '../appwrite/config';
import { APPWRITE_CONFIG } from '../appwrite/config';
import { Achievement, TherapistAchievement } from '../../types/achievements';

// Collection IDs
const COLLECTIONS = {
  ACHIEVEMENTS: 'achievements',
  THERAPIST_ACHIEVEMENTS: 'therapist_achievements'
};
import { ID } from 'appwrite';

export class AchievementService {
  
  // ============================
  // ACHIEVEMENT CRUD OPERATIONS
  // ============================
  
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS // You'll need to create this collection
      );
      return response.documents as Achievement[];
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      throw error;
    }
  }
  
  async createAchievement(achievement: Omit<Achievement, '$id'>): Promise<Achievement> {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        ID.unique(),
        achievement
      );
      return response as Achievement;
    } catch (error) {
      console.error('Failed to create achievement:', error);
      throw error;
    }
  }
  
  async updateAchievement(achievementId: string, updates: Partial<Achievement>): Promise<Achievement> {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        achievementId,
        updates
      );
      return response as Achievement;
    } catch (error) {
      console.error('Failed to update achievement:', error);
      throw error;
    }
  }
  
  async deleteAchievement(achievementId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        achievementId
      );
    } catch (error) {
      console.error('Failed to delete achievement:', error);
      throw error;
    }
  }
  
  // =====================================
  // THERAPIST ACHIEVEMENT OPERATIONS
  // =====================================
  
  async getTherapistAchievements(therapistId: string): Promise<TherapistAchievement[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.THERAPIST_ACHIEVEMENTS, // You'll need to create this collection
        [
          `therapistId=\"${therapistId}\"`,
          `isActive=true`
        ]
      );
      
      // Fetch the full achievement details for each assignment
      const achievementsWithDetails = await Promise.all(
        response.documents.map(async (doc) => {
          const achievement = await this.getAchievement(doc.achievementId);
          return {
            ...doc,
            achievement: achievement
          } as TherapistAchievement;
        })
      );
      
      return achievementsWithDetails;
    } catch (error) {
      console.error('Failed to fetch therapist achievements:', error);
      throw error;
    }
  }
  
  async assignAchievementToTherapist(
    therapistId: string, 
    achievementId: string, 
    awardedBy: string
  ): Promise<TherapistAchievement> {
    try {
      // Check if already assigned
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.THERAPIST_ACHIEVEMENTS,
        [
          `therapistId=\"${therapistId}\"`,
          `achievementId=\"${achievementId}\"`,
          `isActive=true`
        ]
      );
      
      if (existing.documents.length > 0) {
        throw new Error('Achievement already assigned to this therapist');
      }
      
      const achievement = await this.getAchievement(achievementId);
      
      const assignment = {
        therapistId: therapistId,
        achievementId: achievementId,
        dateAwarded: new Date().toISOString(),
        awardedBy: awardedBy,
        isActive: true
      };
      
      const response = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.THERAPIST_ACHIEVEMENTS,
        ID.unique(),
        assignment
      );
      
      return {
        ...response,
        achievement: achievement
      } as TherapistAchievement;
    } catch (error) {
      console.error('Failed to assign achievement to therapist:', error);
      throw error;
    }
  }
  
  async removeAchievementFromTherapist(
    therapistId: string, 
    achievementId: string
  ): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.THERAPIST_ACHIEVEMENTS,
        [
          `therapistId=\"${therapistId}\"`,
          `achievementId=\"${achievementId}\"`,
          `isActive=true`
        ]
      );
      
      for (const doc of response.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.THERAPIST_ACHIEVEMENTS,
          doc.$id,
          { isActive: false }
        );
      }
    } catch (error) {
      console.error('Failed to remove achievement from therapist:', error);
      throw error;
    }
  }
  
  async getAllTherapistAchievements(): Promise<TherapistAchievement[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.THERAPIST_ACHIEVEMENTS,
        [`isActive=true`],
        100 // Limit
      );
      
      // Fetch the full achievement details for each assignment
      const achievementsWithDetails = await Promise.all(
        response.documents.map(async (doc) => {
          const achievement = await this.getAchievement(doc.achievementId);
          return {
            ...doc,
            achievement: achievement
          } as TherapistAchievement;
        })
      );
      
      return achievementsWithDetails;
    } catch (error) {
      console.error('Failed to fetch all therapist achievements:', error);
      throw error;
    }
  }
  
  // =====================================
  // HELPER METHODS
  // =====================================
  
  private async getAchievement(achievementId: string): Promise<Achievement> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        achievementId
      );
      return response as Achievement;
    } catch (error) {
      console.error('Failed to get achievement:', error);
      throw error;
    }
  }
  
  async getAchievementsByCategory(category: Achievement['category']): Promise<Achievement[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        [`category=\"${category}\"`, `isVisible=true`]
      );
      return response.documents as Achievement[];
    } catch (error) {
      console.error('Failed to fetch achievements by category:', error);
      throw error;
    }
  }
  
  async searchAchievements(query: string): Promise<Achievement[]> {
    try {
      // Note: This is a basic search. For better search, you might want to implement
      // full-text search or use Appwrite's search capabilities
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ACHIEVEMENTS,
        [`isVisible=true`]
      );
      
      const filtered = response.documents.filter((achievement: Achievement) => {
        return achievement.name.toLowerCase().includes(query.toLowerCase()) ||
               achievement.description.toLowerCase().includes(query.toLowerCase());
      });
      
      return filtered as Achievement[];
    } catch (error) {
      console.error('Failed to search achievements:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const achievementService = new AchievementService();