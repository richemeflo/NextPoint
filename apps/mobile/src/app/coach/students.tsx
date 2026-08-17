import { useEffect, useMemo, useState } from 'react';
import type { StudentSex } from '@nextpoint/shared';
import { type Href, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

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

const webScrollStyle =
  Platform.OS === 'web'
    ? ({
        overflowX: 'hidden',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      } as unknown as ViewStyle)
    : undefined;

function StudentRow({
  compact,
  student,
}: {
  compact: boolean;
  student: AssociatedStudent;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const initials = student.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('');

  const content = (pressed = false) => (
    <Card
      elevated
      style={[
        styles.studentRow,
        compact && styles.studentRowCompact,
        pressed && styles.studentRowPressed,
      ]}>
      <View style={styles.studentIdentity}>
        <View
          style={[
            styles.studentAvatar,
            { backgroundColor: theme.backgroundSelected },
          ]}>
          <ThemedText type="smallBold" themeColor="primary">
            {initials || '—'}
          </ThemedText>
        </View>
        <View style={styles.studentMain}>
          <ThemedText numberOfLines={1} type="smallBold">
            {student.fullName}
          </ThemedText>
          {student.profileComplete ? (
            <ThemedText
              numberOfLines={1}
              type="small"
              themeColor="textMuted">
              {[
                t('students.levelValue', { level: student.padelLevel }),
                student.age === null
                  ? null
                  : t('students.ageValue', { age: student.age }),
                t(
                  `profile.sex.${student.sex === 'not_specified' ? 'notSpecified' : student.sex}`
                ),
              ]
                .filter(Boolean)
                .join(' · ')}
            </ThemedText>
          ) : (
            <ThemedText
              numberOfLines={1}
              type="smallBold"
              themeColor="warning">
              {t('students.incompleteProfile')}
            </ThemedText>
          )}
        </View>
      </View>
      <View style={[styles.contact, compact && styles.contactCompact]}>
        {student.phone ? (
          <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
            {student.phone}
          </ThemedText>
        ) : null}
        {student.email ? (
          <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
            {student.email}
          </ThemedText>
        ) : null}
        {!student.phone && !student.email ? (
          <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
            {t('students.noContact')}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[styles.disclosure, compact && styles.disclosureCompact]}
        themeColor="primary"
        type="subtitle">
        ›
      </ThemedText>
    </Card>
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push(`/coach/students/${student.userId}` as Href)
      }
      style={styles.studentListItem}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

export default function CoachStudentsScreen() {
  const { width } = useWindowDimensions();
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
  const compactStudentRows = width < 680;

  useEffect(() => {
    if (!user) return;

    let active = true;

    void getAssociatedStudents(user.id)
      .then((result) => {
        if (!active) return;

        if (!result.ok) {
          setLoadState('error');
          return;
        }

        setStudents(result.data);
        setLoadState('ready');
      })
      .catch(() => {
        if (!active) return;
        setLoadState('error');
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
      <FlatList
        contentContainerStyle={styles.scrollContent}
        data={filteredStudents}
        initialNumToRender={12}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(student) => student.userId}
        ListEmptyComponent={
          <View style={styles.emptyResult}>
            {students.length === 0 ? (
              <Feedback
                message={t('students.emptyListBody')}
                title={t('students.emptyListTitle')}
                tone="info"
              />
            ) : (
              <Feedback
                message={t('students.emptyFilterBody')}
                title={t('students.emptyFilterTitle')}
                tone="info"
              />
            )}
          </View>
        }
        ListHeaderComponent={
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
              containerStyle={styles.searchField}
              label={t('students.searchLabel')}
              onChangeText={(query) =>
                setFilters((current) => ({ ...current, query }))
              }
              placeholder={t('students.searchPlaceholder')}
              style={styles.searchInput}
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
          </View>
        }
        maxToRenderPerBatch={12}
        renderItem={({ item }) => (
          <StudentRow compact={compactStudentRows} student={item} />
        )}
        scrollEnabled={!isAgeSliderActive}
        style={[styles.listScroller, webScrollStyle]}
        windowSize={7}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  listScroller: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  scrollContent: {
    alignItems: 'stretch',
    minWidth: 0,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    minWidth: 0,
    gap: Spacing.four,
    marginBottom: Spacing.four,
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
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    gap: Spacing.four,
    overflow: 'hidden',
  },
  searchField: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  searchInput: {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  resultsHeader: {
    gap: Spacing.one,
  },
  emptyResult: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  listSeparator: {
    height: Spacing.two,
  },
  studentListItem: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    minWidth: 0,
  },
  studentRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 112,
    gap: Spacing.three,
    paddingRight: Spacing.three,
  },
  studentRowCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
    minHeight: 164,
    paddingRight: Spacing.four,
  },
  studentRowPressed: {
    opacity: 0.76,
  },
  studentIdentity: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  studentMain: {
    minWidth: 0,
    flex: 1,
    gap: Spacing.one,
  },
  contact: {
    width: 260,
    minWidth: 0,
    minHeight: 44,
    flexShrink: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  contactCompact: {
    width: '100%',
    paddingLeft: 60,
  },
  disclosure: {
    flexShrink: 0,
    lineHeight: 32,
  },
  disclosureCompact: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
  },
});
