import { useContext } from 'react';
import AuthContext from '../contexts/Auth/AuthContext';

export const useCheckSignedIn = () => {
    const [isSignedIn, setIsSignedIn] = useContext(AuthContext);
    return [isSignedIn, setIsSignedIn];
};
