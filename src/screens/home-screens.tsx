import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../providers/auth-provider';

function ScreenShell({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export function TodayScreen() {
  return (
    <ScreenShell
      title="Today"
      subtitle="Hier landen bald überfällige und heute fällige Follow-ups, damit Sales-Arbeit klar priorisiert ist."
    />
  );
}

export function LeadsScreen() {
  return (
    <ScreenShell
      title="Leads"
      subtitle="Hier entsteht als Nächstes die Lead-Liste mit Suche, Filtern und schnellem Zugriff auf jede Opportunity."
    />
  );
}

export function SettingsScreen() {
  const { session, signOut } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Angemeldet als {session?.user.email ?? 'unbekannt'}.</Text>
      <Pressable onPress={signOut} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: '#475569',
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#0F172A',
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
