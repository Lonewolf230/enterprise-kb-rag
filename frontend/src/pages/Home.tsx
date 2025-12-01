import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Home.css';
import { LogOut, User } from 'lucide-react';

interface Group {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const groups: Group[] = [
    { id: 1, name: 'Team Alpha', lastMessage: 'Great work on the project!', time: '10:30 AM', unread: 2 },
    { id: 2, name: 'Design Squad', lastMessage: 'Updated mockups are ready', time: '9:15 AM', unread: 0 },
    { id: 3, name: 'Dev Team', lastMessage: 'Merge conflict resolved', time: 'Yesterday', unread: 5 },
    { id: 4, name: 'Marketing', lastMessage: 'Campaign launching next week', time: 'Yesterday', unread: 0 },
    { id: 5, name: 'Product Updates', lastMessage: 'New features deployed', time: 'Tuesday', unread: 1 },
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupClick = (groupId: number) => {
    navigate(`./chat/${groupId}`);
  };

  return (
    <div className="app-container">
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
          <Outlet context={{ groups }} />
        </main>
      </div>
    </div>
  );
};

export default Home;

// import React, { useState, useEffect } from 'react';
// import { Outlet, useNavigate, useParams } from 'react-router-dom';
// import './Home.css';
// import { LogOut, User } from 'lucide-react';

// interface Group {
//   id: number;
//   name: string;
//   lastMessage: string;
//   time: string;
//   unread: number;
// }

// const Home: React.FC = () => {
//   const navigate = useNavigate();
//   const { groupId } = useParams<{ groupId: string }>();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [groups, setGroups] = useState<Group[]>([
//     { id: 1, name: 'Team Alpha', lastMessage: 'Great work on the project!', time: '10:30 AM', unread: 2 },
//     { id: 2, name: 'Design Squad', lastMessage: 'Updated mockups are ready', time: '9:15 AM', unread: 0 },
//     { id: 3, name: 'Dev Team', lastMessage: 'Merge conflict resolved', time: 'Yesterday', unread: 5 },
//     { id: 4, name: 'Marketing', lastMessage: 'Campaign launching next week', time: 'Yesterday', unread: 0 },
//     { id: 5, name: 'Product Updates', lastMessage: 'New features deployed', time: 'Tuesday', unread: 1 },
//   ]);

//   const filteredGroups = groups.filter(group =>
//     group.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );


//   const handleGroupClick = (group: Group) => {
//     navigate(`/chat/${group.id}`);
//   };

//   // TODO: Replace this with actual API call to search/fetch groups
//   const handleSearchGroups = async (query: string) => {
//     setSearchQuery(query);
//     // Example: 
//     // const results = await fetch(`/api/groups/search?q=${query}`);
//     // setGroups(await results.json());
//   };

//   return (
//     <div className="app-container">
//       <nav className="navbar">
//         <div className="navbar-left">
//           <span className="user-name">John Doe</span>
//         </div>
//         <div className="navbar-right">
//           <button className="icon-btn" title="Profile">
//             <User size={20} />
//           </button>
//           <button className="icon-btn logout-btn" title="Logout">
//             <LogOut size={20} />
//           </button>
//         </div>
//       </nav>

//       <div className="main-content">
//         <aside className="sidebar">
//           <div className="search-container">
//             <input
//               type="text"
//               placeholder="Search groups..."
//               value={searchQuery}
//               onChange={(e) => handleSearchGroups(e.target.value)}
//               className="search-input"
//             />
//           </div>
//           <div className="groups-list">
//             {filteredGroups.map(group => (
//               <div
//                 key={group.id}
//                 className={`group-item ${groupId === String(group.id) ? 'active' : ''}`}
//                 onClick={() => handleGroupClick(group)}
//               >
//                 <div className="group-info">
//                   <h3 className="group-name">{group.name}</h3>
//                   <p className="group-last-message">{group.lastMessage}</p>
//                 </div>
//                 <div className="group-meta">
//                   <span className="group-time">{group.time}</span>
//                   {group.unread > 0 && (
//                     <span className="unread-badge">{group.unread}</span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </aside>

//         <main className="chat-area">
//           <Outlet context={{ groups }} />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Home;