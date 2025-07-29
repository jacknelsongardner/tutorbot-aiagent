import logo from './logo.svg';
import './App.css';
import Login from './login/Login.js';
import Classes from './classes/Classes.js';
import Whiteboard from './whiteboard/Whiteboard.js';
import Survey from './survey/Survey.js';


import React, { useContext, useState, createContext } from 'react';

const PageContext = createContext();
const RoleContext = createContext();
const UserContext = createContext();


function AppContent() {
  const { page, setPage } = useContext(PageContext);

  return (
    <div className="App">
      <header className="App-header">
        
        {page === 'login' && <Login/>}
        {page === 'whiteboard' && <Whiteboard/>}
        {page === 'survey' && <Survey/>}
        {page === 'classes' && <Classes/>}
        
      </header>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('login');

  return (
    <PageContext.Provider value={{ page, setPage }}>
      <RoleContext.Provider value={{ role, setRole }}>
        <UserContext.Provider value={{ user, setUser }}>
          <AppContent />
        </UserContext.Provider>
      </RoleContext.Provider>
    </PageContext.Provider>
  );
}

export default App;
