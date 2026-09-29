// src/components/Navbar.jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="flex justify-between items-center h-[12vh] px-3 md:px-6 bg-background text-primary shadow-sm border-b border-primary/10 sticky top-0 z-50">
      <Link to="/" className="flex gap-3 items-center group">
        <img src="/worklane.svg" alt="Worklane Logo" className="h-10 w-10 object-contain" />
        <span className="text-xl font-black tracking-tight text-primary">
          WORK<span className="text-accent">LANE</span>
        </span>
      </Link>
      <div>
        <Link 
          to="/login" 
          className="bg-accent text-background text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:opacity-95 transition-all duration-200 cursor-pointer inline-block"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;