import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, Menu, IconButton, Appbar } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { Text } from 'react-native';

// Import screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import PipelineScreen from './src/screens/pipeline/PipelineScreen';
import ActivitiesScreen from './src/screens/activities/ActivitiesScreen';
import TeamsScreen from './src/screens/teams/TeamsScreen';
import CustomersScreen from './src/screens/customers/CustomersScreen';
import ForecastScreen from './src/screens/forecast/ForecastScreen';
import LeadsScreen from './src/screens/leads/LeadsScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for authenticated users
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👥</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Pipeline"
        component={PipelineScreen}
        options={{
          title: 'Pipeline',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator for other screens (Customers, Teams, Forecast)
const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen 
        name="Customers" 
        component={CustomersScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          title: 'Customers',
        }}
      />
      <Stack.Screen 
        name="Teams" 
        component={TeamsScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          title: 'Teams',
        }}
      />
      <Stack.Screen 
        name="Forecast" 
        component={ForecastScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          title: 'Forecast',
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { authState, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState?.authenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Themed App Wrapper
const ThemedApp = () => {
  const { theme } = useTheme();
  
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default App;