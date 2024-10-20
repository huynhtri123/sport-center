import { useState, useEffect } from 'react';
import AuthContext from './AuthContext';

function AuthProvider({ children }) {
    const [isSignedIn, setIsSignedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsSignedIn(!!token);
    }, []);

    return <AuthContext.Provider value={[isSignedIn, setIsSignedIn]}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
