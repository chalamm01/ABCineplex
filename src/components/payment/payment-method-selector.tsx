import { CreditCard, QrCode } from 'lucide-react';

export type PaymentMethod = 'card' | 'promptpay';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        type="button"
        onClick={() => onMethodChange('card')}
        className={`flex-1 border-2 rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors ${
          selectedMethod === 'card'
            ? 'border-slate-900 bg-slate-100'
            : 'border-transparent bg-slate-200/50 hover:bg-slate-200'
        }`}
      >
        <CreditCard className={`w-6 h-6 ${selectedMethod === 'card' ? 'text-slate-900' : 'text-slate-500'}`} />
        <span className={`text-sm font-semibold ${selectedMethod === 'card' ? 'text-slate-900' : 'text-slate-500'}`}>
          Card
        </span>
      </button>
      <button
        type="button"
        onClick={() => onMethodChange('promptpay')}
        className={`flex-1 border-2 rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors ${
          selectedMethod === 'promptpay'
            ? 'border-slate-900 bg-slate-100'
            : 'border-transparent bg-slate-200/50 hover:bg-slate-200'
        }`}
      >
        <QrCode className={`w-6 h-6 ${selectedMethod === 'promptpay' ? 'text-slate-900' : 'text-slate-500'}`} />
        <span className={`text-sm font-semibold ${selectedMethod === 'promptpay' ? 'text-slate-900' : 'text-slate-500'}`}>
          PromptPay
        </span>
      </button>
    </div>
  );
}
