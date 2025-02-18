import React from 'react';
import Video from 'react-native-video';
import {View, Text, Button, StyleSheet} from 'react-native';
import {mystyles} from './MyStyle';

const HomeScreen = ({navigation}) => {
  return (
    <View style={mystyles.container}>
      <Video
        source={require('../videoforapp/homeswing.mp4')}
        style={mystyles.backgroundVideo}
        muted
        repeat
        resizeMode="cover"
      />
      <Text style={mystyles.title}>Swing Tracker</Text>
      <Button
        title="Normal mode"
        onPress={() => navigation.navigate('Appscreen')}
      />
      <View style={mystyles.buttonSpacing}></View> {/* เพิ่มระยะห่าง */}
      <Button
        title="Game random mode"
        onPress={() => navigation.navigate('Gamescreen')}
      />
    </View>
  );
};

export default HomeScreen;
