import AuthProvider from './Auth/AuthProvider';
import SportProvider from './Sport/SportProvider';
import CourseProvider from './Course/CourseProvider';
import TournamentProvider from './Tournament/TournamentProvider';
import GetFieldsProvider from './Field/GetFieldsProvider';
import UserProvider from './UserContext/UserProvider';
import BookingPaymentProvider from './Booking/BookingPaymentProvider';
import PaymentProvider from './Payment/PaymentProvider';

function AllProviders({ children }) {
    return (
        <AuthProvider>
            <PaymentProvider>
                <SportProvider>
                    <CourseProvider>
                        <BookingPaymentProvider>
                            <TournamentProvider>
                                <UserProvider>
                                    <GetFieldsProvider>{children}</GetFieldsProvider>
                                </UserProvider>
                            </TournamentProvider>
                        </BookingPaymentProvider>
                    </CourseProvider>
                </SportProvider>
            </PaymentProvider>
        </AuthProvider>
    );
}

export default AllProviders;
