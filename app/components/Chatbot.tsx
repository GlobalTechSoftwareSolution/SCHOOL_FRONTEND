"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WhatsappButton from '@/app/components/Whatsappbutton';
import { Send, X, User, Bot } from "lucide-react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [showContactButtons, setShowContactButtons] = useState(false);
  const [messages, setMessages] = useState<
    { text: string; user: boolean; timestamp: Date }[]
  >([
    { text: "Hi, I'm your School ERP assistant. How can I help you today?", user: false, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleContactFormSubmit = () => {
    // Redirect to contact page with query parameters
    const queryParams = new URLSearchParams({
      name: contactData.name,
      email: contactData.email,
      message: contactData.message
    }).toString();

    window.location.href = `/contact?${queryParams}`;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    const newUserMessage = { text: userMsg, user: true, timestamp: new Date() };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    // Check if user is asking about contact details
    if (userMsg.toLowerCase().includes("contact") || userMsg.toLowerCase().includes("details")) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "I can help you with that. Please fill out this contact form and I'll redirect you to our contact page:", user: false, timestamp: new Date() },
        ]);
        setShowContactForm(true);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CHAT_BOT_API}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg }),
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { text: data.reply || "I don't have information about that. Please contact admin for more details.", user: false, timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Server error, try again.", user: false, timestamp: new Date() },
      ]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    setMessages([
      { text: "Hi, I'm your School ERP assistant. How can I help you today?", user: false, timestamp: new Date() }
    ]);
    setShowContactForm(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="text-black">
      {/* Contact Buttons that appear when arrow is clicked */}
      {showContactButtons && <WhatsappButton />}

      {/* Arrow Button to toggle contact buttons */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowContactButtons(!showContactButtons)}
        className="fixed right-9 bottom-32 z-[9998] bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 text-white transition-transform duration-300 ${showContactButtons ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </motion.button>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:shadow-xl transition-all duration-300"
      >
        {/* ✅ PRO AI BOT ICON */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="8" width="16" height="12" rx="4" />
          <circle cx="9" cy="14" r="1" />
          <circle cx="15" cy="14" r="1" />
          <path d="M12 2v4" />
          <circle cx="12" cy="6" r="1" />
        </svg>

        {/* ✅ Notification Ping */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500"></span>
        </span>
      </motion.button>


      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-24 md:right-6 md:left-auto z-[9999] w-full md:w-96 h-[80vh] md:h-auto md:max-h-[85vh] bg-white shadow-2xl rounded-t-2xl rounded-b-none md:rounded-2xl flex flex-col border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-semibold">School ERP Assistant</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearChat}
                  className="hover:bg-white/20 p-1 rounded-full transition-colors"
                  title="Clear chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* <!-- Bot Head --> */}
                    <rect x="3" y="8" width="18" height="12" rx="4" ry="4" />

                    {/* <!-- Eyes --> */}
                    <circle cx="9" cy="13" r="1" />
                    <circle cx="15" cy="13" r="1" />

                    {/* <!-- Mouth --> */}
                    <path d="M9 17h6" />

                    {/* <!-- Antenna --> */}
                    <path d="M12 2v4" />
                    <circle cx="12" cy="6" r="1" />
                  </svg>

                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="hover:bg-white/20 p-1 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[90%] md:max-w-[85%] flex flex-col ${msg.user ? '' : 'items-start'}`}>
                      <div className="flex items-start gap-2">
                        {!msg.user && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                        )}
                        <div
                          className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed break-words shadow-sm ${msg.user
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm"
                            }`}
                        >
                          {msg.text}
                        </div>
                        {msg.user && (
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center">
                            <User size={16} className="text-gray-700" />
                          </div>
                        )}
                      </div>
                      <span className={`text-xs mt-1 text-gray-500 ${msg.user ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {showContactForm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-white border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">Contact Form</h3>
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={contactData.name}
                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={contactData.email}
                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Your Message"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={contactData.message}
                        onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        onClick={handleContactFormSubmit}
                      >
                        <Send size={16} />
                        Submit
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-gray-500"
                >
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span>Assistant is typing...</span>
                </motion.div>
              )}

              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ask about our school..."
                  disabled={showContactForm || loading}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={sendMessage}
                  disabled={showContactForm || loading || !input.trim()}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${input.trim()
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    } transition-all duration-200`}
                >
                  <Send size={18} />
                </motion.button>
              </div>
              <p className="text-xs text-center text-gray-500 mt-2">
                Powered by School ERP AI Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
