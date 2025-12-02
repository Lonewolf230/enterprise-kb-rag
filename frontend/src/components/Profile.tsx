import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Calendar, Edit2 } from 'lucide-react';
import './Profile.css';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinedDate: string;
  bio: string;
  profilePicture?: string;
}

const Profile: React.FC<ProfileProps> = ({ isOpen, onClose }) => {
  const [userProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinedDate: 'January 2024',
    bio: 'Software developer passionate about creating seamless chat experiences.',
    profilePicture: '', // Leave empty to show initials
  });

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2 className="profile-title">Profile</h2>
          <button className="profile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="profile-picture-container">
              {userProfile.profilePicture ? (
                <img 
                  src={userProfile.profilePicture} 
                  alt={userProfile.name}
                  className="profile-picture"
                />
              ) : (
                <div className="profile-picture-placeholder">
                  {getInitials(userProfile.name)}
                </div>
              )}
              <button className="edit-picture-btn" title="Change picture">
                <Edit2 size={16} />
              </button>
            </div>
            <h3 className="profile-name">{userProfile.name}</h3>
            <p className="profile-bio">{userProfile.bio}</p>
          </div>

          {/* Profile Information */}
          <div className="profile-info-section">
            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={18} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{userProfile.email}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Phone size={18} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Phone</span>
                <span className="profile-info-value">{userProfile.phone}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <MapPin size={18} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Location</span>
                <span className="profile-info-value">{userProfile.location}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Calendar size={18} />
              </div>
              <div className="profile-info-content">
                <span className="profile-info-label">Joined</span>
                <span className="profile-info-value">{userProfile.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="profile-footer">
          <button className="profile-edit-btn">
            <Edit2 size={16} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};


export default Profile;