import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface ConnectionRequestEmailProps {
  fromName: string;
  eventName?: string;
  message?: string;
}

export function ConnectionRequestEmail({
  fromName,
  eventName,
  message,
}: ConnectionRequestEmailProps) {
  return (
    <EmailLayout>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        New Connection Request
      </Text>
      
      <Text style={{ marginBottom: '16px' }}>
        <strong>{fromName}</strong> wants to connect with you
        {eventName ? ` at ${eventName}` : ''}.
      </Text>
      
      {message && (
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '16px',
          borderRadius: '4px',
          margin: '16px 0',
          fontStyle: 'italic',
        }}>
          "{message}"
        </div>
      )}
      
      <div style={{ margin: '24px 0' }}>
        <Button
          href="https://eventura.xyz/connections"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
          }}
        >
          View Request
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        You can accept or decline this request in your connections dashboard.
      </Text>
    </EmailLayout>
  );
}
