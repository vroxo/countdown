import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimeRemaining } from '../types';
import { useTheme } from '../hooks/useTheme';
import { spacing, fontSize, borderRadius } from '../theme/styles';

interface CountdownDisplayProps {
  time: TimeRemaining;
  size?: 'small' | 'medium' | 'large';
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ 
  time, 
  size = 'medium' 
}) => {
  const { theme } = useTheme();

  if (time.isFinished) {
    return (
      <View style={[styles.finishedContainer, { backgroundColor: theme.colors.success + '20' }]}>
        <Text style={[styles.finishedText, { color: theme.colors.success }]}>
          🎉 Finalizado!
        </Text>
      </View>
    );
  }

  const timeUnits = [
    { value: time.days, label: time.days === 1 ? 'Dia' : 'Dias' },
    { value: time.hours, label: time.hours === 1 ? 'Hora' : 'Horas' },
    { value: time.minutes, label: time.minutes === 1 ? 'Min' : 'Mins' },
    { value: time.seconds, label: 'Seg' },
  ];

  const sizeStyles = {
    small: { number: fontSize.md, label: fontSize.xs, padding: spacing.xs },
    medium: { number: fontSize.xl, label: fontSize.sm, padding: spacing.sm },
    large: { number: fontSize.xxxl, label: fontSize.md, padding: spacing.md },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={styles.container}>
      {timeUnits.map((unit, index) => (
        <View key={unit.label} style={styles.unitWrapper}>
          <View
            style={[
              styles.unitBox,
              { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                padding: currentSize.padding,
              },
            ]}
          >
            <Text
              style={[
                styles.number,
                { 
                  color: theme.colors.text, 
                  fontSize: currentSize.number,
                },
              ]}
            >
              {String(unit.value).padStart(2, '0')}
            </Text>
            <Text
              style={[
                styles.label,
                { 
                  color: theme.colors.textSecondary, 
                  fontSize: currentSize.label,
                },
              ]}
            >
              {unit.label}
            </Text>
          </View>
          {index < timeUnits.length - 1 && (
            <Text style={[styles.separator, { color: theme.colors.textSecondary }]}>:</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitBox: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  number: {
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontWeight: '600',
    marginTop: 2,
  },
  separator: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    marginHorizontal: spacing.xs,
  },
  finishedContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  finishedText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
});

