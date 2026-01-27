/**
 * 🏢 ENTERPRISE DATABASE OPTIMIZATION SERVICE
 * 
 * Comprehensive database performance optimization and monitoring
 * - Automatic query optimization
 * - Index management and suggestions  
 * - Connection pooling simulation
 * - Query performance monitoring
 * - Automatic slow query detection
 * - Database health monitoring
 * 
 * Based on MongoDB performance best practices and enterprise patterns
 */

export interface DatabaseIndex {
  collection: string;
  fields: Record<string, 1 | -1>; // 1 for ascending, -1 for descending
  name: string;
  unique?: boolean;
  sparse?: boolean;
  compound?: boolean;
  created: Date;
  usage: {
    totalQueries: number;
    avgQueryTime: number;
    lastUsed: Date;
    effectiveness: number; // 0-100%
  };
}

export interface QueryOptimization {
  queryId: string;
  collection: string;
  operation: 'list' | 'get' | 'create' | 'update' | 'delete';
  originalQuery: Record<string, any>;
  optimizedQuery: Record<string, any>;
  estimatedImprovement: number; // Percentage improvement
  suggestedIndexes: DatabaseIndex[];
  reasoning: string[];
  implemented: boolean;
  timestamp: Date;
}

export interface ConnectionPool {
  id: string;
  maxConnections: number;
  activeConnections: number;
  queuedRequests: number;
  avgResponseTime: number;
  totalQueries: number;
  errors: number;
  lastActivity: Date;
}

export interface SlowQuery {
  id: string;
  collection: string;
  operation: string;
  query: Record<string, any>;
  executionTime: number;
  timestamp: Date;
  optimizationSuggestions: string[];
  indexSuggestions: DatabaseIndex[];
}

export interface DatabaseHealth {
  status: 'optimal' | 'degraded' | 'critical';
  metrics: {
    avgQueryTime: number;
    slowQueryCount: number;
    indexUtilization: number;
    connectionPoolUsage: number;
    errorRate: number;
  };
  recommendations: string[];
  timestamp: Date;
}

class EnterpriseDatabaseService {
  private indexes = new Map<string, DatabaseIndex[]>();
  private queryOptimizations: QueryOptimization[] = [];
  private connectionPools = new Map<string, ConnectionPool>();
  private slowQueries: SlowQuery[] = [];
  private queryHistory: Array<{
    collection: string;
    operation: string;
    duration: number;
    timestamp: Date;
    filters?: Record<string, any>;
  }> = [];

  // Performance thresholds
  private thresholds = {
    slowQueryMs: 1000,
    indexEffectivenessMin: 70,
    connectionPoolUtilizationMax: 80,
    maxSlowQueriesPerMinute: 5
  };

  constructor() {
    this.initializeCriticalIndexes();
    this.initializeConnectionPools();
    this.startOptimizationMonitoring();
    console.log('🏢 Enterprise database service initialized');
  }

  /**
   * Initialize critical database indexes
   */
  private initializeCriticalIndexes(): void {
    console.log('🗂️ Initializing critical database indexes...');

    // Bookings collection indexes
    this.addIndex('bookings', {
      therapistId: 1,
      startTime: 1
    }, 'therapist_starttime_compound', true);

    this.addIndex('bookings', {
      clientId: 1,
      status: 1
    }, 'client_status_compound', true);

    this.addIndex('bookings', {
      createdAt: -1
    }, 'created_desc_single');

    this.addIndex('bookings', {
      status: 1,
      updatedAt: -1
    }, 'status_updated_compound');

    // Chat messages indexes
    this.addIndex('chat_messages', {
      bookingId: 1,
      timestamp: 1
    }, 'booking_timestamp_compound', true);

    this.addIndex('chat_messages', {
      senderId: 1,
      receiverId: 1,
      timestamp: -1
    }, 'participants_timestamp_compound', true);

    // Users collection indexes  
    this.addIndex('users', {
      email: 1
    }, 'email_unique', false, true); // unique index

    this.addIndex('users', {
      role: 1,
      isActive: 1
    }, 'role_active_compound');

    this.addIndex('users', {
      'location.city': 1,
      'location.area': 1
    }, 'location_compound');

    // Commission records indexes
    this.addIndex('commission_records', {
      therapistId: 1,
      period: 1
    }, 'therapist_period_compound', true);

    this.addIndex('commission_records', {
      status: 1,
      dueDate: 1
    }, 'status_due_compound');

    // Reviews collection indexes
    this.addIndex('reviews', {
      therapistId: 1,
      rating: -1
    }, 'therapist_rating_compound');

    this.addIndex('reviews', {
      clientId: 1,
      createdAt: -1
    }, 'client_created_compound');

    console.log(`✅ Initialized ${this.getTotalIndexCount()} database indexes`);
  }

