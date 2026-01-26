'use client';

import { type PaymentProvider } from '@/lib/subscription';

interface PaymentMethodSelectorProps {
  selected: PaymentProvider;
  onSelect: (provider: PaymentProvider) => void;
  className?: string;
}

export function PaymentMethodSelector({
  selected,
  onSelect,
  className = '',
}: PaymentMethodSelectorProps) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {/* Stripe Option */}
      <button
        type="button"
        onClick={() => onSelect('stripe')}
        className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
          selected === 'stripe'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {/* Stripe Logo */}
          <svg className="h-5 w-12" viewBox="0 0 60 25" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M60 12.5C60 8.3 57.1 5.3 53.3 5.3C49.5 5.3 46.3 8.3 46.3 12.6C46.3 17.6 49.9 20 53.6 20C55.5 20 56.9 19.5 58 18.8V15.5C56.9 16.1 55.7 16.5 54.1 16.5C52.6 16.5 51.3 16 51.1 14.2H59.9C59.9 14 60 13.1 60 12.5ZM51 11.3C51 9.6 52 8.7 53.3 8.7C54.5 8.7 55.5 9.6 55.5 11.3H51Z"
              fill={selected === 'stripe' ? '#fff' : '#a1a1aa'}
            />
            <path
              d="M40 5.6L44.6 5.6V19.7H40V5.6Z"
              fill={selected === 'stripe' ? '#fff' : '#a1a1aa'}
            />
            <path
              d="M35.7 6.7L35.4 5.6H31.2V19.7H35.7V10.2C36.7 8.9 38.4 9.1 39 9.3V5.6C38.3 5.3 36.7 5 35.7 6.7Z"
              fill={selected === 'stripe' ? '#fff' : '#a1a1aa'}
            />
            <path
              d="M26.4 2.3L22 3.2V6.6L26.4 5.7V2.3Z"
              fill={selected === 'stripe' ? '#fff' : '#a1a1aa'}
            />
            <path
              d="M22 5.6H26.4V19.7H22V5.6Z"
              fill={selected === 'stripe' ? '#fff' : '#a1a1aa'}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18.7 7.3C17.9 6.5 16.5 5.3 14 5.3C10.4 5.3 7.2 8.3 7.2 12.6C7.2 17.5 10.6 20 13.7 20C15.8 20 17.1 19.2 18 18.2V19.7H22.4V0L18 0.9V7.3ZM18 15.1C17.4 15.9 16.5 16.5 15.3 16.5C13.4 16.5 12 15 12 12.6C12 10.2 13.4 8.7 15.3 8.7C16.5 8.7 17.4 9.3 18 10.1V15.1Z"
              fill={selected === 'stripe' ? '#fff' : '#a1a1aa'}
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 12.6C0 17.2 3.6 20 7.3 20C9.2 20 10.5 19.6 11.6 19V15.5C10.6 16 9.4 16.4 8 16.4C6 16.4 4.5 15.4 4.5 12.6C4.5 10.1 5.9 8.7 8 8.7C9.4 8.7 10.4 9.1 11.6 9.8V6.2C10.6 5.6 9.2 5.3 7.3 5.3C3.5 5.3 0 8.2 0 12.6Z"
              fill={selected === 'stripe' ? '#fff' : '#a1a1aa'}
            />
          </svg>
        </div>
        <p className={`text-xs ${selected === 'stripe' ? 'text-zinc-300' : 'text-zinc-500'}`}>
          Credit/Debit Card
        </p>
      </button>

      {/* Lemon Squeezy Option */}
      <button
        type="button"
        onClick={() => onSelect('lemonsqueezy')}
        className={`flex-1 p-3 rounded-lg border-2 transition-all text-left ${
          selected === 'lemonsqueezy'
            ? 'border-yellow-500 bg-yellow-500/10'
            : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          {/* Lemon Squeezy Icon */}
          <span className="text-lg">
            {selected === 'lemonsqueezy' ? '🍋' : '🍋'}
          </span>
          <span className={`font-medium text-sm ${selected === 'lemonsqueezy' ? 'text-white' : 'text-zinc-400'}`}>
            Lemon Squeezy
          </span>
        </div>
        <p className={`text-xs ${selected === 'lemonsqueezy' ? 'text-zinc-300' : 'text-zinc-500'}`}>
          PayPal, Regional Methods
        </p>
      </button>
    </div>
  );
}

export default PaymentMethodSelector;
