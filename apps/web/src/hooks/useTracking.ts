import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { trackEvent, identifyUser, resetUser } from '@/lib/analytics';
import { AnalyticsEvents, type EventProperties, type AnalyticsEvent } from '@/lib/analytics/events';

export const useTracking = () => {
  const { address, isConnected } = useAccount();

  // Track a custom event
  const track = useCallback(
    (event: AnalyticsEvent, properties?: EventProperties) => {
      // Always include wallet address hash if connected
      const eventProperties = {
        ...properties,
        wallet_connected: isConnected,
        wallet_address: address ? 'hashed' : null,
      };

      trackEvent(event, eventProperties);

      // Update user identity if wallet is connected
      if (isConnected && address) {
        identifyUser(address);
      } else if (!isConnected) {
        resetUser();
      }
    },
    [address, isConnected]
  );

  // Track page views
  const trackPageView = useCallback(
    (pageName: string, properties?: EventProperties) => {
      track(AnalyticsEvents.NAVIGATION, {
        page_name: pageName,
        page_url: typeof window !== 'undefined' ? window.location.pathname : '',
        ...properties,
      });
    },
    [track]
  );

  // Track wallet connection
  const trackWalletConnected = useCallback(
    (walletName: string) => {
      track(AnalyticsEvents.WALLET_CONNECTED, {
        wallet_name: walletName,
      });
    },
    [track]
  );

  // Track network switch
  const trackNetworkSwitched = useCallback(
    (chainId: number, chainName: string) => {
      track(AnalyticsEvents.NETWORK_SWITCHED, {
        chain_id: chainId,
        chain_name: chainName,
      });
    },
    [track]
  );

  // Track event view
  const trackEventView = useCallback(
    (eventId: string, eventName: string) => {
      track(AnalyticsEvents.EVENT_VIEWED, {
        event_id: eventId,
        event_name: eventName,
      });
    },
    [track]
  );

  // Track ticket purchase
  const trackTicketPurchase = useCallback(
    (eventId: string, ticketCount: number, amount: string, currency: string) => {
      track(AnalyticsEvents.TICKET_PURCHASE_COMPLETED, {
        event_id: eventId,
        ticket_count: ticketCount,
        amount,
        currency,
      });
    },
    [track]
  );

  // Track connection request
  const trackConnectionRequest = useCallback(
    (targetAddress: string) => {
      track(AnalyticsEvents.CONNECTION_REQUEST_SENT, {
        target_address: targetAddress,
      });
    },
    [track]
  );

  // Track message sent
  const trackMessageSent = useCallback(
    (recipientAddress: string, messageLength: number) => {
      track(AnalyticsEvents.MESSAGE_SENT, {
        recipient_address: recipientAddress,
        message_length: messageLength,
      });
    },
    [track]
  );

  return {
    track,
    trackPageView,
    trackWalletConnected,
    trackNetworkSwitched,
    trackEventView,
    trackTicketPurchase,
    trackConnectionRequest,
    trackMessageSent,
  };
};

export default useTracking;
