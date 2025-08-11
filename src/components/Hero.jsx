import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { Model } from './Model';

const Hero = () => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Autoplay muted video on mount
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(error => {
        // Autoplay was prevented.
        console.error("Autoplay prevented:", error);
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background Video */}
      <div className="absolute top-0 left-0 w-full h-full bg-vscode-dark">
        <video
          ref={videoRef}
          src="/coding-video.mp4"
          loop
          className="w-full h-full object-cover opacity-20"
        />
        {/* Note: The video src is a placeholder as I was unable to find a real video URL. */}
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-vscode-dark via-vscode-dark/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6 text-center md:text-left"
        >
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            The Future of Coding is Here
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            AI-powered development environment that understands your code. Write better code faster with intelligent AI assistance.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-vscode-blue text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors duration-300 shadow-lg"
          >
            Get Early Access
          </motion.button>
        </motion.div>

        {/* Right Side: 3D Model Canvas */}
        <div className="hidden md:flex items-center justify-center h-full">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[3, 5, 2]} intensity={1.5} />
            <Suspense fallback={null}>
              <Model />
              <Sparkles
                count={100}
                scale={4}
                size={2}
                speed={0.4}
                color={'#4ec9b0'}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center space-x-4">
        <button onClick={togglePlay} className="p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={toggleMute} className="p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </section>
  );
};