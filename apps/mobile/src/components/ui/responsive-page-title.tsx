import { useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';

const mobilePageTitleBreakpoint = 760;

export function ResponsivePageTitle({
  context,
  title,
}: {
  context: string;
  title: string;
}) {
  const { width } = useWindowDimensions();
  const compact = width < mobilePageTitleBreakpoint;

  return (
    <>
      <ThemedText type="smallBold" themeColor="primary">
        {compact ? title : context}
      </ThemedText>
      {compact ? null : <ThemedText type="title">{title}</ThemedText>}
    </>
  );
}
