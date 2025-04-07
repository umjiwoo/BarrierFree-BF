import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';

// 커스텀 Hook으로 변경
export const useHandlePress = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressHome = () => {
    navigation.navigate('Main');
  };

  return {handlePressBack, handlePressHome};
};
