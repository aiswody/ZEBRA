import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../api/client'; 

// --- Helper Components for Icons ---
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.657 7.343A8 8 0 0117.657 18.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1014.12 11.88l-4.242 4.242z" />
    </svg>
);

const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);


// --- Main Chatbot Component ---
export default function App() {
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: '안녕하세요! 기관의 데이터를 바탕으로 온실가스 배출량을 줄일 수 있는 효과적인 방법을 추천해 드릴게요.<br><br>아래 예시 질문을 클릭하여 시작해보세요.'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [showInitialPrompt, setShowInitialPrompt] = useState(true);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleInitialPromptClick = () => {
        const question = "온실가스를 더 적게 배출할 수 있는 방법을 알려줘";
        setMessages(prev => [...prev, { sender: 'user', text: question }]);
        setShowInitialPrompt(false);
        getAIRecommendation();
    };

    const getAIRecommendation = async () => {
        setIsLoading(true);
        try {
            // --- [수정] ---
            // config/urls.py의 '/api/chatbot/'과
            // chatbot/urls.py의 'recommendation/'이 조합된
            // 최종 주소를 호출하도록 수정합니다.
            const response = await api.post('/chatbot/recommendation/');

            const data = response.data;
            
            if (!data.recommendation) {
                throw new Error('서버 응답에 추천 내용이 없습니다.');
            }
            
            setMessages(prev => [...prev, { sender: 'bot', text: data.recommendation }]);

        } catch (error) {
            console.error('Error fetching AI recommendation:', error);
            const errorMessageFromServer = error.response?.data?.error || error.response?.data?.detail || error.message;
            const errorMessage = `<p class="text-red-500">죄송합니다. 추천을 받아오는 중 오류가 발생했습니다.<br><br><b>오류 내용:</b> ${errorMessageFromServer}</p>`;
            setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-100 flex items-center justify-center min-h-screen font-sans">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl flex flex-col h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full"><LeafIcon /></div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">AI 온실가스 감축 도우미</h1>
                            <p className="text-sm text-slate-500">기관 맞춤형 감축 방안을 추천해 드립니다.</p>
                        </div>
                    </div>
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start space-x-3 mb-6 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'bot' && (
                                <div className="p-2 bg-slate-200 rounded-full flex-shrink-0"><BotIcon /></div>
                            )}
                            <div className={`p-4 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-slate-200 rounded-tl-none'}`}>
                                <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: msg.text }} />
                            </div>
                            {msg.sender === 'user' && (
                                <div className="p-2 bg-green-600 text-white rounded-full flex-shrink-0"><UserIcon /></div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start space-x-3 mb-6">
                            <div className="p-2 bg-slate-200 rounded-full flex-shrink-0"><BotIcon /></div>
                            <div className="bg-slate-200 p-4 rounded-lg rounded-tl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Initial Prompt Button */}
                {showInitialPrompt && (
                    <div className="p-6 border-t border-slate-200">
                        <button onClick={handleInitialPromptClick} className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200">
                            <p className="font-semibold text-green-800">"온실가스를 더 적게 배출할 수 있는 방법을 알려줘"</p>
                            <p className="text-sm text-green-600 mt-1">클릭하여 AI 추천 받기</p>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
