import * as React from 'react';
import { EmailLayout } from './components/email-layout';
import { Button, Text } from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <EmailLayout previewText="Welcome to Eventura - Let's get started!">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: '#3b82f6',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <span style={{ color: 'white', fontSize: '32px' }}>🎉</span>
        </div>
        <Text style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Welcome to Eventura, {userName}!
        </Text>
        <Text style={{ color: '#6b7280' }}>Your journey to amazing events starts now.</Text>
      </div>

      <div style={{ margin: '24px 0' }}>
        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <div style={{
            backgroundColor: '#e0f2fe',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            flexShrink: 0,
          }}>
            <span style={{ color: '#0ea5e9' }}>1</span>
          </div>
          <div>
            <Text style={{ fontWeight: '600', margin: '0 0 4px 0' }}>Complete Your Profile</Text>
            <Text style={{ margin: '0', color: '#6b7280' }}>
              Add a profile picture and bio to help others get to know you.
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex', marginBottom: '16px' }}>
          <div style={{
            backgroundColor: '#e0f2fe',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            flexShrink: 0,
          }}>
            <span style={{ color: '#0ea5e9' }}>2</span>
          </div>
          <div>
            <Text style={{ fontWeight: '600', margin: '0 0 4px 0' }}>Discover Events</Text>
            <Text style={{ margin: '0', color: '#6b7280' }}>
              Browse and join events that match your interests.
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex' }}>
          <div style={{
            backgroundColor: '#e0f2fe',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
            flexShrink: 0,
          }}>
            <span style={{ color: '#0ea5e9' }}>3</span>
          </div>
          <div>
            <Text style={{ fontWeight: '600', margin: '0 0 4px 0' }}>Connect with Others</Text>
            <Text style={{ margin: '0', color: '#6b7280' }}>
              Network with other attendees before, during, and after events.
            </Text>
          </div>
        </div>
      </div>

      <div style={{ margin: '32px 0', textAlign: 'center' }}>
        <Button
          href="https://eventura.xyz/explore"
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
          Explore Events
        </Button>
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
        <Text style={{ fontWeight: '600', marginBottom: '8px' }}>Need help getting started?</Text>
        <Text style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
          Check out our <a href="https://eventura.xyz/help" style={{ color: '#3b82f6', textDecoration: 'none' }}>help center</a> or reply to this email.
        </Text>
      </div>
    </EmailLayout>
  );
}
