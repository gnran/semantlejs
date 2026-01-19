import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory nonce store (use a database or Redis for production)
const nonces = new Set<string>();

export async function GET() {
  const nonce = crypto.randomBytes(16).toString('hex');
  nonces.add(nonce);
  
  // Optional: Clean up old nonces after 5 minutes
  setTimeout(() => {
    nonces.delete(nonce);
  }, 5 * 60 * 1000);
  
  return NextResponse.json({ nonce });
}
