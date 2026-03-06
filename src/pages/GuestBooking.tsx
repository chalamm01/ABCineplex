import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { bookingsApi } from '@/services/api';
import type { BookingDetail } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';

export default function GuestBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No booking token provided');
      setLoading(false);
      return;
    }
    bookingsApi.getGuestBooking(token)
      .then(setBooking)
      .catch(() => setError('Could not load booking. The token may have expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center bg-white/70 backdrop-blur-md">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error || !booking) {
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

  const seatLabels = booking.seats?.join(', ') ?? 'N/A';
  const startTime = booking.showtime_start
    ? new Date(booking.showtime_start).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen flex items-center justify-center p-6 bg-white/70 backdrop-blur-md">
        <Card className="border-none shadow-2xl bg-white max-w-md w-full">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-slate-500 mb-1 font-mono text-xs">#{booking.booking_id}</p>

            <div className="mt-6 mb-6 text-left space-y-3 bg-slate-50 rounded-xl p-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Movie</p>
                <p className="font-semibold text-slate-900">{booking.movie_title ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Show Time</p>
                <p className="font-semibold text-slate-900">{startTime}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Seats</p>
                <p className="font-semibold text-slate-900">{seatLabels}</p>
              </div>
              {booking.screen_name && (
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Hall</p>
                  <p className="font-semibold text-slate-900">{booking.screen_name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Paid</p>
                <p className="font-semibold text-slate-900">
                  {(booking.total_amount ?? 0).toLocaleString()} Baht
                </p>
              </div>
            </div>

            {/* QR code data */}
            {booking.qr_code_data && (
              <div className="mb-6 p-4 bg-white border-2 border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">Show this at the entrance</p>
                <p className="font-mono text-sm font-bold text-slate-800 break-all">{booking.qr_code_data}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-700">
              Create an account to track future bookings and earn loyalty points!
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/register')}
                className="w-full h-12 bg-black text-white hover:bg-slate-800 font-bold rounded-lg"
              >
                Create Account
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full h-12 font-semibold rounded-lg"
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
