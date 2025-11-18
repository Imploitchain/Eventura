/**
 * Get current user's personas
 * GET /api/personas/me - Get all personas for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { verifyWalletSignature, verifyTimestamp } from '@/lib/auth/verify'

export async function GET(req: NextRequest) {
  try {
    // Get wallet address and signature from headers
    const walletAddress = req.headers.get('x-wallet-address')
    const signature = req.headers.get('x-signature')
    const message = req.headers.get('x-message')

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Provide wallet address, signature, and message in headers.' },
        { status: 401 }
      )
    }

    // Verify timestamp
    if (!verifyTimestamp(message)) {
      return NextResponse.json(
        { success: false, error: 'Signature expired. Please sign again.' },
        { status: 401 }
      )
    }

    // Verify signature
    const verificationResult = await verifyWalletSignature(walletAddress, message, signature)
    if (!verificationResult.isValid) {
      return NextResponse.json(
        { success: false, error: verificationResult.error || 'Invalid signature' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Fetch all personas for this user
    const { data, error } = await supabase
      .from('event_personas')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch personas' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Personas fetch error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
