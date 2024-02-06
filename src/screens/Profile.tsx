import { Platform } from 'react-native'
import {Center, ScrollView, VStack, Skeleton, Text, Heading , useTheme} from 'native-base';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

const PHOTO_SIZE = 33;

export function Profile() {
  
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  
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
                source={{ uri: 'https://avatars.githubusercontent.com/u/132761611?s=400&u=57cb65b2f358ccc7c95c65ada14cb8483cee9ab2&v=4' }}
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
          }
           <TouchableOpacity>
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