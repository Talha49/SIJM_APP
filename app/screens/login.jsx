
// // LoginScreen.js
// import React, { useContext, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   Keyboard,
// } from "react-native";
// import { FontAwesome } from "@expo/vector-icons";
// import { Link, useNavigation, useRouter } from "expo-router";
// import { AuthContext } from '../../src/contexts/AuthContext';
// import ForgotPasswordModal from "../../src/constants/ForgotPassword";

// const LoginScreen = () => {
//   const { login, loading } = useContext(AuthContext);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);


//   const navigation = useNavigation();
//   const router = useRouter();

//   useEffect(() => {
//     navigation.setOptions({
//       headerShown: false,
//     });
//   }, []);

//   const validateForm = () => {
//     Keyboard.dismiss();
//     const newErrors = {};

//     if (!email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = 'Email is invalid';
//     }

//     if (!password) {
//       newErrors.password = 'Password is required';
//     } else if (password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleLogin = async () => {
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     try {
//       await login(email, password);
//       router.push('/');
//     } catch (error) {
//       Alert.alert(
//         "Login Failed",
//         error?.message || "Please check your credentials and try again.",
//         [{ text: "OK" }]
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="#3B82F6" />
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 relative">
//       <Image
//         source={require("../../assets/loginpic.jpg")}
//         className="absolute w-full h-full"
//         style={{ opacity: 0.1 }}
//       />

//       <View className="flex-1 justify-center px-8">
//         <View className="bg-blue-200/35 p-8 rounded-3xl shadow-lg backdrop-blur-lg">
//           <Text className="text-3xl font-bold text-center mb-8 text-blue-900">
//             Welcome Back
//           </Text>

//           <View className="space-y-4">
//             <View>
//               <View className="bg-white/90 rounded-xl shadow-sm overflow-hidden">
//                 <View className="flex-row items-center px-4 py-3">
//                   <FontAwesome name="envelope" size={20} color="#3B82F6" />
//                   <TextInput
//                     className="flex-1 ml-3 text-base text-gray-800"
//                     placeholder="Email"
//                     value={email}
//                     onChangeText={(text) => {
//                       setEmail(text);
//                       setErrors({ ...errors, email: '' });
//                     }}
//                     autoCapitalize="none"
//                     keyboardType="email-address"
//                     editable={!isSubmitting}
//                   />
//                 </View>
//               </View>
//               {errors.email && (
//                 <Text className="text-red-500 text-sm ml-2 mt-1">{errors.email}</Text>
//               )}
//             </View>

//             <View>
//               <View className="bg-white/90 rounded-xl shadow-sm mt-4 overflow-hidden">
//                 <View className="flex-row items-center px-4 py-3">
//                   <FontAwesome name="lock" size={20} color="#3B82F6" />
//                   <TextInput
//                     className="flex-1 ml-3 text-base text-gray-800"
//                     placeholder="Password"
//                     value={password}
//                     onChangeText={(text) => {
//                       setPassword(text);
//                       setErrors({ ...errors, password: '' });
//                     }}
//                     secureTextEntry={!showPassword}
//                     editable={!isSubmitting}
//                   />
//                   <TouchableOpacity onPress={togglePasswordVisibility}>
//                     <FontAwesome 
//                       name={showPassword ? "eye-slash" : "eye"} 
//                       size={20} 
//                       color="#3B82F6" 
//                     />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               {errors.password && (
//                 <Text className="text-red-500 text-sm ml-2 mt-1">{errors.password}</Text>
//               )}
//             </View>
//           </View>

//           <TouchableOpacity
//             className={`${
//               isSubmitting ? 'bg-blue-400' : 'bg-blue-600'
//             } rounded-xl py-4 mt-6 mb-4`}
//             onPress={handleLogin}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <ActivityIndicator color="white" />
//             ) : (
//               <Text className="text-white text-center text-lg font-bold">
//                 Sign In
//               </Text>
//             )}
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setIsForgotPasswordVisible(true)}>
//         <Text>Forgot Password?</Text>
//       </TouchableOpacity>

//       <ForgotPasswordModal 
//         isVisible={isForgotPasswordVisible}
//         onClose={() => setIsForgotPasswordVisible(false)}
//       />

