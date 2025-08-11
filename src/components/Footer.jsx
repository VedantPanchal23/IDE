import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold font-pacifico">
              logo
            </Link>
            <p className="text-gray-400 dark:text-gray-500 leading-relaxed">
              The AI-powered IDE that transforms how you code. 
              Build better software faster with intelligent assistance.
            </p>
            <div className="flex space-x-4">
              {/* <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <i className="ri-twitter-line text-white"></i>
              </a> */}
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <i className="ri-github-line text-white"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-900 rounded-full flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <i className="ri-discord-line text-white"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Features</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Pricing</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Documentation</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">API Reference</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Changelog</Link></li>
            </ul>
          </div>
          
          {/* <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">About</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Blog</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Careers</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Press</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Contact</Link></li>
            </ul>
          </div> */}
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Help Center</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Community</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Status</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Security</Link></li>
              <li><Link to="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors cursor-pointer">Privacy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 dark:border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-500">
            © 2025 AI IDE. All rights reserved. Built with intelligence and passion.
          </p>
        </div>
      </div>
    </footer>
  );
}