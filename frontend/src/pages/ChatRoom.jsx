import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage as sendMessageApi } from '../lib/api';
import toast from 'react-hot-toast';
import { Video, Mic, Phone, MoreVertical, Users, Settings, Copy, Share2 } from 'lucide-react';
import ChatSidePanel from '../components/ChatSidePanel';

const ChatRoom = () => {
  const { roomId } = useParams();
  const { socket, joinRoom, leaveRoom, sendMessage } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);

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

  useEffect(() => {
    // Initialize video stream
    const initializeStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: isAudioEnabled,
        });
        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeStream();

    return () => {
      // Cleanup stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoEnabled, isAudioEnabled]);

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

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
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
      {/* Main Video Area */}
      <div className={`flex-1 flex flex-col ${showSidePanel ? 'lg:w-3/4' : 'w-full'}`}>
        {/* Video Container */}
        <div className="flex-1 relative bg-base-300">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleVideo}
                className={`btn btn-circle ${
                  isVideoEnabled ? 'btn-primary' : 'btn-error'
                }`}
              >
                <Video className="size-5" />
              </button>
              <button
                onClick={toggleAudio}
                className={`btn btn-circle ${
                  isAudioEnabled ? 'btn-primary' : 'btn-error'
                }`}
              >
                <Mic className="size-5" />
              </button>
              <button className="btn btn-circle btn-error">
                <Phone className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Room Info Bar */}
        <div className="bg-base-100 p-4 flex items-center justify-between border-t border-base-300">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Room {roomId}</h2>
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
              <MoreVertical className="size-5" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <Settings className="size-5" />
            </button>
          </div>
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

          {/* Chat Panel */}
          <div className="flex-1">
            <ChatSidePanel
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUser={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom; 