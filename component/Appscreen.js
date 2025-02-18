import React, { useEffect, useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, StyleSheet, Alert } from 'react-native';
import Video from 'react-native-video';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { mystyles } from './MyStyle';

const SERVICE_UUID = "180D";
const CHARACTERISTIC_UUID = "2A57";

const AppScreen = () => {
  const [bleManager] = useState(new BleManager());
  const [device, setDevice] = useState(null);
  const [swingCount, setSwingCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('รอเชื่อมต่อ...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    requestPermissions();
    return () => {
      bleManager.destroy();
    };
  }, []);

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

  const scanAndConnect = async () => {
    setConnectionStatus('กำลังค้นหา BLE...');
    let scanTimeout = setTimeout(() => {
      bleManager.stopDeviceScan();
      setConnectionStatus('ไม่พบอุปกรณ์ SwingTracker');
    }, 10000);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Scan Error: ", error);
        setConnectionStatus('การค้นหาอุปกรณ์ล้มเหลว');
        return;
      }
      if (device?.name?.includes("SwingTracker")) {
        clearTimeout(scanTimeout);
        bleManager.stopDeviceScan();
        connectToDevice(device);
      }
    });
  };

  const connectToDevice = (device) => {
    device
      .connect()
      .then((device) => {
        setConnectionStatus('เชื่อมต่อสำเร็จ!');
        setIsConnected(true);
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

  const disconnectFromDevice = () => {
    if (device) {
      Alert.alert("ยกเลิกการเชื่อมต่อ", `คุณได้แกว่งไปทั้งหมด ${swingCount} ครั้ง`, [
        { text: "ตกลง", onPress: () => {
          device.cancelConnection()
            .then(() => {
              setIsConnected(false);
              setDevice(null);
              setSwingCount(0);
              setConnectionStatus('ยกเลิกการเชื่อมต่อแล้ว');
            })
            .catch((error) => {
              console.log("Disconnect Error: ", error);
            });
        }}
      ]);
    }
  };

  const subscribeToSwingData = (device) => {
    device.monitorCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID, (error, characteristic) => {
      if (error) {
        console.log("BLE Error: ", error);
        return;
      }
      if (characteristic?.value) {
        try {
          const rawValue = characteristic.value;
          const decodedBytes = Buffer.from(rawValue, 'base64');
          const decodedValue = decodedBytes.readUInt8(0);

          console.log("Raw BLE Value: ", rawValue);
          console.log("Decoded Numeric Value: ", decodedValue);

          if (!isNaN(decodedValue)) {
            setSwingCount(decodedValue);
          }
        } catch (error) {
          console.log("Error decoding BLE value:", error);
        }
      }
    });
  };

  return (
    <View style={mystyles.container}>
      <Video source={require('../videoforapp/Swing.mp4')} style={mystyles.backgroundVideo} muted repeat resizeMode="cover" />
      <View>
        <Text style={mystyles.title}>Swing Counter</Text>
        {!isConnected ? (
          <Button title="เชื่อมต่อ BLE" onPress={scanAndConnect} />
        ) : (
          <View style={mystyles.container1}>
            <Text style={mystyles.count}>{swingCount}</Text>
            <Text>{connectionStatus}</Text>
            <Button title="ยกเลิกการเชื่อมต่อ" onPress={disconnectFromDevice} />
          </View>
        )}
      </View>
    </View>
  );
};

export default AppScreen;
