// 🗄️ LOCAL DATABASE SERVICE
// Handles all database operations with automatic backup and sync

import { 
    Database, 
    DatabaseTherapist, 
    DatabasePlace, 
    DatabaseUser, 
    DatabaseBooking,
    createEmptyDatabase,
    validateTherapist,
    validatePlace
} from './schema';

class LocalDatabaseService {
    private readonly dbPath = 'database/local-db.json';
    private readonly backupPath = 'database/backups';
    private db: Database;
    private isInitialized = false;

    constructor() {
        this.db = createEmptyDatabase();
        this.init();
    }

    // 🚀 Initialize database
    private async init(): Promise<void> {
        try {
            await this.loadDatabase();
            this.isInitialized = true;
            console.log('✅ Local database initialized successfully');
        } catch (error) {
            console.log('📝 Creating new database...');
            this.db = createEmptyDatabase();
            await this.saveDatabase();
            this.isInitialized = true;
            console.log('✅ New local database created');
        }
    }

    // 💾 Save database to file
    private async saveDatabase(): Promise<void> {
        this.db.lastUpdated = new Date().toISOString();
        
        try {
            // Save to localStorage as primary storage
            localStorage.setItem('localDatabase', JSON.stringify(this.db, null, 2));
            
            // Create downloadable backup
            this.createBackup();
            
            console.log('💾 Database saved successfully');
        } catch (error) {
            console.error('❌ Failed to save database:', error);
            throw error;
        }
    }

    // 📖 Load database from file
    private async loadDatabase(): Promise<void> {
        try {
            const data = localStorage.getItem('localDatabase');
            if (!data) {
                throw new Error('No database found');
            }
            
            this.db = JSON.parse(data);
            console.log('📖 Database loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load database:', error);
            throw error;
        }
    }

