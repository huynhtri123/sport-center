import AuthProvider from './auth/AuthProvider';
import SportProvider from './sport/SportProvider';
import CourseProvider from './course/CourseProvider';
import TournamentProvider from './tournament/TournamentProvider';
import GetFieldsProvider from './field/GetFieldsProvider';
import UserProvider from './user/UserProvider';
import BookingPaymentProvider from './booking/BookingPaymentProvider';
import PaymentProvider from './payment/PaymentProvider';
import SelectDateProvider from './booking/SelectDateProvider';
import LoadingProvider from './loading/LoadingProvider';

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
