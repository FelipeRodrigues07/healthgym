import { AppError } from "@utils/AppError";
import axios, {AxiosError, AxiosInstance } from "axios";

import { storageAuthTokenGet, storageAuthTokenSave  } from "@storage/storageAuthToken";

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
}

type PromiseType = {
    onSuccess: (token: string) => void;
    onFailure: (error: AxiosError) => void;
  }
  


const api = axios.create({
    baseURL: 'http://10.50.0.148:3333',
    timeout: 6000,
})  as APIInstanceProps;


let failedQueued: Array<PromiseType> = [];
let isRefreshing = false;




api.registerInterceptTokenManager = singOut => {  //gerenciador para verificar se o token é valido ou não
    const interceptTokenManager =api.interceptors.response.use(response => response, async  (requestError) => {

        if(requestError.response?.status === 401) { //erro relacionado ao token
            if(requestError.response.data?.message === 'token.expired' || requestError.response.data?.message === 'token.invalid') {
                const { refresh_token } = await storageAuthTokenGet();

                if(!refresh_token) {
                    singOut();
                    return Promise.reject(requestError)
                  }
                //pega todos detalhes da requisição
                  const originalRequestConfig = requestError.config;

                  if(isRefreshing) {  //fila de requisição implementada
                    return new Promise((resolve, reject) => {
                      failedQueued.push({
                        onSuccess: (token: string) => { 
                          originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                          resolve(api(originalRequestConfig));
                        },
                        onFailure: (error: AxiosError) => {
                          reject(error)
                        },
                      })
                    })
                  }
          
                  isRefreshing = true  

                  return new Promise(async (resolve, reject) => {
                    try {
                      const { data } = await api.post('/sessions/refresh-token', { refresh_token });
          
                      await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token });
                      if (
                        originalRequestConfig.data &&
                        !(originalRequestConfig.data instanceof FormData)
                      ) {
                        originalRequestConfig.data = JSON.parse(
                          originalRequestConfig.data
                        )
                      }
          
                      originalRequestConfig.headers = {
                        ...originalRequestConfig.headers,
                        Authorization: `Bearer ${data.token}`
                      }
                      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          
                      failedQueued.forEach(request => {
                        request.onSuccess(data.token);
                      });
          
                      console.log("TOKEN ATUALIZADO");
          
                      resolve(api(originalRequestConfig));

                    } catch (error: any) {
                      failedQueued.forEach(request => {
                        request.onFailure(error);
                      })
          
                      singOut(); //se acotece erro
                      reject(error);
                    } finally {
                      isRefreshing = false;
                      failedQueued = []  //limpa a fila de requisição
                    }
                  })
            }
      
            singOut();

          }
    //so chega nessa parte se não for um erro relacionado  ao token
    if(requestError.response && requestError.response.data){//se é uma mensagem tratada dentro do backend
        return Promise.reject(new AppError(requestError.response.data.message));//pega a mensagem de erro do backend definido la
    } else { //se não
        return Promise.reject(requestError) //erro no servirdor
    }
})

return () => {
    api.interceptors.response.eject(interceptTokenManager); //limpa o interceptador quando  ele não é mais necessario
  }

}

export{api};
