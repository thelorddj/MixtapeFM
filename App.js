import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PlayerScreen from './src/screens/PlayerScreen';
import SplashScreen from './src/screens/SplashScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import GameScreen from './src/screens/GameScreen'; // ← 1. Importamos la pantalla del minijuego

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

            // Asignación de iconos para la barra principal de la App
            if (route.name === 'Radio') {
              iconName = focused ? 'radio' : 'radio-outline';
            } else if (route.name === 'Programación') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Cassette Riders') {
              // ← 2. Icono para la pestaña del minijuego (el nombre real
              // de la pantalla es "Cassette Riders", no "Minijuego")
              iconName = focused ? 'game-controller' : 'game-controller-outline';
            }
            if (!iconName) iconName = 'game-controller-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#e91e63',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopWidth: 2,
            borderTopColor: '#e91e63',
            height: 80,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          headerStyle: {
            backgroundColor: '#1a1a1a',
            borderBottomWidth: 2,
            borderBottomColor: '#e91e63',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Radio" component={PlayerScreen} />
        <Tab.Screen name="Programación" component={ScheduleScreen} />
        {/* 3. Agregamos la pestaña del juego */}
        <Tab.Screen name="Cassette Riders" component={GameScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}