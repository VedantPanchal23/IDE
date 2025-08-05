import { useEffect, useState } from 'react';
import feature7 from "../assets/7.jpg";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center overflow-hidden transition-colors">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-96 h-96 bg-blue-500/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${20 + mousePosition.x * 0.02}%`,
            top: `${30 + mousePosition.y * 0.02}%`,
            transform: 'translate3d(0, 0, 0)',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-72 h-72 bg-purple-500/10 dark:bg-purple-400/5 rounded-full blur-2xl"
          style={{
            right: `${15 + mousePosition.x * 0.03}%`,
            top: `${20 + mousePosition.y * 0.03}%`,
            transform: 'translate3d(0, 0, 0)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-cyan-500/10 dark:bg-cyan-400/5 rounded-full blur-2xl"
          style={{
            left: `${60 + mousePosition.x * 0.025}%`,
            bottom: `${25 + mousePosition.y * 0.025}%`,
            transform: 'translate3d(0, 0, 0)',
            animation: 'float 7s ease-in-out infinite'
          }}
        />
      </div>

      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${feature7})`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
      
      <div className="relative w-full mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`text-left space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              The AI-Powered
              <span className="text-blue-300 block animate-pulse">IDE of Tomorrow</span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-lg">
              Code faster with intelligent autocomplete, instant debugging, and AI pair programming. 
              Transform your development workflow with cutting-edge artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/editor"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 hover:shadow-lg text-center"
              >
                Start Coding Now
              </a>
              <button className="bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all duration-300 cursor-pointer whitespace-nowrap backdrop-blur-sm border border-white/20 transform hover:scale-105">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center space-x-8 text-blue-100">
              <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
                {/* <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>50K+ Developers</span> */}
              </div>
              <div className="flex items-center space-x-2 transform hover:scale-110 transition-transform duration-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>1M+ Lines of Code</span>
              </div>
            </div>
          </div>
          
          <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div 
              className="bg-gray-900 rounded-lg p-6 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
              style={{
                transform: `perspective(1000px) rotateY(${(mousePosition.x - 50) * 0.1}deg) rotateX(${(mousePosition.y - 50) * 0.05}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                <span className="text-gray-400 text-sm ml-4">main.jsx</span>
              </div>
              <div className="text-sm font-mono space-y-2">
                <div className="text-blue-400 transform transition-all duration-300 hover:translate-x-2">import <span className="text-yellow-300">{'{'} useState {'}'}</span> from <span className="text-green-400">'react'</span>;</div>
                <div className="text-gray-400 opacity-0 animate-fade-in animation-delay-500">// AI suggests: Add error handling</div>
                <div className="text-purple-400 transform transition-all duration-300 hover:translate-x-2">function <span className="text-blue-300">App</span>() {'{'}</div>
                <div className="text-gray-300 ml-4 transform transition-all duration-300 hover:translate-x-2">const [count, setCount] = <span className="text-blue-400">useState</span>(<span className="text-orange-400">0</span>);</div>
                <div className="text-gray-300 ml-4 transform transition-all duration-300 hover:translate-x-2">return (</div>
                <div className="text-gray-300 ml-8 transform transition-all duration-300 hover:translate-x-2">{'<'}div className=<span className="text-green-400">"app"</span>{'>'}</div>
                <div className="text-gray-300 ml-12 transform transition-all duration-300 hover:translate-x-2">{'<'}h1{'>'}Count: {'{'}count{'}'}{' <'}/h1{'>'}</div>
                <div className="text-gray-300 ml-12 transform transition-all duration-300 hover:translate-x-2">{'<button onClick={() => setCount(c => c + 1)}>'}</div>
                <div className="text-gray-300 ml-16 transform transition-all duration-300 hover:translate-x-2">Increment</div>
                <div className="text-gray-300 ml-12 transform transition-all duration-300 hover:translate-x-2">{'<'}/button{'>'}</div>
                <div className="text-gray-300 ml-8 transform transition-all duration-300 hover:translate-x-2">{'<'}/div{'>'}</div>
                <div className="text-gray-300 ml-4 transform transition-all duration-300 hover:translate-x-2">);</div>
                <div className="text-purple-400 transform transition-all duration-300 hover:translate-x-2">{'}'}</div>
              </div>
            </div>
            
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500/20 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-purple-500/20 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-1/2 -right-8 w-4 h-4 bg-cyan-500/20 rounded-full animate-bounce delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
}