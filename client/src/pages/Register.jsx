import { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
function Register(){
    const [username,setUsername] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error,setError] = useState('');
    const navigate = useNavigate();
    async function handleSubmit(e){
        e.preventDefault();
        setError('');
        try{
            const res = await fetch('/api/auth/register',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: JSON.stringify({username,email,password}),
            });
            const data = await res.json();
            if(!res.ok){
                setError(data.message || 'Registration failed');
                return;
            }
            navigate('/login');
        }catch(err){
            setError('Could not reach server');
        }
    }
    return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
}
export default Register;