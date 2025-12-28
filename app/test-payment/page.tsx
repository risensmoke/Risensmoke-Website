'use client';

import { useEffect, useRef, useState } from 'react';
import { CreditCard, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import type { CloverInstance, CloverElement, CloverFieldState, CloverElementEvent } from '@/types/clover-sdk';

interface PaymentResult {
  paymentId: string;
  cloverOrderId: string;
  last4: string;
  brand: string;
  amount: number;
  orderTitle: string;
  printed: boolean;
}

const CLOVER_SDK_URL = process.env.NEXT_PUBLIC_CLOVER_SDK_URL || '';
const CLOVER_API_KEY = process.env.NEXT_PUBLIC_CLOVER_API_KEY || '';
const CLOVER_MERCHANT_ID = process.env.NEXT_PUBLIC_CLOVER_MERCHANT_ID || '';

export default function TestPaymentPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [testAmount, setTestAmount] = useState('1.00');
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

  useEffect(() => {
    if (!CLOVER_SDK_URL || !CLOVER_API_KEY) {
      setError('Payment configuration is missing. Check NEXT_PUBLIC_CLOVER_SDK_URL and NEXT_PUBLIC_CLOVER_API_KEY');
      setIsLoading(false);
      return;
    }

    console.log('[Clover] SDK URL:', CLOVER_SDK_URL);
    console.log('[Clover] API Key:', CLOVER_API_KEY.substring(0, 10) + '...');

    const initClover = () => {
      if (!window.Clover || mountedRef.current) {
        console.log('[Clover] Already mounted or Clover not available');
        return;
      }

      try {
        console.log('[Clover] Creating Clover instance with merchantId:', CLOVER_MERCHANT_ID);
        cloverRef.current = new window.Clover(CLOVER_API_KEY, {
          merchantId: CLOVER_MERCHANT_ID
        });
        const elements = cloverRef.current.elements();

        const styles = {
          input: {
            fontSize: '16px',
            fontFamily: 'inherit',
            color: '#F8F8F8',
            backgroundColor: 'transparent',
          },
          'input::placeholder': { color: '#888' },
        };

        console.log('[Clover] Creating elements...');
        elementsRef.current.cardNumber = elements.create('CARD_NUMBER', { styles });
        elementsRef.current.cardDate = elements.create('CARD_DATE', { styles });
        elementsRef.current.cardCvv = elements.create('CARD_CVV', { styles });
        elementsRef.current.cardPostalCode = elements.create('CARD_POSTAL_CODE', { styles });

        console.log('[Clover] Mounting elements...');
        elementsRef.current.cardNumber?.mount('#card-number');
        elementsRef.current.cardDate?.mount('#card-date');
        elementsRef.current.cardCvv?.mount('#card-cvv');
        elementsRef.current.cardPostalCode?.mount('#card-postal-code');

        console.log('[Clover] Adding event listeners...');
        elementsRef.current.cardNumber?.addEventListener('change', (e: CloverElementEvent) => {
          console.log('[Clover] Card number event:', JSON.stringify(e));
          // Field is valid when touched=true and no error
          const cardField = e.CARD_NUMBER;
          const isValid = cardField?.touched === true && !cardField?.error;
          console.log('[Clover] Card number valid:', isValid);
          setCardComplete((prev) => ({ ...prev, number: isValid }));
          if (cardField?.error) setError(cardField.error);
        });
        elementsRef.current.cardDate?.addEventListener('change', (e: CloverElementEvent) => {
          console.log('[Clover] Date event:', JSON.stringify(e));
          const dateField = e.CARD_DATE;
          const isValid = dateField?.touched === true && !dateField?.error;
          console.log('[Clover] Date valid:', isValid);
          setCardComplete((prev) => ({ ...prev, date: isValid }));
          if (dateField?.error) setError(dateField.error);
        });
        elementsRef.current.cardCvv?.addEventListener('change', (e: CloverElementEvent) => {
          console.log('[Clover] CVV event:', JSON.stringify(e));
          const cvvField = e.CARD_CVV;
          const isValid = cvvField?.touched === true && !cvvField?.error;
          console.log('[Clover] CVV valid:', isValid);
          setCardComplete((prev) => ({ ...prev, cvv: isValid }));
          if (cvvField?.error) setError(cvvField.error);
        });
        elementsRef.current.cardPostalCode?.addEventListener('change', (e: CloverElementEvent) => {
          console.log('[Clover] ZIP event:', JSON.stringify(e));
          const zipField = e.CARD_POSTAL_CODE;
          const isValid = zipField?.touched === true && !zipField?.error;
          console.log('[Clover] ZIP valid:', isValid);
          setCardComplete((prev) => ({ ...prev, zip: isValid }));
        });

        mountedRef.current = true;
        setIsLoading(false);
        console.log('[Clover] Initialization complete!');
      } catch (err) {
        console.error('[Clover] Init error:', err);
        setError('Failed to initialize payment form: ' + (err instanceof Error ? err.message : String(err)));
        setIsLoading(false);
      }
    };

    // Check if script already loaded
    if (window.Clover) {
      console.log('[Clover] SDK already loaded');
      initClover();
      return;
    }

    // Load the SDK
    console.log('[Clover] Loading SDK...');
    const script = document.createElement('script');
    script.src = CLOVER_SDK_URL;
    script.async = true;
    script.onload = () => {
      console.log('[Clover] SDK loaded successfully');
      initClover();
    };
    script.onerror = (e) => {
      console.error('[Clover] Failed to load SDK:', e);
      setError('Failed to load payment system. Check console for details.');
      setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      try {
        elementsRef.current.cardNumber?.unmount();
        elementsRef.current.cardDate?.unmount();
        elementsRef.current.cardCvv?.unmount();
        elementsRef.current.cardPostalCode?.unmount();
      } catch {
        // Ignore unmount errors
      }
      mountedRef.current = false;
    };
  }, []);

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
      console.log('[Test] Creating token (without options per Clover docs)...');
      // Per Clover docs, createToken() uses values from SDK initialization
      const tokenResult = await cloverRef.current.createToken();

      if (tokenResult.error) {
        throw new Error(tokenResult.error.message);
      }

      if (!tokenResult.token) {
        throw new Error('Failed to tokenize card');
      }

      console.log('[Test] Token created:', tokenResult.token.substring(0, 20) + '...');

      const response = await fetch('/api/clover/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenResult.token,
          amount: parseFloat(testAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Payment failed');
      }

      setResult({
        paymentId: data.payment.id,
        cloverOrderId: data.cloverOrder.id,
        last4: data.payment.last4,
        brand: data.payment.brand,
        amount: data.payment.amount,
        orderTitle: data.orderTitle,
        printed: data.printed,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#FFD700' }}>
          Clover Payment Test
        </h1>
        <p className="text-sm mb-6" style={{ color: '#888' }}>
          Sandbox Environment - Use test card: 4111 1111 1111 1111
        </p>

        {/* Debug info */}
        <div className="mb-4 p-2 rounded text-xs" style={{ backgroundColor: '#333', color: '#888' }}>
          <p>SDK: {CLOVER_SDK_URL ? 'Configured' : 'Missing'}</p>
          <p>API Key: {CLOVER_API_KEY ? CLOVER_API_KEY.substring(0, 10) + '...' : 'Missing'}</p>
          <p>Merchant: {CLOVER_MERCHANT_ID || 'Missing'}</p>
          <p>Card: {cardComplete.number ? 'OK' : '-'} | Date: {cardComplete.date ? 'OK' : '-'} | CVV: {cardComplete.cvv ? 'OK' : '-'} | ZIP: {cardComplete.zip ? 'OK' : '-'}</p>
        </div>

        {/* Success Result */}
        {result && (
          <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', border: '2px solid #4CAF50' }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6" style={{ color: '#4CAF50' }} />
              <h2 className="text-xl font-bold" style={{ color: '#4CAF50' }}>Payment Successful!</h2>
            </div>
            <div className="space-y-2 text-sm" style={{ color: '#F8F8F8' }}>
              <p><strong>Amount:</strong> ${result.amount.toFixed(2)}</p>
              <p><strong>Card:</strong> {result.brand} ending in {result.last4}</p>
              <p><strong>Payment ID:</strong> <code className="text-xs">{result.paymentId}</code></p>
              <p><strong>Clover Order:</strong> <code className="text-xs">{result.cloverOrderId}</code></p>
              <p><strong>Receipt Title:</strong> {result.orderTitle}</p>
              <p><strong>Print Triggered:</strong> {result.printed ? 'Yes' : 'No'}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full py-3 rounded-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #D32F2F)', color: '#F8F8F8' }}
            >
              Run Another Test
            </button>
          </div>
        )}

        {/* Payment Form */}
        {!result && (
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#2C2C2C' }}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5" style={{ color: '#FFD700' }} />
              <h3 className="text-lg font-bold" style={{ color: '#FFD700' }}>Test Payment</h3>
            </div>

            <div className="flex items-center gap-2 mb-4 p-2 rounded" style={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
              <Lock className="w-4 h-4" style={{ color: '#FFD700' }} />
              <span className="text-xs" style={{ color: '#F8F8F8' }}>Sandbox mode - no real charges</span>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B35' }} />
                <span className="ml-2" style={{ color: '#F8F8F8' }}>Loading payment form...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(211, 47, 47, 0.2)', border: '1px solid #D32F2F' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#D32F2F' }} />
                <span className="text-sm" style={{ color: '#F8F8F8' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={isLoading ? 'hidden' : ''}>
              <div className="mb-4">
                <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>Test Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-3 py-3 rounded"
                  style={{ backgroundColor: '#1C1C1C', color: '#F8F8F8', border: '1px solid rgba(255, 107, 53, 0.3)' }}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>Card Number</label>
                <div
                  id="card-number"
                  className="w-full px-3 py-3 rounded h-12"
                  style={{
                    backgroundColor: '#1C1C1C',
                    border: cardComplete.number ? '2px solid #4CAF50' : '1px solid rgba(255, 107, 53, 0.3)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>Expiry</label>
                  <div
                    id="card-date"
                    className="w-full px-3 py-3 rounded h-12"
                    style={{
                      backgroundColor: '#1C1C1C',
                      border: cardComplete.date ? '2px solid #4CAF50' : '1px solid rgba(255, 107, 53, 0.3)',
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>CVV</label>
                  <div
                    id="card-cvv"
                    className="w-full px-3 py-3 rounded h-12"
                    style={{
                      backgroundColor: '#1C1C1C',
                      border: cardComplete.cvv ? '2px solid #4CAF50' : '1px solid rgba(255, 107, 53, 0.3)',
                    }}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block mb-2 text-sm" style={{ color: '#F8F8F8' }}>ZIP Code</label>
                <div
                  id="card-postal-code"
                  className="w-full px-3 py-3 rounded h-12"
                  style={{
                    backgroundColor: '#1C1C1C',
                    border: cardComplete.zip ? '2px solid #4CAF50' : '1px solid rgba(255, 107, 53, 0.3)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || !isFormComplete}
                className="w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2"
                style={{
                  background: isProcessing || !isFormComplete ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                  color: '#F8F8F8',
                  cursor: isProcessing || !isFormComplete ? 'not-allowed' : 'pointer',
                }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay ${(parseFloat(testAmount || '0') * 1.08).toFixed(2)} (incl. 8% tax)
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 rounded" style={{ backgroundColor: '#1C1C1C' }}>
              <h4 className="font-bold mb-2 text-sm" style={{ color: '#FFD700' }}>Test Card Numbers:</h4>
              <ul className="text-xs space-y-1" style={{ color: '#888' }}>
                <li>Visa: 4111 1111 1111 1111</li>
                <li>Mastercard: 5500 0000 0000 0004</li>
                <li>Amex: 3400 0000 0000 009</li>
                <li>Any future expiry, any CVV, any ZIP</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