//           <View className="flex-row items-center my-4">
//             <View className="flex-1 h-0.5 bg-gray-300" />
//             <Text className="mx-4 text-gray-500">or</Text>
//             <View className="flex-1 h-0.5 bg-gray-300" />
//           </View>

//           <TouchableOpacity
//             className="bg-white rounded-xl py-4 flex-row justify-center items-center border border-gray-200"
//           >
//             <FontAwesome name="google" size={20} color="#DB4437" />
//             <Text className="text-gray-700 font-semibold ml-3">
//               Continue with Google
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <View className="flex justify-center items-center">
//           <Link href="/" className="text-blue-500 font-semibold mt-4">
//             Go to home
//           </Link>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default LoginScreen;




// LoginScreen.js
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Link, useNavigation, useRouter } from "expo-router";
import { AuthContext } from "../../src/contexts/AuthContext";
import ForgotPasswordModal from "../../src/constants/ForgotPassword";

import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

// Force the manual redirect URI
const manualRedirectUri = "https://auth.expo.io/@ghauritalha/my-app";
console.log("Using manual Redirect URI:", manualRedirectUri);

// Extract client IDs from your app.json's extra field
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra;
const { androidClientId, expoClientId } = extra || {};
console.log("androidClientId:", androidClientId, "expoClientId:", expoClientId);

const LoginScreen = () => {
  const { login, googleLogin, loading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      androidClientId,
      expoClientId,
      redirectUri: manualRedirectUri,
    },
    { redirectUri: manualRedirectUri }
  );

  useEffect(() => {
    console.log("OAuth Response:", response);
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken || response.params?.id_token;
      if (idToken) {
        handleGoogleLogin(idToken);
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      await googleLogin(idToken);
      router.push("/");
    } catch (error) {
      Alert.alert(
        "Google Login Failed",
        error?.message || "Something went wrong with Google login.",
        [{ text: "OK" }]
      );
    }
  };

  const validateForm = () => {
    Keyboard.dismiss();
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error?.message || "Please check your credentials and try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 relative">
      <Image
        source={require("../../assets/loginpic.jpg")}
        className="absolute w-full h-full"
        style={{ opacity: 0.1 }}
      />
      <View className="flex-1 justify-center px-8">
        <View className="bg-blue-200/35 p-8 rounded-3xl shadow-lg backdrop-blur-lg">
          <Text className="text-3xl font-bold text-center mb-8 text-blue-900">Welcome Back</Text>
          <View className="space-y-4">
            <View>
              <View className="bg-white/90 rounded-xl shadow-sm overflow-hidden">
                <View className="flex-row items-center px-4 py-3">
                  <FontAwesome name="envelope" size={20} color="#3B82F6" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-800"
                    placeholder="Email"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrors({ ...errors, email: "" });
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isSubmitting}
                  />
                </View>
              </View>
              {errors.email && <Text className="text-red-500 text-sm ml-2 mt-1">{errors.email}</Text>}
            </View>
            <View>
              <View className="bg-white/90 rounded-xl shadow-sm mt-4 overflow-hidden">
                <View className="flex-row items-center px-4 py-3">
                  <FontAwesome name="lock" size={20} color="#3B82F6" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-gray-800"
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrors({ ...errors, password: "" });
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
              {errors.password && <Text className="text-red-500 text-sm ml-2 mt-1">{errors.password}</Text>}
            </View>
          </View>
          <TouchableOpacity
            className={`${isSubmitting ? "bg-blue-400" : "bg-blue-600"} rounded-xl py-4 mt-6 mb-4`}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">Sign In</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsForgotPasswordVisible(true)}>
            <Text>Forgot Password?</Text>
          </TouchableOpacity>
          <ForgotPasswordModal isVisible={isForgotPasswordVisible} onClose={() => setIsForgotPasswordVisible(false)} />
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-0.5 bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-0.5 bg-gray-300" />
          </View>
          <TouchableOpacity
            className="bg-white rounded-xl py-4 flex-row justify-center items-center border border-gray-200"
            onPress={() => promptAsync()}
          >
            <FontAwesome name="google" size={20} color="#DB4437" />
            <Text className="text-gray-700 font-semibold ml-3">Continue with Google</Text>
          </TouchableOpacity>
        </View>
        <View className="flex justify-center items-center">
          <Link href="/" className="text-blue-500 font-semibold mt-4">Go to home</Link>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
