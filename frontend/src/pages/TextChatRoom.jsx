import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage as sendMessageApi } from '../lib/api';
import toast from 'react-hot-toast';
import { Users, Settings, Copy, Share2, MessageSquare } from 'lucide-react';
import ChatSidePanel from '../components/ChatSidePanel';

const TextChatRoom = () => {
  const { roomId } = useParams();
  const { socket, joinRoom, leaveRoom, sendMessage } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'earlier'

  useEffect(() => {
    if (socket) {
      joinRoom(roomId);

      socket.on('receive_message', (data) => {
        setMessages((prev) => [...prev, data]);
      });

      socket.on('user_typing', (data) => {
        if (data.userId !== user.id) {
          setIsTyping(true);
        }
      });

      socket.on('user_stopped_typing', (data) => {
        if (data.userId !== user.id) {
          setIsTyping(false);
        }
      });

      return () => {
        leaveRoom(roomId);
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('user_stopped_typing');
      };
    }
  }, [socket, roomId, user.id, joinRoom, leaveRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        roomId,
        content: newMessage,
        userId: user.id,
        userName: user.fullName,
        timestamp: new Date().toISOString(),
      };

      await sendMessageApi(roomId, newMessage);
      sendMessage(messageData);
      setMessages((prev) => [...prev, messageData]);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/chat/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen bg-base-200">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${showSidePanel ? 'lg:w-3/4' : 'w-full'}`}>
        {/* Room Info Bar */}
        <div className="bg-base-100 p-4 flex items-center justify-between border-b border-base-300">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Chat Room {roomId}</h2>
            <div className="flex items-center gap-2">
              <Users className="size-5" />
              <span>{messages.length} messages</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyInviteLink}
              className="btn btn-ghost btn-sm gap-2"
            >
              <Share2 className="size-4" />
              {copied ? 'Copied!' : 'Share'}
            </button>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="btn btn-ghost btn-circle"
            >
              <Users className="size-5" />
            </button>
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="btn btn-ghost btn-circle"
            >
              <Settings className="size-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Panel with Tabs */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-100 p-2">
            <button
              className={`tab ${activeTab === 'current' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Current Chat
            </button>
            <button
              className={`tab ${activeTab === 'earlier' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('earlier')}
            >
              Earlier Chats
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat ${message.userId === user.id ? 'chat-end' : 'chat-start'}`}
                >
                  <div className="chat-header">
                    {message.userName}
                    <time className="text-xs opacity-50 ml-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </time>
                  </div>
                  <div className="chat-bubble">{message.content}</div>
                </div>
              ))}
              {isTyping && (
                <div className="chat chat-start">
                  <div className="chat-bubble">Typing...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input input-bordered flex-1"
              />
              <button type="submit" className="btn btn-primary">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Side Panel */}
      {showSidePanel && (
        <div className="w-full lg:w-1/4 h-full flex flex-col">
          {/* Participants Panel */}
          {showParticipants && (
            <div className="bg-base-100 border-b border-base-300 p-4">
              <h3 className="font-semibold mb-3">Participants ({messages.length}/10)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img src={message.profilePic} alt={message.userName} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{message.userName}</p>
                      <p className="text-xs opacity-70">{message.isAdmin ? 'Admin' : 'Participant'}</p>
                    </div>
                    {message.isAdmin && (
                      <span className="badge badge-primary badge-sm">Admin</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextChatRoom; 