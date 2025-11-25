import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface ConnectionAcceptedEmailProps {
  fromName: string;
}

export function ConnectionAcceptedEmail({ fromName }: ConnectionAcceptedEmailProps) {
  return (
    <EmailLayout>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Connection Accepted! 🎉
      </Text>
      
      <Text style={{ marginBottom: '16px' }}>
        Great news! <strong>{fromName}</strong> has accepted your connection request.
      </Text>
      
      <Text style={{ marginBottom: '24px' }}>
        You're now connected on Eventura. Start a conversation or explore events together!
      </Text>
      
      <div style={{ margin: '24px 0' }}>
        <Button
          href="https://eventura.xyz/messages"
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
          Send a Message
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        You can now see each other's public profiles and connect at events.
      </Text>
    </EmailLayout>
  );
}
