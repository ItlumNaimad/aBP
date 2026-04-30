import React from 'react';
import { render } from '@testing-library/react-native';
import BloodPressureChart from '../../components/BloodPressureChart';
import { PaperProvider } from 'react-native-paper';
import { LightTheme } from '../../theme';

// Mock victory-native i skia żeby zapobiec próbie renderowania natywnych widoków
jest.mock('victory-native', () => ({
  CartesianChart: () => null,
  Line: () => null,
  useChartPressState: () => ({ state: {}, isActive: false }),
}));

jest.mock('@shopify/react-native-skia', () => ({
  Circle: () => null,
}));

describe('BloodPressureChart', () => {
  it('wyświetla informację o braku danych gdy jest 0 pomiarów', () => {
    const { getByText } = render(
      <PaperProvider theme={LightTheme}>
        <BloodPressureChart measurements={[]} />
      </PaperProvider>
    );

    expect(getByText(/Potrzebne są co najmniej 2 pomiary/)).toBeTruthy();
  });

  it('wyświetla informację o braku danych gdy jest 1 pomiar', () => {
    const measurements = [
      { id: '1', userId: 'user', systolic: 120, diastolic: 80, pulse: 70, isAnomaly: false, createdAt: new Date().toISOString() }
    ];

    const { getByText } = render(
      <PaperProvider theme={LightTheme}>
        <BloodPressureChart measurements={measurements} />
      </PaperProvider>
    );

    expect(getByText(/Potrzebne są co najmniej 2 pomiary/)).toBeTruthy();
  });

  it('renderuje legendę i tytuł gdy ma co najmniej 2 pomiary', () => {
    const measurements = [
      { id: '1', userId: 'u1', systolic: 120, diastolic: 80, pulse: 70, isAnomaly: false, createdAt: '2023-01-01T10:00' },
      { id: '2', userId: 'u1', systolic: 125, diastolic: 82, pulse: 72, isAnomaly: false, createdAt: '2023-01-02T10:00' }
    ];

    const { getByText } = render(
      <PaperProvider theme={LightTheme}>
        <BloodPressureChart measurements={measurements} />
      </PaperProvider>
    );

    expect(getByText('Wykres ciśnienia')).toBeTruthy();
    expect(getByText('SYS')).toBeTruthy();
    expect(getByText('DIA')).toBeTruthy();
    expect(getByText('Puls')).toBeTruthy();
  });
});
