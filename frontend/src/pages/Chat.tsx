import React, { useEffect, useRef, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Send, CloudUpload, Image,ArrowRight } from 'lucide-react';
import FileUploadModal from '../components/FileUploadModal';
import ImageUploadModal from '../components/ImageUploadModal';
import './Home.css';

interface Group {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface OutletContext {
  groups: Group[];
}

const Chat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups } = useOutletContext<OutletContext>();
  const [messageInput, setMessageInput] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [messages, setMessages] = useState<Array<any>>([
    { id: 1, sender: 'Alice', text: 'Hey everyone!', time: '10:25 AM', isOwn: false },
    { id: 2, sender: 'You', text: 'Hi Alice! How are things?', time: '10:27 AM', isOwn: true },
    { id: 3, sender: 'Bob', text: 'Great work on the project!', time: '10:30 AM', isOwn: false },
  ]);
  const currentGroup = groups.find(group => group.id.toString() === groupId);
  const handleSendMessage = () => {
  };

  const handleUploadFiles = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadImages = () => {
    setIsImageUploadModalOpen(true);
  };

  // if (!currentGroup) {
  //   return (
  //     <div className="no-chat-selected">
  //       <p>Group not found</p>
  //     </div>
  //   );
  // }

  return (
    <>
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
      />

      <div className="chat-header">
        <h2>{currentGroup?.name}</h2>
        <ArrowRight size={15} />
      </div>

      <div className="messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.isOwn ? 'own' : ''}`}>
            {!msg.isOwn && <span className="message-sender">{msg.sender}</span>}
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="message-time">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="message-input"
        />
        <button onClick={handleUploadImages} className='upload-btn' title="Upload Image">
          <Image size={20} />
        </button>
        <button onClick={handleUploadFiles} className='upload-btn'>
          <CloudUpload size={20} />
        </button>
        <button onClick={handleSendMessage} className="send-btn">
          <Send size={20} />
        </button>
      </div>
    </>
  );
};

export default Chat;