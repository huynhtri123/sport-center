import { Routes, Route } from "react-router-dom";

import Signup from "./pages/Auth/Signup";
import Signin from "./pages/Auth/Signin";
import GlobalStyle from "./components/GlobalStyle/GlobalStyle";
import NavBar from "./layouts/NavBar";
import Home from "./pages/Home/Home";

function App() {
  return (
    <GlobalStyle>
      <div className="app">
        <NavBar></NavBar>
      </div>

      <Routes>
      <Route path="/" element={<Home/>}></Route>
        <Route path="/sign-up" element={<Signup/>}></Route>
        <Route path="/sign-in" element={<Signin/>}></Route>
      </Routes>
    </GlobalStyle>
  );
}

export default App;
