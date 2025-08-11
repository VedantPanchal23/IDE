import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, Search, Users, Bug, Code, FlaskConical, PlayCircle } from 'lucide-react';
import Dialog from './ui/dialog';

const features = [
  {
    icon: Wand2,
    title: 'Smart Code Completion',
    description: 'Intelligent autocomplete suggestions that understand the context of your code.',
    videoUrl: '/feature-1.mp4',
  },
  {
    icon: Search,
    title: 'AI-Powered Search',
    description: 'Use natural language to search your entire codebase and find relevant code instantly.',
    videoUrl: '/feature-2.mp4',
  },
  {
    icon: Users,
    title: 'Collaborative Coding',
    description: 'Work with your team in real-time with AI-assisted pair programming features.',
    videoUrl: '/feature-3.mp4',
  },
  {
    icon: Bug,
    title: 'Intelligent Debugging',
    description: 'Let AI detect, diagnose, and even fix bugs in your code automatically.',
    videoUrl: '/feature-4.mp4',
  },
  {
    icon: Code,
    title: 'Code Generation',
    description: 'Generate boilerplate code, functions, and even entire components from a simple prompt.',
    videoUrl: '/feature-5.mp4',
  },
  {
    icon: FlaskConical,
    title: 'Performance Analysis',
    description: 'Get automated suggestions to optimize your code for better performance and efficiency.',
    videoUrl: '/feature-6.mp4',
  },
];

const Features = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');

  const openModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo('');
  };

  return (
    <section id="features" className="py-20 bg-vscode-dark text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">AI Capabilities Unleashed</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover how CodeAI enhances every aspect of your development workflow, making coding faster, smarter, and more collaborative.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-vscode-secondary rounded-lg p-8 border border-vscode-border cursor-pointer overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => openModal(feature.videoUrl)}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <motion.div whileHover={{ scale: 1.2, rotate: 15 }}>
                    <feature.icon className="w-12 h-12 text-vscode-blue" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-semibold text-center mb-4">{feature.title}</h3>
                <p className="text-gray-400 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-vscode-blue/10 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 flex items-center justify-center z-20">
                <PlayCircle className="w-20 h-20 text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog isOpen={isModalOpen} onClose={closeModal}>
        {selectedVideo && (
          <video src={selectedVideo} controls autoPlay className="w-full h-full rounded-md">
            Your browser does not support the video tag.
            {/* Note: The video src is a placeholder. */}
          </video>
        )}
      </Dialog>
    </section>
  );
};

export default Features;