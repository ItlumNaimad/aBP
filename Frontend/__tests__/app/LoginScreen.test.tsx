import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../../app/index';
import { PaperProvider } from 'react-native-paper';
import { LightTheme } from '../../theme';

// Mockowanie routera
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mockowanie klienta API
jest.mock('../../api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('LoginScreen', () => {
  it('renderuje poprawnie ekran logowania', () => {
    const { getByText } = render(
      <PaperProvider theme={LightTheme}>
        <LoginScreen />
      </PaperProvider>
    );

    expect(getByText('Monitor Ciśnienia')).toBeTruthy();
    expect(getByText('Zaloguj się')).toBeTruthy();
  });

  it('wyświetla błąd przy pustym polu tekstowym', () => {
    const { getByText } = render(
      <PaperProvider theme={LightTheme}>
        <LoginScreen />
      </PaperProvider>
    );

    const loginButton = getByText('Zaloguj się');
    fireEvent.press(loginButton);

    expect(getByText('Wpisz swoją nazwę użytkownika')).toBeTruthy();
  });
});

