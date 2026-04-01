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
  const [isError, setIsError] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setMessage(null);
    const action = mode === 'login' ? signIn : signUp;
    const { error } = await action(email.trim(), password);
    if (error) {
      setIsError(true);
      setMessage(error);
    } else if (mode === 'signup') {
      setIsError(false);
      setMessage('Account erstellt. Bitte prüfe deine E-Mail zur Bestätigung.');
    }
    setSubmitting(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoEmoji}>⚡</Text>
        </View>
        <Text style={styles.appName}>AI Sales Copilot</Text>
        <Text style={styles.tagline}>Dein intelligenter Sales-Assistent</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>
          {mode === 'login' ? 'Willkommen zurück' : 'Account erstellen'}
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
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {message ? (
          <View style={[styles.messageBanner, isError ? styles.errorBanner : styles.successBanner]}>
            <Text style={[styles.messageText, isError ? styles.errorText : styles.successText]}>
              {message}
            </Text>
          </View>
        ) : null}

        <Pressable onPress={handleSubmit} style={styles.primaryButton} disabled={submitting}>
          {submitting
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.primaryButtonText}>
                {mode === 'login' ? 'Einloggen' : 'Account erstellen'}
              </Text>
          }
        </Pressable>

        <Pressable
          onPress={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setMessage(null); }}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {mode === 'login'
              ? 'Noch kein Account? Registrieren'
              : 'Schon registriert? Einloggen'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 28,
  },
  appName: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    color: '#64748B',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F8FAFC',
    fontSize: 16,
  },
  messageBanner: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBanner: { backgroundColor: '#450A0A' },
  successBanner: { backgroundColor: '#052E16' },
  messageText: { fontSize: 14, lineHeight: 20 },
  errorText: { color: '#FCA5A5' },
  successText: { color: '#86EFAC' },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  switchText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '600',
  },
});
