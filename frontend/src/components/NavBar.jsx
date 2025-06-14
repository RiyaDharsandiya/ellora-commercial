import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import logo from "../assets/logo.png"

function Navbar() {
  const { user, loading, signOut } = useUserAuth();
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await signOut(); 
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // While loading, show nothing or a spinner
  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-gray-800 via-gray-700 to-black shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
          <div className="text-white font-bold text-xl tracking-wide">Ellora Commercial</div>
          <div className="text-white">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-700 to-black shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo or App Name */}
          <img 
          src={logo}
          alt="Ellora Commercial Logo"
          className="h-8 w-auto rounded-2xl mr-2" // Added margin-right
        />
          <Link to="/">
            <div className="flex-shrink-0 text-white font-bold text-xl tracking-wide">
              Ellora Commercial
            </div>
          </Link>
          {/* Navigation Links */}
          <div className="flex space-x-6 items-center">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-white hover:bg-white/20 px-3 py-2 rounded transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-white hover:bg-white/20 px-3 py-2 rounded transition"
                >
                  SignUp
                </Link>
              </>
            ) : (
              <>
                {/* Optional: Show user name or avatar */}
                {user.name && (
                  <span className="text-white font-semibold mr-2">
                    Hi, {user.name.split(' ')[0]}
                  </span>
                )}
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full mr-2 border border-white"
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition font-semibold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
