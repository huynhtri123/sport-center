import { useState } from 'react';
import SportContext from './SportContext';

function SportProvider({ children }) {
    const [sports, setSports] = useState([]);
    return <SportContext.Provider value={[sports, setSports]}>{children}</SportContext.Provider>;
}

export default SportProvider;
