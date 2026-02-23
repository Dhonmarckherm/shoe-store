import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Web platform warning - face recognition doesn't work in browser
function WebWarning() {
  return (
    <View style={styles.container}>
      <View style={styles.warningBox}>
        <Text style={styles.title}>⚠️ Web Browser Detected</Text>
        <Text style={styles.message}>
          Face recognition does NOT work in web browsers.
        </Text>
        <Text style={styles.message}>
          Please use the {' '}
          <Text style={styles.bold}>Expo Go app</Text>
          {' '}on your phone instead.
        </Text>
        <View style={styles.steps}>
          <Text style={styles.stepTitle}>How to fix:</Text>
          <Text style={styles.step}>1. Install Expo Go from App Store/Play Store</Text>
          <Text style={styles.step}>2. Open Expo Go app on your phone</Text>
          <Text style={styles.step}>3. Scan the QR code on your computer</Text>
          <Text style={styles.step}>4. DO NOT press 'w' for web</Text>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Linking.openURL('https://expo.dev/client')}
        >
          <Text style={styles.buttonText}>Download Expo Go</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function App() {
  // Show warning on web platform
  if (Platform.OS === 'web') {
    return <WebWarning />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
    justifyContent: 'center',
  },
  warningBox: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e94560',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#eaeaea',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#0f3460',
    backgroundColor: '#e94560',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  steps: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 12,
  },
  step: {
    fontSize: 14,
    color: '#eaeaea',
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
