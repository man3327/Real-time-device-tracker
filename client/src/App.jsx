import {useState,useEffect} from 'react';
function App(){
  const [status, setStatus] = useState('checking...');
  useEffect(() =>{
    fetch('/api/ping')
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Could not reach server'));
  }, []);
  return (
      <div>
        <h1>Device Tracker</h1>
        <p>Backend status: {status}</p>
      </div>
    );
}
export default App;