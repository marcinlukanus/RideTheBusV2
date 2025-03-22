import { Outlet } from 'react-router';
import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';

export const Layout = () => {
  return (
    <div className='flex flex-col min-h-screen '>
      <Header />
      <main className='max-w-6xl mx-auto p-8 pt-16 text-center flex-grow'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
