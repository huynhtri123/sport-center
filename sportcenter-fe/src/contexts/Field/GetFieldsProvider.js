import { useState } from 'react';
import GetFieldsContext from './GetFieldsContext';

function GetFieldsProvider({ children }) {
    const [fields, setFields] = useState([]);
    const [field, setField] = useState({});
    return (
        <GetFieldsContext.Provider value={[fields, setFields, field, setField]}>{children}</GetFieldsContext.Provider>
    );
}

export default GetFieldsProvider;
