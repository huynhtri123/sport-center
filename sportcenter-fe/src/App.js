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
import Booking from './pages/Customer/Booking/Booking';
import FieldList from './pages/Customer/Field/FieldList';
import SportList from './pages/Customer/Sport/SportList';
import DynamicSportHome from './pages/Customer/Sport/SportHome/DynamicSportHome';
import Profile from './pages/Customer/Profile/Profile';

import AuthProvider from './contexts/Auth/AuthProvider';
import AdminDashBoard from './pages/Admin/AdminDashBoard';
import ManageFields from './pages/Admin/ManageFields';
import GetFieldsProvider from './contexts/Field/GetFieldsProvider';
import SportProvider from './contexts/Sport/SportProvider';
import TournamentProvider from './contexts/Tournament/TournamentProvider';
import { useCleanupStorage } from './customs/hooks';

import TournamentHome from './pages/Customer/Tournament/TournamentHome';
import TournamentDetail from './pages/Customer/Tournament/TournamentDetail';
import TournamentRegister from './pages/Customer/Tournament/TournamentRegister';

function App() {
    useCleanupStorage();
    const location = useLocation();

    return (
        <GlobalStyle>
            <AuthProvider>
                <SportProvider>
                    <TournamentProvider>
                        <div className={clsx(styles.app)}>
                            {/* Chỉ hiển thị NavBar nếu đường dẫn không phải là /admin */}
                            {location.pathname !== '/admin' && <NavBar />}
                            <div className={clsx(styles.appContent)}>
                                <GetFieldsProvider>
                                    <Routes>
                                        <Route path='/' element={<Home />} />
                                        <Route path='/profile' element={<Profile />} />
                                        <Route path='/sign-up' element={<Signup />} />
                                        <Route path='/sign-in' element={<Signin />} />
                                        <Route path='/forgot-password' element={<ForgotPassword />} />

                                        <Route path='/admin' element={<AdminDashBoard />} />
                                        <Route path='/admin/managefields' element={<ManageFields />} />

                                        <Route path='/sport/:sportName' element={<DynamicSportHome />} />
                                        <Route path='/sport/fields' element={<FieldList />} />
                                        <Route path='/sports' element={<SportList />} />

                                        <Route path='/booking' element={<Booking />} />
                                        <Route path='/tournaments' element={<TournamentHome />} />
                                        <Route path='/tournament/detail' element={<TournamentDetail />} />
                                        <Route path='/tournament/register' element={<TournamentRegister />} />
                                    </Routes>
                                </GetFieldsProvider>
                            </div>

                            <Footer />

                            <ToastContainer
                                position='top-right'
                                autoClose={3000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme='light'
                            />
                        </div>
                    </TournamentProvider>
                </SportProvider>
            </AuthProvider>
        </GlobalStyle>
    );
}

export default App;
