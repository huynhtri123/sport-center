export const handleLocalStorage = {
    clearToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('email');
    },
    setToken(email, tokenType, token, refreshToken) {
        localStorage.setItem('email', email);
        localStorage.setItem('tokenType', tokenType);
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
    },
};
