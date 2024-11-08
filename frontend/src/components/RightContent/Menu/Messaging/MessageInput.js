import React, { useState } from 'react';

const MessageInput = ({ onSendMessage }) => {
    const [input, setInput] = useState('');

    const handleSendMessage = () => {
        if (input.trim() === '') return;
        onSendMessage(input);
        setInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="flex border-t border-metallic-silver pt-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-grow p-3 bg-charcoal text-neon-blue rounded mr-2 border border-metallic-silver"
            />
            <button
                onClick={handleSendMessage}
                className="bg-green-500 hover:bg-neon-green text-dark-slate py-2 px-4 rounded"
            >
                Send
            </button>
        </div>
    );
};

export default MessageInput;
