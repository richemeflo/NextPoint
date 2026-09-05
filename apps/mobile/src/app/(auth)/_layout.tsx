import Stack from 'expo-router/stack';

import { productName } from '@/features/legal/legal-config';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, title: productName }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