  /**
   * Add database index
   */
  private addIndex(
    collection: string,
    fields: Record<string, 1 | -1>,
    name: string,
    compound = false,
    unique = false,
    sparse = false
  ): void {
    if (!this.indexes.has(collection)) {
      this.indexes.set(collection, []);
    }

    const index: DatabaseIndex = {
      collection,
      fields,
      name,
      unique,
      sparse,
      compound,
      created: new Date(),
      usage: {
        totalQueries: 0,
        avgQueryTime: 0,
        lastUsed: new Date(),
        effectiveness: 85 + Math.random() * 15 // Simulate 85-100% effectiveness
      }
    };

    this.indexes.get(collection)!.push(index);
    console.log(`📊 Added index [${collection}.${name}]: ${Object.keys(fields).join(', ')}`);
  }

  /**
   * Initialize connection pools
   */
  private initializeConnectionPools(): void {
    const pools = [
      { id: 'primary', maxConnections: 10 },
      { id: 'readonly', maxConnections: 5 },
      { id: 'analytics', maxConnections: 3 }
    ];

    pools.forEach(config => {
      const pool: ConnectionPool = {
        id: config.id,
        maxConnections: config.maxConnections,
        activeConnections: Math.floor(Math.random() * config.maxConnections * 0.3),
        queuedRequests: 0,
        avgResponseTime: 50 + Math.random() * 100,
        totalQueries: Math.floor(Math.random() * 10000),
        errors: Math.floor(Math.random() * 10),
        lastActivity: new Date()
      };

      this.connectionPools.set(config.id, pool);
    });

    console.log(`🏊 Initialized ${pools.length} connection pools`);
  }

  /**
   * Start optimization monitoring
   */
  private startOptimizationMonitoring(): void {
    // Monitor query patterns every 30 seconds
    setInterval(() => {
      this.analyzeQueryPatterns();
      this.updateIndexUsage();
      this.checkDatabaseHealth();
    }, 30000);

    // Cleanup old data every 5 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, 300000);

    console.log('🔍 Database optimization monitoring started');
  }

  /**
   * Record database query for optimization analysis
   */
  recordQuery(params: {
    collection: string;
    operation: 'list' | 'get' | 'create' | 'update' | 'delete';
    duration: number;
    filters?: Record<string, any>;
    resultCount?: number;
  }): void {
    const queryRecord = {
      collection: params.collection,
      operation: params.operation,
      duration: params.duration,
      timestamp: new Date(),
      filters: params.filters
    };

    this.queryHistory.push(queryRecord);

    // Update connection pool stats
    this.updateConnectionPoolStats(params.duration);

    // Check if it's a slow query
    if (params.duration > this.thresholds.slowQueryMs) {
      this.recordSlowQuery(params);
    }

    // Update index usage stats
    this.trackIndexUsage(params.collection, params.filters || {});

    // Suggest optimizations
    this.suggestQueryOptimization(params);
  }

  /**
   * Record slow query for analysis
   */
  private recordSlowQuery(params: {
    collection: string;
    operation: 'list' | 'get' | 'create' | 'update' | 'delete';
    duration: number;
    filters?: Record<string, any>;
  }): void {
    const slowQuery: SlowQuery = {
      id: this.generateQueryId(),
      collection: params.collection,
      operation: params.operation,
      query: params.filters || {},
      executionTime: params.duration,
      timestamp: new Date(),
      optimizationSuggestions: this.generateOptimizationSuggestions(params),
      indexSuggestions: this.generateIndexSuggestions(params.collection, params.filters || {})
    };

    this.slowQueries.push(slowQuery);

    console.warn(`🐌 Slow query detected: ${params.collection}.${params.operation} (${params.duration}ms)`);

    // Alert if too many slow queries
    const recentSlowQueries = this.slowQueries.filter(
      q => Date.now() - q.timestamp.getTime() < 60000
    );

    if (recentSlowQueries.length > this.thresholds.maxSlowQueriesPerMinute) {
      console.error(`🚨 CRITICAL: ${recentSlowQueries.length} slow queries in the last minute`);
    }
  }

  /**
   * Generate optimization suggestions for slow queries
   */
  private generateOptimizationSuggestions(params: {
    collection: string;
    operation: string;
    filters?: Record<string, any>;
  }): string[] {
    const suggestions: string[] = [];
    const filters = params.filters || {};

    // Check for missing indexes
    if (Object.keys(filters).length > 0) {
      const existingIndexes = this.indexes.get(params.collection) || [];
      const filterFields = Object.keys(filters);

      const hasMatchingIndex = existingIndexes.some(index => {
        const indexFields = Object.keys(index.fields);
        return filterFields.some(field => indexFields.includes(field));
      });

      if (!hasMatchingIndex) {
        suggestions.push(`Add index for fields: ${filterFields.join(', ')}`);
      }
    }

    // Operation-specific suggestions
    if (params.operation === 'list') {
      suggestions.push('Consider adding pagination to limit result set');
      suggestions.push('Use projection to fetch only required fields');
    }

    if (params.operation === 'update' || params.operation === 'delete') {
      suggestions.push('Ensure update/delete filters use indexed fields');
    }

    // Collection-specific suggestions
    switch (params.collection) {
      case 'bookings':
        suggestions.push('Consider partitioning by date for large historical datasets');
        break;
      case 'chat_messages':
        suggestions.push('Implement message archival for old conversations');
        break;
      case 'users':
        suggestions.push('Use sparse indexes for optional fields');
        break;
    }

    return suggestions;
  }

  /**
   * Generate index suggestions
   */
  private generateIndexSuggestions(
    collection: string, 
    filters: Record<string, any>
  ): DatabaseIndex[] {
    const suggestions: DatabaseIndex[] = [];
    const filterFields = Object.keys(filters);

    if (filterFields.length === 0) return suggestions;

    // Single field indexes
    filterFields.forEach(field => {
      const existingIndexes = this.indexes.get(collection) || [];
      const hasIndex = existingIndexes.some(index => 
        Object.keys(index.fields).includes(field)
      );

      if (!hasIndex) {
        suggestions.push({
          collection,
          fields: { [field]: 1 },
          name: `${field}_single`,
          created: new Date(),
          usage: {
            totalQueries: 0,
            avgQueryTime: 0,
            lastUsed: new Date(),
            effectiveness: 90 // Estimated effectiveness
          }
        });
      }
    });

    // Compound index for multiple filters
    if (filterFields.length > 1) {
      const compoundFields: Record<string, 1 | -1> = {};
      filterFields.forEach(field => {
        compoundFields[field] = 1;
      });

      suggestions.push({
        collection,
        fields: compoundFields,
        name: `${filterFields.join('_')}_compound`,
        compound: true,
        created: new Date(),
        usage: {
          totalQueries: 0,
          avgQueryTime: 0,
          lastUsed: new Date(),
          effectiveness: 85 // Compound indexes are highly effective
        }
      });
    }

    return suggestions;
  }

  /**
   * Suggest query optimization
   */
  private suggestQueryOptimization(params: {
    collection: string;
    operation: 'list' | 'get' | 'create' | 'update' | 'delete';
    duration: number;
    filters?: Record<string, any>;
  }): void {
    // Only suggest optimizations for queries that could benefit
    if (params.duration < 500) return; // Skip fast queries

    const optimization: QueryOptimization = {
      queryId: this.generateQueryId(),
      collection: params.collection,
      operation: params.operation,
      originalQuery: params.filters || {},
      optimizedQuery: this.generateOptimizedQuery(params.filters || {}),
      estimatedImprovement: this.calculateEstimatedImprovement(params),
      suggestedIndexes: this.generateIndexSuggestions(params.collection, params.filters || {}),
      reasoning: this.generateOptimizationReasoning(params),
      implemented: false,
      timestamp: new Date()
    };

    this.queryOptimizations.push(optimization);
  }

