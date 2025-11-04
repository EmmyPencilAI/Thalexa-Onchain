// src/config/wagmi.ts
import { createConfig, http } from 'wagmi';
import { arcTestnet } from 'wagmi/chains';
import { walletConnect, injected, phantom } from '@wagmi/connectors';

const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Get free at walletconnect.com

export const wagmiConfig = createConfig({
    chains: [arcTestnet],
    transports: {
        [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
    },
    connectors: [
        injected(),
        phantom(),
        walletConnect({ projectId }),
    ],
});