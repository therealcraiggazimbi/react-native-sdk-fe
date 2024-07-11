import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import * as Linking from "expo-linking";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const prefix = Linking.createURL("/");

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    const handleDeepLink = (event: { url: string }) => {
      let data = Linking.parse(event.url);
      console.log(data);
      if (data.path === "success") {
        // Handle successful payment
        console.log("Payment was successful!");
      } else if (data.path === "cancel") {
        // Handle cancelled payment
        console.log("Payment was cancelled.");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <StripeProvider publishableKey="pk_test_51LfhM2Bc6oxjTWva7XTjdgL0PD7xmJpWvbEtyXxbAuBZNImaf3HZ6JeN3vrRXGL5r5rqOg5bRYQA2vdymFh8mCEj001icA4Rv7">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack linking={{ prefixes: [prefix] }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </StripeProvider>
  );
}