    // 🔄 Create backup
    private createBackup(): void {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupData = JSON.stringify(this.db, null, 2);
            
            // Store backup in localStorage with timestamp
            localStorage.setItem(`backup_${timestamp}`, backupData);
            
            // Create downloadable backup file
            const blob = new Blob([backupData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Store backup URL for admin download
            localStorage.setItem('latestBackupUrl', url);
            localStorage.setItem('latestBackupTime', timestamp);
            
            this.db.lastBackup = new Date().toISOString();
            
            console.log(`📦 Backup created: ${timestamp}`);
        } catch (error) {
            console.error('❌ Failed to create backup:', error);
        }
    }

    // 🎯 THERAPIST OPERATIONS
    
    async createTherapist(therapist: Omit<DatabaseTherapist, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseTherapist> {
        const errors = validateTherapist(therapist);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        const newTherapist: DatabaseTherapist = {
            ...therapist,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        };

        this.db.therapists.push(newTherapist);
        await this.saveDatabase();
        
        console.log('👨‍⚕️ New therapist created:', newTherapist.name);
        return newTherapist;
    }

    async updateTherapist(id: string, updates: Partial<DatabaseTherapist>): Promise<DatabaseTherapist> {
        const index = this.db.therapists.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Therapist not found');
        }

        const updatedTherapist = {
            ...this.db.therapists[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const errors = validateTherapist(updatedTherapist);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        this.db.therapists[index] = updatedTherapist;
        await this.saveDatabase();
        
        console.log('✏️ Therapist updated:', updatedTherapist.name);
        return updatedTherapist;
    }

    getTherapist(id: string): DatabaseTherapist | null {
        return this.db.therapists.find(t => t.id === id) || null;
    }

    getAllTherapists(): DatabaseTherapist[] {
        return this.db.therapists.filter(t => t.isActive);
    }

    getLiveTherapists(): DatabaseTherapist[] {
        return this.db.therapists.filter(t => t.isActive && t.isLive);
    }

    async deleteTherapist(id: string): Promise<void> {
        const index = this.db.therapists.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Therapist not found');
        }

        // Soft delete - mark as inactive
        this.db.therapists[index].isActive = false;
        this.db.therapists[index].updatedAt = new Date().toISOString();
        
        await this.saveDatabase();
        console.log('🗑️ Therapist deactivated:', id);
    }

    // 🏢 PLACE OPERATIONS
    
    async createPlace(place: Omit<DatabasePlace, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabasePlace> {
        const errors = validatePlace(place);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        const newPlace: DatabasePlace = {
            ...place,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        };

        this.db.places.push(newPlace);
        await this.saveDatabase();
        
        console.log('🏢 New place created:', newPlace.name);
        return newPlace;
    }

    async updatePlace(id: string, updates: Partial<DatabasePlace>): Promise<DatabasePlace> {
        const index = this.db.places.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Place not found');
        }

        const updatedPlace = {
            ...this.db.places[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        const errors = validatePlace(updatedPlace);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        this.db.places[index] = updatedPlace;
        await this.saveDatabase();
        
        console.log('✏️ Place updated:', updatedPlace.name);
        return updatedPlace;
    }

    getPlace(id: string): DatabasePlace | null {
        return this.db.places.find(p => p.id === id) || null;
    }

    getAllPlaces(): DatabasePlace[] {
        return this.db.places.filter(p => p.isActive);
    }

    getLivePlaces(): DatabasePlace[] {
        return this.db.places.filter(p => p.isActive && p.isLive);
    }

    async deletePlace(id: string): Promise<void> {
        const index = this.db.places.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Place not found');
        }

        // Soft delete - mark as inactive
        this.db.places[index].isActive = false;
        this.db.places[index].updatedAt = new Date().toISOString();
        
        await this.saveDatabase();
        console.log('🗑️ Place deactivated:', id);
    }

    // 👤 USER OPERATIONS
    
    async createUser(user: Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseUser> {
        // Check if email already exists
        if (this.db.users.some(u => u.email === user.email && u.isActive)) {
            throw new Error('Email already exists');
        }

        const newUser: DatabaseUser = {
            ...user,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true
        };

        this.db.users.push(newUser);
        await this.saveDatabase();
        
        console.log('👤 New user created:', newUser.email);
        return newUser;
    }

    getUserByEmail(email: string): DatabaseUser | null {
        return this.db.users.find(u => u.email === email && u.isActive) || null;
    }

    getUser(id: string): DatabaseUser | null {
        return this.db.users.find(u => u.id === id && u.isActive) || null;
    }

    // 📊 ANALYTICS & UTILITIES
    
    getDashboardStats() {
        return {
            totalTherapists: this.db.therapists.filter(t => t.isActive).length,
            liveTherapists: this.db.therapists.filter(t => t.isActive && t.isLive).length,
            totalPlaces: this.db.places.filter(p => p.isActive).length,
            livePlaces: this.db.places.filter(p => p.isActive && p.isLive).length,
            totalUsers: this.db.users.filter(u => u.isActive).length,
            totalBookings: this.db.bookings.length,
            lastUpdated: this.db.lastUpdated
        };
    }

    // 🔧 UTILITY METHODS
    
    private generateId(): string {
        return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 📤 Export database for backup
    exportDatabase(): string {
        return JSON.stringify(this.db, null, 2);
    }

    // 📥 Import database from backup
    async importDatabase(jsonData: string): Promise<void> {
        try {
            const importedDb = JSON.parse(jsonData);
            
            // Validate structure
            if (!importedDb.therapists || !importedDb.places || !importedDb.users) {
                throw new Error('Invalid database structure');
            }

            this.db = importedDb;
            await this.saveDatabase();
            
            console.log('📥 Database imported successfully');
        } catch (error) {
            console.error('❌ Failed to import database:', error);
            throw error;
        }
    }

    // 🔄 Sync data to display components
    getSyncData() {
        return {
            therapists: this.getLiveTherapists(),
            places: this.getLivePlaces(),
            lastSync: new Date().toISOString()
        };
    }

    // 🔍 Search functionality
    searchTherapists(query: string): DatabaseTherapist[] {
        const lowercaseQuery = query.toLowerCase();
        return this.db.therapists.filter(t => 
            t.isActive &&
            (t.name.toLowerCase().includes(lowercaseQuery) ||
             t.location.toLowerCase().includes(lowercaseQuery) ||
             t.specialization.toLowerCase().includes(lowercaseQuery) ||
             t.massageTypes.some(type => type.toLowerCase().includes(lowercaseQuery)))
        );
    }

    searchPlaces(query: string): DatabasePlace[] {
        const lowercaseQuery = query.toLowerCase();
        return this.db.places.filter(p => 
            p.isActive &&
            (p.name.toLowerCase().includes(lowercaseQuery) ||
             p.location.toLowerCase().includes(lowercaseQuery) ||
             p.category.toLowerCase().includes(lowercaseQuery) ||
             p.services.some(service => service.toLowerCase().includes(lowercaseQuery)))
        );
    }
}

// Create singleton instance
export const localDatabase = new LocalDatabaseService();

// Export for admin use
export default localDatabase;