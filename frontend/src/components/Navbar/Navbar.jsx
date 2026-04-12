import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
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

  // 🔹 Scroll effect - Optimized with throttle
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 🔹 Update active menu based on current route
  useEffect(() => {
    if (location.pathname === "/") {
      setMenu("home");
    } else if (location.pathname === "/myorders") {
      setMenu("previous");
    }
  }, [location.pathname]);

  // ✅ Optimized logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setShowProfileMenu(false);
    navigate("/?login=true");
  }, [navigate, setToken, setUser]);

  // ✅ Handle profile menu toggle
  const toggleProfileMenu = useCallback(() => {
    setShowProfileMenu(prev => !prev);
  }, []);

  // ✅ Handle admin login
  const handleAdminLogin = useCallback(() => {
    if (adminKey === "SRFOODCOURT26") {
      // Store admin token securely (consider using httpOnly cookies in production)
      localStorage.setItem("adminToken", "admin-auth");
      window.open("https://campusbitesfoodcourtadmin.vercel.app", "_blank");
      setShowAdminAuth(false);
      setAdminKey("");
    } else {
      alert("Invalid Admin Code");
      setAdminKey("");
    }
  }, [adminKey]);

  // ✅ Handle menu clicks
  const handleMenuClick = useCallback((menuItem) => {
    setMenu(menuItem);
    setShowProfileMenu(false); // Close profile menu when clicking nav items
  }, []);

  return (
    <>
      <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/" onClick={() => handleMenuClick("home")}>
          <img className="logo" src={assets.logo} alt="Campus Bites Logo" />
        </Link>

        {/* Menu */}
        {!hideGreenBox && (
          <ul className="navbar-menu" role="navigation">
            <li>
              <Link
                to="/"
                onClick={() => handleMenuClick("home")}
                className={menu === "home" ? "active" : ""}
                aria-current={location.pathname === "/" ? "page" : undefined}
              >
                HOME
              </Link>
            </li>

            <li>
              <a
                href="#explore-menu"
                onClick={() => handleMenuClick("menu")}
                className={menu === "menu" ? "active" : ""}
              >
                MENU
              </a>
            </li>

            <li>
              <a
                href="#footer"
                onClick={() => handleMenuClick("contact")}
                className={menu === "contact" ? "active" : ""}
              >
                CONTACT US
              </a>
            </li>

            <li>
              <Link
                to="/myorders"
                onClick={() => handleMenuClick("previous")}
                className={menu === "previous" ? "active" : ""}
                aria-current={location.pathname === "/myorders" ? "page" : undefined}
              >
                PREVIOUS ORDERS
              </Link>
            </li>
          </ul>
        )}

        {/* Right Section */}
        <div className="navbar-right">
          {!hideGreenBox && (
            <Link 
              to="/cart" 
              className="navbar-search-icon"
              aria-label="View cart"
            >
              <img src={assets.basket_icon} alt="" aria-hidden="true" />
              {getTotalCartAmount() > 0 && (
                <div className="dot" aria-label="Items in cart" />
              )}
            </Link>
          )}

          {!hideGreenBox && (
            <button
              className="admin-btn"
              onClick={() => setShowAdminAuth(true)}
              aria-label="Admin panel"
              type="button"
            >
              Admin
            </button>
          )}

          {/* 🔐 Sign In / Profile */}
          {!token ? (
            <button
              className="signin-btn"
              onClick={() => setShowLogin(true)}
              type="button"
              aria-label="Sign in to your account"
            >
              Sign In
            </button>
          ) : (
            <div className="navbar-profile" ref={profileRef}>
              <img
                src={
                  user?.picture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}`
                }
                alt={`Profile: ${user?.name || "User"}`}
                onClick={toggleProfileMenu}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "User"
                  )}&background=ff5722&color=fff`;
                }}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                loading="lazy"
              />

              {showProfileMenu && (
                <ul 
                  className="navbar-profile-dropdown"
                  role="menu"
                  aria-label="Profile menu"
                >
                  <li role="none" style={{ cursor: "default" }}>
                    <p>
                      <strong>{user?.name || "User"}</strong>
                    </p>
                  </li>

                  <hr />

                  <li 
                    role="menuitem"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/myorders");
                    }}
                    tabIndex={0}
                  >
                    <img src={assets.bag_icon} alt="" aria-hidden="true" />
                    <p>Orders</p>
                  </li>

                  <hr />

                  <li 
                    role="menuitem"
                    onClick={logout}
                    tabIndex={0}
                  >
                    <img src={assets.logout_icon} alt="" aria-hidden="true" />
                    <p>Logout</p>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🔐 Admin Popup - Improved */}
      {showAdminAuth && (
        <div 
          className="admin-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-title"
        >
          <div className="admin-modal">
            <h3 id="admin-title">Admin Access</h3>
            
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter access code"
              aria-label="Admin access code"
              autoComplete="off"
            />

            <div className="admin-buttons">
              <button
                className="admin-enter-btn"
                onClick={handleAdminLogin}
                type="button"
              >
                Enter
              </button>

              <button
                className="admin-cancel-btn"
                onClick={() => {
                  setShowAdminAuth(false);
                  setAdminKey("");
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
