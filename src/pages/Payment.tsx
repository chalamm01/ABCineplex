import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PaymentMethodSelector,
  CardPaymentForm,
  PromptPayForm,
  BookingSummary,
  type PaymentMethod,
  type BookingDetails,
} from '@/components/payment';
import { useCountdown } from '@/hooks/useCountdown';
import { bookingsApi, paymentsApi, showtimesApi, userApi, ordersApi } from '@/services/api';
import type { CartItem } from '@/providers/CartContext';
import { Zap, CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner'

interface SnackPaymentState {
  cart: CartItem[];
  total: number;
}


export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Snack-order mode: cart passed via router state
  const snackState = location.state as SnackPaymentState | null;
  const isSnackMode = !!(snackState?.cart?.length);

  const bookingId = searchParams.get('booking_id');
  const seatsParam = searchParams.get('seats');
  const totalParam = searchParams.get('total');
  const deadlineParam = searchParams.get('deadline');

  // Snack order result id
  const [snackOrderId, setSnackOrderId] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Points redemption state
  const [userPoints, setUserPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Booking data state
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<Date>(
    deadlineParam ? new Date(deadlineParam) : new Date(Date.now() + 5 * 60 * 1000)
  );

  // Countdown hook
  const { formatted: countdown, isExpired } = useCountdown({
    deadline: paymentDeadline,
    onExpire: useCallback(() => {
      if (!paymentSuccess) {
        alert('Payment time expired. Your reservation has been cancelled.');
        navigate('/');
      }
    }, [navigate, paymentSuccess]),
  });

  // Fetch booking details — all data comes from the booking endpoint
  useEffect(() => {
    // Snack mode: populate details directly from cart state
    if (isSnackMode) {
      const { cart, total } = snackState as SnackPaymentState;
      setBookingDetails({
        movieTitle: 'Snack Order',
        posterUrl: '',
        cinemaName: 'Counter Pickup',
        showTime: 'Pick up before show',
        endTime: 'N/A',
        seats: cart.map((i) => `${i.name} ×${i.quantity || 1}`),
        subtotal: total,
        discount: 0,
        discountLabel: undefined,
        total,
      });
      try {
        userApi.getProfile().then((p) => setUserPoints(p.reward_points ?? 0)).catch(() => {});
      } catch { /* best-effort */ }
      setLoading(false);
      return;
    }

    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    bookingsApi.getBooking(bookingId)
      .then(async (booking) => {
        if (booking.payment_deadline) {
          setPaymentDeadline(new Date(booking.payment_deadline));
        }
        const seats = booking.seats?.length
          ? booking.seats
          : seatsParam?.split(',') ?? [];
        const total = booking.total_amount || Number(totalParam) || 0;
        const start = booking.showtime_start ? new Date(booking.showtime_start) : null;

        // EP10-UC003: fetch estimated end time from showtime detail
        let endTimeStr = 'N/A';
        if (booking.showtime_id) {
          try {
            const showtimeDetail = await showtimesApi.getShowtimeById(booking.showtime_id);
            const endIso = showtimeDetail.estimated_end_with_credits ?? showtimeDetail.end_time;
            if (endIso) {
              endTimeStr = new Date(endIso).toLocaleString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              });
            }
          } catch {
            // best-effort; leave as N/A
          }
        }

        setBookingDetails({
          movieTitle: booking.movie_title || 'Movie',
          posterUrl: booking.poster_url || '',
          cinemaName: booking.screen_name || 'ABCineplex',
          showTime: start
            ? start.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'N/A',
          endTime: endTimeStr,
          seats,
          subtotal: total,
          discount: 0,
          discountLabel: undefined,
          total,
        });

        // Fetch user's loyalty points for redemption
        try {
          const profile = await userApi.getProfile();
          setUserPoints(profile.reward_points ?? 0);
        } catch {
          // best-effort
        }
      })
      .catch(() => setError('Failed to load booking details'))
      .finally(() => setLoading(false));
  }, [bookingId, seatsParam, totalParam]);

  const handlePayment = async () => {
    // ── Snack mode ─────────────────────────────────────────────────────────
    if (isSnackMode) {
      try {
        setIsProcessing(true);
        const items = (snackState as SnackPaymentState).cart
          .filter((i) => i.id)
          .map((i) => ({ product_id: i.id as string, quantity: i.quantity || 1 }));
        const result = await ordersApi.createOrder(items);
        setSnackOrderId((result as unknown as { id: string }).id);
        setPaymentSuccess(true);
      } catch {
        alert('Order failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // ── Booking mode ───────────────────────────────────────────────────────
    if (!bookingId) {
      alert('No booking ID provided');
      return;
    }

    try {
      setIsProcessing(true);

      const pointsDiscount = redeemPoints
        ? Math.min(userPoints, Math.floor((bookingDetails?.subtotal ?? 0) * 0.5))
        : 0;

      // Map UI payment method to backend mock method (§5.7)
      const mockMethod = paymentMethod === 'card' ? 'mock_card' : 'mock_qr';

      // Step 1: Initiate mock payment
      const initiated = await paymentsApi.initiate({
        booking_id: bookingId,
        payment_method: mockMethod,
        mock_should_succeed: true,
      });

      // Simulate a short processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 2: Confirm mock payment
      const result = await paymentsApi.confirm(initiated.payment_id, true, pointsDiscount);

      if (result.status === 'success') {
        setPaymentSuccess(true);
      } else {
        alert(`Payment failed: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId) {
      navigate('/');
      return;
    }

    const shouldCancel = confirm('Are you sure you want to cancel this booking?');
    if (!shouldCancel) return;

    try {
      if (bookingId) await bookingsApi.cancelBooking(bookingId);
      navigate('/');
    } catch (err) {
      console.error('Cancel error:', err);
      navigate('/');
    }
  };

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center bg-white/70 backdrop-blur-md">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center bg-white/70 backdrop-blur-md">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">{error || 'Booking not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-black text-white rounded-lg"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment success screen
  if (paymentSuccess) {
    // Snack success screen
    if (isSnackMode) {
      const pointsEarned = Math.max(1, Math.floor((snackState?.total ?? 0) / 10));
      return (
        <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center p-6 bg-white/70 backdrop-blur-md">
          <Card className="border-none shadow-2xl bg-white max-w-md w-full">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
              {snackOrderId && <p className="text-slate-500 mb-2 font-mono text-xs">Order #{snackOrderId}</p>}
              <p className="text-slate-600 mb-4">Your snacks are being prepared. Pick them up at the counter before the show.</p>
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-sm text-green-700 font-medium">
                🎉 +{pointsEarned} loyalty points earned!
              </div>
              <Button
                onClick={() => navigate('/movies')}
                className="w-full h-12 bg-black text-white hover:bg-slate-800 font-bold rounded-lg"
              >
                Back to Movies
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      );
    }

    // Booking success screen
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen flex items-center justify-center p-6 bg-white/70 backdrop-blur-md">
        <Card className="border-none shadow-2xl bg-white max-w-md w-full">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-2">Booking ID: #{bookingId}</p>
            <p className="text-slate-600 mb-8">
              Your tickets for <span className="font-semibold">{bookingDetails.movieTitle}</span> have been confirmed.
              Seats: <span className="font-semibold">{bookingDetails.seats.join(', ')}</span>
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/homepage')}
                className="w-full h-12 bg-black text-white hover:bg-slate-800 font-bold rounded-lg"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center bg-white/70 backdrop-blur-md">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">Payment time has expired. Your reserved seats have been released.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-black text-white rounded-lg"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen flex items-center justify-center p-6 bg-white/70 backdrop-blur-md">

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section: Payment Method */}
        <Card className="border-none shadow-xl bg-white/90">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight uppercase">Select Payment Method</h2>
              <button
                onClick={handleCancel}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* EP-25: Redeem Loyalty Points */}
            {userPoints > 0 && bookingDetails && (() => {
              const maxDiscount = Math.min(userPoints, Math.floor(bookingDetails.subtotal * 0.5));
              return (
                <div className="mb-6 p-4 bg-violet-50 border-2 border-violet-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-violet-900">Redeem Loyalty Points</p>
                      <p className="text-xs text-violet-600 mt-0.5">
                        You have <strong>{userPoints.toLocaleString()} pts</strong>. Redeem {maxDiscount} pts = -{maxDiscount} THB
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={redeemPoints}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRedeemPoints(checked);
                          setBookingDetails((prev) => {
                            if (!prev) return prev;
                            const discount = checked ? maxDiscount : 0;
                            return {
                              ...prev,
                              discount,
                              discountLabel: checked ? `${maxDiscount} loyalty pts` : undefined,
                              total: prev.subtotal - discount,
                            };
                          });
                        }}
                        className="w-5 h-5 accent-violet-700"
                      />
                      <span className="text-sm font-medium text-violet-900">Use points</span>
                    </label>
                  </div>
                </div>
              );
            })()}

            {/* Mock Payment Button - Quick checkout for testing */}
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-3">Quick Checkout (Demo)</p>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Simulate Payment - {bookingDetails.total.toLocaleString()} Baht
                  </span>
                )}
              </Button>
              <p className="text-xs text-emerald-600 mt-2 text-center">Click to instantly confirm your booking</p>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">or pay with</span>
              </div>
            </div>

            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />

            {paymentMethod === 'card' ? (
              <CardPaymentForm
                email={email}
                cardNumber={cardNumber}
                expiration={expiration}
                cvc={cvc}
                saveInfo={saveInfo}
                isProcessing={isProcessing}
                onEmailChange={setEmail}
                onCardNumberChange={setCardNumber}
                onExpirationChange={setExpiration}
                onCvcChange={setCvc}
                onSaveInfoChange={setSaveInfo}
                onSubmit={handlePayment}
              />
            ) : (
              <PromptPayForm
                amount={bookingDetails.total}
                isProcessing={isProcessing}
                onConfirm={handlePayment}
              />
            )}
          </CardContent>
        </Card>

        {/* Right Section: Booking Summary */}
        <Card className="border-none shadow-xl bg-white/90">
          <CardContent className="p-8 h-full">
            <BookingSummary booking={bookingDetails} countdown={countdown} />
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
