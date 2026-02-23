import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

interface PromptPayFormProps {
  amount: number;
  isProcessing: boolean;
  onConfirm: () => void;
}

export function PromptPayForm({ amount, isProcessing, onConfirm }: PromptPayFormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-xl flex flex-col items-center">
        <div className="w-48 h-48 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center mb-4">
          <QrCode className="w-32 h-32 text-slate-400" />
        </div>
        <p className="text-sm text-slate-600 text-center">
          Scan this QR code with your banking app to pay
        </p>
        <p className="text-2xl font-bold mt-2">{amount.toLocaleString()} Baht</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> After scanning and paying, click the button below to confirm your payment.
        </p>
      </div>

      <Button
        onClick={onConfirm}
        disabled={isProcessing}
        className="w-full h-14 bg-black text-white hover:bg-slate-800 text-lg font-bold rounded-lg disabled:opacity-50"
      >
        {isProcessing ? 'Confirming...' : 'I have completed payment'}
      </Button>
    </div>
  );
}
