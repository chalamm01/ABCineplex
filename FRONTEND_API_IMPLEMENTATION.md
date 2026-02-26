# Frontend API Implementation Guide

## Overview

This guide shows how to properly implement the new refactored API service layer across all frontend pages.

---

## Core Patterns

### Pattern 1: Data Fetching with useApi Hook

```typescript
import { useApi } from '@/hooks/useApi'
import { movieApi } from '@/services/api'
import type { Movie } from '@/types/api'

export function MovieList() {
  // Automatically manages loading, error, and data states
  const { data: movies, loading, error, execute } = useApi<Movie[]>(null)

  useEffect(() => {
    execute(() => movieApi.getMovies(1, 20, 'now_showing'))
  }, [execute])

  if (loading) return <Spinner />
  if (error) return <ErrorMessage message={error.message} />

  return (
    <div>
      {movies?.map(movie => <MovieCard key={movie.id} movie={movie} />)}
    </div>
  )
}
```

### Pattern 2: Mutations with useApiMutation Hook

```typescript
import { useApiMutation } from '@/hooks/useApi'
import { bookingApi } from '@/services/api'
import type { ReserveSeatRequest, ReserveSeatResponse } from '@/types/api'

export function ReserveButton() {
  const { mutate, loading, error } = useApiMutation<ReserveSeatResponse, ReserveSeatRequest>()

  const handleReserve = async () => {
    try {
      const result = await mutate(
        payload => bookingApi.reserveSeats(payload),
        { showtime_id: 123, seat_ids: [1, 2, 3], price_per_seat: 180 }
      )
      if (result.success) {
        navigate(`/payment/${result.booking_id}`)
      }
    } catch (err) {
      console.error('Reservation failed:', err)
    }
  }

  return (
    <>
      <button onClick={handleReserve} disabled={loading}>
        {loading ? 'Reserving...' : 'Reserve Seats'}
      </button>
      {error && <p>{error.message}</p>}
    </>
  )
}
```

### Pattern 3: Direct API Calls (Fire and Forget)

```typescript
// For non-critical operations that don't need loading/error states
void movieApi.getMovies().catch(err => console.error(err))
```

---

## Page-by-Page Implementation

### 1. Home.tsx - Homepage with Movie Carousel

**What it should do:**
- Fetch hero carousel items
- Fetch now-showing movies
- Fetch upcoming movies
- Fetch promotions

**Implementation:**

```typescript
import { useApi } from '@/hooks/useApi'
import { movieApi, publicApi } from '@/services/api'
import type { Movie, HeroSlide, Promotion } from '@/types/api'

export default function Home() {
  const { data: slides } = useApi<HeroSlide[]>([])
  const { data: nowShowing } = useApi<Movie[]>([])
  const { data: upcoming } = useApi<Movie[]>([])
  const { data: promotions } = useApi<Promotion[]>([])

  useEffect(() => {
    // Fetch carousel
    publicApi.getHeroCarousel()
      .then(data => /* update state */)
      .catch(err => console.error(err))

    // Fetch movies
    movieApi.getMovies(1, 10, 'now_showing')
      .then(data => /* update state */)
      .catch(err => console.error(err))

    movieApi.getMovies(1, 10, 'upcoming')
      .then(data => /* update state */)
      .catch(err => console.error(err))

    // Fetch promotions
    publicApi.getPromoEvents()
      .then(data => /* update state */)
      .catch(err => console.error(err))
  }, [])

  // ... rest of component
}
```

### 2. Login.tsx - User Authentication

**What it should do:**
- Submit login credentials
- Store JWT token
- Redirect on success

**Implementation:**

```typescript
import { useApiMutation } from '@/hooks/useApi'
import { authApi } from '@/services/api'
import type { LoginRequest, LoginResponse } from '@/types/api'

export default function Login() {
  const { mutate, loading, error } = useApiMutation<LoginResponse, LoginRequest>()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const result = await mutate(
        payload => authApi.login(payload),
        { email: formData.email, password: formData.password }
      )

      // Store token
      localStorage.setItem('token', result.token)

      // Navigate to home
      navigate('/')
    } catch (err) {
      // Error already in `error` state
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <p className="error">{error.message}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

### 3. Register.tsx - User Registration

**Similar to Login, but uses `authApi.register()`**

```typescript
const { mutate } = useApiMutation<RegisterResponse, RegisterRequest>()

