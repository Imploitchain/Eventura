import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface EventReminderEmailProps {
  eventName: string;
  timeUntil: string;
}

export function EventReminderEmail({ eventName, timeUntil }: EventReminderEmailProps) {
  return (
    <EmailLayout>
      <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        ⏰ Reminder: {eventName} starts {timeUntil}
      </Text>
      
      <Text style={{ marginBottom: '16px' }}>
        This is a friendly reminder that <strong>{eventName}</strong> is starting {timeUntil}.
      </Text>
      
      <div style={{ 
        backgroundColor: '#f8fafc',
        borderLeft: '4px solid #3b82f6',
        padding: '16px',
        margin: '16px 0',
      }}>
        <Text style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Event Details:</Text>
        <Text style={{ margin: '4px 0' }}>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        <Text style={{ margin: '4px 0' }}>🕒 {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={{ margin: '4px 0 0 0' }}>📍 Virtual Event</Text>
      </div>
      
      <div style={{ margin: '24px 0' }}>
        <Button
          href="https://eventura.xyz/event/123"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
            marginRight: '12px',
          }}
        >
          View Event
        </Button>
        
        <Button
          href="https://eventura.xyz/event/123/join"
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
            fontWeight: '600',
          }}
        >
          Join Now
        </Button>
      </div>
      
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        You can manage your notification preferences in your account settings.
      </Text>
    </EmailLayout>
  );
}
