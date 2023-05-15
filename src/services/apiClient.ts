import axios from "axios";
import {
    IAuthTokens,
    TokenRefreshRequest,
    applyAuthTokenInterceptor,
    getBrowserLocalStorage,
} from "axios-jwt";

const BASE_URL = "http://localhost:8000";

const axiosInstance = axios.create({ baseURL: BASE_URL });

const requestRefresh: TokenRefreshRequest = async (
    refreshToken: string
): Promise<IAuthTokens | string> => {
    const response = await axios.post(`${BASE_URL}/auth/jwt/create/`, {
        refresh: refreshToken,
    });

    return response.data.access;
};

applyAuthTokenInterceptor(axiosInstance, {
    requestRefresh,
    getStorage: getBrowserLocalStorage,
    headerPrefix: "JWT ",
});

export default axiosInstance;
