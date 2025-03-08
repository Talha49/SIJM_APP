import React from 'react';
import { View, Text } from 'react-native';

const BrickDetection = () => {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-4">Brick Detection</Text>
      <Text className="text-lg text-gray-600">
        This feature allows you to detect bricks in images.
      </Text>
      <Text className="text-lg text-gray-600 mt-4">
        It uses advanced computer vision algorithms to identify bricks in various environments.
      </Text>
    </View>
  );
};

export default BrickDetection;