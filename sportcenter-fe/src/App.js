import { Routes, Route } from 'react-router-dom';
import clsx from 'clsx';
import styles from './assets/css/app.module.scss';

import Signup from './pages/Auth/Signup';
import Signin from './pages/Auth/Signin';
import GlobalStyle from './components/GlobalStyle/GlobalStyle';
import NavBar from './layouts/NavBar';
import Footer from './layouts/Footer';
import Home from './pages/Home/Home';

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
                    </Routes>
                </div>
                <Footer />
            </div>
        </GlobalStyle>
    );
}

export default App;
