"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  User, 
  Settings, 
  Award, 
  Target, 
  Calendar,
  Edit,
  Save,
  X,
  Crown,
  Star,
  TrendingUp,
  Shield,
  CreditCard,
  LogOut
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import PricingCard from '@/components/PricingCard';

interface UserBadge {
  id: number;
  earned_at: string;
  badge: {
    id: number;
    name: string;
    description: string;
    icon_url?: string;
    category: string;
    xp_reward: number;
  };
}

function ProfileContent() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    height_cm: profile?.height_cm || 0,
    weight_kg: profile?.weight_kg || 0,
    activity_level: profile?.activity_level || 'moderate',
    fitness_goals: profile?.fitness_goals || [],
    preferred_units: profile?.preferred_units || 'metric',
    privacy_settings: profile?.privacy_settings || { share_data: false, public_profile: false }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        height_cm: profile.height_cm || 0,
        weight_kg: profile.weight_kg || 0,
        activity_level: profile.activity_level || 'moderate',
        fitness_goals: profile.fitness_goals || [],
        preferred_units: profile.preferred_units || 'metric',
        privacy_settings: profile.privacy_settings || { share_data: false, public_profile: false }
      });
    }
    fetchBadges();
  }, [profile]);

  const fetchBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile?.display_name || '',
      bio: profile?.bio || '',
      height_cm: profile?.height_cm || 0,
      weight_kg: profile?.weight_kg || 0,
      activity_level: profile?.activity_level || 'moderate',
      fitness_goals: profile?.fitness_goals || [],
      preferred_units: profile?.preferred_units || 'metric',
      privacy_settings: profile?.privacy_settings || { share_data: false, public_profile: false }
    });
    setEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSubscription = async (plan: 'monthly' | 'annual' | 'cookbook') => {
    // This would integrate with your Stripe checkout
    console.log('Starting subscription for:', plan);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar activePage="profile" />
        <div className="main-content flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activePage="profile" />
      
      <div className="main-content">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </div>
          
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="btn flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  ) : (
                    <p className="text-white">{profile?.display_name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <p className="text-gray-400">{profile?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => setFormData(prev => ({ ...prev, height_cm: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  ) : (
                    <p className="text-white">{profile?.height_cm ? `${profile.height_cm} cm` : 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  ) : (
                    <p className="text-white">{profile?.weight_kg ? `${profile.weight_kg} kg` : 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Activity Level
                  </label>
                  {editing ? (
                    <select
                      value={formData.activity_level}
                      onChange={(e) => setFormData(prev => ({ ...prev, activity_level: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="light">Light</option>
                      <option value="moderate">Moderate</option>
                      <option value="active">Active</option>
                      <option value="very_active">Very Active</option>
                    </select>
                  ) : (
                    <p className="text-white capitalize">{profile?.activity_level || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Units
                  </label>
                  {editing ? (
                    <select
                      value={formData.preferred_units}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferred_units: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      <option value="metric">Metric</option>
                      <option value="imperial">Imperial</option>
                    </select>
                  ) : (
                    <p className="text-white capitalize">{profile?.preferred_units || 'metric'}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-white">{profile?.bio || 'No bio yet'}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Your Stats</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {profile?.level || 1}
                  </div>
                  <div className="text-sm text-gray-400">Level</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {profile?.xp_points || 0}
                  </div>
                  <div className="text-sm text-gray-400">XP Points</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {profile?.streak_days || 0}
                  </div>
                  <div className="text-sm text-gray-400">Day Streak</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {badges.length}
                  </div>
                  <div className="text-sm text-gray-400">Badges</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Achievements</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">
                      {badge.badge.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {badge.badge.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {badges.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No badges earned yet</p>
                    <p className="text-sm">Keep working out to earn achievements!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
              
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-white mb-2">
                  {profile?.subscription_tier === 'free' ? 'Free Plan' : 'Pro Plan'}
                </div>
                <div className="text-sm text-gray-400">
                  {profile?.subscription_tier === 'free' 
                    ? 'Upgrade to unlock all features' 
                    : 'You have access to all features'
                  }
                </div>
              </div>

              {profile?.subscription_tier === 'free' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleSubscription('monthly')}
                    className="w-full bg-green-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-500 transition"
                  >
                    Upgrade to Pro
                  </button>
                  <button
                    onClick={() => handleSubscription('cookbook')}
                    className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition"
                  >
                    Buy Cookbook
                  </button>
                </div>
              )}
            </div>

            {/* Privacy Settings */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Privacy</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Share data with communities</span>
                  {editing ? (
                    <input
                      type="checkbox"
                      checked={formData.privacy_settings.share_data}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          share_data: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-400"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {profile?.privacy_settings?.share_data ? 'Yes' : 'No'}
                    </span>
                  )}
                </label>
                
                <label className="flex items-center justify-between">
                  <span className="text-gray-300">Public profile</span>
                  {editing ? (
                    <input
                      type="checkbox"
                      checked={formData.privacy_settings.public_profile}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        privacy_settings: {
                          ...prev.privacy_settings,
                          public_profile: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-400"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {profile?.privacy_settings?.public_profile ? 'Yes' : 'No'}
                    </span>
                  )}
                </label>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 text-gray-300 hover:text-white transition">
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
                
                <button className="w-full flex items-center gap-3 text-gray-300 hover:text-white transition">
                  <CreditCard className="w-5 h-5" />
                  Billing
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 transition"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}