# Frontend API Integration Guide

This document explains how to use the refactored API service layer in the ABCineplex frontend.

## Table of Contents
1. [Setup](#setup)
2. [Architecture](#architecture)
3. [Type Definitions](#type-definitions)
4. [Using API Services](#using-api-services)
5. [Error Handling](#error-handling)
6. [Examples](#examples)
7. [Best Practices](#best-practices)

---

## Setup

### Environment Configuration

1. **Create `.env.local` in the project root:**
```bash
VITE_API_URL=http://localhost:8000/api/v1
```

2. **For production, use `.env.production`:**
```bash
VITE_API_URL=https://your-api-domain.com/api/v1
```

The frontend automatically uses these environment variables. No additional setup is needed.

---

## Architecture

The API layer is organized by **domain** for maintainability and clarity:

```
src/
├── types/
│   └── api.ts              # All TypeScript type definitions (synchronized with backend schemas)
├── services/
│   └── api.ts              # API client organized by domain
└── hooks/
    └── useApi.ts           # React hooks for API state management
```

### Service Modules

The `api.ts` service exports these domain-specific API modules:

| Module | Purpose | Auth Required |
|--------|---------|---|
| `authApi` | Login, register, logout, token refresh | Varies |
| `userApi` | User profile, bookings, points, student verification | Yes |
| `movieApi` | Browse movies, get details, showtimes, quality score | No |
| `showtimeApi` | Showtime details, seat maps, time commitment | No |
| `seatApi` | Hold/release seats, check hold status | Yes |
| `bookingApi` | Create bookings, confirm payment, cancel, change seats/showtime | Yes |
| `paymentApi` | Initiate and confirm mock payments | Yes |
| `reviewApi` | Create, update, delete movie reviews | Yes |
| `publicApi` | Hero carousel, promotional events (public) | No |
| `adminApi` | Admin dashboard, manage movies/showtimes/users/CMS | Yes + Admin role |

---

## Type Definitions

All API types are centralized in `src/types/api.ts` and match the backend schemas:

### Key Type Categories

- **Auth**: `LoginRequest`, `LoginResponse`, `RegisterRequest`, `UserProfile`
- **Movies**: `Movie`, `MovieDetail`, `QualityScoreResponse`, `MovieShowtimesResponse`
- **Bookings**: `ReserveSeatRequest`, `ConfirmPaymentRequest`, `BookingDetail`
- **Admin**: `MovieCreate`, `ShowtimeCreate`, `AdminUserResponse`
- **Public**: `HeroSlide`, `Promotion`

### Using Types in Components

```typescript
import type { Movie, UserProfile } from '@/types/api';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
}

export function MovieCard({ movie, onSelect }: MovieCardProps) {
  // Component code...
}
```

---

## Using API Services

### Basic Pattern: Direct API Calls

For simple, non-critical API calls:

```typescript
import { movieApi } from '@/services/api';
import type { Movie } from '@/types/api';

// In an async function or useEffect
const movies = await movieApi.getMovies(1, 20, 'now_showing');
```

### Pattern: With React Hooks (Recommended)

Use the `useApi` hook for better state management:

```typescript
import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { movieApi } from '@/services/api';
import type { Movie } from '@/types/api';

export function MoviesPage() {
  const { data: movies, loading, error, execute } = useApi<Movie[]>(null);

  useEffect(() => {
    execute(() => movieApi.getMovies(1, 20, 'now_showing'));
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!movies) return null;

  return <div>{/* Render movies */}</div>;
}
```

### Pattern: Mutations (Create/Update/Delete)

Use `useApiMutation` for operations that modify data:

```typescript
import { useApiMutation } from '@/hooks/useApi';
import { bookingApi } from '@/services/api';
import type { ConfirmPaymentRequest, ConfirmPaymentResponse } from '@/types/api';

export function PaymentForm() {
  const { mutate, loading, error } = useApiMutation<ConfirmPaymentResponse, ConfirmPaymentRequest>();

  const handlePayment = async (request: ConfirmPaymentRequest) => {
    try {
      const result = await mutate(
        (payload) => bookingApi.confirmPayment(payload),
        request,
      );
      console.log('Payment confirmed:', result);
    } catch (err) {
      console.error('Payment failed:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handlePayment({ /* form data */ });
    }}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Error Handling

The API layer provides **standardized error handling** aligned with the backend:

### Error Response Format

```typescript
interface ErrorResponse {
  message: string;              // Human-readable error message
  errors?: Array<{
    field?: string;             // Field name (for validation errors)
    message: string;            // Specific error message
  }>;
}
```

### Catching and Handling Errors

```typescript
import { APIError } from '@/services/api';

try {
  const result = await bookingApi.reserveSeats({ /* ... */ });
} catch (error) {
  if (error instanceof APIError) {
    console.log(`HTTP ${error.status}:`, error.data?.message);

    // Handle specific errors
    if (error.status === 409) {
      // Seats already booked
    } else if (error.status === 403) {
      // Not authorized
    }
  }
}
```

### In Components with Hooks

The `useApi` and `useApiMutation` hooks automatically capture errors:

```typescript
const { error } = useApi();

if (error) {
  return (
    <div className="alert alert-error">
      <p>{error.message}</p>
      {error.errors && (
        <ul>
          {error.errors.map((err, idx) => (
            <li key={idx}>
              {err.field}: {err.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Examples

### Example 1: Browse Movies with Filtering

```typescript
import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { movieApi } from '@/services/api';
import type { MovieListResponse } from '@/types/api';

export function MovieBrowser() {
  const { data, loading, error, execute } = useApi<MovieListResponse>(null);

  useEffect(() => {
    execute(() =>
      movieApi.getMovies(
        1,           // page
        20,          // limit
        'now_showing', // status
        'Action',    // genre
        'Avatar'     // search
      )
    );
  }, [execute]);

  return (
    <div>
      {loading && <p>Loading movies...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <>
          <div>
            {data.movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <p>Page {data.page} of {Math.ceil(data.total / 20)}</p>
        </>
      )}
    </div>
  );
}
```

### Example 2: Book a Showtime

```typescript
import { useApiMutation } from '@/hooks/useApi';
import { bookingApi } from '@/services/api';
import type { ReserveSeatRequest, ReserveSeatResponse } from '@/types/api';

export function SeatSelector({ showtimeId, seatIds }: Props) {
  const { mutate, loading } = useApiMutation<ReserveSeatResponse, ReserveSeatRequest>();

  const handleReserve = async () => {
    try {
      const result = await mutate(
        payload => bookingApi.reserveSeats(payload),
        {
          showtime_id: showtimeId,
          seat_ids: seatIds,
          price_per_seat: 180,
        }
      );

      if (result.success) {
        // Redirect to payment with booking_id
        window.location.href = `/payment/${result.booking_id}`;
      }
    } catch (error) {
      alert(`Failed to reserve seats: ${error.message}`);
    }
  };

  return (
    <button onClick={handleReserve} disabled={loading}>
      {loading ? 'Reserving...' : 'Reserve Seats'}
    </button>
  );
}
```

### Example 3: Admin: Create a Movie

```typescript
import { useApiMutation } from '@/hooks/useApi';
import { adminApi } from '@/services/api';
import type { MovieCreate, Movie } from '@/types/api';

export function CreateMovieForm() {
  const { mutate, loading, error } = useApiMutation<Movie, MovieCreate>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const movieData: MovieCreate = {
      title: formData.get('title') as string,
      release_date: formData.get('release_date') as string,
      duration_minutes: parseInt(formData.get('duration_minutes') as string),
      // ... other fields
    };

    try {
      const newMovie = await mutate(
        payload => adminApi.createMovie(payload),
        movieData
      );
      alert(`Movie created: ${newMovie.title}`);
    } catch (err) {
      console.error('Failed to create movie:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error.message}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Movie'}
      </button>
    </form>
  );
}
```

### Example 4: Get Movie Quality Score (RAQS)

```typescript
import { useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { movieApi } from '@/services/api';
import type { QualityScoreResponse } from '@/types/api';

export function MovieQualityBadge({ movieId }: { movieId: number }) {
  const { data: quality } = useApi<QualityScoreResponse>(null);

  useEffect(() => {
    movieApi.getQualityScore(movieId)
      .then(data => {
        // Update state...
      });
  }, [movieId]);

  if (!quality) return null;

  return (
    <div className="quality-badge">
      <span className="score">{quality.risk_adjusted_quality_score}/10</span>
      <div className="breakdown">
        <p>Base Rating: {quality.score_breakdown.base_rating}</p>
        <p>Confidence: {(quality.score_breakdown.confidence_weight * 100).toFixed(0)}%</p>
        <p>Recency: {(quality.score_breakdown.recency_factor * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
}
```

---

## Best Practices

### 1. **Always Use Types**
```typescript
// ✅ Good
import type { Movie } from '@/types/api';
const movies: Movie[] = [];

// ❌ Avoid
const movies: any[] = [];
```

### 2. **Organize Imports**
```typescript
// ✅ Good: Types first, then services
import type { User, Movie } from '@/types/api';
import { userApi, movieApi } from '@/services/api';

// ❌ Avoid: Mixed imports
import { userApi, type User } from '@/services/api';
```

### 3. **Use Hooks for State Management**
```typescript
// ✅ Recommended
const { data, loading, error, execute } = useApi<T>();

// ⚠️ Use direct calls only for fire-and-forget operations
void movieApi.getMovies().catch(console.error);
```

### 4. **Handle Errors Consistently**
```typescript
// ✅ Good
try {
  const result = await apiCall();
} catch (error) {
  if (error instanceof APIError && error.status === 409) {
    // Handle conflict
  } else {
    console.error('API error:', error);
  }
}

// ❌ Avoid
await apiCall();  // No error handling
```

### 5. **Avoid Hardcoding IDs**
```typescript
// ✅ Good
movieApi.getQualityScore(movieId);  // Dynamic ID

// ❌ Avoid
movieApi.getQualityScore(123);  // Hardcoded
```

### 6. **Set Proper Loading States**
```typescript
// ✅ Good
{loading ? <Spinner /> : <Content data={data} />}

// ❌ Avoid
{!data ? <Spinner /> : <Content data={data} />}  // Might show spinner even on error
```

### 7. **Cache When Appropriate**
```typescript
// ✅ Use memoization for expensive calls
const memoizedMovies = useMemo(() =>
  movieApi.getMovies(page, limit),
  [page, limit]
);
```

---

## Common Endpoints Quick Reference

```typescript
// Movies
movieApi.getMovies(page, limit, status, genre, search)
movieApi.getMovieById(id)
movieApi.getMovieShowtimes(id, dateFrom, days)
movieApi.getQualityScore(id)

// Bookings
bookingApi.reserveSeats({ showtime_id, seat_ids, price_per_seat })
bookingApi.confirmPayment({ booking_id, payment_intent_id })
bookingApi.cancelBooking(id)

// User Profile
userApi.getProfile()
userApi.updateProfile({ first_name, last_name, ... })
userApi.getBookings(status, page, limit)
userApi.getPoints()

// Authentication
authApi.login({ email, password })
authApi.register({ email, password, first_name, ... })
authApi.logout()

// Admin (require auth + admin role)
adminApi.createMovie(movieData)
adminApi.listUsers(search, skip, limit)
adminApi.getDashboard()
```

---

## Troubleshooting

### API calls return 401 Unauthorized
- **Cause**: Token not stored or expired
- **Solution**: Ensure token is saved to localStorage after login: `localStorage.setItem('token', token)`

### CORS errors
- **Cause**: API_BASE_URL is wrong or API doesn't allow origin
- **Solution**: Check `.env.local` VITE_API_URL matches your API server

### Types don't match backend responses
- **Cause**: Backend schema changed but types weren't updated
- **Solution**: Regenerate types in `src/types/api.ts` from backend `app/schemas/`

### Mutations not updating UI
- **Cause**: Not invalidating or refetching data
- **Solution**: Use `execute()` hook method to refetch after mutations

---

*Last Updated: February 2026*
*API Version: 1.0*
