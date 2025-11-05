const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

let pinata;
if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_API_KEY) {
    try {
        const PinataSDK = require('@pinata/sdk');
        pinata = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);
        console.log('Pinata LIVE');
    } catch (e) {
        console.warn('Pinata failed');
    }
}

app.get('/', (req, res) => {
    res.json({ message: 'Thalexa Backend LIVE', ipfs: !!pinata });
});

app.post('/create-batch', async (req, res) => {
    try {
        const { batchId, origin } = req.body;
        if (!batchId || !origin) return res.status(400).json({ error: 'Missing fields' });

        let uri = 'ipfs://mock';
        if (pinata) {
            const metadata = { name: `Batch ${batchId}`, origin, date: new Date().toISOString() };
            const result = await pinata.pinJSONToIPFS(metadata);
            uri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
        }

        res.json({ success: true, uri, batchId });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/qr/:batchId', async (req, res) => {
    try {
        const url = `thalexa://batch/${req.params.batchId}`;
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