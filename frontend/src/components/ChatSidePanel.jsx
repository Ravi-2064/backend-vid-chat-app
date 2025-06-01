import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const ChatSidePanel = ({ messages = [], onSendMessage, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-100 border-l border-base-300">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.senderId === currentUser?._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUser?._id
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200'
              }`}
            >
              {message.senderId !== currentUser?._id && (
                <div className="text-xs opacity-70 mb-1">{message.senderName}</div>
              )}
              <div className="break-words">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-base-300 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost btn-circle"
          >
            <Paperclip className="size-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button type="button" className="btn btn-ghost btn-circle">
            <Smile className="size-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input input-bordered flex-1"
          />
          <button
            type="submit"
            className="btn btn-primary btn-circle"
            disabled={!newMessage.trim()}
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSidePanel; 