/**
 * Unit Tests for Booking Authorization Guards
 * Testing critical revenue protection logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  validateTherapistBookingAccess, 
  validateUserBookingLimit,
  validateBookingCreation 
} from '../guards/bookingAuthGuards';

// Mock Appwrite
vi.mock('../appwrite', () => ({
  databases: {
    listDocuments: vi.fn(),
    getDocument: vi.fn()
  }
}));

vi.mock('../appwrite.config', () => ({
  APPWRITE_CONFIG: {
    databaseId: 'test-db',
    collections: {
      therapists: 'therapists',
      bookings: 'bookings'
    }
  }
}));

describe('BookingAuthGuards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateTherapistBookingAccess', () => {
    it('should allow booking for active therapist', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.getDocument as any).mockResolvedValueOnce({
        $id: 'therapist-123',
        isActive: true,
        status: 'available',
        accountStatus: 'verified'
      });

      const result = await validateTherapistBookingAccess('therapist-123');
      
      expect(result.allowed).toBe(true);
    });

    it('should block booking for inactive therapist', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.getDocument as any).mockResolvedValueOnce({
        $id: 'therapist-123',
        isActive: false,
        status: 'offline',
        accountStatus: 'suspended'
      });

      const result = await validateTherapistBookingAccess('therapist-123');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('inactive');
    });

    it('should block booking for suspended therapist', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.getDocument as any).mockResolvedValueOnce({
        $id: 'therapist-123',
        isActive: true,
        status: 'available',
        accountStatus: 'suspended'
      });

      const result = await validateTherapistBookingAccess('therapist-123');
      
      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('error');
    });

    it('should fail-closed on database errors', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.getDocument as any).mockRejectedValueOnce(new Error('Database error'));

      const result = await validateTherapistBookingAccess('therapist-123');
      
      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('critical');
    });
  });

  describe('validateUserBookingLimit', () => {
    it('should allow booking when under limit', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [
          { $id: 'booking-1', status: 'pending' },
          { $id: 'booking-2', status: 'confirmed' }
        ]
      });

      const result = await validateUserBookingLimit('user-123');
      
      expect(result.allowed).toBe(true);
    });

    it('should block booking when at limit (3 active bookings)', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [
          { $id: 'booking-1', status: 'pending' },
          { $id: 'booking-2', status: 'confirmed' },
          { $id: 'booking-3', status: 'pending' }
        ]
      });

      const result = await validateUserBookingLimit('user-123');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('limit');
    });

    it('should not count completed bookings toward limit', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [
          { $id: 'booking-1', status: 'pending' },
          { $id: 'booking-2', status: 'completed' },
          { $id: 'booking-3', status: 'completed' },
          { $id: 'booking-4', status: 'cancelled' }
        ]
      });

      const result = await validateUserBookingLimit('user-123');
      
      expect(result.allowed).toBe(true); // Only 1 active booking
    });
  });

  describe('validateBookingCreation', () => {
    it('should validate all checks before allowing booking', async () => {
      const { databases } = await import('../appwrite');
      
      // Mock therapist check
      (databases.getDocument as any).mockResolvedValueOnce({
        $id: 'therapist-123',
        isActive: true,
        status: 'available',
        accountStatus: 'verified'
      });

      // Mock user booking limit check
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [{ $id: 'booking-1', status: 'pending' }]
      });

      const result = await validateBookingCreation('user-123', 'therapist-123', 'therapist');
      
      expect(result.allowed).toBe(true);
    });

    it('should fail if therapist is unauthorized', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.getDocument as any).mockResolvedValueOnce({
        $id: 'therapist-123',
        isActive: false
      });

      const result = await validateBookingCreation('user-123', 'therapist-123', 'therapist');
      
      expect(result.allowed).toBe(false);
    });

    it('should fail if user has too many bookings', async () => {
      const { databases } = await import('../appwrite');
      
      // Therapist OK
      (databases.getDocument as any).mockResolvedValueOnce({
        $id: 'therapist-123',
        isActive: true,
        status: 'available',
        accountStatus: 'verified'
      });

      // User at limit
      (databases.listDocuments as any).mockResolvedValueOnce({
        documents: [
          { $id: 'booking-1', status: 'pending' },
          { $id: 'booking-2', status: 'confirmed' },
          { $id: 'booking-3', status: 'pending' }
        ]
      });

      const result = await validateBookingCreation('user-123', 'therapist-123', 'therapist');
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('limit');
    });

    it('should skip validation for non-therapist providers', async () => {
      const result = await validateBookingCreation('user-123', 'place-456', 'place');
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('Fail-Closed Security', () => {
    it('should block on any unexpected error', async () => {
      const { databases } = await import('../appwrite');
      
      (databases.getDocument as any).mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const result = await validateBookingCreation('user-123', 'therapist-123', 'therapist');
      
      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('critical');
    });
  });
});
