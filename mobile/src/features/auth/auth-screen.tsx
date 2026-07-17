import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/features/auth/use-auth';

export function AuthScreen() {
  const { isConfigured, isLoading, missingEnv, session, signIn, signOut, signUp } =
    useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'signin' | 'signup' | null>(
    null
  );

  async function handleAuthAction(action: 'signin' | 'signup') {
    setErrorMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Preencha e-mail e senha para continuar.');
      return;
    }

    setPendingAction(action);

    try {
      if (action === 'signin') {
        await signIn(trimmedEmail, password);
      } else {
        await signUp(trimmedEmail, password);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível autenticar.';
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSignOut() {
    setErrorMessage(null);
    setPendingAction('signin');

    try {
      await signOut();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível encerrar a sessão.';
      setErrorMessage(message);
    } finally {
      setPendingAction(null);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#0F6E5B" />
          <Text style={styles.loadingText}>Restaurando sessão do GGastos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (session) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Milestone 1</Text>
          <Text style={styles.title}>GGastos</Text>
          <Text style={styles.subtitle}>Sessão autenticada com Supabase.</Text>

          <View style={styles.sessionBox}>
            <Text style={styles.label}>Usuário atual</Text>
            <Text style={styles.sessionValue}>
              {session.user.email ?? session.user.id}
            </Text>
            <Text style={styles.hint}>
              O shell mínimo está pronto para receber dashboard, planejamento e sync.
            </Text>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable
            accessibilityRole="button"
            onPress={handleSignOut}
            style={[styles.primaryButton, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>Sair</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Fundação Supabase + Mobile</Text>
        <Text style={styles.title}>GGastos</Text>
        <Text style={styles.subtitle}>
          Cadastro, login e restauração de sessão no shell inicial do app.
        </Text>

        {!isConfigured ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Configuração pendente</Text>
            <Text style={styles.warningBody}>
              Defina as variáveis Expo públicas antes de autenticar:
            </Text>
            <Text style={styles.warningEnv}>{missingEnv.join('\n')}</Text>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            placeholderTextColor="#7C8A86"
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            placeholderTextColor="#7C8A86"
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={!isConfigured || pendingAction !== null}
          onPress={() => handleAuthAction('signin')}
          style={[
            styles.primaryButton,
            (!isConfigured || pendingAction !== null) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {pendingAction === 'signin' ? 'Entrando...' : 'Entrar'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={!isConfigured || pendingAction !== null}
          onPress={() => handleAuthAction('signup')}
          style={[
            styles.primaryButton,
            styles.secondaryButton,
            (!isConfigured || pendingAction !== null) && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.secondaryButtonText}>
            {pendingAction === 'signup' ? 'Criando conta...' : 'Criar conta'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4EFE7',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E4DACC',
    gap: 16,
  },
  eyebrow: {
    color: '#8A4B2A',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: '#18221E',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#52605C',
    fontSize: 16,
    lineHeight: 22,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: '#34403D',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D4CCC0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#18221E',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#0F6E5B',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E8F1EE',
  },
  secondaryButtonText: {
    color: '#0F6E5B',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  warningBox: {
    backgroundColor: '#FFF4E5',
    borderColor: '#F3C98B',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  warningTitle: {
    color: '#8A4B2A',
    fontSize: 15,
    fontWeight: '800',
  },
  warningBody: {
    color: '#7A5A35',
    fontSize: 14,
    lineHeight: 20,
  },
  warningEnv: {
    color: '#5E4120',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingText: {
    color: '#34403D',
    fontSize: 16,
    textAlign: 'center',
  },
  sessionBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D6E4DE',
    backgroundColor: '#F3F8F6',
    padding: 16,
    gap: 8,
  },
  sessionValue: {
    color: '#18221E',
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    color: '#52605C',
    fontSize: 14,
    lineHeight: 20,
  },
});
