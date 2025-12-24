/**
 * Clover SDK Type Definitions
 * Types for the Clover iframe payment SDK
 */

export interface CloverOptions {
  merchantId?: string;
}

export interface CloverInstance {
  elements: () => CloverElements;
  createToken: () => Promise<{ token?: string; error?: { message: string } }>;
}

export interface CloverElements {
  create: (type: string, options?: Record<string, unknown>) => CloverElement;
}

export interface CloverElement {
  mount: (selector: string) => void;
  unmount: () => void;
  addEventListener: (event: string, handler: (event: CloverElementEvent) => void) => void;
  removeEventListener?: (event: string, handler: (event: CloverElementEvent) => void) => void;
}

export interface CloverFieldState {
  touched?: boolean;
  error?: string;
  info?: string;
}

export interface CloverElementEvent {
  CARD_NUMBER?: CloverFieldState;
  CARD_DATE?: CloverFieldState;
  CARD_CVV?: CloverFieldState;
  CARD_POSTAL_CODE?: CloverFieldState;
  error?: { message: string };
  touched?: boolean;
  complete?: boolean;
}

// Augment window interface
declare global {
  interface Window {
    Clover: new (apiKey: string, options?: CloverOptions) => CloverInstance;
  }
}
