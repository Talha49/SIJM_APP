import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import axios from 'axios';
import { useToast } from '../components/customtoast';

const SCREEN_WIDTH = Dimensions.get('window').width;

const ForgotPasswordModal = ({ isVisible, onClose }) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [receivedOtp, setReceivedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  const scrollViewRef = useRef(null);
  const otpRefs = Array(5).fill(0).map(() => useRef());
  let timerInterval = useRef(null);

  React.useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (currentStep - 1) * (SCREEN_WIDTH - 32),
        animated: true
      });
    }
  }, [currentStep]);


  const startTimer = () => {
    clearInterval(timerInterval.current);
    setTimer(60);
    timerInterval.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    const errors = {};
    if (password.length < 8) errors.length = 'Min 8 characters required';
    if (!/[A-Z]/.test(password)) errors.uppercase = 'One uppercase required';
    if (!/[a-z]/.test(password)) errors.lowercase = 'One lowercase required';
    if (!/[0-9]/.test(password)) errors.number = 'One number required';
    if (!/[!@#$%^&*]/.test(password)) errors.special = 'One special char required';
    return errors;
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        'http:// 192.168.1.14:3000/api/auth/forgot-password',
        { email }
      );

      if (response.data.otp) {
        setReceivedOtp(response.data.otp);
        showToast('OTP sent successfully', 'success');
        setCurrentStep(2);
        startTimer();
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to send OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (value.length > 1) value = value[0];
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '') {
      if (index < 4) {
        otpRefs[index + 1].current.focus();
      }
    } else if (index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === receivedOtp) {
      setCurrentStep(3);
      clearInterval(timerInterval.current);
    } else {
      showToast('Invalid OTP. Please try again.', 'error');
    }
  };

  const handleResetPassword = async () => {
    const errors = validatePassword(newPassword);
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      showToast('Password does not meet requirements', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        'http:// 192.168.1.14:3000/api/auth/reset-password',
        { email, newPassword }
      );

      if (response.data.message) {
        showToast('Password reset successful', 'success');
        handleClose();
      }
    } catch (error) {
      showToast(error.response?.data?.error || 'Password reset failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    clearInterval(timerInterval.current);
    setCurrentStep(1);
    setEmail('');
    setOtp(['', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrors({});
    onClose();
  };
  
  const renderEmailStep = () => (
    <View className="p-8 w-full">
      <Text className="text-3xl font-bold text-center mb-4 text-gray-800">
        Forgot Password
      </Text>
      <Text className="text-gray-600 mb-8 text-center text-base">
        Enter your email address to receive a verification code
      </Text>
      
      <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center border border-gray-200 shadow-sm">
        <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
          <FontAwesome name="envelope" size={20} color="#3B82F6" />
        </View>
        <TextInput
          className="flex-1 ml-4 text-base text-gray-800"
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        className={`mt-8 rounded-2xl py-4 ${
          isLoading ? 'bg-blue-400' : 'bg-blue-600'
        } shadow-lg`}
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-bold text-lg">
          {isLoading ? 'Sending...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View className="p-8 w-full">
      <Text className="text-3xl font-bold text-center mb-4 text-gray-800">
        Enter OTP
      </Text>
      <Text className="text-gray-600 mb-8 text-center text-base">
        Enter the verification code sent to{'\n'}{email}
      </Text>

      <View className="flex-row justify-between mb-8 px-4">
        {otp.map((digit, index) => (
          <View key={index} className="w-12 h-16 mx-1">
            <TextInput
              ref={otpRefs[index]}
              className="w-full h-full border-2 border-gray-300 rounded-2xl text-center text-xl bg-gray-50 text-gray-800"
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              style={{ fontSize: 24 }}
            />
          </View>
        ))}
      </View>

      <View className="flex-row justify-between items-center mb-8 px-4">
        <View className="bg-blue-50 px-4 py-2 rounded-full">
          <Text className="text-blue-600 font-medium">
            Time: {timer}s
          </Text>
        </View>
        <TouchableOpacity 
          onPress={timer === 0 ? handleSendOTP : null}
          disabled={timer > 0}
          className="px-4 py-2"
        >
          <Text className={`${timer > 0 ? 'text-gray-400' : 'text-blue-600'} font-medium`}>
            Resend OTP
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-blue-600 rounded-2xl py-4 shadow-lg"
        onPress={verifyOtp}
      >
        <Text className="text-white text-center font-bold text-lg">
          Verify OTP
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPasswordStep = () => (
    <View className="p-8 w-full">
      <Text className="text-3xl font-bold text-center mb-4 text-gray-800">
        Reset Password
      </Text>
      
      <View className="space-y-6 mb-8">
        <View>
          <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center border border-gray-200 shadow-sm">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
              <FontAwesome name="lock" size={20} color="#3B82F6" />
            </View>
            <TextInput
              className="flex-1 ml-4 text-base text-gray-800"
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          {Object.values(passwordErrors).map((error, index) => (
            <Text key={index} className="text-red-500 text-sm ml-2 mt-2 font-medium">
              {error}
            </Text>
          ))}
        </View>

        <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center border border-gray-200 shadow-sm">
          <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
            <FontAwesome name="lock" size={20} color="#3B82F6" />
          </View>
          <TextInput
            className="flex-1 ml-4 text-base text-gray-800"
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
      </View>

      <TouchableOpacity
        className={`rounded-2xl py-4 ${
          isLoading ? 'bg-blue-400' : 'bg-blue-600'
        } shadow-lg`}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-bold text-lg">
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
    visible={isVisible}
    transparent
    animationType="slide"
    onRequestClose={handleClose}
  >
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-black/50 justify-center">
        <View className="mx-4 bg-white rounded-2xl">
          <TouchableOpacity
            onPress={handleClose}
            className="absolute right-4 top-4 z-10"
          >
            <FontAwesome name="times" size={24} color="gray" />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: SCREEN_WIDTH * 3 }}
          >
            <View style={{ width: SCREEN_WIDTH - 32 }}>
              {renderEmailStep()}
            </View>
            <View style={{ width: SCREEN_WIDTH - 32 }}>
              {renderOtpStep()}
            </View>
            <View style={{ width: SCREEN_WIDTH - 32 }}>
              {renderPasswordStep()}
            </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
  );
};

export default ForgotPasswordModal;