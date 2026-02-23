import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface CardPaymentFormProps {
  email: string;
  cardNumber: string;
  expiration: string;
  cvc: string;
  saveInfo: boolean;
  isProcessing: boolean;
  onEmailChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onExpirationChange: (value: string) => void;
  onCvcChange: (value: string) => void;
  onSaveInfoChange: (value: boolean) => void;
  onSubmit: () => void;
}

export function CardPaymentForm({
  email,
  cardNumber,
  expiration,
  cvc,
  saveInfo,
  isProcessing,
  onEmailChange,
  onCardNumberChange,
  onExpirationChange,
  onCvcChange,
  onSaveInfoChange,
  onSubmit,
}: CardPaymentFormProps) {
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19);
  };

  const formatExpiration = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCardNumberChange(formatCardNumber(e.target.value));
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onExpirationChange(formatExpiration(e.target.value));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
    onCvcChange(cleaned);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-slate-600">Email</label>
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-12 border-slate-300"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase text-slate-600">Card number</label>
        <div className="relative">
          <Input
            placeholder="1234 1234 1234 1234"
            value={cardNumber}
            onChange={handleCardNumberChange}
            className="h-12 border-slate-300"
          />
          <div className="absolute right-3 top-3 flex gap-1 grayscale opacity-70">
            <div className="w-6 h-4 bg-blue-800 rounded-sm" />
            <div className="w-6 h-4 bg-red-600 rounded-sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-600">Expiration</label>
          <Input
            placeholder="MM/YY"
            value={expiration}
            onChange={handleExpirationChange}
            className="h-12 border-slate-300"
            maxLength={5}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-slate-600">CVC</label>
          <Input
            placeholder="CVC"
            value={cvc}
            onChange={handleCvcChange}
            className="h-12 border-slate-300"
            maxLength={4}
          />
        </div>
      </div>

      <div className="flex items-start space-x-3 bg-slate-50 p-4 rounded-lg">
        <Checkbox
          id="save-info"
          checked={saveInfo}
          onCheckedChange={(checked) => onSaveInfoChange(checked === true)}
          className="mt-1 border-slate-400"
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="save-info"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Securely save my information for one-click checkout
          </label>
          <p className="text-xs text-muted-foreground">Remember my choices</p>
        </div>
      </div>

      <Button
        onClick={onSubmit}
        disabled={isProcessing || !email || !cardNumber || !expiration || !cvc}
        className="w-full h-14 bg-black text-white hover:bg-slate-800 text-lg font-bold rounded-lg mt-4 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </div>
  );
}
