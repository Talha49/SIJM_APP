import React, { useEffect, createContext, useContext } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Create context
export const ToastContext = createContext(undefined);

// Toast types configuration
const toastTypes = {
  success: {
    icon: 'checkmark-circle',
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    textColor: '#15803d',
    iconColor: '#22c55e'
  },
  error: {
    icon: 'close-circle',
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    textColor: '#b91c1c',
    iconColor: '#ef4444'
  },
  info: {
    icon: 'information-circle',
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    textColor: '#1d4ed8',
    iconColor: '#3b82f6'
  },
  warning: {
    icon: 'warning',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#b45309',
    iconColor: '#f59e0b'
  }
};

const Toast = ({ message, type = 'info', onClose, autoClose = true, duration = 3000 }) => {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);
  const toastStyle = toastTypes[type];

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    if (autoClose) {
      const timer = setTimeout(() => {
        // Slide out animation
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => onClose());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: toastStyle.backgroundColor,
          borderColor: toastStyle.borderColor,
          transform: [{ translateY }],
          opacity,
        }
      ]}
    >
      <Ionicons 
        name={toastStyle.icon} 
        size={24} 
        color={toastStyle.iconColor}
        style={styles.icon} 
      />
      <Text style={[styles.message, { color: toastStyle.textColor }]}>
        {message}
      </Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons 
          name="close" 
          size={20} 
          color={toastStyle.textColor}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = React.useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,  // Increased elevation for Android
    zIndex: 9999,   // High zIndex to stay above modals
  },
});

// Custom hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};