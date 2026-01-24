# Security Policy

## Reporting a Vulnerability

We take security seriously at Eventura. If you discover a security vulnerability, please report it responsibly.

**DO NOT open public issues for security vulnerabilities.**

### How to Report

Please send security reports to: **security@eventura.network**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Resolution Target**: Within 14 days for critical issues

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Smart Contract Security

Our Solidity contracts implement:
- OpenZeppelin security libraries
- ReentrancyGuard on all financial operations
- Pausable emergency stop mechanism
- Multi-signature admin controls
- Access control for event organizers

A security audit is planned with a reputable firm before mainnet deployment.

## Responsible Disclosure

We kindly ask that you:
- Give us reasonable time to fix the issue before public disclosure
- Do not exploit the vulnerability beyond what is necessary to demonstrate it
- Do not access or modify other users' data

Thank you for helping keep Eventura secure!
