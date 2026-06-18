import { Button } from '@heroui/react';
import { ThemeContext } from './context/theme';
import { ThemeProvider } from './context/ThemeContext';
import { WallpaperProvider } from './context/WallpaperContext';
import { Route, Routes } from 'react-router';

function App() {
  return(
    <ThemeProvider>
      <WallpaperProvider>
      <Routes>

      <Route path="/" element={<ChatPage/>}/>
      <Route path="/auth" element={<AuthPage/>}/>


      </WallpaperProvider>
      </ThemeProvider>
  );
}

export default App;
