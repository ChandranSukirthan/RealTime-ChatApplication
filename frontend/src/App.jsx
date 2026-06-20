import { Button } from '@heroui/react';
import { ThemeContext } from './context/theme';
import { ThemeProvider } from './context/ThemeContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { Route, Routes } from 'react-router';
import ChatPage from "./pages/ChatPage"
import AuthPage from "./pages/AuthPage"
import {useAuth} from "@clerk/react"

function App() {
  const {isSignedIn, isLoaded} = useAuth();

  //todo: make this a better component
  if(!isLoaded) return <p>loading...</p>

  const {isSignedIn, isLoaded} = useAuth();

  return(
    <ThemeProvider>
      <WallpaperProvider>
      <Routes>

      <Route path="/" element={isSignedIn ? <ChatPage/> : <Navigate to={"/auth"} repalce />}/>
      <Route path="/auth" element={!isSignedIn ? <AuthPage/> : <Navigate to={"/auth"} repalce />}/>

      </Routes>
      </WallpaperProvider>
      </ThemeProvider>
  );
}

export default App;
