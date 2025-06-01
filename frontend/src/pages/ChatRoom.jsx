import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Video, Mic, Phone, MoreVertical, Users, Settings, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, joinRoom, leaveRoom } = useSocket();
  const { user } = useAuth();
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (socket) {
      joinRoom(roomId);

      return () => {
        leaveRoom(roomId);
      };
    }
  }, [socket, roomId, joinRoom, leaveRoom]);

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
        toast.error('Failed to access camera/microphone');
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
    const inviteLink = `${window.location.origin}/video-chat/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-base-200">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
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
              <button 
                onClick={handleEndCall}
                className="btn btn-circle btn-error"
              >
                <Phone className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Room Info Bar */}
        <div className="bg-base-100 p-4 flex items-center justify-between border-t border-base-300">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Video Chat Room {roomId}</h2>
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
            <button className="btn btn-ghost btn-circle">
              <Settings className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="w-80 bg-base-100 border-l border-base-300 p-4">
          <h3 className="font-semibold mb-3">Participants</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full">
                  <img src={user.profilePic} alt={user.fullName} />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{user.fullName}</p>
                <p className="text-xs opacity-70">You</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom; 