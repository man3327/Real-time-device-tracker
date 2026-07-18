import { createContext,useContext,useEffect,useState } from "react";
const AuthContext = createContext(null);
export function AuthProvider({children}){
    const [token,setToken] = useState(()=> localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        if(stored){
            return JSON.parse(stored)
        }else{
            return null;
        }
    });
    useEffect(()=>{
        if(token) localStorage.setItem('token',token);
        else localStorage.removeItem('token');
    },[token]);
    
    useEffect(()=>{
        if(user) localStorage.setItem('user', JSON.stringify(user));
        else localStorage.removeItem('user');
    },[user]);
    function login(newToken , newUser){
        setToken(newToken);
        setUser(newUser);
    }
    function logout(){
        setToken(null);
        setUser(null);
    }
    return (
        <AuthContext.Provider value={{token,user,login,logout}}>
            {children}
        </AuthContext.Provider>
    );
}
export function useAuth(){
    return useContext(AuthContext);
}