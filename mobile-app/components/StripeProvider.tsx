import React from 'react';
import { StripeProvider as StripeProviderBase } from '@stripe/stripe-react-native';
import { STRIPE_CONFIG } from '../config/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  return (
    <StripeProviderBase
      publishableKey={STRIPE_CONFIG.publishableKey}
      merchantIdentifier="merchant.com.fitfusionai" // Replace with your merchant ID
      urlScheme="fitfusionai" // Replace with your app's URL scheme
    >
      {children}
    </StripeProviderBase>
  );
}


















