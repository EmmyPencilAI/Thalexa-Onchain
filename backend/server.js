const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const connection = new Connection(process.env.RPC_URL || 'https://rpc.testnet.arc.network');

// PROGRAM_ID (SAFE)
let programId;
try {
    programId = new PublicKey(process.env.PROGRAM_ID);
    console.log('Program ID LIVE:', programId.toBase58());
} catch (e) {
    console.warn('Invalid PROGRAM_ID — using mock');
    programId = new PublicKey('11111111111111111111111111111111');
}

// PINATA (FIXED CLASS + SAFE)
let pinata;
if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
    try {
        const PinataSDK = require('@pinata/sdk');
        pinata = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);
        console.log('Pinata LIVE!');
    } catch (e) {
        console.warn('Pinata error — IPFS disabled');
    }
} else {
    console.warn('No Pinata keys — IPFS disabled');
}

// TEST ROUTE
app.get('/', (req, res) => {
    res.json({
        message: 'Thalexa Backend LIVE!',
        programId: programId.toBase58(),
        ipfs: !!pinata
    });
});

// CREATE BATCH + IPFS (LIVE)
app.post('/create-batch', async (req, res) => {
    try {
        const { batchId, origin } = req.body;
        if (!batchId || !origin) return res.status(400).json({ error: 'batchId and origin required' });

        let uri = 'ipfs://mock';
        if (pinata) {
            const metadata = { name: `Batch ${batchId}`, origin, date: new Date().toISOString() };
            const result = await pinata.pinJSONToIPFS(metadata);
            uri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
            console.log('IPFS Pin:', uri);
        }

        res.json({ success: true, uri, batchId });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GENERATE QR (LIVE)
app.get('/qr/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;
        const url = `thalexa://batch/${batchId}`;
        const qr = await QRCode.toDataURL(url);
        res.json({ qr, url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend LIVE at http://localhost:${PORT}`);
});