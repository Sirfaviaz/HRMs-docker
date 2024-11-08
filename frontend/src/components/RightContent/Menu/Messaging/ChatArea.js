import React, { useEffect, useRef } from 'react';
import MessageInput from './MessageInput';

const ChatArea = ({ activeChat, messages, onSendMessage, currentUser }) => {
    const messageContainerRef = useRef(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages, activeChat]);

    return (
        <div className="flex flex-col flex-grow p-4 bg-white text-gray-900">
            {activeChat ? (
                <>
                    <div className="mb-4 border-b border-metallic-silver pb-2">
                        <h2 className="text-xl text-neon-green">{activeChat.name}</h2>
                    </div>
                    <div
                        ref={messageContainerRef}
                        className="flex-grow overflow-y-auto mb-4 custom-scrollbar"
                    >
                        {messages.map((message) => {
                            const isSender = currentUser && message.senderId === currentUser.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`mb-3 p-3 rounded-lg ${
                                        isSender
                                            ? 'bg-blue-500 text-white text-right ml-auto'
                                            : 'bg-gray-200 text-black mr-auto'
                                    }`}
                                    style={{
                                        maxWidth: '70%',
                                        alignSelf: isSender ? 'flex-end' : 'flex-start',
                                    }}
                                >
                                    {!isSender && (
                                        <div className="font-bold mb-1 text-gray-700">
                                            {message.senderName}
                                        </div>
                                    )}
                                    <div>{message.text}</div>
                                    <div className="text-xs mt-2">
                                        {message.timestamp}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <MessageInput onSendMessage={onSendMessage} />
                </>
            ) : (
                <div className="text-center mt-20 text-metallic-silver">
                    Select a chat to start messaging
                </div>
            )}
        </div>
    );
};

export default ChatArea;
