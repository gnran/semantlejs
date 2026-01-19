'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createBaseAccountSDK } from '@base-org/account';
import { base } from 'viem/chains';

const SignInWithBaseButton = dynamic(
  () => import('@base-org/account-ui/react').then((mod) => mod.SignInWithBaseButton),
  { ssr: false }
);

type WalletConnectResponse = {
  accounts: Array<{
    address: string;
    capabilities: {
      signInWithEthereum: {
        message: string;
        signature: string;
      };
    };
  }>;
};

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sdk = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return createBaseAccountSDK({ 
      appName: 'My Base App', 
      appChainIds: [base.id] 
    });
  }, []);

  // Prebuilt UI button handler
  const handlePrebuiltSignIn = async () => {
    if (!sdk) return;
    try {
      setError(null);
      const provider = sdk.getProvider();
      const nonce = window.crypto.randomUUID().replace(/-/g, '');
      
      const resp = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: { 
              nonce, 
              chainId: `0x${base.id.toString(16)}` 
            }
          }
        }]
      }) as WalletConnectResponse;

      const accountInfo = resp.accounts[0];
      const { address } = accountInfo;
      const { message, signature } = accountInfo.capabilities.signInWithEthereum;

      // Send to backend verify
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature })
      });

      const json = await res.json();
      if (json.ok) {
        setAddress(address);
      } else {
        throw new Error(json.error || 'Verification failed');
      }
    } catch (e: any) {
      setError(e.message || 'Sign in failed');
    }
  };

  // Custom button handler
  const handleCustomSignIn = async () => {
    if (!sdk) return;
    try {
      setError(null);
      const provider = sdk.getProvider();
      const nonce = window.crypto.randomUUID().replace(/-/g, '');
      
      const resp = await provider.request({
        method: 'wallet_connect',
        params: [{
          version: '1',
          capabilities: {
            signInWithEthereum: { 
              nonce, 
              chainId: `0x${base.id.toString(16)}` 
            }
          }
        }]
      }) as WalletConnectResponse;

      const accountInfo = resp.accounts[0];
      const { address } = accountInfo;
      const { message, signature } = accountInfo.capabilities.signInWithEthereum;

      // Send to backend verify
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature })
      });

      const json = await res.json();
      if (json.ok) {
        setAddress(address);
      } else {
        throw new Error(json.error || 'Verification failed');
      }
    } catch (e: any) {
      setError(e.message || 'Sign in failed');
    }
  };

  if (address) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Signed in as {address}</h2>
        <button 
          onClick={() => setAddress(null)}
          style={{ 
            marginTop: '1rem', 
            padding: '10px 20px', 
            background: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem' }}>Sign in with Base Demo</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Sign in with Base Demo</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Prebuilt UI Component</h2>
        <SignInWithBaseButton
          onClick={handlePrebuiltSignIn}
          colorScheme="light"
          variant="solid"
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Custom Implementation</h2>
        <button
          onClick={handleCustomSignIn}
          style={{ 
            padding: '10px 20px', 
            background: '#0070f3', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Custom Sign In With Base
        </button>
      </div>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          Error: {error}
        </p>
      )}
    </div>
  );
}
