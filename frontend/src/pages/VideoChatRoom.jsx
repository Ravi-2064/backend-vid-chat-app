import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users } from 'lucide-react';

const VideoChatRoom = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const videoRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    // Initialize video stream
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error('Error accessing media devices:', err));
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement actual mute functionality
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // TODO: Implement actual video toggle functionality
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'You', time: new Date().toLocaleTimeString() }]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:bg-opacity-80 transition-all`}
              >
                {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} hover:bg-opacity-80 transition-all`}
              >
                {isVideoOff ? <VideoOff className="text-white" /> : <Video className="text-white" />}
              </button>
              
              <button
                className="p-3 rounded-full bg-red-500 hover:bg-opacity-80 transition-all"
              >
                <PhoneOff className="text-white" />
              </button>
              
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-3 rounded-full ${isChatOpen ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-opacity-80 transition-all`}
              >
                <MessageSquare className="text-white" />
              </button>
              
              <button
                onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
                className={`p-3 rounded-full ${isParticipantsOpen ? 'bg-blue-500' : 'bg-gray-700'} hover:bg-opacity-80 transition-all`}
              >
                <Users className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="w-80 bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold">Chat</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatRef}>
            {messages.map((message, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-medium">{message.sender}</span>
                  <span className="text-gray-400 text-sm">{message.time}</span>
                </div>
                <p className="text-gray-200">{message.text}</p>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Participants Sidebar */}
      {isParticipantsOpen && (
        <div className="w-80 bg-gray-800">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white font-semibold">Participants</h2>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Sample participants - replace with actual data */}
            {['John Doe', 'Jane Smith', 'Mike Johnson'].map((name, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <span className="text-white font-medium">{name[0]}</span>
                </div>
                <span className="text-white">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChatRoom; 