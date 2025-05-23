'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Lock, LogOut, ChevronDown } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

interface UserDropdownProps {
  user: {
    name?: string | null;
    email: string;
  };
  onLogout: () => void;
}

export default function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangePassword = () => {
    setIsOpen(false);
    setIsPasswordModalOpen(true);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsOpen(true)}
          className="flex items-center space-x-2 text-secondary-700 hover:text-secondary-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
        >
          <User className="h-5 w-5" />
          <span>{user.name || user.email}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        <div
          className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 transition-all duration-200 transform origin-top-right ${
            isOpen 
              ? 'opacity-100 scale-100 visible' 
              : 'opacity-0 scale-95 invisible'
          }`}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-secondary-100">
            <p className="text-sm font-medium text-secondary-900">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-secondary-500 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={handleChangePassword}
              className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900 transition-colors duration-200"
            >
              <Lock className="h-4 w-4" />
              <span>Change Password</span>
            </button>

            <hr className="my-2 border-secondary-100" />

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 hover:text-danger-700 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}