await mutate(
  payload => authApi.register(payload),
  { email, password, first_name, last_name, ... }
)
```

### 4. MovieBooking.tsx - Select Movie, Showtime, Seats

**What it should do:**
- Fetch movie details
- Fetch showtimes for movie
- Fetch seat map
- Hold seats (5-minute TTL)
- Show RAQS score
- Show TTC for each showtime

**Key API Calls:**

```typescript
// Get movie details with RAQS
const movieDetail = await movieApi.getMovieById(movieId)

// Get showtimes grouped by date
const showtimes = await movieApi.getMovieShowtimes(movieId, dateFrom, 7)

// Get quality score (RAQS)
const quality = await movieApi.getQualityScore(movieId)

// Get seat map
const seatMap = await showtimeApi.getSeats(showtimeId)

// Get time commitment (TTC)
const ttc = await showtimeApi.getTimeCommitment(showtimeId, travelMinutes)

// Hold seats for 5 minutes
const hold = await seatApi.holdSeats(showtimeId, [1, 2, 3])

// Release hold if user cancels
await seatApi.releaseHold(showtimeId, hold.hold_id)

// Check hold status (countdown timer)
const holdStatus = await seatApi.getHoldStatus(showtimeId, holdId)
```

### 5. Payment.tsx - Process Booking Payment

**What it should do:**
- Display booking summary
- Show seat hold countdown
- Process mock payment
- Create booking on success

**Key API Calls:**

```typescript
import { bookingApi, paymentApi } from '@/services/api'

// Create booking after payment
const booking = await bookingApi.reserveSeats({
  showtime_id: showtimeId,
  seat_ids: seatIds,
  price_per_seat: price
})

// Initiate payment
const payment = await paymentApi.initiatePayment({
  booking_id: booking.booking_id,
  payment_method: 'mock_card',
  mock_should_succeed: true
})

// Confirm payment
const result = await paymentApi.confirmPayment(payment.payment_id, true)

if (result.status === 'success') {
  // Show confirmation with QR code
  navigate(`/confirmation/${result.booking_id}`)
}
```

### 6. BookingHistory.tsx - View Past Bookings

**What it should do:**
- Fetch user's bookings
- Allow seat/showtime changes
- Display QR codes

**Key API Calls:**

```typescript
import { userApi, bookingApi } from '@/services/api'

// Get bookings list
const { bookings } = await userApi.getBookings('confirmed', 1, 10)

// Get specific booking details
const booking = await bookingApi.getBookingById(bookingId)

// Change showtime (self-service)
await bookingApi.changeShowtime(bookingId, newShowtimeId, newSeatIds)

// Change seat (self-service)
await bookingApi.changeSeat(bookingId, newSeatIds)

// Cancel booking
await bookingApi.cancelBooking(bookingId)
```

### 7. Profile.tsx - User Profile Management

**Already updated above** ✅

**Key API Calls:**

```typescript
import { userApi } from '@/services/api'

// Get user profile
const profile = await userApi.getProfile()

// Update profile
const updated = await userApi.updateProfile({
  first_name: 'John',
  last_name: 'Doe',
  phone: '0812345678'
})

// Get bookings
const { bookings } = await userApi.getBookings()

// Get points & transactions
const points = await userApi.getPoints()
```

### 8. Reviews.tsx - Movie Reviews

**What it should do:**
- List movie reviews
- Create new review
- Edit own review
- Delete own review

**Key API Calls:**

```typescript
import { reviewApi } from '@/services/api'

// Get reviews for movie
const reviews = await reviewApi.getMovieReviews(movieId)

// Create review
await reviewApi.createReview(movieId, {
  rating: 4.5,
  review_text: 'Great movie!'
})

// Update review
await reviewApi.updateReview(reviewId, {
  rating: 5.0,
  review_text: 'Actually amazing!'
})

// Delete review
await reviewApi.deleteReview(reviewId)
```

### 9. Admin.tsx - Admin Dashboard

**What it should do:**
- Manage movies (CRUD)
- Manage showtimes (CRUD)
- Manage users
- View dashboard stats
- Manage CMS content

**Key API Calls:**

```typescript
import { adminApi } from '@/services/api'

