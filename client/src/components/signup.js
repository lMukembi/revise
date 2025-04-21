import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Schools } from "./schools";
import Logo from "../assets/logo.png";
import "../styles/signup.css";
import axios from "axios";

// const exambankAPI = "http://localhost:8000";
const exambankAPI = "https://api.revise.co.ke";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState(null);
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const filteredSchools = Schools.filter((school) =>
    school.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const processSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${exambankAPI}/api/user/signup`, {
        name,
        email,
        school: school ? school.value : "",
        password,
      });

      if (res.data) {
        localStorage.setItem(
          "JSUD",
          JSON.stringify({
            SESSID: res.data.result._id,
            UTKN: res.data.tokenID,
          })
        );
        navigate("/");
        alert("Signup success!");
      } else {
        navigate("/signup");
      }
    } catch (error) {
      console.log(error);
      navigate("/signup");
    }
  };
  return (
    <div className="signupwrapper">
      <form className="signup" onSubmit={(e) => processSignup(e)}>
        <img src={Logo} alt="Revise" />
        <span>Revise | Exam Bank System</span>

        <div className="custom-select">
          <input
            type="text"
            placeholder="Enter school"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSchool(null);
            }}
            className="custom-select-input"
          />
          {searchTerm && !school && filteredSchools.length > 0 && (
            <ul className="custom-select-list">
              {filteredSchools.slice(0, 10).map((schoolOption) => (
                <li
                  key={schoolOption.value}
                  className="custom-select-option"
                  onClick={() => {
                    setSchool(schoolOption.value);
                    setSearchTerm(schoolOption.label);
                  }}
                >
                  {schoolOption.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="text"
          name="name"
          required
          placeholder="Enter name"
          onChange={(e) => setName(e.target.value.replace(/\s/g, ""))}
        />

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

        <button>Signup</button>

        <div className="signupinfo">
          Already have an account?
          <Link to="/login" className="link">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
};
