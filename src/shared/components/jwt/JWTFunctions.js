// This is how we handle response with JWT token

import axios from 'axios';

var JWTFunctions = {
    initJWT(){
        this.addAxiosResponseInterceptor();
    },
    addAxiosResponseInterceptor(){
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response.status === 401 && error.response.config.url == '/api/auth/token/refresh') {
                    // If we can't do authorized requesto to refresh token, it means the refresh token is wrong or expired,
                    // so we need to re-login.
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
                // Reject promise if not authentication error
                if (error.response.status !== 401) {
                    return Promise.reject(error);
                }
    
                /* 
                 * When response code is 401, we try to refresh the token.
                 * Eject the interceptor so it doesn't loop in case
                 * token refresh causes the 401 response
                 */
                axios.interceptors.response.eject(interceptor);
    
                return axios.post('/api/auth/token/refresh').then(response => {
                    return axios(error.response.config);
                }).catch(error => {
                    this.clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }).finally(()=>{
                    this.addAxiosResponseInterceptor();
                });
            }
        );
    },
    setAccessToken(token) {
        localStorage.setItem('access_token', token);
    },
    setRefreshToken(token){
        localStorage.setItem('refresh_token', token);
    }, 
    getAccessToken() {
        return localStorage.getItem('access_token');
    }, 
    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }, 
    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};
JWTFunctions.initJWT();
export { JWTFunctions };