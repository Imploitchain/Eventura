import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface NewMessageEmailProps {
  fromName: string;
  messagePreview: string;
}

export function NewMessageEmail({ fromName, messagePreview }: NewMessageEmailProps) {
  return (
    <EmailLayout>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        New message from {fromName}
      </Text>
      
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '16px',
        margin: '16px 0',
      }}>
        <Text style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{fromName}:</Text>
        <Text style={{ margin: '0', color: '#4b5563' }}>{messagePreview}...</Text>
      </div>
      
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
          Reply to {fromName}
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        This is an automated message. You're receiving this because you have message notifications enabled.
      </Text>
    </EmailLayout>
  );
}
