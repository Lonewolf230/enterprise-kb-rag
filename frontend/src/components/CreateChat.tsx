import React, { useState, useEffect } from 'react';
import { X, Users, User, Search, Loader2 } from 'lucide-react';
import './CreateChat.css';
import axios from 'axios';

interface CreateChatProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (chatData: { id: string; type: 'group' | 'individual'; name: string; members: string[] }) => void;
}

interface UserData {
  id: string;
  name: string;
  username: string;
}

const CreateChat: React.FC<CreateChatProps> = ({ isOpen, onClose, onCreateChat }) => {
  const [chatType, setChatType] = useState<'group' | 'individual'>('group');
  const [chatName, setChatName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setAvailableUsers([]);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    const debounceTimer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 800); 

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]); // Re-run this effect whenever searchQuery changes

  const searchUsers = async (query: string) => {
    try {
      const response=await axios.get(`${import.meta.env.VITE_BACKEND_SERVER_URL||'http://localhost:8000'}/users/search`,{
        params:{query:query}
      });
      
      if (!response.status.toString().startsWith('2')) {
        throw new Error('Failed to fetch users');
      }

      const data = response.data;
      console.log(data);
      

      setAvailableUsers(data.users || data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError('Failed to search users. Please try again.');
      setIsLoading(false);
      
      // FALLBACK: Mock data for demo/testing purposes
      // Remove this in production
      const mockUsers: UserData[] = [
        { id: '1', name: 'Alice Johnson', username: 'alice@example.com' },
        { id: '2', name: 'Bob Smith', username: 'bob@example.com' },
        { id: '3', name: 'Carol Williams', username: 'carol@example.com' },
        { id: '4', name: 'David Brown', username: 'david@example.com' },
        { id: '5', name: 'Emma Davis', username: 'emma@example.com' },
      ];
      
      const filtered = mockUsers.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      );
      setAvailableUsers(filtered);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleCreate = () => {
    if (chatType === 'group' && !chatName.trim()) {
      alert('Please enter a group name');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }
    const chatId = generateUUID();
    
    onCreateChat({
      id: chatId,
      type: chatType,
      name: chatName,
      members: selectedMembers
    });

    // Reset form
    setChatName('');
    setSelectedMembers([]);
    setSearchQuery('');
    setAvailableUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create New Chat</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Chat Type Toggle */}
          <div className="toggle-container">
            <button
              className={`toggle-btn ${chatType === 'group' ? 'active' : ''}`}
              onClick={() => setChatType('group')}
            >
              <Users size={18} />
              <span>Group Chat</span>
            </button>
            <button
              className={`toggle-btn ${chatType === 'individual' ? 'active' : ''}`}
              onClick={() => setChatType('individual')}
            >
              <User size={18} />
              <span>Individual Chat</span>
            </button>
          </div>

          {/* Group Name Input (only for groups) */}
          {chatType === 'group' && (
            <div className="input-group">
              <label className="input-label">Group Name</label>
              <input
                type="text"
                placeholder="Enter group name..."
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="text-input"
              />
            </div>
          )}

          {/* Member Search */}
          <div className="input-group">
            <label className="input-label">
              {chatType === 'group' ? 'Add Members' : 'Select User'}
            </label>
            <div className="search-input-container">
              {isLoading ? (
                <Loader2 size={16} className="search-icon spinning" />
              ) : (
                <Search size={16} className="search-icon" />
              )}
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            {searchError && (
              <p className="search-error">{searchError}</p>
            )}
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="selected-container">
              <span className="selected-label">Selected ({selectedMembers.length}):</span>
              <div className="selected-list">
                {selectedMembers.map(memberId => {
                  const user = availableUsers.find(u => u.id === memberId);
                  return (
                    <div key={memberId} className="selected-chip">
                      <span>{user?.name || 'Unknown User'}</span>
                      <button
                        className="remove-btn"
                        onClick={() => toggleMember(memberId)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* User List */}
          <div className="user-list">
            {!searchQuery.trim() ? (
              <div className="empty-state">
                <Search size={48} className="empty-icon" />
                <p>Start typing to search for users</p>
              </div>
            ) : isLoading ? (
              <div className="loading-state">
                <Loader2 size={32} className="spinning" />
                <p>Searching users...</p>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="empty-state">
                <p>No users found</p>
              </div>
            ) : (
              availableUsers.map(user => (
                <div
                  key={user.id}
                  className={`user-item ${selectedMembers.includes(user.id) ? 'selected' : ''}`}
                  onClick={() => {
                    if (chatType === 'individual') {
                      setSelectedMembers([user.id]);
                    } else {
                      toggleMember(user.id);
                    }
                  }}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.username}</div>
                  </div>
                  <div className="checkbox">
                    {selectedMembers.includes(user.id) && (
                      <div className="checkmark">✓</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="create-btn" onClick={handleCreate}>
            Create Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChat;