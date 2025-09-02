import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader, Bot } from 'lucide-react';
// [수정됨] 이제 chatapi.js 대신 client.js에서 함수를 가져옵니다.
import { fetchUserBuildings, getAIRecommendation } from '../../../api/client'; 

export default function Chatbot2yo() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userBuildings, setUserBuildings] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      { 
        sender: 'bot', 
        text: '안녕하세요! ZEBRA의 AI 챗봇입니다. 아래 버튼을 눌러 온실가스 감축 방안 분석을 시작해보세요.' 
      }
    ]);

    const loadBuildingData = async () => {
      try {
        const response = await fetchUserBuildings();
        setUserBuildings(response.data);
      } catch (err) {
        setError('건물 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
        console.error(err);
      }
    };
    loadBuildingData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleAnalysisClick = async () => {
    if (!userBuildings || userBuildings.length === 0) {
      setMessages(prev => [...prev, { sender: 'bot', text: '분석할 건물 데이터가 없습니다. 먼저 대시보드에서 건물을 등록해주세요.' }]);
      return;
    }

    const userMessage = "온실가스 배출을 줄일 수 있는 방안을 추천해줘";
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAIRecommendation(userBuildings);
      const aiResponse = response.data.recommendation;
      setMessages(prev => [...prev, { sender: 'bot', text: aiResponse, isHtml: true }]);
    } catch (err) {
      setError('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10">
        <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 p-2 rounded-full">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex items-center mx-auto">
          <Bot className="text-indigo-600 mr-2" size={28}/>
          <h1 className="text-xl font-bold text-gray-800">AI 감축 방안 분석</h1>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && <img src="https://i.imgur.com/your-zebra-character.png" alt="ZEBRA" className="w-10 h-10 rounded-full flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/6366f1/ffffff?text=Z'; }}/>}
              <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>
                {msg.isHtml ? <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.text }} /> : <p>{msg.text}</p>}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-end gap-3">
              <img src="https://i.imgur.com/your-zebra-character.png" alt="ZEBRA" className="w-10 h-10 rounded-full flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/6366f1/ffffff?text=Z'; }}/>
              <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl flex items-center shadow-sm">
                <Loader className="animate-spin mr-3" size={20} />
                <span>데이터를 분석 중입니다...</span>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-center py-4">{error}</p>}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white p-4 border-t sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleAnalysisClick}
            disabled={isLoading || userBuildings === null}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ArrowRight className="mr-2" size={20} />
            <span>감축 방안 분석 시작하기</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