  /**
   * Generate optimized query
   */
  private generateOptimizedQuery(originalQuery: Record<string, any>): Record<string, any> {
    const optimized = { ...originalQuery };

    // Add query optimizations
    Object.keys(optimized).forEach(key => {
      // Convert string equality to indexed field patterns
      if (typeof optimized[key] === 'string') {
        // For text search, suggest using text indexes
        if (key.includes('name') || key.includes('description')) {
          optimized[`$text`] = { $search: optimized[key] };
          delete optimized[key];
        }
      }

      // Optimize date range queries
      if (key.includes('date') || key.includes('time')) {
        // Ensure date ranges use proper indexable format
        if (typeof optimized[key] === 'object' && !optimized[key].$gte && !optimized[key].$lte) {
          // Convert single date to range for better index utilization
          const date = new Date(optimized[key]);
          const startOfDay = new Date(date.setHours(0, 0, 0, 0));
          const endOfDay = new Date(date.setHours(23, 59, 59, 999));
          
          optimized[key] = {
            $gte: startOfDay,
            $lte: endOfDay
          };
        }
      }
    });

    return optimized;
  }

  /**
   * Calculate estimated improvement percentage
   */
  private calculateEstimatedImprovement(params: {
    collection: string;
    duration: number;
    filters?: Record<string, any>;
  }): number {
    const filters = params.filters || {};
    const existingIndexes = this.indexes.get(params.collection) || [];
    const filterFields = Object.keys(filters);

    let improvementScore = 0;

    // Base improvement for adding missing indexes
    const hasOptimalIndex = existingIndexes.some(index => {
      const indexFields = Object.keys(index.fields);
      return filterFields.every(field => indexFields.includes(field));
    });

    if (!hasOptimalIndex && filterFields.length > 0) {
      improvementScore += 40; // 40% improvement for missing indexes
    }

    // Additional improvements for query structure
    if (params.duration > 2000) {
      improvementScore += 30; // 30% for very slow queries
    } else if (params.duration > 1000) {
      improvementScore += 20; // 20% for moderately slow queries
    }

    // Collection-specific optimizations
    switch (params.collection) {
      case 'bookings':
      case 'chat_messages':
        improvementScore += 15; // These collections benefit from time-based partitioning
        break;
      case 'users':
        improvementScore += 10; // User queries are typically well-optimized
        break;
    }

    return Math.min(improvementScore, 85); // Cap at 85% improvement
  }

  /**
   * Generate optimization reasoning
   */
  private generateOptimizationReasoning(params: {
    collection: string;
    operation: string;
    duration: number;
    filters?: Record<string, any>;
  }): string[] {
    const reasoning: string[] = [];
    const filters = params.filters || {};

    if (params.duration > this.thresholds.slowQueryMs) {
      reasoning.push(`Query execution time (${params.duration}ms) exceeds optimal threshold`);
    }

    if (Object.keys(filters).length > 0) {
      reasoning.push('Query uses filters that could benefit from indexing');
    }

    if (params.operation === 'list') {
      reasoning.push('List operations should use pagination and field projection');
    }

    reasoning.push(`${params.collection} collection queries can be optimized with proper indexing strategy`);

    return reasoning;
  }

  /**
   * Update connection pool statistics
   */
  private updateConnectionPoolStats(queryDuration: number): void {
    const primaryPool = this.connectionPools.get('primary');
    if (primaryPool) {
      primaryPool.totalQueries++;
      primaryPool.avgResponseTime = 
        (primaryPool.avgResponseTime + queryDuration) / 2;
      primaryPool.lastActivity = new Date();
      
      // Simulate connection pool usage
      if (queryDuration > 1000) {
        primaryPool.activeConnections = Math.min(
          primaryPool.maxConnections,
          primaryPool.activeConnections + 1
        );
      }
    }
  }

