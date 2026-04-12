import React, { useContext, useState, useEffect, useRef } from "react";
import "./components/Navbar/Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  const profileRef = useRef(null);

  const { getTotalCartAmount, token, setToken, user, setUser } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();

  const hideGreenBox = location.pathname === "/select";

  // ✅ Sync active menu with route
  const currentPath = location.pathname;

  // 🔹 Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ FIXED logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);
    setShowProfileMenu(false);

    navigate("/login", { replace: true });
  };

  // ✅ Smooth scroll for anchors
  const handleScrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/">
          <img className="logo" src={assets.logo} alt="logo" />
        </Link>

        {/* Menu */}
        {!hideGreenBox && (
          <ul className="navbar-menu">
            <li>
              <Link
                to="/"
                className={currentPath === "/" ? "active" : ""}
              >
                HOME
              </Link>
            </li>

            <li>
              <button
                onClick={() => handleScrollTo("#explore-menu")}
                className="menu-link"
              >
                MENU
              </button>
            </li>

            <li>
              <button
                onClick={() => handleScrollTo("#footer")}
                className="menu-link"
              >
                CONTACT US
              </button>
            </li>

            <li>
              <Link
                to="/myorders"
                className={currentPath === "/myorders" ? "active" : ""}
              >
                PREVIOUS ORDERS
              </Link>
            </li>
          </ul>
        )}

        {/* Right Section */}
        <div className="navbar-right">
          {!hideGreenBox && (
            <Link to="/cart" className="navbar-search-icon">
              <img src={assets.basket_icon} alt="cart" />
              {getTotalCartAmount() > 0 && <div className="dot"></div>}
            </Link>
          )}

          {!hideGreenBox && (
            <button
              className="admin-btn"
              onClick={() => setShowAdminAuth(true)}
            >
              Admin
            </button>
          )}

          {!token ? (
            <button
              className="signin-btn"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          ) : (
            <div className="navbar-profile" ref={profileRef}>
              <img
                src={
                  user?.picture ||
                  `https://ui-avatars.com/api/?name=${user?.name || "User"}`
                }
                alt="profile"
                onClick={() =>
                  setShowProfileMenu((prev) => !prev)
                }
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${
                    user?.name || "User"
                  }&background=ff5722&color=fff`;
                }}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />

              {showProfileMenu && (
                <ul className="navbar-profile-dropdown">
                  <li style={{ cursor: "default" }}>
                    <strong>{user?.name || "User"}</strong>
                  </li>

                  <hr />

                  <li
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/myorders");
                    }}
                  >
                    <img src={assets.bag_icon} alt="" />
                    <p>Orders</p>
                  </li>

                  <hr />

                  <li onClick={logout}>
                    <img src={assets.logout_icon} alt="" />
                    <p>Logout</p>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Popup */}
      {showAdminAuth && (
        <div className="admin-overlay">
          <div className="admin-modal">
            <h3>Admin Access</h3>

            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter access code"
            />

            <button
              className="admin-enter-btn"
              onClick={() => {
                if (adminKey === "SRFOODCOURT26") {
                  window.open("http://localhost:5174/", "_self");
                } else {
                  alert("Invalid Admin Code");
                }
              }}
            >
              Enter
            </button>

            <button
              className="admin-cancel-btn"
              onClick={() => setShowAdminAuth(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
