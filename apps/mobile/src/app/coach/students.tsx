import { useEffect, useMemo, useState } from 'react';
import type { StudentSex } from '@nextpoint/shared';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  filterAssociatedStudents,
  padelLevels,
  type StudentListFilters,
} from '@/features/students/student-list-filters';
import {
  STUDENT_MAX_AGE,
  STUDENT_MIN_AGE,
  StudentAgeRangeSlider,
} from '@/features/students/student-age-range-slider';
import { StudentFilterSelector } from '@/features/students/student-filter-selector';
import { ManualStudentForm } from '@/features/students/manual-student-form';
import {
  getAssociatedStudents,
  type AssociatedStudent,
} from '@/features/students/student-coach-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

const emptyFilters: StudentListFilters = {
  query: '',
  level: null,
  minAge: STUDENT_MIN_AGE,
  maxAge: STUDENT_MAX_AGE,
  sex: null,
};

function StudentRow({ student }: { student: AssociatedStudent }) {
  const { t } = useTranslation();

  return (
    <Card style={styles.studentRow}>
      <View style={styles.studentMain}>
        <ThemedText type="smallBold">{student.fullName}</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {t('students.levelValue', { level: student.padelLevel })} ·{' '}
          {t('students.ageValue', { age: student.age })} ·{' '}
          {t(`profile.sex.${student.sex === 'not_specified' ? 'notSpecified' : student.sex}`)}
        </ThemedText>
      </View>
      <View style={styles.contact}>
        <ThemedText type="small" themeColor="textMuted">
          {student.phone}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {student.email}
        </ThemedText>
      </View>
    </Card>
  );
}

export default function CoachStudentsScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [students, setStudents] = useState<AssociatedStudent[]>([]);
  const [filters, setFilters] = useState<StudentListFilters>(emptyFilters);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createdStudentName, setCreatedStudentName] = useState<string | null>(
    null
  );
  const [isAgeSliderActive, setIsAgeSliderActive] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (!user) return;

    let active = true;

    void getAssociatedStudents(user.id).then((result) => {
      if (!active) return;

      if (!result.ok) {
        setLoadState('error');
        return;
      }

      setStudents(result.data);
      setLoadState('ready');
    });

    return () => {
      active = false;
    };
  }, [user]);

  const filteredStudents = useMemo(
    () => filterAssociatedStudents(students, filters),
    [filters, students]
  );
  const hasFilters =
    filters.query.trim().length > 0 ||
    filters.level !== null ||
    filters.minAge !== STUDENT_MIN_AGE ||
    filters.maxAge !== STUDENT_MAX_AGE ||
    filters.sex !== null;

  const sexOptions: { value: StudentSex | null; label: string }[] = [
    { value: null, label: t('students.allSexes') },
    { value: 'female', label: t('profile.sex.female') },
    { value: 'male', label: t('profile.sex.male') },
    { value: 'other', label: t('profile.sex.other') },
    {
      value: 'not_specified',
      label: t('profile.sex.notSpecified'),
    },
  ];

  if (loadState === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('students.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!isAgeSliderActive}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('role.coachLabel')}
            </ThemedText>
            <ThemedText type="title">{t('students.title')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('students.subtitle')}
            </ThemedText>
            {!isCreateOpen ? (
              <View style={styles.headingAction}>
                <Button
                  label={t('students.createAction')}
                  onPress={() => {
                    setCreatedStudentName(null);
                    setIsCreateOpen(true);
                  }}
                />
              </View>
            ) : null}
          </View>

          {isCreateOpen ? (
            <Card elevated>
              <ManualStudentForm
                onCancel={() => setIsCreateOpen(false)}
                onCreated={(student) => {
                  setStudents((current) =>
                    [...current, student].sort((left, right) =>
                      left.fullName.localeCompare(right.fullName)
                    )
                  );
                  setCreatedStudentName(student.fullName);
                  setIsCreateOpen(false);
                }}
              />
            </Card>
          ) : null}
          {createdStudentName ? (
            <Feedback
              message={t('students.createSuccessBody', {
                name: createdStudentName,
              })}
              title={t('students.createSuccessTitle')}
              tone="success"
            />
          ) : null}

          {loadState === 'error' ? (
            <Feedback
              message={t('students.loadErrorBody')}
              title={t('students.loadErrorTitle')}
              tone="error"
            />
          ) : null}

          <Card elevated style={styles.filters}>
            <TextField
              autoCapitalize="words"
              label={t('students.searchLabel')}
              onChangeText={(query) =>
                setFilters((current) => ({ ...current, query }))
              }
              placeholder={t('students.searchPlaceholder')}
              value={filters.query}
            />
            <StudentFilterSelector
              label={t('students.levelFilterLabel')}
              onChange={(level) =>
                setFilters((current) => ({ ...current, level }))
              }
              options={[
                { value: null, label: t('students.allLevels') },
                ...padelLevels.map((level) => ({
                  value: level,
                  label: String(level),
                })),
              ]}
              value={filters.level}
            />
            <StudentFilterSelector
              label={t('students.sexFilterLabel')}
              onChange={(sex) =>
                setFilters((current) => ({ ...current, sex }))
              }
              options={sexOptions}
              value={filters.sex}
            />
            <StudentAgeRangeSlider
              onChange={([minAge, maxAge]) =>
                setFilters((current) => ({ ...current, minAge, maxAge }))
              }
              onInteractionChange={setIsAgeSliderActive}
              value={[filters.minAge, filters.maxAge]}
            />
            {hasFilters ? (
              <Button
                label={t('students.resetFilters')}
                onPress={() => setFilters(emptyFilters)}
                variant="secondary"
              />
            ) : null}
          </Card>

          <View style={styles.resultsHeader}>
            <ThemedText type="smallBold">{t('students.resultsTitle')}</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {t('students.resultCount', { count: filteredStudents.length })}
            </ThemedText>
          </View>

          {students.length === 0 ? (
            <Feedback
              message={t('students.emptyListBody')}
              title={t('students.emptyListTitle')}
              tone="info"
            />
          ) : filteredStudents.length === 0 ? (
            <Feedback
              message={t('students.emptyFilterBody')}
              title={t('students.emptyFilterTitle')}
              tone="info"
            />
          ) : (
            <View style={styles.list}>
              {filteredStudents.map((student) => (
                <StudentRow key={student.userId} student={student} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  heading: {
    maxWidth: 720,
    gap: Spacing.two,
  },
  headingAction: {
    alignItems: 'flex-start',
    paddingTop: Spacing.one,
  },
  filters: {
    gap: Spacing.four,
  },
  resultsHeader: {
    gap: Spacing.one,
  },
  list: {
    gap: Spacing.two,
  },
  studentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  studentMain: {
    minWidth: 200,
    flex: 1,
    gap: Spacing.one,
  },
  contact: {
    minWidth: 220,
    alignItems: 'flex-start',
    gap: Spacing.one,
  },
});
