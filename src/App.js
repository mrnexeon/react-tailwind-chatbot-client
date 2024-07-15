import React, { useState, useEffect, useRef, forwardRef } from 'react';
import './App.css';

function ChatBubble({ role, content }) {
  return (
    <div
      className={`${role === 'user' ? 'col-start-1 col-end-8' : 'col-start-6 col-end-13'
        } p-2 rounded-lg`}
    >
      <div className={`flex ${role === 'user' ? 'flex-row' : 'flex-row-reverse'} items-center`}>
        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${role === 'user' ? 'bg-indigo-300' : 'bg-indigo-500'} flex-shrink-0`}>
          {role[0].toUpperCase()}
        </div>
        <div className={`relative ${role === 'user' ? 'ml-3' : 'mr-3'} text-sm ${role === 'user' ? 'bg-white dark:bg-cyan-900' : 'bg-blue-500 dark:bg-sky-900'} p-3 shadow rounded-xl`}>
          <span className={`whitespace-pre-wrap ${role === 'user' ? 'text-black dark:text-white' : 'text-white'}`}>
            {content}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChatMessages({ messages }) {
  return (
    <div className="grid grid-cols-12 gap-y-2 px-2">
      {messages.map((message, index) =>
        <ChatBubble key={index} role={message.role} content={message.content.map(block => block.text).join('\n')} />
      )}
    </div>
  );
}

const ChatInput = forwardRef(({ onSendMessage }, ref) => {
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim() === '') {
      return;
    }
    onSendMessage(input);
    setInput('');
  }

  return (
    <div className="flex items-center">
      <input
        ref={ref}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="Type a message..."
      />
      <button
        onClick={handleSendMessage}
        className="p-2 ml-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-20"
      >
        Send
      </button>
    </div>
  );
});

function NavItem({ children, active, onClick }) {
  return (
    <li>
      <div
        className={`flex items-center cursor-pointer px-3 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group ${active ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
        onClick={onClick}
      >
        {children}
      </div>
    </li>
  );
}

function App() {
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputFieldRef = useRef(null);

  useEffect(() => {
    inputFieldRef.current.focus();
    fetchChats().then((data) => {
      setChats(data.reverse());
    }).catch((error) => {
      alert(`Error fetching chats, please try again later. ${error}`);
    });
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchChats = async () => {
    const response = await fetch(`${process.env.REACT_APP_RESTAPI_ENDPOINT}/chats`);
    return response.json();
  };

  const fetchChatHistory = async (chatId) => {
    const response = await fetch(`${process.env.REACT_APP_RESTAPI_ENDPOINT}/chat/${chatId}`);
    return response.json();
  }

  const sendMessage = async (message, chatId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_RESTAPI_ENDPOINT}/chat${chatId ? `?chat_id=${chatId}` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: message
      });
      const data = await response.json();
      console.log('Response:', data);
      return data;
    } catch (error) {
      console.error('Error', error);
    }
  };

  const handleSendMessage = (input) => {
    const newMessage = {
      role: "user",
      content: [
        {
          text: input
        }
      ]
    };
    setMessages([...messages, newMessage]);
    scrollToBottom();

    sendMessage(input, chatId).then((response) => {
      if (!chatId) {
        setChats([response.chat, ...chats]);
      }
      setChatId(response.chat.id);
      setMessages([...messages, newMessage, response.message]);
      scrollToBottom();
    });
  };

  const openChat = (chatId) => {
    console.log('Open chat:', chatId);
    setChatId(chatId);
    fetchChatHistory(chatId).then((data) => {
      setMessages(data);
      scrollToBottom();
      inputFieldRef.current.focus();
    });
  };

  const newChat = () => {
    setChatId(null);
    setMessages([]);
    inputFieldRef.current.focus();
  };

  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex justify-start items-center">
            <button
              data-drawer-target="drawer-navigation"
              data-drawer-toggle="drawer-navigation"
              aria-controls="drawer-navigation"
              className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <span className="self-center font-semibold whitespace-nowrap dark:text-white">Chatbot</span>
          </div>
        </div>
      </nav>

      <aside
        className="fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
        aria-label="Sidenav"
        id="drawer-navigation"
      >
        <div className="overflow-y-auto py-5 px-3 h-full bg-white dark:bg-gray-800">
          {chats.length > 0 && <ul className="space-y-2">
            {chats.map((chat, index) => (
              <NavItem key={index} active={chatId === chat.id} onClick={() => openChat(chat.id)}>
                <span className="truncate text-ellipsis">
                  {chat.title}
                </span>
              </NavItem>
            ))}
          </ul>}
          <ul className={`pt-5 space-y-2 ${chats.length > 0 ? 'mt-5 border-t border-gray-200 dark:border-gray-700' : ''}`}>

            <NavItem active={!chatId} onClick={() => newChat()}>
              <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6l3 3v-3h2V9h-2M4 4h11v8H9l-3 3v-3H4V4Z" />
              </svg>
              <span className="ml-3 truncate text-ellipsis">
                New chat
              </span>
            </NavItem>
          </ul>
        </div>
      </aside>

      <main className="p-4 md:ml-64 pt-20 dark:text-white h-screen">

        {/* Chat */}
        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full py-2 px-4">

          <div className="h-full overflow-x-auto mb-6">
            <ChatMessages messages={messages} />
            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSendMessage={handleSendMessage} ref={inputFieldRef} />

        </div>

      </main>
    </div>
  );
}

export default App;
