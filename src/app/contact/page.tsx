'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FiSend } from "react-icons/fi";

// Define a type for the message object
type Message = {
  id: number;
  sender: 'bot' | 'user';
  text: string;
};

// A single message component with proper props typing
interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === 'bot';
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
          isBot
            ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 rounded-bl-none'
            : 'bg-blue-600 text-white rounded-br-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

// The main Contact Page component
export default function ContactPage() {
  const [isChatStarted, setIsChatStarted] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to handle the start of the chat
  const handleStartChat = () => {
    setIsChatStarted(true);
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Welcome to ByteDocker! \n Hope you're having a beautiful day. \n Please let me know some of your details so that I can get back to you as soon as possible. What is your name?",
      },
    ]);
  };

  // Function to handle sending a message
  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      text: inputValue,
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-10 text-center tracking-tight">
        Enhance Your Digital Experience with Us
      </h1>

      {/* Chat Box Container */}
      <div className="w-full max-w-3xl h-[70vh] max-h-[700px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
        
        {/* Chat Header */}
        <header className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-t-xl border-b border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">management@bytedocker.com</p>
          <div className="flex items-center space-x-4">
            <a
              href="https://www.instagram.com/your_username_here" // Your Instagram URL
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-colors duration-300"
            >
              <FaInstagram size={22} />
            </a>
            <a
              href="https://www.linkedin.com/in/your_profile_here" // Your LinkedIn URL
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-400 transition-colors duration-300"
            >
              <FaLinkedin size={22} />
            </a>
          </div>
        </header>

        {/* Chat Body */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col">
          {!isChatStarted ? (
            <div className="m-auto text-center">
              <button
                onClick={handleStartChat}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              >
                Start a Conversation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        {isChatStarted && (
          <footer className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-b-xl border-t border-gray-200 dark:border-gray-600">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                placeholder="Type your business idea..."
                className="flex-1 w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="off"
                aria-label="Chat input"
              />
              <button
                type="submit"
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
                disabled={!inputValue.trim()}
              >
                <FiSend size={20} />
              </button>
            </form>
          </footer>
        )}
      </div>
    </main>
  );
}