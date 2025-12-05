'use client';

import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </ErrorBoundary>
  );
}

export default ClientLayout;
