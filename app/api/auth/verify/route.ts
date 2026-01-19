import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage } from 'viem';

// Note: In edge runtime, in-memory Sets don't persist between requests
// For production, use a shared database or Redis for nonce storage
// For this demo, we validate message format and signature
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, message, signature } = body;

    if (!address || !message || !signature) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      );
    }

    // Extract and validate nonce from message
    // Base message format includes nonce at the end: "... at <nonce>"
    const match = message.match(/at ([a-f0-9]{32})$/i);
    const nonce = match ? match[1] : null;

    if (!nonce) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Note: In edge runtime, we can't track used nonces across requests
    // In production, you'd check against Redis/database here

    // Verify signature using viem
    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // On success, you might create a session or issue a JWT here
    return NextResponse.json({
      ok: true,
      address,
      message: 'Signature verified successfully'
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
