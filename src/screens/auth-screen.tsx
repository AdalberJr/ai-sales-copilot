import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../providers/auth-provider';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submitLabel = mode === 'login' ? 'Einloggen' : 'Account erstellen';

  async function handleSubmit() {
    setSubmitting(true);
    setMessage(null);

    const action = mode === 'login' ? signIn : signUp;
    const { error } = await action(email.trim(), password);

    if (error) {
      setMessage(error);
    } else if (mode === 'signup') {
      setMessage('Account erstellt. Prüfe ggf. deine Mail zur Bestätigung.');
    }

    setSubmitting(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>AI Sales Copilot</Text>
        <Text style={styles.title}>{mode === 'login' ? 'Willkommen zurück' : 'Neuen Account anlegen'}</Text>
        <Text style={styles.subtitle}>
          Melde dich an, um Leads, Wiedervorlagen und AI-Sales-Hilfen sicher zu verwalten.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>E-Mail</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="name@firma.de"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Passwort</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Mindestens 6 Zeichen"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable onPress={handleSubmit} style={styles.primaryButton} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{submitLabel}</Text>}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode((current) => (current === 'login' ? 'signup' : 'login'));
            setMessage(null);
          }}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === 'login' ? 'Noch kein Account? Jetzt registrieren' : 'Schon ein Account? Jetzt einloggen'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    color: '#0F172A',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    color: '#334155',
    fontSize: 14,
    marginBottom: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
});
