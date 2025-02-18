import React, {useEffect, useState} from 'react';
import {View, Text, Button, Alert, StyleSheet} from 'react-native';
import Video from 'react-native-video';
import {BleManager} from 'react-native-ble-plx';
import {Buffer} from 'buffer';
import {mystyles} from './MyStyle';

const SERVICE_UUID = '180D';
const CHARACTERISTIC_UUID = '2A57';

const GameScreen = () => {
  const [bleManager] = useState(new BleManager());
  const [device, setDevice] = useState(null);
  const [swingCount, setSwingCount] = useState(0);
  const [targetCount, setTargetCount] = useState(generateRandomTarget());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('รอเชื่อมต่อ...');

  useEffect(() => {
    return () => {
      bleManager.destroy();
    };
  }, []);

  useEffect(() => {
    if (swingCount >= targetCount) {
      Alert.alert(
        '🎉 สำเร็จ!',
        `คุณทำได้ ${swingCount} ครั้ง ครบเป้าหมายแล้ว!`,
        [{text: 'เล่นใหม่', onPress: resetGame}],
      );
    }
  }, [swingCount]);

  function generateRandomTarget() {
    return Math.floor(Math.random() * (30 - 20 + 1)) + 20;
  }

  const scanAndConnect = () => {
    setConnectionStatus('กำลังค้นหา BLE...');
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Scan Error: ', error);
        setConnectionStatus('การค้นหาอุปกรณ์ล้มเหลว');
        return;
      }
      if (device?.name?.includes('SwingTracker')) {
        bleManager.stopDeviceScan();
        connectToDevice(device);
      }
    });
  };

  const connectToDevice = device => {
    device
      .connect()
      .then(device => {
        setConnectionStatus('เชื่อมต่อสำเร็จ!');
        setIsConnected(true);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        setDevice(device);
        subscribeToSwingData(device);
      })
      .catch(error => {
        console.log('Connection Error: ', error);
        setConnectionStatus('การเชื่อมต่อล้มเหลว!');
      });
  };

  const subscribeToSwingData = device => {
    let lastSwingValue = 0; // เก็บค่าการแกว่งล่าสุดเพื่อกันการเพิ่มผิดพลาด

    device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.log('BLE Error: ', error);
          return;
        }
        if (characteristic?.value) {
          try {
            const decodedBytes = Buffer.from(characteristic.value, 'base64');
            const decodedValue = decodedBytes.readUInt8(0);

            if (!isNaN(decodedValue) && decodedValue !== lastSwingValue) {
              lastSwingValue = decodedValue;
              setSwingCount(prevCount => prevCount + 1); // เพิ่มขึ้นทีละ 1
            }
          } catch (error) {
            console.log('Error decoding BLE value:', error);
          }
        }
      },
    );
  };

  const resetGame = () => {
    setSwingCount(0);
    setTargetCount(generateRandomTarget());
  };

  return (
    <View style={mystyles.container}>
      <Video
        source={require('../videoforapp/Swing.mp4')}
        style={mystyles.backgroundVideo}
        muted
        repeat
        resizeMode="cover"
      />
      <Text style={mystyles.title}>🎮 Game Mode</Text>
      <View style={mystyles.container1}>
        <Text style={mystyles.target}>🎯 เป้าหมาย: {targetCount} ครั้ง</Text>
        <Text style={mystyles.count}> {swingCount} </Text>
      </View>
      {!isConnected ? (
        <Button title="🔗 เชื่อมต่อ BLE" onPress={scanAndConnect} />
      ) : (
        <Text style={mystyles.statusText}>{connectionStatus}</Text>
      )}
    </View>
  );
};

export default GameScreen;
