import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Home.css';
import CreateChat from '../components/CreateChat';
import Profile from '../components/Profile';
import { LogOut, User,UserPlus } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const groups: Group[] = [
    { id: '1', name: 'Team Alpha', lastMessage: 'Great work on the project!', time: '10:30 AM', unread: 2 },
    { id: '2', name: 'Design Squad', lastMessage: 'Updated mockups are ready', time: '9:15 AM', unread: 0 },
    { id: '3', name: 'Dev Team', lastMessage: 'Merge conflict resolved', time: 'Yesterday', unread: 5 },
    { id: '4', name: 'Marketing', lastMessage: 'Campaign launching next week', time: 'Yesterday', unread: 0 },
    { id: '5', name: 'Product Updates', lastMessage: 'New features deployed', time: 'Tuesday', unread: 1 },
  ];

  const [chats, setChats] = useState<Group[]>(groups);

  const filteredGroups = chats.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupClick = (groupId: string) => {
    navigate(`./chat/${groupId}`);
  };

  const createGroup=()=>{
    console.log("Click on group");
    setIsCreateChatOpen(true);
  }

  const openProfile=()=>{
    console.log("Open profile");
    setIsProfileOpen(true);
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="user-name">John Doe</span>
        </div>
        <div className="navbar-right">
          <button className="icon-btn" title="Profile">
            <User size={20} onClick={openProfile}/>
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
            <UserPlus size={30} className="add-group-icon" fill='white' onClick={createGroup}/> 
          </div>
          <div className="groups-list">
            {filteredGroups.map(group => (
              <div
                key={group.id}
                className={`group-item ${window.location.pathname.includes(`/chat/${group.id}`) ? 'active' : ''}`}
                onClick={() => handleGroupClick(group.id)}
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
          <Outlet context={{ chats }} />
        </main>

        <CreateChat isOpen={isCreateChatOpen} onClose={() => setIsCreateChatOpen(false)} onCreateChat={(chatData) => {
          console.log('Creating chat:', chatData);
          const newChat: Group = {
            id: chatData.id,
            name: chatData.name || 'New Chat',
            lastMessage: 'Hellooo',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: 2
          }
          setChats((prevChats) => [newChat, ...prevChats]);
          setIsCreateChatOpen(false);
          console.log("All groups",chats);
          
        }} />

        <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </div>
    </div>
  );
};

export default Home;

