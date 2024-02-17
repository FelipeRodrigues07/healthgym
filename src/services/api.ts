import { AppError } from "@utils/AppError";
import axios from "axios";

const api = axios.create({
    baseURL: 'http://10.0.0.133:3333',
    timeout: 6000,
});

api.interceptors.response.use(response => response, error => {
    if(error.response && error.response.data){//se é uma mensagem tratada dentro do backend
        return Promise.reject(new AppError(error.response.data.message));//pega a mensagem de erro do backend definido la
    } else { //se não
        return Promise.reject(error) //erro no servirdor
    }
})

export{api};
