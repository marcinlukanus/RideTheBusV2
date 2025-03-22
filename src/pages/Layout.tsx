import { Outlet } from 'react-router';
import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';

export const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto max-w-6xl flex-grow p-8 pt-16 text-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
