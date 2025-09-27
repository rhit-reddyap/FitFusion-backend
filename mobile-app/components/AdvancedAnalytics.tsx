import React from 'react';
import AdvancedAnalyticsReal from './AdvancedAnalyticsReal';

interface AdvancedAnalyticsProps {
  onBack: () => void;
}

export default function AdvancedAnalytics({ onBack }: AdvancedAnalyticsProps) {
  return <AdvancedAnalyticsReal onBack={onBack} />;
}