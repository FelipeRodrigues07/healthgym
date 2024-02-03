
import {  StatusBar } from 'react-native';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { NativeBaseProvider } from 'native-base';
import { THEME } from './src/theme';

import { Loading } from '@components/Loading';
import { Routes } from '@routes/index';


export default function App() {

   const [fontLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })

  return (
    <NativeBaseProvider  theme={THEME}>
      <StatusBar barStyle="light-content"
       backgroundColor="transparent"
       translucent
        />
      {fontLoaded ? <Routes /> : <Loading />} 
    </NativeBaseProvider>
  );
};
