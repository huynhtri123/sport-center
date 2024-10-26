import { Routes, Route } from 'react-router-dom';
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
import Booking from './pages/ForCustomer/Booking/Booking';
import FieldList from './pages/ForCustomer/Field/FieldList';
import SportList from './pages/ForCustomer/Sport/SportList';
import DynamicSportHome from './pages/ForCustomer/Sport/SportHome/DynamicSportHome';

import AuthProvider from './contexts/Auth/AuthProvider';
import GetFieldsProvider from './contexts/Field/GetFieldsProvider';
import SportProvider from './contexts/Sport/SportProvider';
import { useCleanupStorage } from './customs/hooks';

function App() {
    useCleanupStorage();

    return (
        <GlobalStyle>
            <AuthProvider>
                <SportProvider>
                    <div className={clsx(styles.app)}>
                        <NavBar />
                        <div className={clsx(styles.appContent)}>
                            <GetFieldsProvider>
                                <Routes>
                                    <Route path='/' element={<Home />} />
                                    <Route path='/sign-up' element={<Signup />} />
                                    <Route path='/sign-in' element={<Signin />} />
                                    <Route path='/forgot-password' element={<ForgotPassword />} />

                                    <Route path='/sport/:sportName' element={<DynamicSportHome />} />
                                    <Route path='/sport/fields' element={<FieldList />} />
                                    <Route path='/sports' element={<SportList />} />

                                    <Route path='/booking' element={<Booking />} />
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
                </SportProvider>
            </AuthProvider>
        </GlobalStyle>
    );
}

export default App;
