import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './component/Homescreen';
import AppScreen from './component/Appscreen';
import Gamescreen from './component/Gamescreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Homescreen" component={HomeScreen} options={{ title: 'Home'}} />
        <Stack.Screen name="Appscreen" component={AppScreen} options={{ title: 'Swing Counter' }} />
        <Stack.Screen name="Gamescreen" component={Gamescreen} options={{ title: 'Game' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
