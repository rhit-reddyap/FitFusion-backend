"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { DEV_MODE } from '@/lib/devMode';

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading, signInAsAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
        
        {DEV_MODE && (
          <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <h3 className="text-yellow-400 font-semibold mb-2">Development Mode</h3>
            <p className="text-yellow-200 text-sm mb-4">
              Since Supabase isn't configured, you can use the admin account to test all features:
            </p>
            <button
              onClick={signInAsAdmin}
              className="w-full bg-yellow-500 text-black py-2 px-4 rounded-lg font-medium hover:bg-yellow-400 transition"
            >
              Sign In as Admin
            </button>
            <p className="text-yellow-200 text-xs mt-2">
              Admin has access to all premium features including cookbook, analytics, and AI plans.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
