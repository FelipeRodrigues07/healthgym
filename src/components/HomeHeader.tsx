import { Heading, HStack, Text, VStack, Icon } from 'native-base';
import { UserPhoto } from './UserPhoto';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';


export function HomeHeader() {
  return (
    <HStack  bg="gray.600" pt={16} pb={5} px={8} alignItems="center">
     <UserPhoto 
        source={{ uri: 'https://avatars.githubusercontent.com/u/132761611?s=400&u=57cb65b2f358ccc7c95c65ada14cb8483cee9ab2&v=4' }}
        size={16}
        alt="Imagem do usuário"
        mr={4}
      />
      <VStack flex={1}>
        <Text color="gray.100"  fontSize="md">
          Olá,
        </Text>

        <Heading color="gray.100"  fontSize="md">
          Felipe
        </Heading>
      </VStack>
      <TouchableOpacity>
        <Icon 
          as={MaterialIcons}
          name="logout"
          color="gray.200"
          size={7}
        />
      </TouchableOpacity>
    </HStack>
  );
}