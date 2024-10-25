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
import AuthProvider from './contexts/Auth/AuthProvider';
import FootballHome from './pages/ForCustomer/Sport/SportHome/FootballHome';
import BadmintonHome from './pages/ForCustomer/Sport/SportHome/BadmintonHome';
import TennisHome from './pages/ForCustomer/Sport/SportHome/TennisHome';
import YogaHome from './pages/ForCustomer/Sport/SportHome/YogaHome';
import Booking from './pages/ForCustomer/Booking/Booking';
import FieldList from './pages/ForCustomer/Field/FieldList';
import GetFieldsProvider from './contexts/Field/GetFieldsProvider';

function App() {
    return (
        <GlobalStyle>
            <AuthProvider>
                <div className={clsx(styles.app)}>
                    <NavBar />
                    <div className={clsx(styles.appContent)}>
                        <GetFieldsProvider>
                            <Routes>
                                <Route path='/' element={<Home />} />
                                <Route path='/sign-up' element={<Signup />} />
                                <Route path='/sign-in' element={<Signin />} />
                                <Route path='/forgot-password' element={<ForgotPassword />} />

                                <Route path='/sport/football' element={<FootballHome />} />
                                <Route path='/sport/badminton' element={<BadmintonHome />} />
                                <Route path='/sport/tennis' element={<TennisHome />} />
                                <Route path='/sport/yoga' element={<YogaHome />} />
                                <Route path='/sport/fields' element={<FieldList />} />

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
                    {/* Same as */}
                    <ToastContainer />
                </div>
            </AuthProvider>
        </GlobalStyle>
    );
}

export default App;
