import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Eventura</title>
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f3f4f6;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              padding: 20px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              text-decoration: none;
            }
            .content {
              padding: 24px 0;
              line-height: 1.6;
              color: #374151;
            }
            .footer {
              text-align: center;
              padding: 20px 0;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #9ca3af;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: 600;
              margin: 16px 0;
            }
            .button:hover {
              background-color: #2563eb;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <a href="https://eventura.xyz" className="logo">
              Eventura
            </a>
          </div>
          <div className="content">
            {children}
          </div>
          <div className="footer">
            <p>© {new Date().getFullYear()} Eventura. All rights reserved.</p>
            <p>
              <a href="https://eventura.xyz/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a>
              {' • '}
              <a href="https://eventura.xyz/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a>
              {' • '}
              <a href="https://eventura.xyz/unsubscribe" style={{ color: '#9ca3af', textDecoration: 'none' }}>Unsubscribe</a>
            </p>
            <p>Eventura, 123 Web3 Street, Internet City, 10001</p>
          </div>
        </div>
      </body>
    </html>
  );
}
