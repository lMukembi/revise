// import React from "react";
// import { IoBookmarkOutline } from "react-icons/io5";
// import { FaDownload } from "react-icons/fa6";
// import { GoCopilot } from "react-icons/go";

// import "../styles/examcard.css";

// // const exambankAPI = "http://localhost:8000";
// const exambankAPI = "https://app.revise.co.ke";

// export const Examcard = ({ exam, index }) => {

//         const handleDownload = async (id) => {
//     const fileUrl = `${exambankAPI}/api/exams/download/${id}`;
//   try {
//     const res = await fetch(fileUrl);
//     const data = await res.json();

//     if (!res.ok) throw new Error("Download failed.");

//     const response = await fetch(data.file);
//     const blob = await response.blob();

//     const blobUrl = window.URL.createObjectURL(blob);

//     const link = document.createElement("a");
//     link.href = blobUrl;
//     link.download = exam.unit + ".pdf";

//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//     window.URL.revokeObjectURL(blobUrl);

//     setExams((prev) =>
//       prev.map((item) =>
//         item._id === id
//           ? { ...item, downloads: data.downloads }
//           : item
//       )
//     );

//   } catch (error) {
//     console.log(error);
//   }
// };

//   return (
//     <div className="examcard">
//       <div className="unit">
//         {index + 1}. {exam.code}: {exam.unit}
//       </div>

//       <div className="others">
//         <small>{exam.school} •</small>
//         <small>{exam.programme} •</small>
//         <small>{exam.year}</small>
//       </div>

//       <div className="actions">
//         <small
//           onClick={() => handleDownload(exam._id)}
//           className="actionbutton"
//           title="Download PDF"
//         >
//           <FaDownload className="actionicon" />
//         </small>
//         <small>
//          <GoCopilot className="actionicon" />
//         </small>
//         <small>
//           <IoBookmarkOutline className="actionicon" />
//         </small>
//       </div>
//     </div>
//   );
// };

import React from "react";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import "../styles/examcard.css";

// const exambankAPI = "http://localhost:8000";
const exambankAPI = "https://app.revise.co.ke";

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
          <HiOutlineDocumentDownload className="actionicon" />
        </div>
      </div>
      <div className="others">
        <small>{exam.school} •</small>
        <small>{exam.programme} •</small>
        <small>{exam.year}</small>
      </div>
    </div>
  );
};
