import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Note: Using Node.js runtime for better viem compatibility with ERC-6492 signatures
// Edge runtime has limitations with some crypto operations
// For production, use a shared database or Redis for nonce storage
// For this demo, we validate message format and signature
// export const runtime = 'edge'; // Commented out to use Node.js runtime

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

    // Log the actual message and signature for debugging
    console.log('Received message for verification:', message);
    console.log('Message length:', message.length);
    console.log('Received signature:', signature);
    console.log('Signature length:', signature?.length);
    
    // Normalize address - ensure it has 0x prefix
    const normalizedAddress = address.startsWith('0x') 
      ? address.toLowerCase() as `0x${string}`
      : (`0x${address}`.toLowerCase() as `0x${string}`);
    
    // Normalize signature - ensure it has 0x prefix
    // Note: Base Account may use ERC-6492 smart wallet signatures which are longer
    // viem's verifyMessage handles ERC-6492 automatically
    let normalizedSignature: `0x${string}`;
    if (!signature) {
      return NextResponse.json(
        { error: 'Signature is required' },
        { status: 400 }
      );
    }
    
    // Ensure signature has 0x prefix (required by viem)
    // Don't validate length here - ERC-6492 signatures can be longer than 130 chars
    if (signature.startsWith('0x') || signature.startsWith('0X')) {
      normalizedSignature = signature.toLowerCase() as `0x${string}`;
    } else {
      normalizedSignature = (`0x${signature}`.toLowerCase() as `0x${string}`);
    }
    
    console.log('Normalized signature length:', normalizedSignature.length - 2); // -2 for 0x prefix
    
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

    // Verify signature using viem with public client
    // Base Account uses ERC-6492 for smart wallets, which viem handles automatically
    // The signature may be longer than standard ECDSA signatures
    // Using publicClient.verifyMessage as recommended by Base docs
    let valid = false;
    try {
      console.log('Attempting signature verification...');
      console.log('Address:', normalizedAddress);
      console.log('Message:', message);
      console.log('Signature (first 100 chars):', normalizedSignature.substring(0, 100));
      console.log('Full signature length:', normalizedSignature.length - 2); // -2 for 0x
      
      // Create a public client for Base network
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });
      
      // Use publicClient.verifyMessage which handles ERC-6492 automatically
      valid = await publicClient.verifyMessage({
        address: normalizedAddress,
        message,
        signature: normalizedSignature,
      });
      
      console.log('Verification result:', valid);
    } catch (verifyError: any) {
      console.error('Signature verification error:', verifyError);
      console.error('Error message:', verifyError.message);
      console.error('Error stack:', verifyError.stack);
      console.error('Error name:', verifyError.name);
      
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: 'Signature verification failed',
          details: verifyError.message || 'Unknown error',
          errorName: verifyError.name,
          signatureLength: normalizedSignature.length - 2
        },
        { status: 500 }
      );
    }

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
