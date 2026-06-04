import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          HelpDesk
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/knowledge-base" className="nav-link">
          Knowledge Base
        </Link>

        {!token && (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link">
              Sign Up
            </Link>
          </>
        )}

        {token && (
          <>
            <span className="nav-user">
              Welcome, {name} ({role})
            </span>
            <Link
              to="/login"
              className="nav-link"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Logout
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
