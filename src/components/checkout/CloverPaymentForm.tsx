'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CreditCard, Lock, AlertCircle, Loader2 } from 'lucide-react';
import type { CloverInstance, CloverElement, CloverElementEvent } from '@/types/clover-sdk';

interface CloverPaymentFormProps {
  amount: number;
  orderId: string;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface PaymentResult {
  paymentId: string;
  cloverOrderId: string;
  last4: string;
  brand: string;
}

const CLOVER_SDK_URL = process.env.NEXT_PUBLIC_CLOVER_SDK_URL;
const CLOVER_API_KEY = process.env.NEXT_PUBLIC_CLOVER_API_KEY;
const CLOVER_MERCHANT_ID = process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID;

export default function CloverPaymentForm({
  amount,
  orderId,
  onSuccess,
  onError,
  onCancel,
}: CloverPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState({
    number: false,
    date: false,
    cvv: false,
    zip: false,
  });

  const cloverRef = useRef<CloverInstance | null>(null);
  const elementsRef = useRef<{
    cardNumber?: CloverElement;
    cardDate?: CloverElement;
    cardCvv?: CloverElement;
    cardPostalCode?: CloverElement;
  }>({});
  const mountedRef = useRef(false);

  // Load Clover SDK
  useEffect(() => {
    if (!CLOVER_SDK_URL || !CLOVER_API_KEY || !CLOVER_MERCHANT_ID) {
      setError('Payment configuration is missing. Please contact support.');
      setIsLoading(false);
      return;
    }

    // Check if script already loaded
    if (window.Clover) {
      initializeClover();
      return;
    }

    // Load the SDK script
    const script = document.createElement('script');
    script.src = CLOVER_SDK_URL;
    script.async = true;
    script.onload = () => {
      initializeClover();
    };
    script.onerror = () => {
      setError('Failed to load payment system. Please try again.');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup elements on unmount
      unmountElements();
    };
  }, []);

  const initializeClover = useCallback(() => {
    if (!CLOVER_API_KEY || !window.Clover || mountedRef.current) {
      return;
    }

    try {
      // Initialize Clover SDK with API key and merchant ID
      cloverRef.current = new window.Clover(CLOVER_API_KEY, {
        merchantId: CLOVER_MERCHANT_ID
      });
      const elements = cloverRef.current.elements();

      // Style configuration for the iframes
      // Note: Clover iframes have white backgrounds we can't change
      // So we style the input text to be dark and readable on white
      const styles = {
        input: {
          fontSize: '16px',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#333333',
          backgroundColor: '#FFFFFF',
          lineHeight: '48px',
          height: '48px',
          padding: '0 12px',
          margin: '0',
          border: 'none',
          outline: 'none',
          width: '100%',
        },
        'input::placeholder': {
          color: '#999999',
        },
        'input:focus': {
          outline: 'none',
        },
      };

      // Create and mount elements
      elementsRef.current.cardNumber = elements.create('CARD_NUMBER', { styles });
      elementsRef.current.cardDate = elements.create('CARD_DATE', { styles });
      elementsRef.current.cardCvv = elements.create('CARD_CVV', { styles });
      elementsRef.current.cardPostalCode = elements.create('CARD_POSTAL_CODE', { styles });

      // Mount elements
      elementsRef.current.cardNumber?.mount('#card-number');
      elementsRef.current.cardDate?.mount('#card-date');
      elementsRef.current.cardCvv?.mount('#card-cvv');
      elementsRef.current.cardPostalCode?.mount('#card-postal-code');

      // Add event listeners for validation
      // Clover SDK event structure: { CARD_NUMBER: { error?: string, touched: boolean, info: string }, ... }
      // Field is complete when touched=true AND error is undefined/empty
      type CloverFieldEvent = { error?: string; touched?: boolean; info?: string };

      const handleCardNumberChange = (event: CloverElementEvent) => {
        const fieldEvent = (event as Record<string, CloverFieldEvent>).CARD_NUMBER;
        const isComplete = fieldEvent?.touched && !fieldEvent?.error;
        setCardComplete((prev) => ({ ...prev, number: !!isComplete }));
      };

      const handleCardDateChange = (event: CloverElementEvent) => {
        const fieldEvent = (event as Record<string, CloverFieldEvent>).CARD_DATE;
        const isComplete = fieldEvent?.touched && !fieldEvent?.error;
        setCardComplete((prev) => ({ ...prev, date: !!isComplete }));
      };

      const handleCardCvvChange = (event: CloverElementEvent) => {
        const fieldEvent = (event as Record<string, CloverFieldEvent>).CARD_CVV;
        const isComplete = fieldEvent?.touched && !fieldEvent?.error;
        setCardComplete((prev) => ({ ...prev, cvv: !!isComplete }));
      };

      const handleCardPostalCodeChange = (event: CloverElementEvent) => {
        const fieldEvent = (event as Record<string, CloverFieldEvent>).CARD_POSTAL_CODE;
        const isComplete = fieldEvent?.touched && !fieldEvent?.error;
        setCardComplete((prev) => ({ ...prev, zip: !!isComplete }));
      };

      elementsRef.current.cardNumber?.addEventListener('change', handleCardNumberChange);
      elementsRef.current.cardDate?.addEventListener('change', handleCardDateChange);
      elementsRef.current.cardCvv?.addEventListener('change', handleCardCvvChange);
      elementsRef.current.cardPostalCode?.addEventListener('change', handleCardPostalCodeChange);

      mountedRef.current = true;
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Clover:', err);
      setError('Failed to initialize payment form');
      setIsLoading(false);
    }
  }, []);

  const unmountElements = () => {
    try {
      elementsRef.current.cardNumber?.unmount();
      elementsRef.current.cardDate?.unmount();
      elementsRef.current.cardCvv?.unmount();
      elementsRef.current.cardPostalCode?.unmount();
    } catch (err) {
      // Ignore unmount errors
    }
    mountedRef.current = false;
  };

  const isFormComplete = cardComplete.number && cardComplete.date && cardComplete.cvv && cardComplete.zip;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cloverRef.current || !isFormComplete) {
      setError('Please fill in all card details');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create token from card data
      // Clover requires apiAccessKey to be passed in the createToken call
      const tokenResult = await cloverRef.current.createToken({
        apiAccessKey: CLOVER_API_KEY
      });

      // Check for various error formats Clover might return
      if (tokenResult?.errors) {
        throw new Error(tokenResult.errors[0]?.message || 'Card validation error');
      }

      if (tokenResult?.error) {
        throw new Error(tokenResult.error.message || 'Card tokenization error');
      }

      if (!tokenResult?.token) {
        throw new Error('Failed to tokenize card - no token returned');
      }

      // Send token to server for processing
      const response = await fetch('/api/clover/payments/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localOrderId: orderId,
          token: tokenResult.token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Payment failed');
      }

      // Payment successful
      onSuccess({
        paymentId: data.payment.id,
        cloverOrderId: data.cloverOrderId,
        last4: data.payment.last4,
        brand: data.payment.brand,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: 'rgba(255, 215, 0, 0.15)' }}
        >
          <CreditCard className="w-6 h-6" style={{ color: '#FFD700' }} />
        </div>
        <h3 className="text-xl font-bold" style={{ color: '#FFD700', fontFamily: "'Rye', serif" }}>
          Payment Details
        </h3>
      </div>

      {/* Security Badge */}
      <div
        className="flex items-center gap-3 mb-6 p-3 rounded-lg"
        style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)' }}
      >
        <Lock className="w-5 h-5 flex-shrink-0" style={{ color: '#4CAF50' }} />
        <span className="text-sm" style={{ color: '#F8F8F8' }}>
          Your payment information is securely processed by Clover
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B35' }} />
          <span className="ml-2" style={{ color: '#F8F8F8' }}>
            Loading payment form...
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          className="flex items-center gap-2 mb-4 p-3 rounded"
          style={{ backgroundColor: 'rgba(211, 47, 47, 0.2)', border: '1px solid #D32F2F' }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#D32F2F' }} />
          <span className="text-sm" style={{ color: '#F8F8F8' }}>
            {error}
          </span>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className={isLoading ? 'hidden' : ''}>
        {/* Accepted Card Types */}
        <div className="mb-4">
          <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>
            Accepted Cards
          </label>
          <div className="flex flex-wrap gap-2">
            <div
              className="px-3 py-1 rounded text-xs font-bold"
              style={{ backgroundColor: '#1A1F71', color: '#FFFFFF' }}
            >
              VISA
            </div>
            <div
              className="px-3 py-1 rounded text-xs font-bold"
              style={{ backgroundColor: '#EB001B', color: '#FFFFFF' }}
            >
              Mastercard
            </div>
            <div
              className="px-3 py-1 rounded text-xs font-bold"
              style={{ backgroundColor: '#FF6000', color: '#FFFFFF' }}
            >
              Discover
            </div>
            <div
              className="px-3 py-1 rounded text-xs font-bold"
              style={{ backgroundColor: '#006FCF', color: '#FFFFFF' }}
            >
              AMEX
            </div>
          </div>
        </div>

        {/* Card Number */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold" style={{ color: '#FFD700' }}>
            Card Number
          </label>
          <div
            id="card-number"
            className="w-full rounded-lg overflow-hidden transition-all duration-200"
            style={{
              backgroundColor: '#FFFFFF',
              border: cardComplete.number
                ? '2px solid #4CAF50'
                : '2px solid rgba(255, 107, 53, 0.6)',
              height: '52px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#FFD700' }}>
              Expiration Date
            </label>
            <div
              id="card-date"
              className="w-full rounded-lg overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: '#FFFFFF',
                border: cardComplete.date
                  ? '2px solid #4CAF50'
                  : '2px solid rgba(255, 107, 53, 0.6)',
                height: '52px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold" style={{ color: '#FFD700' }}>
              CVV
            </label>
            <div
              id="card-cvv"
              className="w-full rounded-lg overflow-hidden transition-all duration-200"
              style={{
                backgroundColor: '#FFFFFF',
                border: cardComplete.cvv
                  ? '2px solid #4CAF50'
                  : '2px solid rgba(255, 107, 53, 0.6)',
                height: '52px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
          </div>
        </div>

        {/* Postal Code */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold" style={{ color: '#FFD700' }}>
            ZIP Code
          </label>
          <div
            id="card-postal-code"
            className="w-full rounded-lg overflow-hidden transition-all duration-200"
            style={{
              backgroundColor: '#FFFFFF',
              border: cardComplete.zip
                ? '2px solid #4CAF50'
                : '2px solid rgba(255, 107, 53, 0.6)',
              height: '52px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* Amount Display */}
        <div
          className="mb-8 p-5 rounded-lg text-center"
          style={{
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            border: '2px solid rgba(255, 107, 53, 0.5)',
            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.1)'
          }}
        >
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#F8F8F8' }}>
            Order Total
          </span>
          <div className="text-3xl font-bold mt-1" style={{ color: '#FFD700', fontFamily: "'Rye', serif" }}>
            ${amount.toFixed(2)}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-4 rounded-lg font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: 'rgba(80, 80, 80, 0.6)',
              color: '#F8F8F8',
              border: '1px solid rgba(150, 150, 150, 0.3)',
              fontSize: '16px',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || !isFormComplete}
            className="flex-1 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background:
                isProcessing || !isFormComplete
                  ? 'rgba(80, 80, 80, 0.6)'
                  : 'linear-gradient(135deg, #FF6B35, #D32F2F)',
              color: '#F8F8F8',
              cursor: isProcessing || !isFormComplete ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              boxShadow: isProcessing || !isFormComplete
                ? 'none'
                : '0 4px 15px rgba(255, 107, 53, 0.4)',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: '#777' }}>
            🔒 Payments are securely processed by Clover. Your card details are never stored on our servers.
          </p>
        </div>
      </form>
    </div>
  );
}
