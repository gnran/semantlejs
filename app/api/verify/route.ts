import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const client = createPublicClient({
  chain: base,
  transport: http(),
});

type VerifyBody = {
  address: string;
  message: string;
  signature: string;
};

const usedNonces = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const body: VerifyBody = await req.json();
    const { address, message, signature } = body;

    // Extract nonce from message (SIWE format)
    const nonceMatch = message.match(/Nonce: (\w+)/);
    const nonce = nonceMatch?.[1];
    
    if (!nonce || usedNonces.has(nonce)) {
      return NextResponse.json(
        { error: 'Invalid or reused nonce' }, 
        { status: 400 }
      );
    }

    // Mark nonce as used
    usedNonces.add(nonce);

    // Verify signature (supports Base smart accounts via ERC-6492)
    const valid = await client.verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`
    });

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid signature' }, 
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Unknown error' }, 
      { status: 500 }
    );
  }
}
