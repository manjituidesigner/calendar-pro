import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../components/Card';

export const Settings = () => {
  return (
    <View className="flex-1 p-4">
      <Card>
        <Text className="text-[20px] font-interExtraBold text-black dark:text-white mb-2">
          Settings
        </Text>
      </Card>
    </View>
  );
};
