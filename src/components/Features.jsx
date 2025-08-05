import { useState, useEffect } from 'react';
import feature1 from "../assets/1.jpg";
import feature2 from "../assets/2.jpg";
import feature3 from "../assets/3.jpg";
import feature4 from "../assets/4.jpg";
import feature5 from "../assets/5.jpg";
import feature6 from "../assets/6.jpg";

export default function Features() {
  const [visibleCards, setVisibleCards] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCards([0, 1, 2, 3, 4, 5]);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: "AI Code Completion",
      description: "Intelligent autocomplete that understands your context and suggests the most relevant code snippets.",
      image: feature1
    },
    {
      title: "Instant Debugging",
      description: "AI-powered debugging that identifies and fixes issues in real-time, making development faster.",
      image: feature2
    },
    {
      title: "Pair Programming",
      description: "Collaborate with AI as your coding partner, getting suggestions and improvements as you code.",
      image: feature3
    },
    {
      title: "Multi-Language Support",
      description: "Work with any programming language with intelligent syntax highlighting and smart suggestions.",
      image: feature4
    },
    {
      title: "Cloud Collaboration",
      description: "Share your projects instantly and collaborate with team members in real-time from anywhere.",
      image: feature5
    },
    {
      title: "Performance Analytics",
      description: "Track your coding performance with detailed analytics and insights to improve your workflow.",
      image: feature6
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transform transition-all duration-700 hover:scale-105">
            Powerful Features for Modern Developers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to build amazing applications with the power of artificial intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer ${
                visibleCards.includes(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
                transformStyle: 'preserve-3d'
              }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.05)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
              }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-48 object-cover object-top group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}