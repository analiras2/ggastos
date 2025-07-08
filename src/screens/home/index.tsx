import React from 'react';
import { View, Button } from 'react-native';
import { BaseScreen } from '@components/BaseScreen';
import { useSnackbar } from '@contexts/SnackbarContext';

const HomeScreen = () => {
  const { showSnackbar } = useSnackbar();

  const handleSuccess = () => {
    showSnackbar('Operação realizada com sucesso!', 'success');
  };

  return (
    <BaseScreen
      scrollable
      safeArea
    >
      <View>
        <Button 
          title="Testar Snackbar" 
          onPress={handleSuccess} 
        />
      </View>
    </BaseScreen>
  );
};

export default HomeScreen;
