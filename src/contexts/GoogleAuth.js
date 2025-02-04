import { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const googleClientId = "1048483058759-hduec78p110nuf8i1lsh5g7u3fse3huf.apps.googleusercontent.com";

export function useGoogleAuth() {
  const [userInfo, setUserInfo] = useState(null);

  const redirectUri = makeRedirectUri({
    scheme: "myapp", // Use the scheme from app.json
    useProxy: true, // Use Expo proxy (optional)
  });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: googleClientId,
      scopes: ["profile", "email"],
      redirectUri,
    },
    { authorizationEndpoint: "https://accounts.google.com/o/oauth2/auth" }
  );

  useEffect(() => {
    if (response?.type === "success") {
      fetchNextAuthSession(response.params);
    }
  }, [response]);

  const fetchNextAuthSession = async ({ id_token }) => {
    try {
      const res = await fetch("http://192.168.18.29:3000/api/auth/callback/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token }),
      });

      const data = await res.json();
      if (data?.user) {
        setUserInfo(data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return { userInfo, promptAsync };
}
