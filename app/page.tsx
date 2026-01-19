'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { createBaseAccountSDK } from '@base-org/account';

// Dynamically import SignInWithBaseButton with SSR disabled
const SignInWithBaseButton = dynamic(
  () => import('@base-org/account-ui/react').then((mod) => mod.SignInWithBaseButton),
  { ssr: false }
);

export default function HomePage() {
  const [status, setStatus] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Initialize SDK only on client side
  const sdk = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createBaseAccountSDK({
      appName: 'My BaseAuth App'
    });
  }, []);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Custom sign-in flow
  const customSignIn = async () => {
    if (!sdk) {
      setStatus('SDK not initialized');
      return;
    }
    
    const provider = sdk.getProvider();
    setStatus('Generating nonce…');
    
    // Fetch nonce from backend
    const nonceRes = await fetch('/api/auth/nonce');
    const { nonce } = await nonceRes.json();
    
    // Switch to Base Chain if needed (chainId = Base mainnet 0x2105)
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }]
      });
    } catch (err) {
      console.warn('Switch chain failed or was not supported', err);
    }

    setStatus('Connecting and signing…');

    try {
      const { accounts } = await provider.request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: {
              signInWithEthereum: {
                nonce,
                chainId: '0x2105'
              }
            }
          }
        ]
      });

      const acct = accounts[0];
      const { address } = acct;
      const { message, signature } = acct.capabilities.signInWithEthereum;

      setStatus('Verifying signature on backend…');

      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('✅ Signed in! Address: ' + address);
      } else {
        setStatus('❌ Verification failed: ' + (data.error || res.statusText));
      }
    } catch (err: any) {
      console.error(err);
      setStatus('Error: ' + (err.message || err.toString()));
    }
  };

  // Sign in with Base button handler
  const handleSignInWithBase = async () => {
    setStatus('Signing in with Base…');
    await customSignIn();
  };

  if (!mounted) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Base Auth Example</h1>
      
      <div style={{ marginBottom: 20 }}>
        {/* 1. UI component sign-in with Base */}
        <SignInWithBaseButton
          align="center"
          variant="solid"
          colorScheme="light"
          onClick={handleSignInWithBase}
        />
      </div>

      <div>
        {/* 2. Custom sign-in flow */}
        <button onClick={customSignIn}>
          Custom Sign in with Base
        </button>
      </div>

      {status && <p>Status: {status}</p>}
    </div>
  );
}
