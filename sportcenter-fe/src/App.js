import { Routes, Route, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import styles from './assets/css/app.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Signup from './pages/Auth/Signup';
import Signin from './pages/Auth/Signin';
import GlobalStyle from './components/GlobalStyle/GlobalStyle';
import NavBar from './layouts/NavBar';
import Footer from './layouts/Footer';
import Home from './pages/Home/Home';
import ForgotPassword from './pages/Auth/ForgotPassword';

import CourseList from './pages/Course/CourseList';
import CourseLesson from './pages/Course/CourseLesson';
import Booking from './pages/Customer/Booking/Booking';
import FieldList from './pages/Customer/Field/FieldList';
import SportList from './pages/Customer/Sport/SportList';
import Profile from './pages/Customer/Profile/Profile';
import Payments from './pages/Customer/Payment/Payments';
import PaymentSuccess from './pages/Customer/Payment/PaymentSuccess';
import PaymentFailed from './pages/Customer/Payment/PaymentFailed';

import AdminDashBoard from './pages/Admin/AdminDashBoard';
import { useCleanupStorage } from './customs/hooks';
import TournamentHome from './pages/Customer/Tournament/TournamentHome';
import TournamentDetail from './pages/Customer/Tournament/TournamentDetail';
import TournamentRegister from './pages/Customer/Tournament/TournamentRegister';

import AllProviders from './contexts/AllProviders';
import ProtectedRoute from './components/ProtectedRoute';
import { Role } from './utils/enums/Role';

function App() {
    useCleanupStorage();
    const location = useLocation();

    return (
        <GlobalStyle>
            <AllProviders>
                <div className={clsx(styles.app)}>
                    {/* Chỉ hiển thị NavBar nếu đường dẫn không phải là /admin */}
                    {location.pathname !== '/admin' && <NavBar />}
                    <div className={clsx(styles.appContent)}>
                        <Routes>
                            <Route
                                path='/admin'
                                element={
                                    <ProtectedRoute requiredRole={Role.ADMIN}>
                                        <AdminDashBoard></AdminDashBoard>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path='/' element={<Home />} />
                            <Route path='/profile' element={<Profile />} />
                            <Route path='/sign-up' element={<Signup />} />
                            <Route path='/sign-in' element={<Signin />} />
                            <Route path='/forgot-password' element={<ForgotPassword />} />

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
                        autoClose={2000}
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
