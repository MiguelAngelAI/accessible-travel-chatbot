import { useState, useEffect, useRef } from "react";
import Chat from "./components/Chat";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID());
  const [allConversations, setAllConversations] = useState([
    { id: conversationId, title: "Conversation 1" },
  ]);
  const [conversationsData, setConversationsData] = useState({});
  const [lastSent, setLastSent] = useState(0);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setConversationsData((prev) => ({ ...prev, [conversationId]: messages }));
  }, [messages]);

  useEffect(() => {
    setMessages(conversationsData[conversationId] || []);
  }, [conversationId]);

  const typingDelay = 10; // velocidad de escritura (ms por letra)

  const handleSend = async (input) => {
    if (!input.trim()) return;

    const now = Date.now();
    if (now - lastSent < 3000) {
      alert("Please wait a few seconds before sending another message.");
      return;
    }
    setLastSent(now);

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const evtSource = new EventSource(
        `http://127.0.0.1:8000/chat?message=${encodeURIComponent(
          input
        )}&conversation_id=${conversationId}`
      );

      let botResponse = "";
      let firstTokenReceived = false;
      let buffer = [];

      const processBuffer = () => {
        if (buffer.length > 0) {
          botResponse += buffer.shift();
          setMessages((prev) => {
            const newMessages = [...prev];
            if (
              newMessages.length > 0 &&
              newMessages[newMessages.length - 1].sender === "assistant"
            ) {
              newMessages[newMessages.length - 1].text = botResponse;
            } else {
              newMessages.push({ sender: "assistant", text: botResponse });
            }
            return newMessages;
          });
        }
        if (buffer.length > 0) {
          setTimeout(processBuffer, typingDelay);
        }
      };

      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "content") {
          if (!firstTokenReceived) {
            setIsTyping(false);
            firstTokenReceived = true;
          }
          // Agregar caracteres nuevos al buffer y procesar progresivamente
          buffer.push(...data.content.split(""));
          if (buffer.length === data.content.length) {
            processBuffer();
          }
        } else if (data.type === "done") {
          evtSource.close();
        } else if (data.type === "error") {
          setIsTyping(false);
          evtSource.close();
          setMessages((prev) => [
            ...prev,
            { sender: "assistant", text: `⚠️ Error: ${data.message}` },
          ]);
        }
      };

      evtSource.onerror = () => {
        setIsTyping(false);
        evtSource.close();
      };
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: `⚠️ Error sending message.` },
      ]);
    }
  };

  const handleNewConversation = () => {
    setConversationsData((prev) => ({ ...prev, [conversationId]: messages }));

    const newId = crypto.randomUUID();
    setConversationId(newId);
    setAllConversations((prev) => [
      ...prev,
      { id: newId, title: `Conversation ${prev.length + 1}` },
    ]);
    setMessages([]);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-indigo-50 to-white relative">
      <header className="w-full py-3 px-4 border-b border-gray-200 flex items-center justify-between bg-white/70 backdrop-blur-md">
        <h1 className="font-semibold text-gray-800 text-lg">Accessible Travel Chatbot</h1>
        <div className="flex items-center gap-2">
          <select
            className="bg-white border border-gray-300 text-gray-800 rounded-lg px-2 py-1 text-sm shadow-sm"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
          >
            {allConversations.map((conv) => (
              <option key={conv.id} value={conv.id}>
                {conv.title}
              </option>
            ))}
          </select>
          <button
            onClick={handleNewConversation}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded-md shadow hover:bg-blue-700"
          >
            New Chat
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <Chat messages={messages} onSend={handleSend} isTyping={isTyping} />
        <div ref={chatEndRef} />
      </main>
    </div>
  );
}
