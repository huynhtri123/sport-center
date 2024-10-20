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

function App() {
    return (
        <GlobalStyle>
            <div className={clsx(styles.app)}>
                <NavBar />
                <div className={clsx(styles.appContent)}>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/sign-up' element={<Signup />} />
                        <Route path='/sign-in' element={<Signin />} />
                        <Route path='/forgot-password' element={<ForgotPassword />} />
                    </Routes>
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
        </GlobalStyle>
    );
}

export default App;
