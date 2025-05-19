import { Outlet } from 'react-router-dom';


export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Outlet />
      </main>
     
    </div>
  );
} 