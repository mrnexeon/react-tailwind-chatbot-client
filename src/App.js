import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats().then((data) => {
      setChats(data);
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

  const handleSendMessage = () => {
    if (input.trim()) {
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
          setChats([...chats, response.chat_id]);
        }
        setChatId(response.chat_id);
        setMessages([...messages, newMessage, response.message]);
        scrollToBottom();
      });

      setInput('');
    }
  };

  const openChat = (chatId) => {
    setChatId(chatId);
    fetchChatHistory(chatId).then((data) => {
      setMessages(data);
      scrollToBottom();
    });
  };

  const newChat = () => {
    setChatId(null);
    setMessages([]);
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
              <svg
                aria-hidden="true"
                className="hidden w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
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
          <ul className="space-y-2">
            {chats.map((id, index) => (
              <li key={index}>
                <div
                  onClick={() => openChat(id)}
                  className={`px-3 py-2 text-base cursor-pointer truncate text-ellipsis font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 ${chatId === id ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {id}
                </div>
              </li>
            ))}
          </ul>
          <ul className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <li>
              <div
                className="flex items-center cursor-pointer p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
                onClick={() => newChat()}
              >
                <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6l3 3v-3h2V9h-2M4 4h11v8H9l-3 3v-3H4V4Z" />
                </svg>
                <span className="ml-3">New chat</span>
              </div>
            </li>
          </ul>
        </div>
      </aside>

      <main className="p-4 md:ml-64 pt-20 dark:text-white h-screen">
        <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl h-full py-2 px-4">
          <div className="flex flex-col h-full overflow-x-auto mb-6">
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-12 gap-y-2 px-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`${message.role === 'user' ? 'col-start-1 col-end-8' : 'col-start-6 col-end-13'
                      } p-2 rounded-lg`}
                  >
                    <div className={`flex ${message.role === 'user' ? 'flex-row' : 'flex-row-reverse'} items-center`}>
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${message.role === 'user' ? 'bg-indigo-300' : 'bg-indigo-500'
                          } flex-shrink-0`}
                      >
                        {message.role[0].toUpperCase()}
                      </div>
                      <div
                        className={`relative ${message.role === 'user' ? 'ml-3' : 'mr-3'
                          } text-sm ${message.role === 'user' ? 'bg-white dark:bg-cyan-900' : 'bg-blue-500 dark:bg-sky-900'
                          } p-3 shadow rounded-xl`}
                      >
                        <span
                          className={`whitespace-pre-wrap ${message.role === 'user' ? 'text-black dark:text-white' : 'text-white'
                            }`}
                        >
                          {message.content.map(block => block.text).join('\n')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <input
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
        </div>
      </main>
    </div>
  );
}

export default App;
