import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
const GroupContext = createContext(null);
export function GroupProvider({ children }) {
  const { token } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupIdState] = useState(() =>
    localStorage.getItem('activeGroupId')
  );
  const [loading, setLoading] = useState(true);
  async function refreshGroups() {
    if (!token) return;
    setLoading(true);
    try {
      const res =await fetch('/api/groups/mine', {
        headers:{Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      setGroups(data);
    } catch (err){
      console.error('Failed to load groups:', err);
    } finally{
      setLoading(false);
    }
  }
  useEffect(()=>{
    if (token){
      refreshGroups();
    } else{
      setGroups([]);
      setLoading(false);
    }
  },[token]);
  function setActiveGroupId(id){
    setActiveGroupIdState(id);
    localStorage.setItem('activeGroupId', id);
  }
  return(
    <GroupContext.Provider
      value={{groups,activeGroupId,setActiveGroupId, refreshGroups, loading }}
    >
      {children}
    </GroupContext.Provider>
  );
}
export function useGroups() {
  return useContext(GroupContext);
}