import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Detection from '../../src/components/PipeDetection';
import PipeDetection from '../../src/components/PipeDetection';
import BrickDetection from '../../src/components/BrickDetection';
import RebarDetection from '../../src/components/RebarDetecton';
import BeamsDetection from '../../src/components/AllBeamDetection';
const { width } = Dimensions.get('window');

const Dashboard = () => {
  const [selectedDetection, setSelectedDetection] = useState(null);

  const detectionOptions = [
    { 
      id: 'pipeDetection', 
      label: 'Pipe Inspection', 
      subtitle: 'Detect & Analyze Pipe Conditions',
      icon: <FontAwesome5 name="industry" size={50} color="white" />, // Represents industrial pipes and infrastructure
      gradient: ['#007bff', '#0056b3']
    },
    { 
      id: 'brickDetection', 
      label: 'Brick Analysis', 
      subtitle: 'Structural Brick Evaluation',
      icon: <FontAwesome5 name="border-all" size={50} color="white" />, // Better representation for bricks
      gradient: ['#0056b3', '#003580']
    },
    { 
      id: 'rebarDetection', 
      label: 'Rebar Inspection', 
      subtitle: 'Reinforcement Integrity Check',
      icon: <FontAwesome5 name="drafting-compass" size={50} color="white" />, // Represents structural assessment
      gradient: ['#003580', '#001f4d']
    },
    { 
      id: 'beamDetection', 
      label: 'Beam Inspection', 
      subtitle: 'Structural Beam Analysis',
      icon: <FontAwesome5 name="ruler-combined" size={50} color="white" />, // Represents measurement and structural components
      gradient: ['#003580', '#001f4d']
    },
  ];
  
  const renderGridLayout = () => (
    <View className="flex-1 bg-white p-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-blue-600 text-center">
          Structural Detection Tools
        </Text>
        <Text className="text-center text-gray-600 mt-2">
          Advanced Inspection & Analysis Solutions
        </Text>
      </View>
      <View className="flex-row flex-wrap justify-between">
        {detectionOptions.map((option) => (
          <TouchableOpacity 
            key={option.id}
            className="mb-6"
            style={{ width: width * 0.42 }}
            onPress={() => setSelectedDetection(option.id)}
          >
            <LinearGradient
              colors={option.gradient}
              className="rounded-3xl p-5 items-center justify-center shadow-2xl"
              style={{ height: width * 0.45 }}
            >
              <View className="bg-white/20 rounded-full p-4 mb-3">
                {option.icon}
              </View>
              <Text className="text-white font-bold text-lg text-center">
                {option.label}
              </Text>
              <Text className="text-white/70 text-xs text-center mt-1">
                {option.subtitle}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSelectedDetection = () => {
    const selectedOption = detectionOptions.find(
      option => option.id === selectedDetection
    );

    const SelectedComponent = () => {
      switch(selectedDetection) {
        case 'pipeDetection':
          return <PipeDetection />;
        case 'brickDetection':
          return <BrickDetection />;
        case 'rebarDetection':
          return <RebarDetection />;
        case 'beamDetection':
          return <BeamsDetection/>
        default:
          return null;
      }
    };

    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center p-6 bg-blue-600">
        <TouchableOpacity 
  onPress={() => setSelectedDetection(null)}
  className="mr-4"
>
  <FontAwesome5 name="arrow-left" size={28} color="white" /> 
</TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-white">
              {selectedOption.label}
            </Text>
            <Text className="text-white/80 text-sm">
              {selectedOption.subtitle}
            </Text>
          </View>
        </View>
        <View className="flex-1">
          <SelectedComponent />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {selectedDetection ? renderSelectedDetection() : renderGridLayout()}
    </View>
  );
};

export default Dashboard;