'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTracking } from '@/hooks/useTracking';
import { AnalyticsEvents } from '@/lib/analytics/events';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView } = useTracking();

  // Track page views
  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
    trackPageView(pathname, { url });
  }, [pathname, searchParams, trackPageView]);

  return <>{children}</>;
};

// Higher Order Component for analytics
export const withAnalytics = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const { track } = useTracking();

    // Track component mount
    useEffect(() => {
      if (componentName) {
        track(AnalyticsEvents.NAVIGATION, {
          component_name: componentName,
          action: 'component_mounted',
        });
      }
    }, [track, componentName]);

    return <Component {...props} />;
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WrappedComponent.displayName = `withAnalytics(${displayName})`;

  return WrappedComponent;
};

export default AnalyticsProvider;
