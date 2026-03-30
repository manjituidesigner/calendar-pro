import './global.css';
import 'react-native-gesture-handler';
import { useFonts, Inter_300Light, Inter_500Medium, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { FormProvider } from './src/context/FormContext';
import { BaseLayout } from './src/components/BaseLayout';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { DrawerNavigator } from './src/navigation/DrawerNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import { RootNavigator } from './src/navigation/RootNavigator';

const AppNavigator = () => {
  const { isDark } = useTheme();
  const { user, loading } = useAuth();
  
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: 'transparent',
    },
  };

  if (loading) {
    return <ActivityIndicator size="large" className="flex-1 justify-center items-center" />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <BaseLayout>
          <RootNavigator />
        </BaseLayout>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    InterLight: Inter_300Light,
    InterMedium: Inter_500Medium,
    InterExtraBold: Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" className="flex-1 justify-center items-center" />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <FormProvider>
            <AppNavigator />
          </FormProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
