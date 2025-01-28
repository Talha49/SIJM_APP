import { Stack } from 'expo-router';
import '../global.css';
import Header from '../src/components/Header'; // Adjust the path as needed
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <>
    <AuthProvider>
      {/* Global Header */}
     <Header />

      {/* Screen Navigation */}
      <Stack 
     
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="login" />
      </Stack>

      </AuthProvider>
    </>
  );
}
