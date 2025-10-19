import React, { useState } from 'react';
import './Home.css';
import {Send,CloudUpload,LogOut,User} from 'lucide-react'
import FileUploadModal from '../components/FileUploadModal';

interface Group {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const Home: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const groups: Group[] = [
    { id: 1, name: 'Team Alpha', lastMessage: 'Great work on the project!', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Design Squad', lastMessage: 'Updated mockups are ready', time: '9:15 AM', unread: 0 },
    { id: 3, name: 'Dev Team', lastMessage: 'Merge conflict resolved', time: 'Yesterday', unread: 5 },
    { id: 4, name: 'Marketing', lastMessage: 'Campaign launching next week', time: 'Yesterday', unread: 0 },
    { id: 5, name: 'Product Updates', lastMessage: 'New features deployed', time: 'Tuesday', unread: 1 },
  ];

  const messages = [
    { id: 1, sender: 'Alice', text: 'Hey everyone!', time: '10:25 AM', isOwn: false },
    { id: 2, sender: 'You', text: 'Hi Alice! How are things?', time: '10:27 AM', isOwn: true },
    { id: 3, sender: 'Bob', text: 'Great work on the project!', time: '10:30 AM', isOwn: false },
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  const handleUploadFiles = () => {
    setIsUploadModalOpen(true);
  }

  const currentGroup = groups.find(g => g.id === selectedGroup);

  return (
    <div className="app-container">
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <nav className="navbar">
        <div className="navbar-left">
          <span className="user-name">John Doe</span>
        </div>
        <div className="navbar-right">
          <button className="icon-btn" title="Profile">
            <User size={20} />
          </button>
          <button className="icon-btn logout-btn" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="main-content">
        <aside className="sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="groups-list">
            {filteredGroups.map(group => (
              <div
                key={group.id}
                className={`group-item ${selectedGroup === group.id ? 'active' : ''}`}
                onClick={() => setSelectedGroup(group.id)}
              >
                <div className="group-info">
                  <h3 className="group-name">{group.name}</h3>
                  <p className="group-last-message">{group.lastMessage}</p>
                </div>
                <div className="group-meta">
                  <span className="group-time">{group.time}</span>
                  {group.unread > 0 && (
                    <span className="unread-badge">{group.unread}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="chat-area">
          {selectedGroup ? (
            <>
              <div className="chat-header">
                <h2>{currentGroup?.name}</h2>
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
                <button onClick={handleUploadFiles} className='upload-btn'>
                  <CloudUpload size={20} />
                </button>
                <button onClick={handleSendMessage} className="send-btn">
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>Select a group to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;