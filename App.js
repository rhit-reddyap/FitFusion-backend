import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import Dashboard from './screens/Dashboard';
import Workouts from './screens/Workouts';
import Food from './screens/Food';
import Analytics from './screens/Analytics';
import Profile from './screens/Profile';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Dashboard">
        <Drawer.Screen name="Dashboard" component={Dashboard} />
        <Drawer.Screen name="Workouts" component={Workouts} />
        <Drawer.Screen name="Food" component={Food} />
        <Drawer.Screen name="Analytics" component={Analytics} />
        <Drawer.Screen name="Profile" component={Profile} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