// Dashboard
const stats = await adminApi.getDashboard()

// Movies
const movies = await adminApi.listMovies()
await adminApi.createMovie(movieData)
await adminApi.updateMovie(movieId, updates)
await adminApi.deleteMovie(movieId)

// Showtimes
await adminApi.createShowtime(showtimeData)
await adminApi.updateShowtime(showtimeId, updates)
await adminApi.deleteShowtime(showtimeId)

// Users
const users = await adminApi.listUsers(search, 0, 50)
await adminApi.updateUser(userId, { is_admin: true, ... })

// Hero carousel
await adminApi.createHeroSlide(slideData)
await adminApi.updateHeroSlide(slideId, updates)
await adminApi.deleteHeroSlide(slideId)

// Promotions
await adminApi.createPromotion(promoData)
await adminApi.updatePromotion(promoId, updates)
await adminApi.deletePromotion(promoId)
```

### 10. Snacks.tsx - Snack Pre-order

**What it should do:**
- Show snack menu
- Add snacks to order
- Display with booking

**Key API Calls:**

```typescript
// Note: Snack endpoints not yet in main API
// But snacks can be added during booking via snack_orders table
// See BookingHistory for how to modify order before confirmation
```

---

## Error Handling Best Practices

### 1. Display User-Friendly Errors

```typescript
{error && (
  <Alert className="alert-error">
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
  </Alert>
)}
```

### 2. Handle Specific Errors

```typescript
try {
  await bookingApi.reserveSeats(data)
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 409) {
      // Seats already booked
      showMessage('Some seats are no longer available')
    } else if (error.status === 400) {
      // Validation error
      showMessage(error.data?.message || 'Invalid request')
    } else if (error.status === 401) {
      // Not authenticated
      navigate('/login')
    }
  }
}
```

### 3. Retry Logic

```typescript
const retry = async <T,>(fn: () => Promise<T>, attempts = 3): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (attempts > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return retry(fn, attempts - 1)
    }
    throw error
  }
}

// Usage
const result = await retry(() => movieApi.getMovies())
```

---

## Loading States

### 1. Skeleton Loading

```typescript
if (loading) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}
```

### 2. Spinner

```typescript
if (loading) return <Spinner />
```

### 3. Disabled Button

```typescript
<button disabled={loading}>
  {loading ? 'Loading...' : 'Click Me'}
</button>
```

---

## Common Gotchas

### ❌ Don't: Call API directly without hooks

```typescript
// Bad - no loading state, no error handling
const [movies, setMovies] = useState([])
useEffect(() => {
  movieApi.getMovies().then(setMovies).catch(console.error)
}, [])
```

### ✅ Do: Use the hooks

```typescript
// Good - automatic loading/error states
const { data: movies } = useApi<Movie[]>([])
useEffect(() => {
  execute(() => movieApi.getMovies())
}, [execute])
```

---

### ❌ Don't: Store token in state

```typescript
// Bad - lost on refresh
const [token, setToken] = useState('')
```

### ✅ Do: Store in localStorage

```typescript
// Good - persists across refreshes
localStorage.setItem('token', token)
const token = localStorage.getItem('token')
```

---

### ❌ Don't: Trust unverified API responses

```typescript
// Bad - no type safety
const data = await fetch(url).then(r => r.json())
```

### ✅ Do: Use typed API service

```typescript
// Good - type-safe with validation
const data = await movieApi.getMovies() // Returns typed response
```

---

## Testing API Integration

```typescript
// Test with mock data
const mockMovies: Movie[] = [
  { id: 1, title: 'Movie 1', ... }
]

// Use in component
<MovieList movies={mockMovies} />
```

---

## Summary

✅ **Use the new API service layer for all calls**
✅ **Use useApi/useApiMutation hooks for state management**
✅ **Store tokens in localStorage**
✅ **Display error messages to users**
✅ **Show loading states during async operations**
✅ **Type everything with TypeScript**
✅ **Handle errors gracefully**

❌ **Don't call API directly in useEffect**
❌ **Don't store sensitive data in state**
❌ **Don't ignore error responses**
❌ **Don't hardcode API URLs**

