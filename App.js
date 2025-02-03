import React, { useEffect, useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const SERVICE_UUID = "180D";  // UUID ของ BLE Service
const CHARACTERISTIC_UUID = "2A57"; // UUID ของ Characteristic

const App = () => {
  const [bleManager] = useState(new BleManager());
  const [device, setDevice] = useState(null);
  const [swingCount, setSwingCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('รอเชื่อมต่อ...');

  useEffect(() => {
    requestPermissions();
    return () => {
      bleManager.destroy();  // Clean up เมื่อ component ถูก unmount
    };
  }, []);

  // ขอสิทธิ์ Bluetooth (Android 11 รองรับเฉพาะสิทธิ์เหล่านี้)
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } catch (err) {
        console.log('Error requesting permissions', err);
      }
    }
  };

  // ตรวจสอบอุปกรณ์ที่จับคู่แล้ว
  const checkPairedDevices = async () => {
    try {
      const devices = await bleManager.devices([]);
      const pairedDevice = devices.find(d => d.name === "SwingTracker");
      
      if (pairedDevice) {
        setConnectionStatus("พบอุปกรณ์ที่จับคู่แล้ว กำลังเชื่อมต่อ...");
        connectToDevice(pairedDevice);
      } else {
        scanAndConnect();
      }
    } catch (error) {
      console.log("Error checking paired devices:", error);
    }
  };

  // ค้นหาและเชื่อมต่อกับอุปกรณ์ BLE
  const scanAndConnect = async () => {
    setConnectionStatus('กำลังค้นหา BLE...');
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan Error: ", error);
        setConnectionStatus('การค้นหาอุปกรณ์ล้มเหลว');
        return;
      }
      if (device && device.name === "SwingTracker") {
        bleManager.stopDeviceScan();
        connectToDevice(device);
      }
    });
  };

  // เชื่อมต่อกับอุปกรณ์ที่พบ
  const connectToDevice = (device) => {
    device
      .connect()
      .then((device) => {
        setConnectionStatus('เชื่อมต่อสำเร็จ!');
        return device.discoverAllServicesAndCharacteristics();
      })
      .then((device) => {
        setDevice(device);
        subscribeToSwingData(device);
      })
      .catch((error) => {
        setConnectionStatus('การเชื่อมต่อล้มเหลว!');
        console.log("Connection Error: ", error);
      });
  };

  // รับค่าการแกว่งแขนแบบ real-time
  const subscribeToSwingData = (device) => {
    device.monitorCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID, (error, characteristic) => {
      if (error) {
        console.log("BLE Error: ", error);
        return;
      }
      if (characteristic?.value) {
        const decodedValue = parseInt(atob(characteristic.value), 10);
        console.log("Decoded Value: ", decodedValue);
        setSwingCount(decodedValue);
      }
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Swing Counter</Text>
      <Text style={{ fontSize: 40, marginVertical: 20 }}>{swingCount}</Text>
      <Text>{connectionStatus}</Text>
      <Button title="เชื่อมต่อ BLE" onPress={checkPairedDevices} />
    </View>
  );
};

export default App;
