import { useState } from 'react';
import LoadingContext from './LoadingContext';

function LoadingProvider({ children }) {
    const [isLoadingContext, setIsLoadingContext] = useState(false);
    return (
        <LoadingContext.Provider value={[isLoadingContext, setIsLoadingContext]}>{children}</LoadingContext.Provider>
    );
}

export default LoadingProvider;
