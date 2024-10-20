import React from "react";

const ChatBubble = React.memo(({ role, content }) => {
  const isUser = role === "user";
  const messageContent = Array.isArray(content) ? content : [{ text: content }];

  return (
    <div className={`${isUser ? "col-start-6 col-end-13" : "col-start-1 col-end-8"} rounded-lg`}>
      <div className={`flex ${isUser ? "flex-row-reverse" : "flex-row"} items-center`}>
        {/* <div
          className={`flex items-center justify-center h-10 w-10 rounded-full ${
            isUser ? "bg-indigo-300" : "bg-indigo-500"
          } flex-shrink-0`}
        >
          {role[0].toUpperCase()}
        </div> */}
        <div
          className={`relative ${isUser ? "mr-1" : "ml-1"} text-sm font-[550] ${
            isUser ? "bg-white" : "bg-blue-500"
          } p-3 shadow rounded-xl`}
        >
          <span className={`whitespace-pre-wrap font-poppins tracking-wider ${isUser ? "text-black" : "text-white"}`}>
            {messageContent.map((block) => block.text).join("\n")}
          </span>
        </div>
      </div>
    </div>
  );
});
ChatBubble.displayName = "ChatBubble";

export default ChatBubble;
