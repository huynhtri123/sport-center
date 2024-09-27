import { Link, useLocation } from "react-router-dom";
import styles from "../assets/css/Layouts/navBar.module.scss";

function NavBar() {
    const location = useLocation();

    return (
        <nav class={`navbar navbar-expand-lg bg-body-tertiary`}>
            <div class="container-fluid">
                <Link
                    class={`navbar-brand ${
                        location.pathname === "/" ? styles.active : ""
                    }`}
                    to="/"
                >
                    Home
                </Link>
                <button
                    class="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div
                    class="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <Link
                                class={`nav-link ${
                                    location.pathname === "/sign-up"
                                        ? styles.active
                                        : ""
                                }`}
                                to="/sign-up"
                            >
                                Sign up
                            </Link>
                        </li>

                        <li class="nav-item">
                            <Link
                                class={`nav-link ${
                                    location.pathname === "/sign-in"
                                        ? styles.active
                                        : ""
                                }`}
                                to="/sign-in"
                            >
                                Sign in
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
