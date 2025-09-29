import { Routes, Route, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import styles from './assets/css/app.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Signup from './pages/auth/Signup';
import Signin from './pages/auth/Signin';
import GlobalStyle from './components/globalStyle/GlobalStyle';
import NavBar from './layouts/NavBar';
import Footer from './layouts/Footer';
import Home from './pages/home/Home';
import ForgotPassword from './pages/auth/ForgotPassword';

import CourseList from './pages/customer/course/CourseList';
import CourseLesson from './pages/customer/course/CourseLesson';
import Booking from './pages/customer/booking/Booking';
import FieldList from './pages/customer/field/FieldList';
import SportList from './pages/customer/sport/SportList';
import Profile from './pages/customer/profile/Profile';
import Payments from './pages/customer/payment/Payments';
import PaymentSuccess from './pages/customer/payment/PaymentSuccess';
import PaymentFailed from './pages/customer/payment/PaymentFailed';

import AdminDashboard from './pages/admin/dashboard/AdminDashBoard';
import { useCleanupStorage } from './customs/hooks';
import TournamentHome from './pages/customer/tournament/TournamentHome';
import TournamentDetail from './pages/customer/tournament/TournamentDetail';
import TournamentRegister from './pages/customer/tournament/TournamentRegister';
import Notification from './pages/customer/notification/Notification';
import TournamentDetailManage from './pages/admin/tournament/TournamentDetailManage';

import AllProviders from './contexts/AllProviders';
import ProtectedRoute from './components/protectedRoutes/ProtectedRoute';
import { Role } from './utils/enums/Role';

function App() {
    useCleanupStorage();
    const location = useLocation();

    return (
        <GlobalStyle>
            <AllProviders>
                <div className={clsx(styles.app)}>
                    {/* Chỉ hiển thị NavBar nếu đường dẫn không phải là /admin */}
                    {!location.pathname.startsWith('/admin') && <NavBar />}
                    <div className={clsx(styles.appContent)}>
                        <Routes>
                            <Route
                                path='/admin'
                                element={
                                    <ProtectedRoute requiredRole={Role.ADMIN}>
                                        <AdminDashboard></AdminDashboard>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path='/tournament-details/:id' element={<TournamentDetailManage />} />
                            <Route path='/' element={<Home />} />
                            <Route path='/profile' element={<Profile />} />
                            <Route path='/sign-up' element={<Signup />} />
                            <Route path='/sign-in' element={<Signin />} />
                            <Route path='/forgot-password' element={<ForgotPassword />} />
                            <Route path='/notifications' element={<Notification />} />

                            {/* <Route path='/sport/:sportId' element={<DynamicSportHome />} /> */}
                            <Route path='/sport/fields' element={<FieldList />} />
                            <Route path='/bookings' element={<SportList />} />

                            <Route path='/booking' element={<Booking />} />
                            <Route path='/tournaments' element={<TournamentHome />} />
                            <Route path='/tournament/detail' element={<TournamentDetail />} />
                            <Route path='/tournament/register' element={<TournamentRegister />} />

                            <Route path='/courses' element={<CourseList />} />
                            <Route path='/courses/:courseId' element={<CourseLesson />} />

                            <Route path='/payments' element={<Payments />} />
                            <Route path='/payment-success' element={<PaymentSuccess />} />
                            <Route path='/payment-failed' element={<PaymentFailed />} />
                        </Routes>
                    </div>

                    <Footer />
                    <ToastContainer
                        position='top-right'
                        autoClose={1000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme='colored'
                    />
                </div>
            </AllProviders>
        </GlobalStyle>
    );
}

export default App;
