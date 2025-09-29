import { useState } from 'react';
import TournamentContext from './TournamentContext';

function TournamentProvider({ children }) {
    const [tournament, setTournament] = useState({});

    return <TournamentContext.Provider value={[tournament, setTournament]}>{children}</TournamentContext.Provider>;
}

export default TournamentProvider;
