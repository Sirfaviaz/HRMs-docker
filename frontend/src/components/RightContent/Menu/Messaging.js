import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Messaging/Sidebar';
import ChatArea from './Messaging/ChatArea';
import api, { backendHost } from '../../../services/api';
import Cookies from 'js-cookie';
import './Messaging.css';

const ChatApp = () => {
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const chatSocketRef = useRef(null);         // For the active chat room
    const chatListSocketRef = useRef(null);     // For the general chat list
    const messageQueue = [];
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        fetchCurrentUser();
        fetchContacts();
        setupChatListWebSocket();  // Establish connection for chat list
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/chat/current_user/');
            setCurrentUser(response.data);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const response = await api.get('/chat/contacts/');
            setContacts(response.data);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    // Set up WebSocket for the general chat list
    const setupChatListWebSocket = () => {
        if (chatListSocketRef.current) {
            chatListSocketRef.current.close();
        }

        const accessToken = Cookies.get('access');
        chatListSocketRef.current = new WebSocket(
            `ws://${backendHost}/ws/chat/?token=${accessToken}`
        );

        chatListSocketRef.current.onopen = () => {
            console.log("Chat list WebSocket connection opened.");
        };

        chatListSocketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Received chat list WebSocket message:", data);

            if (data.type === 'initial_chat_rooms') {
                console.log("Received initial chat rooms:", data.chat_rooms);
                setChatRooms(data.chat_rooms);
            } else if (data.type === 'chat_list_update') {
                handleChatListUpdate(data);
            }
        };

        chatListSocketRef.current.onerror = (error) => {
            console.error('Chat list WebSocket error:', error);
        };

        chatListSocketRef.current.onclose = (event) => {
            console.error('Chat list WebSocket closed:', event);
        };
    };

    // Set up WebSocket for the active chat room
    const setupWebSocket = (chatRoomId) => {
        if (chatSocketRef.current) {
            chatSocketRef.current.close();
        }

        const accessToken = Cookies.get('access');
        chatSocketRef.current = new WebSocket(
            `ws://${backendHost}/ws/chat/${chatRoomId}/?token=${accessToken}`
        );

        chatSocketRef.current.onopen = () => {
            console.log("WebSocket connection opened for chat room:", chatRoomId);
            sendQueuedMessages();
        };

        chatSocketRef.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("Received chat room WebSocket message:", data);

            if (data.type === 'chat_message') {
                handleIncomingMessage(data);
            }
        };

        chatSocketRef.current.onerror = (error) => {
            console.error('Chat room WebSocket error:', error);
        };

        chatSocketRef.current.onclose = (event) => {
            console.error('Chat room WebSocket closed:', event);
        };
    };

    const handleChatSelect = (chat) => {
        setActiveChat(chat);
        setMessages([]);
        setupWebSocket(chat.id);
        fetchMessages(chat.id);

        setUnreadCounts((prevUnreadCounts) => ({
            ...prevUnreadCounts,
            [chat.id]: 0,
        }));
    };

    const fetchMessages = async (chatRoomId) => {
        try {
            const response = await api.get(`/chat/chat-rooms/${chatRoomId}/messages/`);
            const processedMessages = response.data.map((message) => ({
                id: message.id,
                text: message.content,
                senderId: message.sender?.id,
                senderName: message.sender?.username || 'Unknown',
                timestamp: new Date(message.timestamp).toLocaleTimeString(),
            }));
            setMessages(processedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleIncomingMessage = (data) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: data.id,
                text: data.message,
                senderId: data.sender_id,
                senderName: data.sender_name,
                timestamp: new Date(data.timestamp).toLocaleTimeString(),
            },
        ]);
    };

    const handleChatListUpdate = (data) => {
        console.log("Received chat_list_update:", data);
    
        setChatRooms((prevChatRooms) => {
            console.log("Current chatRooms:", prevChatRooms);
    
            const existingChatRoomIndex = prevChatRooms.findIndex(
                (chatRoom) => String(chatRoom.id) === String(data.chat_room_id)
            );
    
            if (existingChatRoomIndex !== -1) {
                console.log("Updating existing chat room:", data.chat_room_id);
                const updatedChatRooms = [...prevChatRooms];
                updatedChatRooms[existingChatRoomIndex] = {
                    ...updatedChatRooms[existingChatRoomIndex],
                    last_message: data.last_message,
                    last_message_timestamp: data.last_message_timestamp,
                    participants: data.participants || updatedChatRooms[existingChatRoomIndex].participants,
                };
    
                return updatedChatRooms.sort(
                    (a, b) => new Date(b.last_message_timestamp || 0) - new Date(a.last_message_timestamp || 0)
                );
            } else {
                console.log("Adding new chat room:", data.chat_room_id);
                const newChatRoom = {
                    id: data.chat_room_id,
                    last_message: data.last_message,
                    last_message_timestamp: data.last_message_timestamp,
                    participants: data.participants || [],
                };
    
                return [
                    newChatRoom,
                    ...prevChatRooms,
                ].sort(
                    (a, b) => new Date(b.last_message_timestamp || 0) - new Date(a.last_message_timestamp || 0)
                );
            }
        });
    };
    

    const sendQueuedMessages = () => {
        while (messageQueue.length > 0 && chatSocketRef.current.readyState === WebSocket.OPEN) {
            const message = messageQueue.shift();
            chatSocketRef.current.send(JSON.stringify(message));
        }
    };

    const handleStartChat = async (contact) => {
        try {
            const response = await api.post('/chat/private-chat/', { user_id: contact.id });
            const chatRoom = response.data;

            setChatRooms((prevRooms) => {
                const exists = prevRooms.some((room) => room.id === chatRoom.id);
                if (!exists) {
                    return [chatRoom, ...prevRooms];
                }
                return prevRooms;
            });

            setActiveChat(chatRoom);
            setupWebSocket(chatRoom.id);
            fetchMessages(chatRoom.id);
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const handleSendMessage = (text) => {
        if (text.trim() === '') return;
        if (chatSocketRef.current && currentUser) {
            const message = {
                message: text,
                sender_id: currentUser.id,
                sender_name: currentUser.username,
            };

            if (chatSocketRef.current.readyState === WebSocket.OPEN) {
                try {
                    chatSocketRef.current.send(JSON.stringify(message));
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            } else {
                messageQueue.push(message);
            }
        }
    };

    return (
        <div className="flex h-[700px] bg-white text-gray-900">
            <Sidebar
                recentChats={chatRooms}
                contacts={contacts}
                activeChat={activeChat}
                onSelectChat={handleChatSelect}
                onStartChat={handleStartChat}
                currentUser={currentUser}
                unreadCounts={unreadCounts}
            />
            <ChatArea
                activeChat={activeChat}
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
            />
        </div>
    );
};

export default ChatApp;
