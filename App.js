import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PlayerScreen from './src/screens/PlayerScreen';
import SplashScreen from './src/screens/SplashScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import FacebookScreen from './src/screens/FacebookScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Radio') {
              iconName = focused ? 'radio' : 'radio-outline';
            } else if (route.name === 'Programación') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Facebook') {
              iconName = focused ? 'logo-facebook' : 'logo-facebook';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#e91e63',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
      backgroundColor: '#1a1a1a',          // ← Fondo de la barra
      borderTopWidth: 2,                   // ← Grosor del borde superior
      borderTopColor: '#e91e63',           // ← Color del borde superior
      height: 105,                          // ← Altura de la barra
      paddingBottom: 5,
      paddingTop: 5,
    },
    tabBarLabelStyle: {
      fontSize: 12,                        // ← Tamaño del texto
      fontWeight: 'bold',
    },
    headerStyle: {
      backgroundColor: '#1a1a1a',          // ← Fondo del header superior
      borderBottomWidth: 2,
      borderBottomColor: '#e91e63',
    },
    headerTintColor: '#fff',               // ← Color del texto del header
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  })}
>
      
        <Tab.Screen name="Radio" component={PlayerScreen} />
        <Tab.Screen name="Programación" component={ScheduleScreen} />
        <Tab.Screen name="Facebook" component={FacebookScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}