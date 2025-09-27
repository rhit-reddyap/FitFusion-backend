"use client";

import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  notifications?: number;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, notifications = 0, user }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between md:hidden">
      {/* Left side - Hamburger menu */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Center - App title */}
      <h1 className="text-lg font-bold text-white">Fit Fusion AI</h1>

      {/* Right side - Notifications and user */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">{notifications}</span>
              </div>
            )}
          </button>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.display_name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;