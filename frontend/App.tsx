import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

// LIVE BACKEND URL
const BACKEND_URL = 'https://thalexa-backend.vercel.app';

const App = () => {
  const [batchId, setBatchId] = useState('');
  const [origin, setOrigin] = useState('');
  const [scanning, setScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const createBatch = async () => {
    if (!batchId || !origin) return Alert.alert('Fill all fields');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/create-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, origin }),
      });
      const data = await res.json();
      if (data.success) {
        const qrRes = await fetch(`${BACKEND_URL}/qr/${batchId}`);
        const qrData = await qrRes.json();
        setQrCode(qrData.qr);
        Alert.alert('Success', `IPFS: ${data.uri}`);
      } else {
        Alert.alert('Error', data.error || 'Failed');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Check backend URL');
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanning(false);
    const id = data.split('/').pop();
    setBatchId(id || '');
    Alert.alert('Scanned', `Batch: ${id}`);
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Thalexa</Text>
      <Text style={styles.subtitle}>Trace Every Bean</Text>

      <TextInput placeholder="Batch ID" value={batchId} onChangeText={setBatchId} style={styles.input} />
      <TextInput placeholder="Origin" value={origin} onChangeText={setOrigin} style={styles.input} />

      <TouchableOpacity style={styles.button} onPress={createBatch} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Batch'}
        </Text>
      </TouchableOpacity>

      {qrCode ? (
        <Image source={{ uri: qrCode }} style={styles.qr} />
      ) : null}

      <TouchableOpacity style={styles.scanBtn} onPress={() => setScanning(true)}>
        <Text style={styles.scanText}>Scan QR</Text>
      </TouchableOpacity>

      {scanning && hasPermission && (
        <View style={styles.scanner}>
          <Camera
            onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity style={styles.close} onPress={() => setScanning(false)}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', padding: 20, alignItems: 'center' },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#6F4E37' },
  subtitle: { fontSize: 16, color: '#4CAF50', marginBottom: 20 },
  input: { backgroundColor: 'white', borderRadius: 10, padding: 14, width: '100%', marginBottom: 15, borderWidth: 1, borderColor: '#4CAF50' },
  button: { backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  scanBtn: { backgroundColor: '#8B4513', padding: 14, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 10 },
  scanText: { color: 'white', fontWeight: 'bold' },
  qr: { width: 200, height: 200, margin: 20 },
  scanner: { height: 300, width: '100%', marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  close: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  closeText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});