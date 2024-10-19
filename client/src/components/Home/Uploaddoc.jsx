import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { fileDataState } from "../../utils/recoil/atoms";

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useRecoilState(fileDataState);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setFileData(data);
      setLoading(false);
      navigate("/chatbot", { state: { data } });
    } catch (error) {
      console.error("Error uploading file:", error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {loading ? (
        <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      ) : (
        <>
          <input type="file" onChange={handleFileChange} className="mb-4" />
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Upload Document
          </button>
        </>
      )}
    </div>
  );
};

export default UploadDocument;
