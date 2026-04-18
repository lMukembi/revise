import React, { useEffect, useState } from "react";
import "../styles/home.css";
import { useLocation, useNavigate } from "react-router-dom";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { Exams } from "./exams";
import { MdLogout } from "react-icons/md";
import Logo from "../assets/logo.png";
import axios from "axios";

// const exambankAPI = "http://localhost:8000";
const exambankAPI = "https://app.revise.co.ke";

export const Home = () => {
  const userData = JSON.parse(localStorage.getItem("JSUD"));

  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [exams, setExams] = useState([]);
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    const fileUrl = `${exambankAPI}/api/exams/downloads/total`;

    const fetchDownloads = async () => {
      try {
        const res = await fetch(fileUrl);
        const data = await res.json();

        setDownloads(data.downloads);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDownloads();
  }, []);

  const handleAddExam = () => {
    if (userData) {
      navigate("/add-exam");
    } else {
      navigate("/login", { state: { from: location.pathname } });
    }
  };

  useEffect(() => {
    const getExams = async () => {
      try {
        const res = await axios.get(`${exambankAPI}/api/exams/all-exams`, {
          withCredentials: true,
        });

        if (res.data) {
          setExams(res.data);
        }
      } catch (err) {
        console.log(err.message);
      }
    };

    getExams();
  }, []);

  const logoutUser = () => {
    localStorage.clear();
    navigate("/login");
  };
  return (
    <div className="home">
      <div className="header">
        <h2>
          <img src={Logo} alt="Revise" />
          Revise
        </h2>

        {window.innerWidth > 768 ? (
          <div className="headright">
            <div className="addexam" onClick={handleAddExam}>
              Add exam
            </div>

            {userData && (
              <div>
                <MdLogout className="logout" onClick={() => logoutUser()} />
              </div>
            )}
          </div>
        ) : (
          <>
            {userData && (
              <div className="logout">
                <MdLogout onClick={() => logoutUser()} />
              </div>
            )}
          </>
        )}
      </div>
      <div>
        <input
          type="text"
          name="search"
          placeholder="Search exams..."
          className="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <span className="allexams">
        {exams.length} Papers • {downloads} Downloads
      </span>

      <div className="examswrapper">
        <Exams searchTerm={searchTerm} />
      </div>

      {window.innerWidth < 768 && (
        <div className="addbutton">
          <BsFillPlusCircleFill className="addicon" onClick={handleAddExam} />
        </div>
      )}
    </div>
  );
};
