import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Surface, useTheme, DataTable } from 'react-native-paper';
import { medicalColors } from '../theme';
import type { Measurement } from '../store/useAppStore';
import type { MD3Theme } from 'react-native-paper';

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

  if (Platform.OS === 'web') {
    return <WebFallbackTable measurements={measurements} theme={theme} />;
  }

  return <NativeChart measurements={measurements} theme={theme} />;
}

function WebFallbackTable({ measurements, theme }: { measurements: Measurement[]; theme: MD3Theme }) {
  const reversed = useMemo(() => [...measurements].reverse(), [measurements]);

  const avgSys = Math.round(measurements.reduce((s, m) => s + m.systolic, 0) / measurements.length);
  const avgDia = Math.round(measurements.reduce((s, m) => s + m.diastolic, 0) / measurements.length);
  const avgPulse = Math.round(measurements.reduce((s, m) => s + m.pulse, 0) / measurements.length);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>
        📊 Dane pomiarów
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        Wykres interaktywny dostępny w aplikacji mobilnej
      </Text>

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

      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Data</DataTable.Title>
          <DataTable.Title numeric>SYS</DataTable.Title>
          <DataTable.Title numeric>DIA</DataTable.Title>
          <DataTable.Title numeric>Puls</DataTable.Title>
        </DataTable.Header>

        {reversed.map((m, i) => (
          <DataTable.Row key={m.id || i} style={m.isAnomaly ? { backgroundColor: medicalColors.danger + '15' } : undefined}>
            <DataTable.Cell>{formatShortDate(m.createdAt)}</DataTable.Cell>
            <DataTable.Cell numeric><Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{m.systolic}</Text></DataTable.Cell>
            <DataTable.Cell numeric><Text style={{ color: theme.colors.secondary, fontWeight: '600' }}>{m.diastolic}</Text></DataTable.Cell>
            <DataTable.Cell numeric><Text style={{ color: medicalColors.danger, fontWeight: '600' }}>{m.pulse}</Text></DataTable.Cell>
          </DataTable.Row>
        ))}

        <DataTable.Row style={{ backgroundColor: theme.colors.elevation.level3 }}>
          <DataTable.Cell><Text style={{ fontWeight: '700', color: theme.colors.onSurface }}>Średnia</Text></DataTable.Cell>
          <DataTable.Cell numeric><Text style={{ fontWeight: '700', color: theme.colors.primary }}>{avgSys}</Text></DataTable.Cell>
          <DataTable.Cell numeric><Text style={{ fontWeight: '700', color: theme.colors.secondary }}>{avgDia}</Text></DataTable.Cell>
          <DataTable.Cell numeric><Text style={{ fontWeight: '700', color: medicalColors.danger }}>{avgPulse}</Text></DataTable.Cell>
        </DataTable.Row>
      </DataTable>
    </Surface>
  );
}

let CartesianChart: any;
let ChartLine: any;
let useChartPressState: any;
let SkiaCircle: any;

if (Platform.OS !== 'web') {
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
}

function NativeChart({ measurements, theme }: { measurements: Measurement[]; theme: MD3Theme }) {
  const { state, isActive } = useChartPressState({ x: 0, y: { systolic: 0, diastolic: 0, pulse: 0 } });

  const chartData = useMemo(() => {
    return [...measurements].reverse().map((m, index) => ({
      index,
      systolic: m.systolic,
      diastolic: m.diastolic,
      pulse: m.pulse,
      date: formatShortDate(m.createdAt),
    }));
  }, [measurements]);

  if (!CartesianChart) return null;

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>Wykres ciśnienia</Text>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} /><Text variant="bodySmall">SYS</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} /><Text variant="bodySmall">DIA</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: medicalColors.danger }]} /><Text variant="bodySmall">Puls</Text></View>
      </View>
      <View style={styles.chartWrapper}>
        <CartesianChart data={chartData} xKey="index" yKeys={['systolic', 'diastolic', 'pulse']} domainPadding={{ top: 20, bottom: 20, left: 10, right: 10 }} axisOptions={{ tickCount: { x: Math.min(chartData.length, 5), y: 5 }, formatXLabel: (val: number) => { const idx = Math.round(val); return (idx >= 0 && idx < chartData.length) ? chartData[idx].date : ''; }, formatYLabel: (val: number) => String(Math.round(val)), labelColor: theme.colors.onSurfaceVariant, lineColor: theme.colors.outline + '40' }} chartPressState={state}>
          {({ points }: any) => (
            <>
              <ChartLine points={points.systolic} color={theme.colors.primary} strokeWidth={3} curveType="natural" />
              <ChartLine points={points.diastolic} color={theme.colors.secondary} strokeWidth={3} curveType="natural" />
              <ChartLine points={points.pulse} color={medicalColors.danger} strokeWidth={2} curveType="natural" />
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
      {isActive && (
        <ChartTooltip state={state} theme={theme} />
      )}
    </Surface>
  );
}

/**
 * Tooltip wyodrębniony do osobnego komponentu, aby uniknąć
 * ostrzeżenia Reanimated: "Reading from value during component render".
 *
 * Wartości SharedValue z victory-native są odczytywane bezpiecznie
 * w useEffect (poza cyklem render) i mostowane do stanu React.
 */
function ChartTooltip({ state, theme }: { state: any; theme: MD3Theme }) {
  const [values, setValues] = React.useState({ sys: 0, dia: 0, pulse: 0 });

  React.useEffect(() => {
    // Odczytujemy SharedValue w bezpiecznym interwale (poza renderem Reacta),
    // co rozwiązuje ostrzeżenie Reanimated oraz zapobiega pętli "Maximum update depth".
    const intervalId = setInterval(() => {
      const sysVal = state.y.systolic?.value ?? state.y.systolic;
      const diaVal = state.y.diastolic?.value ?? state.y.diastolic;
      const pulseVal = state.y.pulse?.value ?? state.y.pulse;

      const sys = typeof sysVal === 'object' && sysVal !== null ? sysVal.value : sysVal;
      const dia = typeof diaVal === 'object' && diaVal !== null ? diaVal.value : diaVal;
      const pulse = typeof pulseVal === 'object' && pulseVal !== null ? pulseVal.value : pulseVal;

      const s = Math.round(sys ?? 0);
      const d = Math.round(dia ?? 0);
      const p = Math.round(pulse ?? 0);

      setValues(prev => {
        if (prev.sys === s && prev.dia === d && prev.pulse === p) return prev;
        return { sys: s, dia: d, pulse: p };
      });
    }, 50);

    return () => clearInterval(intervalId);
  }, [state]);

  return (
    <View style={[styles.tooltip, { backgroundColor: theme.colors.elevation.level3 }]}>
      <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>SYS: {values.sys}</Text>
      <Text variant="bodySmall" style={{ color: theme.colors.secondary, fontWeight: '700' }}>DIA: {values.dia}</Text>
      <Text variant="bodySmall" style={{ color: medicalColors.danger, fontWeight: '700' }}>Puls: {values.pulse}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 20, padding: 16, marginBottom: 16 },
  title: { fontWeight: '700', marginBottom: 8 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  chartWrapper: { height: 220, width: '100%' },
  emptyState: { height: 120, justifyContent: 'center', alignItems: 'center' },
  tooltip: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginTop: 8 },
});