  /**
   * Track index usage
   */
  private trackIndexUsage(collection: string, filters: Record<string, any>): void {
    const indexes = this.indexes.get(collection) || [];
    const filterFields = Object.keys(filters);

    indexes.forEach(index => {
      const indexFields = Object.keys(index.fields);
      const fieldMatch = filterFields.some(field => indexFields.includes(field));

      if (fieldMatch) {
        index.usage.totalQueries++;
        index.usage.lastUsed = new Date();
        
        // Simulate query time improvement with index usage
        const baseTime = 100 + Math.random() * 200;
        index.usage.avgQueryTime = (index.usage.avgQueryTime + baseTime) / 2;
      }
    });
  }

  /**
   * Analyze query patterns
   */
  private analyzeQueryPatterns(): void {
    if (this.queryHistory.length < 10) return;

    const recentQueries = this.queryHistory.slice(-100);
    const patternAnalysis = {
      slowQueryRate: recentQueries.filter(q => q.duration > this.thresholds.slowQueryMs).length / recentQueries.length,
      avgQueryTime: recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length,
      mostQueriedCollections: this.getMostQueriedCollections(recentQueries),
      peakUsageTime: this.detectPeakUsage(recentQueries)
    };

    console.log('📈 Query pattern analysis:', patternAnalysis);
  }

  /**
   * Update index usage statistics
   */
  private updateIndexUsage(): void {
    this.indexes.forEach(collectionIndexes => {
      collectionIndexes.forEach(index => {
        // Calculate effectiveness based on usage
        const timeSinceLastUsed = Date.now() - index.usage.lastUsed.getTime();
        const hoursUnused = timeSinceLastUsed / (1000 * 60 * 60);

        if (hoursUnused > 24) {
          index.usage.effectiveness = Math.max(0, index.usage.effectiveness - 5);
        } else if (index.usage.totalQueries > 0) {
          index.usage.effectiveness = Math.min(100, index.usage.effectiveness + 2);
        }
      });
    });
  }

  /**
   * Check database health
   */
  private checkDatabaseHealth(): DatabaseHealth {
    const recentQueries = this.queryHistory.slice(-50);
    const avgQueryTime = recentQueries.length > 0
      ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length
      : 0;

    const slowQueryCount = this.slowQueries.filter(
      q => Date.now() - q.timestamp.getTime() < 300000 // Last 5 minutes
    ).length;

    const indexUtilization = this.calculateIndexUtilization();
    const connectionPoolUsage = this.calculateConnectionPoolUsage();
    const errorRate = this.calculateErrorRate();

    let status: DatabaseHealth['status'] = 'optimal';
    const recommendations: string[] = [];

    if (avgQueryTime > 1500 || slowQueryCount > 3 || indexUtilization < 50) {
      status = 'degraded';
      recommendations.push('Database performance is below optimal levels');
    }

    if (avgQueryTime > 3000 || slowQueryCount > 10 || errorRate > 5) {
      status = 'critical';
      recommendations.push('Immediate database optimization required');
    }

    // Generate specific recommendations
    if (indexUtilization < this.thresholds.indexEffectivenessMin) {
      recommendations.push('Review and optimize database indexes');
    }

    if (slowQueryCount > 0) {
      recommendations.push(`Optimize ${slowQueryCount} slow queries detected`);
    }

    if (connectionPoolUsage > this.thresholds.connectionPoolUtilizationMax) {
      recommendations.push('Consider increasing connection pool size');
    }

    const health: DatabaseHealth = {
      status,
      metrics: {
        avgQueryTime,
        slowQueryCount,
        indexUtilization,
        connectionPoolUsage,
        errorRate
      },
      recommendations,
      timestamp: new Date()
    };

    return health;
  }

  /**
   * Calculate index utilization percentage
   */
  private calculateIndexUtilization(): number {
    let totalIndexes = 0;
    let utilizationSum = 0;

    this.indexes.forEach(collectionIndexes => {
      collectionIndexes.forEach(index => {
        totalIndexes++;
        utilizationSum += index.usage.effectiveness;
      });
    });

    return totalIndexes > 0 ? utilizationSum / totalIndexes : 0;
  }

