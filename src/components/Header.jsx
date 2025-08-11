import { Link, useNavigate } from 'react-router-dom';
import ThemeSelector from './ThemeSelector';

export default function Header() {
  const navigate = useNavigate();

  const handleSignIn = () => navigate('/login');
  const handleGetStarted = () => navigate('/signup');

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-gray-900 dark:text-white font-pacifico">
              logo
            </Link>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#docs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Docs
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSelector />
            <button onClick={handleSignIn} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap">
              Sign In
            </button>
            <button onClick={handleGetStarted} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}