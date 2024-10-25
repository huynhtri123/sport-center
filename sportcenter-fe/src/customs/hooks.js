import { useContext } from 'react';
import AuthContext from '../contexts/Auth/AuthContext';
import GetFieldsContext from '../contexts/Field/GetFieldsContext';

export const useCheckSignedIn = () => {
    const [isSignedIn, setIsSignedIn] = useContext(AuthContext);
    return [isSignedIn, setIsSignedIn];
};

export const useGetFields = () => {
    const [fields, setFields] = useContext(GetFieldsContext); // Chỉ lấy `fields` và `setFields`
    return [fields, setFields];
};

export const useGetField = () => {
    const [, , field, setField] = useContext(GetFieldsContext); // Chỉ lấy `field` và `setField`
    return [field, setField];
};
