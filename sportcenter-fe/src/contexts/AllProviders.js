import AuthProvider from './Auth/AuthProvider';
import SportProvider from './Sport/SportProvider';
import CourseProvider from './Course/CourseProvider';
import TournamentProvider from './Tournament/TournamentProvider';
import GetFieldsProvider from './Field/GetFieldsProvider';
import UserProvider from './UserContext/UserProvider';
import BookingPaymentProvider from './Booking/BookingPaymentProvider';
import PaymentProvider from './Payment/PaymentProvider';
import SelectDateProvider from './Booking/SelectDateProvider';
import LoadingProvider from './Loading/LoadingProvider';

function AllProviders({ children }) {
    return (
        <AuthProvider>
            <LoadingProvider>
                <PaymentProvider>
                    <SportProvider>
                        <CourseProvider>
                            <BookingPaymentProvider>
                                <TournamentProvider>
                                    <UserProvider>
                                        <SelectDateProvider>
                                            <GetFieldsProvider>{children}</GetFieldsProvider>
                                        </SelectDateProvider>
                                    </UserProvider>
                                </TournamentProvider>
                            </BookingPaymentProvider>
                        </CourseProvider>
                    </SportProvider>
                </PaymentProvider>
            </LoadingProvider>
        </AuthProvider>
    );
}

export default AllProviders;
