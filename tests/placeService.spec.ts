import { describe, it, expect, beforeEach, vi } from 'vitest';

// Dynamically import after mocks
let placeService: any;

// Mock appwrite dependencies used in appwriteService
const mockDocs: Record<string, any> = {};

const databases = {
  createDocument: vi.fn(async (_db: string, _col: string, id: string, data: any) => {
    mockDocs[id] = { ...data, $id: id };
    return mockDocs[id];
  }),
  getDocument: vi.fn(async (_db: string, _col: string, id: string) => {
    if (!mockDocs[id]) {
      const err: any = new Error('Not Found');
      err.code = 404;
      throw err;
    }
    return mockDocs[id];
  }),
  listDocuments: vi.fn(async (_db: string, _col: string, queries?: any[]) => {
    // Very lightweight query matcher: look for Query.equal(field, value)
    if (!queries || queries.length === 0) {
      return { documents: Object.values(mockDocs) };
    }
    const q = queries[0];
    // Support our simplified structure in tests
    const field = q?.attribute || q?.key || q?.field || 'id';
    const value = Array.isArray(q?.value) ? q.value[0] : q?.value;
    const found = Object.values(mockDocs).filter((d: any) => d[field] === value);
    return { documents: found };
  })
};

vi.mock('../lib/appwriteServiceDependencies', () => ({}));

// Mock appwrite module parts used when creating IDs
vi.mock('appwrite', () => ({
  ID: { unique: () => 'test_generated_id' },
  Query: { equal: (attribute: string, value: any) => ({ attribute, value }) }
}));

// Mock config & exported items referenced inside appwriteService
vi.mock('../lib/appwriteConfig', () => ({ }));

// Because appwriteService imports databases & APPWRITE_CONFIG directly, mock that module path
vi.mock('../lib/appwrite', () => ({
  databases,
  APPWRITE_CONFIG: {
    databaseId: 'db',
    collections: { places: 'places' },
    endpoint: 'http://localhost',
    projectId: 'proj'
  },
  Query: { equal: (attribute: string, value: any) => ({ attribute, value }) }
}));

// Import after mocks applied
import '../lib/appwriteService';
import { placeService as importedPlaceService } from '../lib/appwriteService';

beforeEach(() => {
  // Reset mocks and documents
  Object.keys(mockDocs).forEach(k => delete mockDocs[k]);
  vi.clearAllMocks();
  placeService = importedPlaceService;
});

describe('placeService.create', () => {
  it('normalizes id and placeId to document $id', async () => {
    const created = await placeService.create({ name: 'Test Place' });
    expect(created.$id).toBe('test_generated_id');
    expect(created.id).toBe(created.$id);
    expect(created.placeId).toBe(created.$id);
  });

  it('uses provided id when present and syncs placeId', async () => {
    const created = await placeService.create({ id: 'custom123', name: 'Custom Place' });
    expect(created.$id).toBe('custom123');
    expect(created.id).toBe('custom123');
    expect(created.placeId).toBe('custom123');
  });
});

describe('placeService.getByProviderId', () => {
  it('finds by direct $id', async () => {
    const created = await placeService.create({ name: 'Direct Lookup' });
    const found = await placeService.getByProviderId(created.$id);
    expect(found?.$id).toBe(created.$id);
  });

  it('falls back to id attribute lookup', async () => {
    // Simulate mismatch: create a doc where $id !== id (edge legacy)
    mockDocs['legacy_doc'] = { $id: 'legacy_doc', id: 'legacy_attr', placeId: 'legacy_attr', name: 'Legacy Place' };
    const found = await placeService.getByProviderId('legacy_attr');
    expect(found?.$id).toBe('legacy_doc');
    expect(found?.id).toBe('legacy_attr');
  });

  it('falls back to placeId attribute lookup', async () => {
    mockDocs['legacy2'] = { $id: 'legacy2', id: 'x123', placeId: 'placeX', name: 'Legacy Place 2' };
    const found = await placeService.getByProviderId('placeX');
    expect(found?.$id).toBe('legacy2');
  });
});
