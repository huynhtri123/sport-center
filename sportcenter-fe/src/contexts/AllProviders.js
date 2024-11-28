import AuthProvider from './Auth/AuthProvider';
import SportProvider from './Sport/SportProvider';
import CourseProvider from './Course/CourseProvider';
import TournamentProvider from './Tournament/TournamentProvider';
import GetFieldsProvider from './Field/GetFieldsProvider';
import UserProvider from './UserContext/UserProvider';

function AllProviders({ children }) {
    return (
        <AuthProvider>
            <SportProvider>
                <CourseProvider>
                    <TournamentProvider>
                        <UserProvider>
                            <GetFieldsProvider>{children}</GetFieldsProvider>
                        </UserProvider>
                    </TournamentProvider>
                </CourseProvider>
            </SportProvider>
        </AuthProvider>
    );
}

export default AllProviders;
