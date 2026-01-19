import { NextResponse } from 'next/server';

// In-memory nonce store (use a database or Redis for production)
// Note: In edge runtime, this won't persist between requests
// For production, use a shared database or Redis
const nonces = new Set<string>();

export async function GET() {
  // Generate random nonce using Web Crypto API (edge-compatible)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const nonce = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  nonces.add(nonce);
  
  return NextResponse.json({ nonce });
}
