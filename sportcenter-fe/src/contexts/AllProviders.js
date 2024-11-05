import AuthProvider from './Auth/AuthProvider';
import SportProvider from './Sport/SportProvider';
import CourseProvider from './Course/CourseProvider';
import TournamentProvider from './Tournament/TournamentProvider';
import GetFieldsProvider from './Field/GetFieldsProvider';

function AllProviders({ children }) {
    return (
        <AuthProvider>
            <SportProvider>
                <CourseProvider>
                    <TournamentProvider>
                        <GetFieldsProvider>{children}</GetFieldsProvider>
                    </TournamentProvider>
                </CourseProvider>
            </SportProvider>
        </AuthProvider>
    );
}

export default AllProviders;
