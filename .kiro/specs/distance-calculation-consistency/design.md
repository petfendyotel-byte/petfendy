# Distance Calculation Consistency - Design Document

## 🏗️ System Architecture

### Overview
The distance calculation system will be redesigned to provide consistent, reliable, and cached distance calculations for taxi transfers. The system will use Google Distance Matrix API as primary source with intelligent fallback and comprehensive caching.

### Core Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  Distance API    │───▶│  Cache Layer    │
│                 │    │   /calculate     │    │   (Redis/DB)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Google Maps     │    │  Fallback       │
                       │  Distance API    │    │  Calculator     │
                       └──────────────────┘    └─────────────────┘
```

## 🔧 Technical Design

### 1. Distance Cache Service

**File**: `petfendy/lib/distance-cache.ts`

```typescript
interface DistanceCache {
  key: string
  distance: number
  method: 'google' | 'fallback'
  segments?: DistanceSegment[]
  calculatedAt: Date
  expiresAt: Date
}

interface DistanceSegment {
  from: string
  to: string
  distance: number
}

class DistanceCacheService {
  // Cache operations
  async get(key: string): Promise<DistanceCache | null>
  async set(key: string, data: DistanceCache): Promise<void>
  async invalidate(pattern: string): Promise<void>
  
  // Key generation
  generateKey(pickup: Location, dropoff: Location, isVip: boolean): string
}
```

### 2. Enhanced Distance Calculator

**File**: `petfendy/lib/distance-calculator.ts`

```typescript
interface DistanceCalculationResult {
  totalDistance: number
  method: 'google' | 'fallback'
  cached: boolean
  segments: DistanceSegment[]
  calculatedAt: Date
  isVipTransfer: boolean
}

class DistanceCalculator {
  // Main calculation method
  async calculateDistance(
    pickup: Location, 
    dropoff: Location, 
    isVip: boolean = false
  ): Promise<DistanceCalculationResult>
  
  // Google API integration
  private async calculateWithGoogle(
    pickup: Location, 
    dropoff: Location, 
    isVip: boolean
  ): Promise<DistanceCalculationResult>
  
  // Fallback calculation
  private calculateFallback(
    pickup: Location, 
    dropoff: Location, 
    isVip: boolean
  ): DistanceCalculationResult
}
```

### 3. Google Maps API Service

**File**: `petfendy/lib/google-maps-service.ts`

```typescript
interface GoogleMapsConfig {
  apiKey: string
  timeout: number
  retryAttempts: number
  rateLimitPerSecond: number
}

class GoogleMapsService {
  // Distance Matrix API call with consistent parameters
  async getDistance(origin: string, destination: string): Promise<number | null>
  
  // Batch distance calculation
  async getBatchDistances(
    origins: string[], 
    destinations: string[]
  ): Promise<number[][]>
  
