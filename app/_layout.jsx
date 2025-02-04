import { Stack } from 'expo-router';
import '../global.css';
import Header from '../src/components/Header'; // Adjust the path as needed
import { AuthProvider } from '../src/contexts/AuthContext';
import { Provider } from 'react-redux';
import store from '../src/redux/Store/store';
import { ToastProvider } from '../src/components/customtoast';
export default function RootLayout() {
  return (
    <>

    <Provider store={store}>
    <ToastProvider> 
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
      </ToastProvider>
      </Provider>
    </>
  );
}
