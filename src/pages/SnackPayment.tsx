import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  PaymentMethodSelector,
  CardPaymentForm,
  PromptPayForm,
  type PaymentMethod,
} from '@/components/payment';
import { ordersApi } from '@/services/api';
import type { CartItem } from '@/providers/CartContext';
import { CheckCircle } from 'lucide-react';

interface SnackPaymentState {
  cart: CartItem[];
  total: number;
}

export default function SnackPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SnackPaymentState | null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Guard: redirect if no cart state
  if (!state?.cart?.length) {
    navigate('/cart');
    return null;
  }

  const { cart, total } = state;
  const pointsToEarn = Math.max(1, Math.floor(total / 10));

  const handlePay = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const items = cart
        .filter((i) => i.id)
        .map((i) => ({ product_id: i.id as string, quantity: i.quantity || 1 }));

      const result = await ordersApi.createOrder(items);
      setOrderId(result.id as unknown as string);
      setSuccess(true);
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-white/70 backdrop-blur-md">
          <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-violet-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 mb-4">
              Your snacks are being prepared. Pick them up at the counter before the show.
            </p>

            <div className="bg-violet-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-mono text-xs text-gray-700 truncate">{orderId}</p>
              <hr className="my-3" />
              {cart.map((item) => (
                <div key={item.name} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.name} ×{item.quantity || 1}</span>
                  <span className="font-medium text-violet-900">
                    {item.price * (item.quantity || 1)} THB
                  </span>
                </div>
              ))}
              <hr className="my-3" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-violet-900">{total} THB</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-sm text-green-700 font-medium">
              🎉 +{pointsToEarn} loyalty points earned from this order!
            </div>

            <button
              onClick={() => navigate('/movies')}
              className="w-full bg-violet-900 hover:bg-violet-800 text-white font-semibold py-3 rounded-xl"
            >
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment page ───────────────────────────────────────────────────────────
  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-8 py-10 bg-white/70 backdrop-blur-md flex justify-center">
        <div className="w-full max-w-4xl flex gap-10">

          {/* LEFT — Payment form */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-violet-900 mb-6">Payment</h1>

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
                onSubmit={handlePay}
              />
            ) : (
              <PromptPayForm
                amount={total}
                isProcessing={isProcessing}
                onConfirm={handlePay}
              />
            )}

            {error && (
              <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}
          </div>

          {/* RIGHT — Order summary */}
          <div className="w-80 bg-white rounded-2xl shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold mb-5">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-400 text-xs">{item.price} × {item.quantity || 1}</p>
                  </div>
                  <span className="font-semibold text-violet-900">
                    {item.price * (item.quantity || 1)} THB
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-bold text-lg mb-2">
              <span>Total</span>
              <span className="text-violet-900">{total} THB</span>
            </div>

            <p className="text-xs text-green-600 text-right">
              🎉 Earn ~{pointsToEarn} loyalty points
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
