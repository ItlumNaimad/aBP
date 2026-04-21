import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { loginUser } from '../api/client';
import type { MD3Theme } from 'react-native-paper';

/**
 * Ekran logowania (index.tsx).
 *
 * Prosty formularz z jednym polem „Nazwa użytkownika".
 * Po zatwierdzeniu wysyła POST /api/users/login i przekierowuje do Dashboard.
 */
export default function LoginScreen() {
  const theme = useTheme<MD3Theme>();
  const setUser = useAppStore((s) => s.setUser);

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Wpisz swoją nazwę użytkownika');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await loginUser(trimmed);
      setUser(user);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Nie udało się połączyć z serwerem';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(theme);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo / Ikona aplikacji */}
        <Surface style={styles.logoContainer} elevation={2}>
          <Text style={styles.logoEmoji}>🩺</Text>
        </Surface>

        <Text variant="headlineLarge" style={styles.title}>
          Monitor Ciśnienia
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Zaloguj się, aby rozpocząć monitorowanie zdrowia
        </Text>

        {/* Formularz */}
        <Surface style={styles.formCard} elevation={1}>
          <TextInput
            label="Nazwa użytkownika"
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              if (error) setError('');
            }}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            contentStyle={styles.inputContent}
            error={!!error}
            disabled={loading}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="login"
          >
            Zaloguj się
          </Button>
        </Surface>

        <Text variant="bodySmall" style={styles.footer}>
          Aplikacja do monitorowania ciśnienia krwi i tętna
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    inner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 28,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryContainer,
      marginBottom: 20,
    },
    logoEmoji: {
      fontSize: 48,
    },
    title: {
      fontWeight: '700',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 32,
      paddingHorizontal: 16,
    },
    formCard: {
      width: '100%',
      maxWidth: 400,
      borderRadius: 20,
      padding: 24,
      backgroundColor: theme.colors.elevation.level1,
    },
    input: {
      fontSize: 18,
    },
    inputContent: {
      paddingVertical: 8,
    },
    button: {
      marginTop: 8,
      borderRadius: 16,
    },
    buttonContent: {
      paddingVertical: 12,
    },
    buttonLabel: {
      fontSize: 18,
      fontWeight: '600',
    },
    footer: {
      marginTop: 32,
      color: theme.colors.outline,
      textAlign: 'center',
    },
  });
