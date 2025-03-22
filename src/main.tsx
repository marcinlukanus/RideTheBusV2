import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PartyBus } from './pages/PartyBus.tsx';
import { Stats } from './pages/Stats.tsx';
import { Layout } from './pages/Layout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* The Layout route will wrap all the nested routes */}
        <Route element={<Layout />}>
          <Route index element={<App />} />
          <Route path='/party-bus' element={<PartyBus />} />
          <Route path='/party-bus/:roomCode' element={<PartyBus />} />
          <Route path='/stats' element={<Stats />} />
          <Route path='/login' element={<Login />} />
          <Route path='/sign-up' element={<SignUp />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
