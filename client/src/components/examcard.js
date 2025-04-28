import React from "react";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import "../styles/examcard.css";

// const exambankAPI = "http://localhost:8000";
const exambankAPI = "https://api.revise.co.ke";

export const Examcard = ({ exam, index }) => {
  const fileUrl = `${exambankAPI}/uploads/${exam.file}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = exam.unit + ".pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download file.");
    }
  };

  return (
    <div className="examcard">
      <div className="unit">
        <div>
          {index + 1}. {exam.code}: {exam.unit}
        </div>
        <div onClick={handleDownload} className="download" title="Download PDF">
          <HiOutlineDocumentDownload className="downloadicon" />
        </div>
      </div>
      <div className="others">
        <small>{exam.school}</small>
        <span>•</span>
        <small>{exam.programme}</small>
        <span>•</span>
        <small>{exam.year}</small>
      </div>
    </div>
  );
};
