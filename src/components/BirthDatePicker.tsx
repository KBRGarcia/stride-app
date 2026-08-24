import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useTheme } from '../hooks/useTheme';

const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const MIN_YEAR = 1920;
const ITEM_HEIGHT = 48;

type PickerField = 'day' | 'month' | 'year';

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampDay(year: number, monthIndex: number, day: number): number {
  return Math.min(day, daysInMonth(year, monthIndex));
}

function buildDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, clampDay(year, monthIndex, day));
}

interface BirthDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
}

export function BirthDatePicker({
  value,
  onChange,
  maximumDate = new Date(),
}: BirthDatePickerProps) {
  const { colors } = useTheme();
  const maxYear = maximumDate.getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let year = maxYear; year >= MIN_YEAR; year -= 1) {
      list.push(year);
    }
    return list;
  }, [maxYear]);

  const [openField, setOpenField] = useState<PickerField | null>(null);
  const [yearDraft, setYearDraft] = useState(String(value.getFullYear()));

  const selectedYear = value.getFullYear();
  const selectedMonth = value.getMonth();
  const selectedDay = value.getDate();
  const dayOptions = useMemo(
    () => Array.from({ length: daysInMonth(selectedYear, selectedMonth) }, (_, index) => index + 1),
    [selectedYear, selectedMonth]
  );

  const applyDate = (year: number, monthIndex: number, day: number) => {
    const next = buildDate(year, monthIndex, day);
    if (next > maximumDate) {
      onChange(maximumDate);
      return;
    }
    onChange(next);
  };

  const commitYear = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setYearDraft(String(selectedYear));
      return;
    }

    const year = Math.min(maxYear, Math.max(MIN_YEAR, parsed));
    setYearDraft(String(year));
    applyDate(year, selectedMonth, selectedDay);
    setOpenField(null);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          gap: 8,
          marginBottom: 24,
        },
        field: {
          flex: 1,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
        },
        fieldMonth: {
          flex: 1.6,
        },
        fieldLabel: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 4,
          fontWeight: '600',
        },
        fieldValue: {
          fontSize: 16,
          color: colors.text,
          fontWeight: '600',
        },
        overlay: {
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'flex-end',
        },
        sheet: {
          maxHeight: '72%',
          backgroundColor: colors.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        },
        sheetTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 6,
        },
        sheetHint: {
          fontSize: 13,
          color: colors.textMuted,
          marginBottom: 12,
        },
        yearInput: {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          color: colors.text,
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 10,
        },
        applyButton: {
          backgroundColor: colors.primary,
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: 'center',
          marginBottom: 12,
        },
        applyButtonText: {
          color: colors.primaryText,
          fontWeight: '700',
        },
        list: {
          maxHeight: 280,
        },
        option: {
          height: ITEM_HEIGHT,
          justifyContent: 'center',
          borderRadius: 10,
          paddingHorizontal: 12,
        },
        optionActive: {
          backgroundColor: colors.primaryActive,
        },
        optionText: {
          color: colors.textSecondary,
          fontSize: 16,
        },
        optionTextActive: {
          color: colors.primaryText,
          fontWeight: '700',
        },
      }),
    [colors]
  );

  return (
    <View>
      <View style={styles.row}>
        <Pressable style={styles.field} onPress={() => setOpenField('day')}>
          <Text style={styles.fieldLabel}>Día</Text>
          <Text style={styles.fieldValue}>{String(selectedDay).padStart(2, '0')}</Text>
        </Pressable>
        <Pressable style={[styles.field, styles.fieldMonth]} onPress={() => setOpenField('month')}>
          <Text style={styles.fieldLabel}>Mes</Text>
          <Text style={styles.fieldValue}>{MONTH_LABELS[selectedMonth]}</Text>
        </Pressable>
        <Pressable
          style={styles.field}
          onPress={() => {
            setYearDraft(String(selectedYear));
            setOpenField('year');
          }}
        >
          <Text style={styles.fieldLabel}>Año</Text>
          <Text style={styles.fieldValue}>{selectedYear}</Text>
        </Pressable>
      </View>

      <Modal
        visible={openField !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenField(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpenField(null)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            {openField === 'year' ? (
              <>
                <Text style={styles.sheetTitle}>Año de nacimiento</Text>
                <Text style={styles.sheetHint}>Escríbelo o elige en la lista</Text>
                <TextInput
                  style={styles.yearInput}
                  value={yearDraft}
                  onChangeText={setYearDraft}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="1980"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  onSubmitEditing={() => commitYear(yearDraft)}
                />
                <Pressable style={styles.applyButton} onPress={() => commitYear(yearDraft)}>
                  <Text style={styles.applyButtonText}>Usar este año</Text>
                </Pressable>
                <FlatList
                  data={years}
                  keyExtractor={(item) => String(item)}
                  style={styles.list}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[styles.option, item === selectedYear && styles.optionActive]}
                      onPress={() => commitYear(String(item))}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item === selectedYear && styles.optionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  )}
                />
              </>
            ) : null}

            {openField === 'month' ? (
              <>
                <Text style={styles.sheetTitle}>Mes</Text>
                <FlatList
                  data={MONTH_LABELS.map((label, index) => ({ label, index }))}
                  keyExtractor={(item) => item.label}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[styles.option, item.index === selectedMonth && styles.optionActive]}
                      onPress={() => {
                        applyDate(selectedYear, item.index, selectedDay);
                        setOpenField(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item.index === selectedMonth && styles.optionTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  )}
                />
              </>
            ) : null}

            {openField === 'day' ? (
              <>
                <Text style={styles.sheetTitle}>Día</Text>
                <FlatList
                  data={dayOptions}
                  keyExtractor={(item) => String(item)}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[styles.option, item === selectedDay && styles.optionActive]}
                      onPress={() => {
                        applyDate(selectedYear, selectedMonth, item);
                        setOpenField(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item === selectedDay && styles.optionTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  )}
                />
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
