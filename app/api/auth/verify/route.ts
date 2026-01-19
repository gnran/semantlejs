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

    // Log the actual message for debugging
    console.log('Received message for verification:', message);
    console.log('Message length:', message.length);
    
    // Extract and validate nonce from message (optional for this demo)
    // Base message format includes nonce - try to extract it but don't fail if we can't
    // Since we can't track nonces in edge runtime anyway, we'll just verify the signature
    let nonce: string | null = null;
    
    // Try various patterns to extract nonce
    let match = message.match(/at ([a-f0-9]{32})$/i) || 
                message.match(/at ([a-f0-9]+)$/i) ||
                message.match(/([a-f0-9]{32})/i);
    
    if (match) {
      nonce = match[1];
      console.log('Extracted nonce:', nonce);
    } else {
      console.log('Could not extract nonce - will still verify signature');
    }

    // Note: In edge runtime, we can't track used nonces across requests
    // For this demo, we skip nonce validation and just verify the signature
    // In production with a database/Redis, you'd validate nonce here

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
