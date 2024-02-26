import { Platform } from 'react-native'
import {Center, ScrollView, VStack, Skeleton, Text, Heading ,  useToast } from 'native-base';
import { useState } from 'react';
import { TouchableOpacity  } from 'react-native';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';


const PHOTO_SIZE = 33;

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; //ver as informações da imagem

import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '@hooks/useAuth';
import { yupResolver } from '@hookform/resolvers/yup';//integração entre hook e o resolver
import * as yup from 'yup';

import { api } from '@services/api';
import { AppError } from '@utils/AppError';


type FormDataProps = {
  name: string;
  email: string; 
  password?: string | null | undefined;  
  confirm_password?: string | null | undefined;
  old_password?: string | null;    
}

const profileSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string().required('Informe o email.').email(),
  old_password: yup.string().required('Informe a senha antiga.').nullable().transform((value) => !!value ? value : null),
  password: yup.string().min(6, 'A senha deve ter pelo menos 6 dígitos.').nullable().transform((value) => !!value ? value : null),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => !!value ? value : null)
    .oneOf([yup.ref('password'), ''], 'A confirmação de senha não confere.')
    .when('password', {
      is: (Field: any) => Field,
      then: (schema) =>
        schema
        .nullable()
        .required('Informe a confirmação da senha.')       
    })
})



export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false);
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


const { user, updateUserProfile } = useAuth();

const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({ 
  defaultValues: { 
    name: user.name,
    email: user.email
  },
  resolver: yupResolver<FormDataProps>(profileSchema)
});



 async function handleProfileUpdate(data: FormDataProps) {
  try {
    setIsUpdating(true);
    const userUpdated = user;
    userUpdated.name = data.name;
    await api.put('/users', data);
    await updateUserProfile(userUpdated);

    toast.show({
      title: 'Perfil atualizado com sucesso!',
      placement: 'top',
      bgColor: 'green.500'
    });
  } catch (error) {
    const isAppError = error instanceof AppError;
    const title = isAppError ? error.message : 'Não foi possível atualizar os dados. Tente novamente mais tarde.';

    toast.show({
      title,
      placement: 'top',
      bgColor: 'red.500'
    })
  } finally {
    setIsUpdating(false);
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
          <Controller 
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input 
                bg="gray.600" 
                placeholder='Nome'
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

        <Controller 
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input 
                bg="gray.600" 
                placeholder="E-mail"
                isDisabled
                isReadOnly
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        
        <Heading color="gray.200" fontSize="md" mb={2} alignSelf="flex-start" mt={12} fontFamily="heading">
            Alterar senha
          </Heading>

          <Controller 
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input 
                bg="gray.600"
                placeholder="Senha antiga"
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />

         <Controller 
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input 
                bg="gray.600"
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input 
                bg="gray.600"
                placeholder="Confirme a nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button 
            title="Atualizar" 
            mt={4} 
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isUpdating}
          />
          </Center>
      </ScrollView>
    </VStack>
  );
}