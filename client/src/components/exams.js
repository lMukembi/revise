import React, { Fragment, useEffect, useState } from "react";
import "../styles/home.css";
import axios from "axios";
import { Link } from "react-router-dom";
import { Examcard } from "./examcard";

// const exambankAPI = "http://localhost:8000";
const exambankAPI = "https://app.revise.co.ke";

export const Exams = ({ searchTerm }) => {
  const [exams, setExams] = useState([]);

  const filteredExams = exams.filter((exam) =>
    `${exam.code} ${exam.unit} ${exam.school} ${exam.programme} ${exam.year}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="units">
      {filteredExams.length > 0 ? (
        <>
          {filteredExams.length > 0 &&
            filteredExams.map((exam, index) => {
              return (
                <Fragment key={`${index}.${exam._id}`}>
                  <Examcard exam={exam} index={index} />
                </Fragment>
              );
            })}
        </>
      ) : (
        <small className="noexams">
          No exams! <Link to="./add-exam">Add exam</Link>
        </small>
      )}
    </div>
  );
};
