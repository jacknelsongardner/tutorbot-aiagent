import React, { useState, createContext, useContext } from 'react';
import './App.css';
import logo from './logo.svg';

import Login from './login/Login.js';
// import Classes from './classes/Classes.js';
// import Whiteboard from './whiteboard/Whiteboard.js';
import Survey from './survey/Survey.js';

export const PageContext = createContext();
export const RoleContext = createContext();
export const UserContext = createContext();

function PageRouter() {
  const { page } = useContext(PageContext);

  return (
    <>
      {page === 'login' && <Login />}
       {page === 'survey' && <Survey />}
      {/* {page === 'survey' && <Survey />} */}
      {/* {page === 'classes' && <Classes />} */}
    </>
  );
}

function App() {
  const [page, setPage] = useState('login');
  const [role, setRole] = useState('');
  const [user, setUser] = useState('');

  return (
    <PageContext.Provider value={{ page, setPage }}>
      <RoleContext.Provider value={{ role, setRole }}>
        <UserContext.Provider value={{ user, setUser }}>
          <div className="App">
            <header className="App-header">
              <PageRouter />
            </header>
          </div>
        </UserContext.Provider>
      </RoleContext.Provider>
    </PageContext.Provider>
  );
}

export default App;
