import React, { useState } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import './App.css';

const RPC_URL = 'https://rpc.testnet.arc.network';
const PROGRAM_ID = '0xfB09314B03B44B9dD21bC76A7f45b0Ab1C6Cc834';
const connection = new Connection(RPC_URL);
const wallets = [new PhantomWalletAdapter()];

function AppContent() {
  const { publicKey, connected, signTransaction } = useWallet();
  const [batchId, setBatchId] = useState('');
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(false);

  const createBatch = async () => {
    if (!publicKey) return alert('Connect wallet');
    setLoading(true);
    try {
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PROGRAM_ID),
          lamports: 100000,
        })
      );
      const signed = await signTransaction!(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig);
      alert(`Success: ${sig.slice(0, 8)}...`);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Thalexa</h1>
      <WalletMultiButton />
      {connected && (
        <>
          <p>{publicKey?.toBase58().slice(0, 8)}...</p>
          <input placeholder="Batch ID" value={batchId} onChange={e => setBatchId(e.target.value)} />
          <input placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} />
          <button onClick={createBatch} disabled={loading}>
            {loading ? 'Creating...' : 'Create Batch'}
          </button>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AppContent />
      </WalletModalProvider>
    </WalletProvider>
  );
}