import { useState } from 'react';
import SelectDateContext from './SelectDateContext';

function SelectDateProvider({ children }) {
    const [selectedDate, setSelectedDate] = useState('');
    return <SelectDateContext.Provider value={[selectedDate, setSelectedDate]}>{children}</SelectDateContext.Provider>;
}

export default SelectDateProvider;
