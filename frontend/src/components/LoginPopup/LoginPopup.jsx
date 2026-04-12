import React, { useContext, useEffect, useRef } from "react";
import "./LoginPopup.css";
import { StoreContext } from "../../Context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const LoginPopup = ({ onLoginSuccess }) => {
  const { setToken, setUser, url } = useContext(StoreContext);
  const googleDivRef = useRef(null);

  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post(`${url}/api/user/google-login`, {
        token: response.credential,
      });

      if (res.data.success) {
        const newToken = res.data.token;
        const userData = res.data.user;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(newToken);
        setUser(userData);

        toast.success("Login Successful 🎉");

        onLoginSuccess(); // unlock app
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Google login failed");
    }
  };

  useEffect(() => {
    const loadGoogle = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = renderButton;
        document.body.appendChild(script);
      } else {
        renderButton();
      }
    };

    const renderButton = () => {
      // retry until div exists
      if (!googleDivRef.current) {
        setTimeout(renderButton, 300);
        return;
      }

      try {
        googleDivRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id:
            "850316169928-afv9arfjktro2uvqi8j01p79j93g3s86.apps.googleusercontent.com",
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(googleDivRef.current, {
          theme: "outline",
          size: "large",
          width: 300,
        });
      } catch (err) {
        console.log("Google render error:", err);
      }
    };

    loadGoogle();
  }, []);

  return (
    <div className="login-popup">
      <div className="login-popup-container">
        <h2 style={{ textAlign: "center" }}>Sign in with Google</h2>

        <div
          ref={googleDivRef}
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        ></div>
      </div>
    </div>
  );
};

export default LoginPopup;
