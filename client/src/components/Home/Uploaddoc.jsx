import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { fileDataState } from "../../utils/recoil/atoms";

const UploadDocument = () => {
  const [fileData, setFileData] = useRecoilState(fileDataState);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

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
    <div className="flex flex-col">
      {loading ? (
        <div className="loader border-blue-500 rounded-full animate-spin"></div>
      ) : (
        <div className="flex items-center text-center gap-2 border-2 p-4 rounded-lg">
          <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" />
          <label htmlFor="fileInput" className="cursor-pointer text-white font-semibold">
            Select a file to upload
          </label>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;
