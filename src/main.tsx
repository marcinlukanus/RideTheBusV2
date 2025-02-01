import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter, Route, Routes } from 'react-router';
import { PartyBus } from './pages/PartyBus.tsx';
import { Stats } from './pages/Stats.tsx';
import { Layout } from './pages/Layout';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      {/* The Layout route will wrap all the nested routes */}
      <Route element={<Layout />}>
        <Route index element={<App />} />
        <Route path='/party-bus' element={<PartyBus />} />
        <Route path='/stats' element={<Stats />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