  // Request deduplication
  private deduplicateRequests(requests: DistanceRequest[]): Promise<DistanceResponse[]>
}
```

## 📊 Data Models

### Location Interface
```typescript
interface Location {
  province: string
  district: string
  fullAddress?: string
}
```

### Distance Calculation Request
```typescript
interface DistanceRequest {
  pickup: Location
  dropoff: Location
  isVipTransfer: boolean
  forceRefresh?: boolean
}
```

### Distance Calculation Response
```typescript
interface DistanceResponse {
  success: boolean
  totalDistance: number
  method: 'google' | 'fallback'
  cached: boolean
  segments: DistanceSegment[]
  breakdown?: {
    ankaraToPickup?: number
    pickupToDropoff?: number
    dropoffToAnkara?: number
  }
  calculatedAt: Date
  expiresAt: Date
  error?: string
}
```

## 🔄 Calculation Logic

### VIP Transfer Calculations

1. **Ankara Departure** (Ankara → Destination)
   ```
   Distance = Google(Ankara → Destination) × 2
   Segments: [Ankara → Destination, Destination → Ankara]
   ```

2. **Ankara Arrival** (Origin → Ankara)
   ```
   Distance = Google(Origin → Ankara) × 2
   Segments: [Origin → Ankara, Ankara → Origin]
   ```

3. **Non-Ankara Routes** (Origin → Destination)
   ```
   Distance = Google(Ankara → Origin) + Google(Origin → Destination) + Google(Destination → Ankara)
   Segments: [Ankara → Origin, Origin → Destination, Destination → Ankara]
   ```

### Regular Transfer Calculations
```
Distance = Google(Ankara → Origin) + Google(Origin → Destination) + Google(Destination → Ankara)
Segments: [Ankara → Origin, Origin → Destination, Destination → Ankara]
```

## 🗄️ Caching Strategy

### Cache Key Format
```
distance:{province1}-{district1}:{province2}-{district2}:{vip|regular}
```

### Cache Levels

1. **Memory Cache** (In-process)
   - TTL: 1 hour
   - Size: 1000 entries
   - LRU eviction

2. **Redis Cache** (Distributed)
   - TTL: 24 hours (Google API results)
   - TTL: 7 days (Fallback results)
   - Persistent across deployments

3. **Database Cache** (Long-term)
   - Permanent storage for validated distances
   - Historical data for analytics
   - Backup for Redis failures

### Cache Invalidation
- Manual invalidation via admin interface
- Automatic expiration based on TTL
- Version-based invalidation for fallback data updates

## 🔧 Google Maps API Integration

### API Configuration
```typescript
const GOOGLE_MAPS_CONFIG = {
  baseUrl: 'https://maps.googleapis.com/maps/api/distancematrix/json',
  parameters: {
    units: 'metric',
    mode: 'driving',
    avoid: 'tolls', // Consistent routing
    departure_time: 'now', // Remove for consistency
    traffic_model: 'best_guess' // Remove for consistency
  },
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
}
```

### Consistent API Calls
- Remove traffic-dependent parameters
- Use fixed routing preferences
- Implement request deduplication
- Add comprehensive error handling

## 🛡️ Error Handling & Fallback

### Error Scenarios
1. **Google API Unavailable**
   - Use fallback calculation
   - Log API failure
   - Cache fallback result with shorter TTL

2. **API Rate Limit Exceeded**
   - Implement exponential backoff
   - Use cached results if available
   - Fall back to hardcoded distances

3. **Invalid Location Data**
   - Validate input parameters
   - Return error with suggestions
   - Log invalid requests

### Fallback Data Accuracy
- Validate fallback distances against Google API
- Update hardcoded distances quarterly
- Implement distance reasonableness checks

## 📈 Performance Optimizations

### Request Optimization
- Batch multiple distance requests
- Deduplicate concurrent identical requests
- Implement request queuing for rate limiting

### Response Optimization
- Compress API responses
- Stream large batch responses
- Implement progressive loading

### Caching Optimization
- Preload common routes
- Implement cache warming
- Use cache hierarchies (memory → Redis → DB)

## 🔍 Monitoring & Observability

### Metrics to Track
```typescript
interface DistanceMetrics {
  // Performance metrics
  calculationTime: number
  cacheHitRate: number
  apiSuccessRate: number
  
  // Business metrics
  totalCalculations: number
  uniqueRoutes: number
  vipTransferPercentage: number
  
  // Error metrics
  apiFailures: number
  fallbackUsage: number
  invalidRequests: number
}
```

### Logging Strategy
- Structured logging with correlation IDs
- Performance timing logs
- Error logs with context
- Business event logs

### Alerting
- API failure rate > 5%
- Cache hit rate < 80%
- Response time > 2 seconds
- Fallback usage > 20%

## 🧪 Testing Strategy

### Unit Tests
- Distance calculation functions
- Cache operations
- Google API service
- Fallback calculations

### Integration Tests
- End-to-end distance calculation
- Cache persistence
- API integration
- Error handling scenarios

### Property-Based Tests
```typescript
// Property: Same route always returns same distance
property('distance consistency', 
  fc.record({
    pickup: locationArbitrary,
    dropoff: locationArbitrary,
    isVip: fc.boolean()
  }),
  async (route) => {
    const result1 = await calculateDistance(route.pickup, route.dropoff, route.isVip)
    const result2 = await calculateDistance(route.pickup, route.dropoff, route.isVip)
    
    expect(result1.totalDistance).toBe(result2.totalDistance)
  }
)

