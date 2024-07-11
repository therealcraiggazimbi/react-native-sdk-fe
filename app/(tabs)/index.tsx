import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const stripe = useStripe();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckoutWebView = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/checkout/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const session = await response.json();
      console.log("Session:", session); // For debugging
      if (session.clientSecret) {
        setCheckoutUrl(session.clientSecret);
      } else {
        throw new Error("Invalid session URL");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/checkout/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.clientSecret) {
        throw new Error("Invalid session ID");
      }

      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  const initializePaymentSheet = async () => {
    setIsLoading(true);
    const { clientSecret } = await fetchPaymentSheetParams();

    const { error } = await stripe.initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Your Merchant Name",
      returnURL: "myapp://stripe-redirect", // Ensure this matches your app scheme
    });

    if (!error) {
      setIsLoading(false);
      openPaymentSheet();
    } else {
      console.error(error);
      setIsLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await stripe.presentPaymentSheet();
    if (error) {
      console.log(`Error code: ${error.code}`, error.message);
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Your payment is confirmed!");
    }
  };

  if (checkoutUrl) {
    return <WebView source={{ uri: checkoutUrl }} style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Checkout Method</Text>
      <Button title="JavaScript SDK Checkout" onPress={handleCheckoutWebView} />
      <Button
        title="React Native SDK Checkout"
        onPress={initializePaymentSheet}
      />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});
