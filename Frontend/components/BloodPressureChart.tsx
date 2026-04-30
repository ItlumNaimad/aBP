import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { medicalColors } from '../theme';
import type { Measurement } from '../store/useAppStore';
import type { MD3Theme } from 'react-native-paper';

// Dynamiczny import zapobiega błędom bundlera przy pierwszej inicjalizacji na Web
// Zostaną załadowane kiedy WithSkiaWeb udostępni silnik
let CartesianChart: any;
let ChartLine: any;
let useChartPressState: any;
let SkiaCircle: any;

try {
  const victory = require('victory-native');
  CartesianChart = victory.CartesianChart;
  ChartLine = victory.Line;
  useChartPressState = victory.useChartPressState;

  const skia = require('@shopify/react-native-skia');
  SkiaCircle = skia.Circle;
} catch (e) {
  console.warn('Wykresy Victory/Skia niedostępne', e);
}

interface BloodPressureChartProps {
  measurements: Measurement[];
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  } catch {
    return '??';
  }
}

export default function BloodPressureChart({ measurements }: BloodPressureChartProps) {
  const theme = useTheme<MD3Theme>();

  if (measurements.length < 2) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Wykres ciśnienia
        </Text>
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            Potrzebne są co najmniej 2 pomiary,{'\n'}aby wyświetlić wykres.
          </Text>
        </View>
      </Surface>
    );
  }

  // Jeśli importy się nie powiodły, pokaż informację (zabezpieczenie fallback)
  if (!CartesianChart) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
        <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
          Wykres ciśnienia
        </Text>
        <View style={styles.emptyState}>
          <Text variant="bodyMedium" style={{ color: theme.colors.error, textAlign: 'center' }}>
            Moduł wykresów nie mógł zostać załadowany.
          </Text>
        </View>
      </Surface>
    );
  }

  return <NativeChart measurements={measurements} theme={theme} />;
}

function NativeChart({ measurements, theme }: { measurements: Measurement[]; theme: MD3Theme }) {
  const { state, isActive } = useChartPressState({ x: 0, y: { systolic: 0, diastolic: 0, pulse: 0 } });

  const chartData = useMemo(() => {
    return [...measurements]
      .reverse()
      .map((m, index) => ({
        index,
        systolic: m.systolic,
        diastolic: m.diastolic,
        pulse: m.pulse,
        date: formatShortDate(m.createdAt),
      }));
  }, [measurements]);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        Wykres ciśnienia
      </Text>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>SYS</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>DIA</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: medicalColors.danger }]} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Puls</Text>
        </View>
      </View>

      {/* Wykres Victory Native */}
      <View style={styles.chartWrapper}>
        <CartesianChart
          data={chartData}
          xKey="index"
          yKeys={['systolic', 'diastolic', 'pulse']}
          domainPadding={{ top: 20, bottom: 20, left: 10, right: 10 }}
          axisOptions={{
            tickCount: { x: Math.min(chartData.length, 5), y: 5 },
            formatXLabel: (val: number) => {
              const idx = Math.round(val);
              if (idx >= 0 && idx < chartData.length) {
                return chartData[idx].date;
              }
              return '';
            },
            formatYLabel: (val: number) => String(Math.round(val)),
            labelColor: theme.colors.onSurfaceVariant,
            lineColor: theme.colors.outline + '40',
          }}
          chartPressState={state}
        >
          {({ points }: any) => (
            <>
              <ChartLine
                points={points.systolic}
                color={theme.colors.primary}
                strokeWidth={3}
                curveType="natural"
              />
              <ChartLine
                points={points.diastolic}
                color={theme.colors.secondary}
                strokeWidth={3}
                curveType="natural"
              />
              <ChartLine
                points={points.pulse}
                color={medicalColors.danger}
                strokeWidth={2}
                curveType="natural"
              />
              {isActive && (
                <>
                  <SkiaCircle cx={state.x.position} cy={state.y.systolic.position} r={6} color={theme.colors.primary} />
                  <SkiaCircle cx={state.x.position} cy={state.y.diastolic.position} r={6} color={theme.colors.secondary} />
                  <SkiaCircle cx={state.x.position} cy={state.y.pulse.position} r={6} color={medicalColors.danger} />
                </>
              )}
            </>
          )}
        </CartesianChart>
      </View>

      {/* Interaktywne wartości pod wykresem — widoczne po naciśnięciu */}
      {isActive && (
        <View style={[styles.tooltip, { backgroundColor: theme.colors.elevation.level3 }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
            SYS: {Math.round(state.y.systolic.value.value)}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary, fontWeight: '700' }}>
            DIA: {Math.round(state.y.diastolic.value.value)}
          </Text>
          <Text variant="bodySmall" style={{ color: medicalColors.danger, fontWeight: '700' }}>
            Puls: {Math.round(state.y.pulse.value.value)}
          </Text>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartWrapper: {
    height: 220,
    width: '100%',
  },
  emptyState: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
  },
});
