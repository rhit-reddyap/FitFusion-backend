import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Apple, 
  ChefHat, 
  Dumbbell, 
  BarChart3, 
  User,
  Users
} from 'lucide-react';

interface SidebarProps {
  activePage?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage = 'dashboard', isOpen = true, onToggle }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'ai-plans', label: 'AI Plans', icon: Target, href: '/ai' },
    { id: 'food-tracker', label: 'Food Tracker', icon: Apple, href: '/food' },
    { id: 'cookbook', label: 'Cookbook', icon: ChefHat, href: '/cookbook' },
    { id: 'workout-tracker', label: 'Workout Tracker', icon: Dumbbell, href: '/workouts' },
    { id: 'communities', label: 'Communities', icon: Users, href: '/communities' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`sidebar transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center -ml-2">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Fit Fusion AI</h1>
              <p className="text-sm text-gray-400">AI-Powered Health</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <a
                key={item.id}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto">
          <div className="text-gray-400 text-sm mb-2">Your Journey</div>
          <div className="text-gray-500 text-xs">Track, Plan, Succeed</div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;