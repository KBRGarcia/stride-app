import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, View } from 'react-native';

const SPLASH_LOGO = require('../../assets/images/Stride-logo.png');

export function BrandSplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={SPLASH_LOGO}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Logo de Stride"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
  },
  logo: {
    width: 260,
    height: 260,
  },
});
