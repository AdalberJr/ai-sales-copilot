import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/providers/auth-provider';
import { AuthScreen } from './src/screens/auth-screen';
import { LeadsScreen, SettingsScreen, TodayScreen } from './src/screens/home-screens';

const Tab = createBottomTabNavigator();

function AppShell() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F8FAFC',
          gap: 12,
        }}
      >
        <ActivityIndicator size="large" color="#0F172A" />
        <Text style={{ color: '#475569', fontSize: 15 }}>Session wird geladen…</Text>
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerTitleStyle: { fontWeight: '700' },
          tabBarActiveTintColor: '#0F172A',
          tabBarInactiveTintColor: '#64748B',
        }}
      >
        <Tab.Screen name="Today" component={TodayScreen} />
        <Tab.Screen name="Leads" component={LeadsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
