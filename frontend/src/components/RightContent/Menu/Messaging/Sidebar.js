import React from 'react';

const Sidebar = ({ recentChats = [], contacts = [], activeChat, onSelectChat, onStartChat, currentUser, unreadCounts }) => {
    const sortedChats = [...recentChats];

    return (
        <div className="w-72 bg-gray-100 p-4 overflow-y-auto border-r border-gray-300 flex flex-col relative">
            <h2 className="text-2xl mb-4 text-blue-700">Chat</h2>
            <div>
                <h3 className="text-lg mb-2 text-gray-600">Recent Chats</h3>
                {sortedChats.map((chat) => {
                    const unreadCount = unreadCounts?.[chat.id] || 0;

                    // Ensure participants is defined before calling .filter()
                    const otherParticipants = chat.participants?.filter(
                        (participant) => participant.id !== currentUser?.id
                    ) || [];

                    // Extract the name of the other participants
                    const participantNames = otherParticipants
                        .map((participant) =>
                            (participant.first_name || participant.last_name)
                                ? `${participant.first_name} ${participant.last_name}`.trim()
                                : participant.username
                        )
                        .join(", ");

                    return (
                        <div
                            key={chat.id}
                            className={`p-3 mb-2 rounded cursor-pointer ${
                                activeChat?.id === chat.id
                                    ? 'bg-blue-300 text-black border border-blue-500'
                                    : unreadCount > 0
                                        ? 'bg-yellow-200 text-gray-800 border border-yellow-400'
                                        : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                            onClick={() => onSelectChat(chat)}
                        >
                            <div className="flex justify-between items-center">
                                <span>{participantNames || "Unnamed Chat"}</span>
                                {unreadCount > 0 && (
                                    <span className="text-sm bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">{chat.last_message || "No messages yet"}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;
