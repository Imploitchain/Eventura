export const AnalyticsEvents = {
  // Wallet Events
  WALLET_CONNECTED: 'wallet_connected',
  WALLET_DISCONNECTED: 'wallet_disconnected',
  NETWORK_SWITCHED: 'network_switched',

  // Event Related
  EVENT_VIEWED: 'event_viewed',
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_DELETED: 'event_deleted',

  // Ticket Related
  TICKET_PURCHASE_STARTED: 'ticket_purchase_started',
  TICKET_PURCHASE_COMPLETED: 'ticket_purchase_completed',
  TICKET_PURCHASE_FAILED: 'ticket_purchase_failed',

  // Connection Related
  CONNECTION_REQUEST_SENT: 'connection_request_sent',
  CONNECTION_REQUEST_ACCEPTED: 'connection_request_accepted',
  CONNECTION_REQUEST_REJECTED: 'connection_request_rejected',

  // Messaging
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',

  // Navigation
  NAVIGATION: 'navigation',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface AnalyticsEventPayload<T = EventProperties> {
  event: AnalyticsEvent;
  properties?: T;
}
