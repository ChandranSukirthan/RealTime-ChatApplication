import { useEffect, useState } from 'react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { Button } from '@heroui/react';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen">
       <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold">MY APP</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button onPress={toggleTheme} variant="flat" color="primary">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Button>
          <Show when="signed-out">
            <SignInButton mode="modal"/>
            <SignUpButton mode="modal"/>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </header>
    </div>
  );
}

export default App;

