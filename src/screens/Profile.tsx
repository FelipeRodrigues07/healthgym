import { Platform } from 'react-native'
import {Center, ScrollView, VStack, Skeleton, Text, Heading ,  useToast } from 'native-base';
import { useState } from 'react';
import { TouchableOpacity ,Alert } from 'react-native';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';


const PHOTO_SIZE = 33;

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; //ver as informações da imagem



export function Profile() {
  
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState('https://avatars.githubusercontent.com/u/132761611?s=400&u=57cb65b2f358ccc7c95c65ada14cb8483cee9ab2&v=4');

  const toast = useToast();

async function handleUserPhotoSelected(){
  setPhotoIsLoading(true);
  try{
  const photoSelected = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 1,
  aspect: [4, 4],
  allowsEditing: true
});
if(photoSelected.canceled) {
  return;
}
if(photoSelected.assets[0].uri) {
  const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
  if (photoInfo.exists && (photoInfo.size / 1024 / 1024 > 5)) {
    return toast.show({
      title: 'Essa imagem é muito grande. Escolha uma de até 5MB.',
      placement: 'top',
      bgColor: 'red.500'
    })
 }
  setUserPhoto(photoSelected.assets[0].uri);
}

  }catch (error){
    console.log(error)
  }finally {
    setPhotoIsLoading(false)
  }
}

  
  return (
    <VStack flex={1}>
      <ScreenHeader title='Perfil' />
      <ScrollView contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 100 : 36 }}  bounces={false}>
        <Center mt={6} px={10}>
        {
            photoIsLoading ?
              <Skeleton 
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded="full"
                startColor="gray.500"
                endColor="gray.400"
              />
            :
              <UserPhoto 
                source={{ uri: userPhoto }}
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
          }
           <TouchableOpacity onPress={handleUserPhotoSelected}>
            <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
              Alterar Foto
            </Text>
          </TouchableOpacity>
          <Input 
            bg="gray.600" 
            placeholder='Nome' 
          />

          <Input 
            bg="gray.600" 
            placeholder="E-mail"
            isDisabled
          />
        
        <Heading color="gray.200" fontSize="md" mb={2} alignSelf="flex-start" mt={12}>
            Alterar senha
          </Heading>

          <Input 
            bg="gray.600"
            placeholder="Senha antiga"
            secureTextEntry
          />

          <Input 
            bg="gray.600"
            placeholder="Nova senha"
            secureTextEntry
          />

          <Input 
            bg="gray.600"
            placeholder="Confirme a nova senha"
            secureTextEntry
          />

          <Button title="Atualizar" mt={4} />
          </Center>
      </ScrollView>
    </VStack>
  );
}