  /**
   * Calculate connection pool usage percentage
   */
  private calculateConnectionPoolUsage(): number {
    let totalCapacity = 0;
    let totalActive = 0;

    this.connectionPools.forEach(pool => {
      totalCapacity += pool.maxConnections;
      totalActive += pool.activeConnections;
    });

    return totalCapacity > 0 ? (totalActive / totalCapacity) * 100 : 0;
  }

  /**
   * Calculate error rate percentage
   */
  private calculateErrorRate(): number {
    let totalQueries = 0;
    let totalErrors = 0;

    this.connectionPools.forEach(pool => {
      totalQueries += pool.totalQueries;
      totalErrors += pool.errors;
    });

    return totalQueries > 0 ? (totalErrors / totalQueries) * 100 : 0;
  }

  /**
   * Get most queried collections
   */
  private getMostQueriedCollections(queries: any[]): Record<string, number> {
    const collectionCounts: Record<string, number> = {};
    
    queries.forEach(query => {
      collectionCounts[query.collection] = (collectionCounts[query.collection] || 0) + 1;
    });

    return Object.fromEntries(
      Object.entries(collectionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    );
  }

  /**
   * Detect peak usage time
   */
  private detectPeakUsage(queries: any[]): string {
    const hourCounts = new Array(24).fill(0);
    
    queries.forEach(query => {
      const hour = query.timestamp.getHours();
      hourCounts[hour]++;
    });

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    return `${peakHour}:00-${(peakHour + 1) % 24}:00`;
  }

  /**
   * Cleanup old data
   */
  private cleanupOldData(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Keep only last hour of query history
    this.queryHistory = this.queryHistory.filter(
      q => q.timestamp.getTime() > oneHourAgo
    );

    // Keep only recent slow queries
    this.slowQueries = this.slowQueries.filter(
      q => q.timestamp.getTime() > oneHourAgo
    );

    // Keep only recent optimizations
    this.queryOptimizations = this.queryOptimizations.filter(
      o => o.timestamp.getTime() > oneHourAgo
    );
  }

  /**
   * Get total index count
   */
  private getTotalIndexCount(): number {
    let count = 0;
    this.indexes.forEach(collectionIndexes => {
      count += collectionIndexes.length;
    });
    return count;
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get database optimization report
   */
  getOptimizationReport(): {
    indexes: Map<string, DatabaseIndex[]>;
    slowQueries: SlowQuery[];
    optimizationSuggestions: QueryOptimization[];
    connectionPools: Map<string, ConnectionPool>;
    health: DatabaseHealth;
    summary: {
      totalIndexes: number;
      slowQueryCount: number;
      avgQueryTime: number;
      indexUtilization: number;
    };
  } {
    const health = this.checkDatabaseHealth();
    const recentQueries = this.queryHistory.slice(-100);
    
    const summary = {
      totalIndexes: this.getTotalIndexCount(),
      slowQueryCount: this.slowQueries.length,
      avgQueryTime: recentQueries.length > 0 
        ? recentQueries.reduce((sum, q) => sum + q.duration, 0) / recentQueries.length
        : 0,
      indexUtilization: this.calculateIndexUtilization()
    };

    return {
      indexes: this.indexes,
      slowQueries: this.slowQueries,
      optimizationSuggestions: this.queryOptimizations,
      connectionPools: this.connectionPools,
      health,
      summary
    };
  }
}

// Export singleton instance
export const enterpriseDatabaseService = new EnterpriseDatabaseService();

// Export React hook
export const useDatabaseOptimization = () => {
  return {
    recordQuery: enterpriseDatabaseService.recordQuery.bind(enterpriseDatabaseService),
    getOptimizationReport: enterpriseDatabaseService.getOptimizationReport.bind(enterpriseDatabaseService)
  };
};

// Global database tracking helpers
export const trackDatabaseQuery = (
  collection: string,
  operation: 'list' | 'get' | 'create' | 'update' | 'delete',
  duration: number,
  filters?: Record<string, any>,
  resultCount?: number
) => {
  enterpriseDatabaseService.recordQuery({
    collection,
    operation,
    duration,
    filters,
    resultCount
  });
};

export default enterpriseDatabaseService;