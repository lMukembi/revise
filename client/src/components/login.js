import React, { useState } from "react";
import "../styles/login.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import axios from "axios";

// const exambankAPI = "http://localhost:8000";
const exambankAPI = "https://api.revise.co.ke";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/";

  const processLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await axios.post(`${exambankAPI}/api/user/login`, {
        email,
        password,
      });

      if (res.data) {
        localStorage.setItem(
          "JSUD",
          JSON.stringify({
            SESSID: res.data.result._id,
          })
        );
        alert("Login success!");
        navigate(redirectPath, { replace: true });
      } else {
        alert("Email or password is wrong!");
        navigate("/login");
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="loginwrapper">
      <form className="login" onSubmit={(e) => processLogin(e)}>
        <img src={Logo} alt="Revise" />

        <span>Revise | Exam Bank System</span>

        <input
          type="text"
          name="email"
          required
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
        />

        <input
          type="text"
          name="password"
          required
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Processing..." : "Login"}
        </button>

        <div className="logininfo">
          Don't have an account?
          <Link to="/signup" className="link">
            Signup
          </Link>
        </div>
      </form>
    </div>
  );
};
