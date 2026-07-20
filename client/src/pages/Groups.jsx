import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGroups } from '../context/GroupContext';
function Groups(){
  const {token}= useAuth();
  const {groups,activeGroupId,setActiveGroupId,refreshGroups,loading}= useGroups();
  const [groupName, setGroupName] =useState('');
  const [inviteCode, setInviteCode] =useState('');
  const [error, setError] =useState('');
  const navigate = useNavigate();
  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try{
      const res=await fetch('/api/groups', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`,
        },
        body:JSON.stringify({name: groupName}),
      });
      const data =await res.json();
      if (!res.ok){
        setError(data.message || 'Failed to create group');
        return;
      }
      setGroupName('');
      await refreshGroups();
    } catch (err){
      setError('Could not reach server');
    }
  }
  async function handleJoin(e) {
    e.preventDefault();
    setError('');
    try{
      const res= await fetch('/api/groups/join', {
        method: 'POST',
        headers:{
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`,
        },
        body:JSON.stringify({inviteCode}),
      });
      const data =await res.json();
      if (!res.ok){
        setError(data.message || 'Failed to join group');
        return;
      }
      setInviteCode('');
      await refreshGroups();
    }catch (err){
      setError('Could not reach server');
    }
  }
  function selectGroup(id) {
    setActiveGroupId(id);
    navigate('/map');
  }
  if (loading) {
    return <p>Loading your groups...</p>;
  }
  return (
    <div>
      <h2>Your Groups</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {groups.length === 0 && <p>You're not in any groups yet.</p>}
      <ul>
        {groups.map((group) => (
          <li key={group._id}>
            {group.name} — invite code: <code>{group.inviteCode}</code>
            <button onClick={() => selectGroup(group._id)}>
              {activeGroupId === group._id ? 'Currently viewing' : 'View this group'}
            </button>
          </li>
        ))}
      </ul>
      <h3>Create a new group</h3>
      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>
      <h3>Join a group</h3>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}
export default Groups;