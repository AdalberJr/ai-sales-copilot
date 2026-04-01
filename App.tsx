import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

function ScreenShell({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: '700', color: '#0F172A', marginBottom: 12 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 16, lineHeight: 24, color: '#475569' }}>{subtitle}</Text>
    </View>
  );
}

function TodayScreen() {
  return (
    <ScreenShell
      title="Today"
      subtitle="Hier landen bald überfällige und heute fällige Follow-ups, damit Sales-Arbeit klar priorisiert ist."
    />
  );
}

function LeadsScreen() {
  return (
    <ScreenShell
      title="Leads"
      subtitle="Hier entsteht die Lead-Liste mit Suche, Statusfiltern und schnellem Zugriff auf alle Kontakte."
    />
  );
}

function SettingsScreen() {
  return (
    <ScreenShell
      title="Settings"
      subtitle="Hier kommen später Profil, Logout und grundlegende App-Einstellungen rein."
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
