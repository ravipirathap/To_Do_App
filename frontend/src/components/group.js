import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./group.css"  

import io from "socket.io-client";
const socket = io("http://localhost:5000");
const Group = () => {
  const [newGroupName, setNewGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedGroup, setSelectedGroup] = useState({});
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [memberId,setMemberId]= useState("")

  
  const [isAdmin, setIsAdmin] = useState(false);
 
  useEffect(() => {
    fetchGroups();
    fetchUsers();
    const userRole = localStorage.getItem("role");
    setIsAdmin(userRole === "admin");
  }, []);
  const handleCreateGroup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/groups',{name: newGroupName}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        
      });
      setNewGroupName('');
      fetchGroups();
      // You might also want to automatically select the newly created group here.
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };
  const fetchGroups = async () => {
    try {
      const response = await axios.get('http://localhost:5000/groups',{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMemberId(response.data.userId)
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

      setUsers(response.data.users);
    
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleGroupSelect = async (groupId) => {
    try {
      const groupResponse = await axios.get(`http://localhost:5000/groups/${groupId}`);
      const messagesResponse = await axios.get(`http://localhost:5000/groups/${groupId}/messages`); // Add this endpoint to fetch messages
      setSelectedGroupId(groupId);
      setSelectedGroup(groupResponse.data);
      setSelectedGroupMembers(groupResponse.data.members);
      setGroupMessages(messagesResponse.data.messages); // Set group messages here
    } catch (error) {
      console.error('Error fetching group or messages:', error);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await axios.put(`http://localhost:5000/groups/${selectedGroupId}/addMember`, {
        userId,
      },{  
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }}
        );
      handleGroupSelect(selectedGroupId);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };
  
  const handleSendMessage = async () => {
    
    try {
      await axios.post(`http://localhost:5000/groups/${selectedGroupId}/sendMessage`, {text:newMessage}, {  
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }}
     
    );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
//   useEffect(() => {
//   socket.on("groupMessage", (data) => {
//     setGroupMessages((prevMessages) => [
//       ...prevMessages,
//       data,
//     ]);
  
//   });
//   return () => {
//     socket.disconnect();
//   };
// },[]);

  return (
    <div className='group'>
       {isAdmin &&(
        <div>
        <h3 className='create'>Create New Group:</h3>
        <input 
        className='input'
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Enter group name"
        />
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>
        )}
<ul>
  {groups.map((group) => (
    <li key={group._id} className='groupli'>
      {isAdmin || group.members.some(member => member._id === memberId) ? (
        <button className='groupselect'  onClick={() => handleGroupSelect(group._id)}>{group.name}</button>
      ) : null}
    </li>
  ))}
</ul>

      
      <div>
        <h2>{selectedGroup.name}</h2>
        <h3>Members:</h3>
        <ul className='ul'>
          {selectedGroupMembers.map((member) => (
            <li key={member._id}>{member.full_name}</li>  
          ))}
        </ul>
        {isAdmin && selectedGroup._id && (
      <div>
        <h3>Add Member:</h3>
        <select className='select' onChange={(e) => handleAddMember(e.target.value)}>
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
    )}
      </div>
      <div>
          <h3>Group Chat:</h3>
          <div className="chat-box">
            {groupMessages.map((message, index) => (
              <div key={index} className="chat-message">
                <strong>{message.sender.full_name}</strong>: {message.text}
              </div>
            ))}
          </div>
          <input
          className='messageinput'
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button className='messagesend'  onClick={handleSendMessage}>Send</button>
        </div>

    </div>
  );
};

export default Group;
