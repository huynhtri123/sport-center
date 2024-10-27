import { useState } from 'react';
import AuthContext from './AuthContext';

function AuthProvider({ children }) {
    const token = localStorage.getItem('token');
    const check = token ? true : false;
    const [isSignedIn, setIsSignedIn] = useState(check);

    return <AuthContext.Provider value={[isSignedIn, setIsSignedIn]}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
