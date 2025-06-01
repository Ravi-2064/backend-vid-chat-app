import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, MessageSquare, Send, PhoneOff } from 'lucide-react';

const VideoChatRoom = () => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const videoRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    let stream = null;
    // Request camera and microphone access
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(mediaStream => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Error accessing media devices:', err);
      });

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (videoRef.current?.srcObject) {
      const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (videoRef.current?.srcObject) {
      const audioTrack = videoRef.current.srcObject.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { text: newMessage, sender: 'me', timestamp: new Date() }]);
      setNewMessage('');
      // Scroll to bottom of chat
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Main video area */}
      <div className="flex-1 relative bg-base-300">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-base-300 to-transparent">
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleAudio}
              className={`btn btn-circle ${isAudioEnabled ? 'btn-primary' : 'btn-error'}`}
            >
              {isAudioEnabled ? <Mic /> : <MicOff />}
            </button>
            <button
              onClick={toggleVideo}
              className={`btn btn-circle ${isVideoEnabled ? 'btn-primary' : 'btn-error'}`}
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`btn btn-circle ${showChat ? 'btn-primary' : 'btn-ghost'}`}
            >
              <MessageSquare />
            </button>
            <button className="btn btn-circle btn-error">
              <PhoneOff />
            </button>
          </div>
        </div>
      </div>

      {/* Chat sidebar */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-base-100 border-l border-base-300 flex flex-col">
          <div className="p-4 border-b border-base-300">
            <h3 className="font-semibold">Chat</h3>
          </div>
          
          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat ${message.sender === 'me' ? 'chat-end' : 'chat-start'}`}
              >
                <div className="chat-bubble">
                  {message.text}
                  <div className="text-xs opacity-50">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VideoChatRoom; 