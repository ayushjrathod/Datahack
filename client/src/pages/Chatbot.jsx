import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import ChatInput from "../components/Chatbot/ChatInput";
import ChatMessages from "../components/Chatbot/ChatMessages";
import DrawerBackdrop from "../components/Chatbot/DrawerBackdrop";
import Navbar from "../components/Chatbot/Navbar";
import Sidebar from "../components/Chatbot/Sidebar";

// Recoil atoms
const drawerOpenState = atom({
  key: "drawerOpenState",
  default: false,
});

const chatIdState = atom({
  key: "chatIdState",
  default: null,
});

const messagesState = atom({
  key: "messagesState",
  default: [],
});

const inputState = atom({
  key: "inputState",
  default: "",
});

const chatsState = atom({
  key: "chatsState",
  default: [{ id: 1, title: "General Chat" }],
});

const initialChatMessagesState = atom({
  key: "initialChatMessagesState",
  default: {
    1: [
      {
        role: "assistant", //another role is user
        content: [{ text: "Hello! How can I assist you today?" }],
      },
    ],
  },
});

function Chatbot() {
  const [drawerOpen, setDrawerOpen] = useRecoilState(drawerOpenState);
  const [chatId, setChatId] = useRecoilState(chatIdState);
  const [messages, setMessages] = useRecoilState(messagesState);
  const [input, setInput] = useRecoilState(inputState);
  const [chats, setChats] = useRecoilState(chatsState);
  const initialChatMessages = useRecoilValue(initialChatMessagesState);
  let chatsArray = [
    {
      id: 1,
      title: "General Chat",
    },
  ];

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { id } = useParams();

  const openChat = (id) => {
    setChatId(id);
    setMessages(initialChatMessages[id] || []);
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const newChat = () => {
    const newId = Date.now();
    const newTitle = prompt("Enter new chat title name") || "Untitled Chat";
    setChatId(newId);
    setMessages([
      {
        role: "assistant",
        content: [{ text: "Hello! How can I help you today?" }],
      },
    ]);
    const temp = { id: newId, title: newTitle };
    setChats((prevChatsArray) => {
      const updatedChatsArray = [...prevChatsArray, temp];
      return updatedChatsArray;
    });
    setDrawerOpen(false);
    inputRef.current?.focus();
  };

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { role: "user", content: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      console.log("starting fetch");
      const response = await fetch(`http://127.0.0.1:8000/ask/${id}`, {
        method: "POST",
        body: JSON.stringify({ query: input }),
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = { role: "assistant", content: [{ text: "" }] };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantMessage.content[0].text += chunk;
        setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error receiving message:", error);
      const errorMessage = {
        role: "assistant",
        content: [{ text: "Sorry, something went wrong." }],
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="antialiased bg-gray-50">
      <Navbar toggleDrawer={toggleDrawer} />

      {drawerOpen && <DrawerBackdrop onClick={toggleDrawer} />}

      <Sidebar chats={chats} chatId={chatId} openChat={openChat} newChat={newChat} drawerOpen={drawerOpen} />

      <main className="p-4 md:ml-64 pt-20 h-screen">
        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full py-2 px-4">
          <div className="h-full overflow-x-auto mb-6">
            <ChatMessages messages={messages} />
            <div ref={messagesEndRef} />
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            inputRef={inputRef}
          />
        </div>
      </main>
    </div>
  );
}

export default Chatbot;
