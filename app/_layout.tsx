import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error("error getting token:", error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("error saving token:", error);
    }
  },
};

function RootLayoutNav() {
  const { isSignedIn } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      {!isSignedIn ? (
        <>
          <Stack.Screen
            name="index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="sign-up"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="sign-in"
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="movie/[id]"
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing Clerk publishable key");
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}