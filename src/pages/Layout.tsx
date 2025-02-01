import { Outlet } from 'react-router';
import { Footer } from '../components/Footer/Footer';

export const Layout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Optional header */}
      {/* <header>Your header content here</header> */}

      {/* Main content area that grows */}
      <main className='max-w-6xl mx-auto p-8 pt-16 text-center flex-grow'>
        <Outlet />
      </main>

      {/* Footer stays at the bottom */}
      <Footer />
    </div>
  );
};
