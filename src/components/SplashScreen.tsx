"use client";

import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Start the animation sequence
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setLogoVisible(true), 500);
    const timer3 = setTimeout(() => setTextVisible(true), 1000);
    const timer4 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Logo Container */}
      <div className={`relative mb-8 transition-all duration-1000 ${logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Human Figure */}
        <div className="relative">
          {/* Head */}
          <div className="w-16 h-16 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full absolute -top-2 left-1/2 transform -translate-x-1/2"></div>
          
          {/* Torso */}
          <div className="w-20 h-32 bg-gradient-to-b from-orange-500 via-pink-500 to-purple-600 rounded-t-full absolute top-12 left-1/2 transform -translate-x-1/2"></div>
          
          {/* Left Flame Element */}
          <div className="absolute left-0 top-20 w-8 h-16 bg-gradient-to-t from-lime-400 via-blue-400 to-purple-600 rounded-full transform -rotate-12 opacity-80"></div>
          
          {/* Right C-shaped Element */}
          <div className="absolute right-0 top-8 w-12 h-20 bg-gradient-to-b from-yellow-400 via-red-500 to-teal-600 rounded-full transform rotate-12 opacity-80"></div>
        </div>
      </div>

      {/* App Name */}
      <div className={`transition-all duration-1000 delay-500 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-6xl font-bold text-white mb-2 tracking-wide">
          Fit Fusion AI
        </h1>
        <p className="text-xl text-gray-300 text-center">
          AI-Powered Fitness & Nutrition
        </p>
      </div>

      {/* Loading Animation */}
      <div className={`mt-12 transition-opacity duration-1000 delay-1000 ${textVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default SplashScreen;

