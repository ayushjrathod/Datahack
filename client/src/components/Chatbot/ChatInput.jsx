import React, { useRef } from "react";

const ChatInput = ({ input, setInput, handleSendMessage, handleKeyPress, inputRef, handleFileUpload }) => {
  const fileInputRef = useRef(null);

  const triggerFileUpload = (fileType) => {
    fileInputRef.current.setAttribute("accept", fileType);
    fileInputRef.current.click();
  };

  return (
    <div>
      <div className="bg-gray-200 rounded-lg flex justify-center w-full">
        <div className="bg-white w-full border-2 border-gray-500 rounded-lg p-2 m-2 flex flex-col">
          <div className="flex items-center mb-2">
            <button onClick={() => triggerFileUpload(".pdf")} className="mr-2 p-1 bg-blue-500 text-white rounded">
              <i className="bx bxs-file-pdf"></i> PDF
            </button>
            <button onClick={() => triggerFileUpload("image/*")} className="mr-2 p-1 bg-green-500 text-white rounded">
              <i className="bx bxs-image"></i> Image
            </button>
            <button onClick={() => triggerFileUpload(".pptx")} className="mr-2 p-1 bg-orange-500 text-white rounded">
              <i className="bx bxs-file-ppt"></i> PPTX
            </button>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
          </div>
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyUp={handleKeyPress}
              className="w-full border-none outline-none"
              placeholder="Type a message..."
            />
            <div className="relative">
              <button onClick={handleSendMessage}>
                <i className="bx bx-send bx-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
