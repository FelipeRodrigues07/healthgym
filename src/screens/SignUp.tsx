import { useNavigation } from "@react-navigation/native";
import { VStack, Image, Text, Center, Heading, ScrollView, KeyboardAvoidingView , useToast} from "native-base";
import { Platform } from 'react-native'
import { useState } from 'react';

import LogoSvg from '@assets/logo.svg';
import BackgroundImg from '@assets/background.png';

import { Input } from "@components/Input";
import { Button } from "@components/Button";


import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { api } from "@services/api";
import { AppError } from '@utils/AppError'

import { useAuth } from '@hooks/useAuth';

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome'),
  email: yup.string().required('Informe o e-mail').email('E-mail inválido'),
  password: yup.string().required('Informe a senha').min(6, 'A senha deve ter pelo menos 6 dígitos.'),
  password_confirm: yup.string().required('Confirme a senha.').oneOf([yup.ref('password'), ''], 'A confirmação da senha não confere')
});

export function SignUp() {
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  function handleGoBack() {
    navigation.goBack();  //aqui não precisa de tipagem
  }


  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormDataProps>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirm: ''
    }
  });

  const toast = useToast();

  const { singIn } = useAuth();

  async function handleSignUp({ name, email, password }: FormDataProps) {

    try {
      setIsLoading(true)

      await api.post('/users', { name, email, password });
      await singIn(email, password)
    } catch (error) {
      setIsLoading(false);
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível criar a conta. Por Favor, tente mais tarde.'
      //quando uma mensagem de erro não é tratada

      toast.show({
        title,
        placement: 'top',
        bg: 'red.500'
      })
    }
      
    /*
      const response = await fetch('http://10.160.137.2:3333/users', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })//converter para texto
    })
    const data = await response.json();
    console.log(data);
    */
  }


  const handleReset = () => {
    reset({
      name: '',
      email: '',
      password: '',
      password_confirm: ''
    });
  };


  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <VStack flex={1} px={10} pb={16}>
          <Image
            source={BackgroundImg}
            defaultSource={BackgroundImg}//carrega mais rapido, padrão
            alt="Pessoas treinando"
            resizeMode="contain"
            position="absolute"
          />

          <Center my={24}>
            <LogoSvg />

            <Text color="gray.100" fontSize="sm">
              Treine sua mente e o seu corpo.
            </Text>
          </Center>

          <Center>
            <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
              Crie sua conta
            </Heading>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Nome"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.email?.message}

                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Senha"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password_confirm"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Confirmar a Senha"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                  onSubmitEditing={handleSubmit(handleSignUp)}//bara quando clicar no botão de enviar
                  returnKeyType="send"
                  errorMessage={errors.password_confirm?.message}
                />
              )}
            />

            <Button title="Criar e acessar"  isLoading={isLoading} onPress={() => {
              handleSubmit(handleSignUp)();
              handleReset();
              // onPress={handleSubmit(handleSignUp)}
            }} />

          </Center>

          <Button
            title="Voltar para o login"
            variant="outline"
            mt={12}
            onPress={handleGoBack}
          />
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}