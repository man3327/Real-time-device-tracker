import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavBar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav style={{ padding: '8px 16px', background: '#222', color: 'white', display: 'flex', gap: 16, alignItems: 'center' }}>
      <span>Hi, {user.username}</span>
      <Link to="/groups" style={{ color: 'white' }}>My Groups</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default NavBar;