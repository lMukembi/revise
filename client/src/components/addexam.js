import React, { useEffect, useState } from "react";
import "../styles/addexam.css";
import Logo from "../assets/logo.png";
import axios from "axios";
import { Login } from "./login";
import { redirect, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { Programmes } from "./programmes";

// const exambankAPI = "http://localhost:8000";
const exambankAPI = "https://api.revise.co.ke";

export const Addexam = () => {
  const userData = JSON.parse(localStorage.getItem("JSUD"));

  const [code, setCode] = useState("");
  const [school, setSchool] = useState("");
  const [programme, setProgramme] = useState("");
  const [unit, setUnit] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(e.target.files[0]);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const navigate = useNavigate();

  const filteredProgrammes = Programmes.filter((programme) =>
    programme.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const logoutUser = () => {
    localStorage.clear();
    navigate("/login");
  };

  const currentYear = new Date().getFullYear();
  const years = [];

  for (let y = 2000; y <= currentYear; y++) {
    years.push(y);
  }

  const processAddExam = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem("JSUD"));
      if (!userInfo) {
        return redirect("/login");
      }
      const userID = userInfo.SESSID;

      if (userID) {
        const formData = new FormData();
        formData.append("code", code);
        formData.append("unit", unit);
        formData.append("school", school);
        formData.append("programme", programme);
        formData.append("file", file);
        formData.append("id", userID);
        formData.append("year", year);

        const res = await axios.post(
          `${exambankAPI}/api/exams/${userID}/addexam`,
          formData
        );

        if (res.data) {
          alert("Submit success!");
          setCode("");
          setSchool("");
          setUnit("");
          setFile(null);
        }
      } else {
        navigate("./add-exam");
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("JSUD"));
        if (!userInfo) {
          return redirect("/login");
        }
        const userID = userInfo.SESSID;
        const res = await axios.get(
          `${exambankAPI}/api/user/${userID}/user-data`
        );
        if (res.data) {
          setSchool(res.data.school);
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    getUserData();
  }, []);

  if (!userData) {
    return <Login />;
  }

  return (
    <>
      {userData ? (
        <div className="examwrapper">
          <div className="header">
            <h2>
              <img src={Logo} alt="Revise" /> Revise | Exam Bank
            </h2>
            <div className="logout">
              <MdLogout onClick={() => logoutUser()} />
            </div>
          </div>
          <form onSubmit={(e) => processAddExam(e)}>
            <div className="custom-select">
              <input
                type="text"
                placeholder="Enter course"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setProgramme(null);
                }}
                className="custom-select-input"
              />
              {searchTerm && !programme && filteredProgrammes.length > 0 && (
                <ul className="custom-select-list">
                  {filteredProgrammes.slice(0, 20).map((programmeOption) => (
                    <li
                      key={programmeOption.value}
                      className="custom-select-option"
                      onClick={() => {
                        setProgramme(programmeOption.value);
                        setSearchTerm(programmeOption.label);
                      }}
                    >
                      {programmeOption.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="text"
              name="code"
              required
              placeholder="Enter unit code"
              onChange={(e) => setCode(e.target.value)}
            />

            <input
              type="text"
              name="name"
              required
              placeholder="Enter unit title"
              onChange={(e) => setUnit(e.target.value)}
            />

            <select
              name="year"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="year-select"
            >
              <option value="">Select exam year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <input
              type="file"
              name="file"
              required
              accept="application/pdf"
              onChange={handleFile}
            />

            <button disabled={loading}>
              {loading ? "Processing..." : "Add exam"}
            </button>
          </form>
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};