// Property: VIP transfers follow correct calculation rules
property('vip transfer calculation', 
  fc.record({
    pickup: locationArbitrary,
    dropoff: locationArbitrary
  }),
  async (route) => {
    const vipResult = await calculateDistance(route.pickup, route.dropoff, true)
    const regularResult = await calculateDistance(route.pickup, route.dropoff, false)
    
    if (route.pickup.province === 'Ankara' || route.dropoff.province === 'Ankara') {
      // VIP should be exactly 2x for Ankara routes
      expect(vipResult.totalDistance).toBeLessThanOrEqual(regularResult.totalDistance)
    }
  }
)
```

## 🔒 Security Considerations

### API Key Security
- Store API key in environment variables
- Restrict API key by domain/IP
- Monitor API usage for anomalies
- Rotate API keys regularly

### Input Validation
- Sanitize location inputs
- Validate province/district combinations
- Prevent injection attacks
- Rate limit requests per user

### Data Privacy
- No personal data in distance calculations
- Log only necessary information
- Implement data retention policies
- Secure cache storage

## 📱 User Interface Enhancements

### Distance Breakdown Display
```typescript
interface DistanceBreakdownProps {
  segments: DistanceSegment[]
  totalDistance: number
  method: 'google' | 'fallback'
  isVipTransfer: boolean
}

// Show route segments to user
// Display calculation method
// Highlight VIP transfer logic
// Show cache status (for debugging)
```

### Loading States
- Show calculation progress
- Display estimated time
- Provide cancel option
- Show fallback notification

## 🔄 Migration Strategy

### Phase 1: Infrastructure
1. Implement cache service
2. Create distance calculator service
3. Add monitoring and logging
4. Deploy with feature flag

### Phase 2: API Enhancement
1. Enhance Google Maps integration
2. Implement request deduplication
3. Add comprehensive error handling
4. Update fallback data

### Phase 3: User Experience
1. Add distance breakdown UI
2. Implement loading states
3. Add calculation transparency
4. Deploy to production

### Phase 4: Optimization
1. Performance tuning
2. Cache optimization
3. Advanced monitoring
4. Analytics implementation

## 📊 Success Metrics

### Technical Metrics
- **Consistency**: 100% identical results for same routes
- **Performance**: < 2 seconds response time
- **Reliability**: > 99% uptime
- **Cache Efficiency**: > 80% hit rate

### Business Metrics
- **User Satisfaction**: Reduced pricing complaints
- **Conversion Rate**: Improved booking completion
- **Cost Efficiency**: Reduced API calls by 50%
- **Accuracy**: < 1% distance variance

## 🔗 API Specification

### POST /api/calculate-distance

**Request:**
```json
{
  "pickupProvince": "Ankara",
  "pickupDistrict": "Çankaya",
  "dropoffProvince": "Edirne",
  "dropoffDistrict": "Merkez",
  "isVipTransfer": false,
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "totalDistance": 577,
  "method": "google",
  "cached": true,
  "isVipTransfer": false,
  "segments": [
    {
      "from": "Ankara, Turkey",
      "to": "Edirne, Turkey",
      "distance": 577
    }
  ],
  "breakdown": {
    "ankaraToPickup": 0,
    "pickupToDropoff": 577,
    "dropoffToAnkara": 577
  },
  "calculatedAt": "2025-01-26T17:30:00Z",
  "expiresAt": "2025-01-27T17:30:00Z"
}
```

## 🎯 Correctness Properties

### Property 1: Distance Consistency
**Validates: Requirements AC-1.1, AC-1.2**
```typescript
// Same route parameters always return identical distance
∀ route: Route → 
  calculateDistance(route) = calculateDistance(route)
```

### Property 2: VIP Transfer Calculation
**Validates: Requirements AC-3.1, AC-3.2, AC-3.3**
```typescript
// VIP transfers follow correct multiplication rules
∀ route: Route where route.pickup.province = "Ankara" →
  calculateVipDistance(route) = calculateRegularDistance(route.pickup, route.pickup) × 2
```

### Property 3: Cache Consistency
**Validates: Requirements AC-1.3**
```typescript
// Cached results match fresh calculations
∀ route: Route →
  let fresh = calculateDistance(route, forceRefresh: true)
  let cached = calculateDistance(route, forceRefresh: false)
  fresh.totalDistance = cached.totalDistance
```

### Property 4: Fallback Accuracy
**Validates: Requirements AC-2.2**
```typescript
// Fallback calculations are within reasonable range of Google API
∀ route: Route →
  let google = calculateWithGoogle(route)
  let fallback = calculateFallback(route)
  |google.distance - fallback.distance| / google.distance < 0.15
```

This design ensures consistent, reliable, and performant distance calculations while maintaining transparency and user trust in the pricing system.