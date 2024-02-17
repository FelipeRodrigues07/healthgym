import { createContext, ReactNode, useState  } from "react";

import { UserDTO } from "@dtos/UserDTO";

import { api } from '@services/api';

export type AuthContextDataProps = {
  user: UserDTO;
  singIn: (email: string, password: string) => Promise<void>;
}

type AuthContextProviderProps = {
    children: ReactNode
  }
  

  export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

  import { storageUserSave } from '@storage/storageUser';
  
  export function AuthContextProvider({ children }: AuthContextProviderProps)  {

    const [user, setUser] = useState<UserDTO>({} as UserDTO)

    async function singIn(email: string, password: string) {
      try {
        const { data } = await api.post('/sessions', { email, password });
  
        if(data.user) {
          setUser(data.user);
          storageUserSave(data.user)
        }
      } catch (error) {
        throw error
      }
    }

    return (
      <AuthContext.Provider value={{ user, singIn }}>
        {children}
      </AuthContext.Provider>
    )
  }