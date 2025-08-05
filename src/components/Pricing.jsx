import { useState } from 'react';

export default function Pricing() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for students and hobby developers",
      features: [
        "Basic AI code completion",
        "Up to 3 projects",
        "Community support",
        "Basic debugging tools"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Best for individual developers and freelancers",
      features: [
        "Advanced AI pair programming",
        "Unlimited projects",
        "Priority support",
        "Advanced debugging & analytics",
        "Cloud collaboration",
        "Multi-language support"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Team",
      price: "$49",
      period: "per month",
      description: "Perfect for development teams and companies",
      features: [
        "Everything in Pro",
        "Team collaboration tools",
        "Advanced analytics dashboard",
        "Custom integrations",
        "Dedicated support",
        "Enterprise security"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transform transition-all duration-700 hover:scale-105">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your development needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 border transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl cursor-pointer ${
                plan.popular 
                  ? 'border-blue-500 dark:border-blue-400 scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: hoveredCard === index 
                  ? 'perspective(1000px) rotateY(5deg) translateY(-16px) scale(1.05)' 
                  : 'perspective(1000px) rotateY(0deg) translateY(0px) scale(1)'
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 dark:bg-blue-400 text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white transform transition-all duration-300 hover:scale-110">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex items-center space-x-3 transform transition-all duration-300 hover:translate-x-2"
                    >
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}>
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">All plans include 14-day free trial • No credit card required</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-110">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-110">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center space-x-2 transform transition-all duration-300 hover:scale-110">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}