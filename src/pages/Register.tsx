// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const BUSINESS_SECTORS = [
  'IT & Technology', 'Food & Beverage', 'Retail', 'Healthcare',
  'Education', 'Manufacturing', 'Services', 'Eco & Sustainability'
];

const REGIONS = [
  'North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'
];

const TRANSITION_GOALS = [
  'Expand to new markets', 'Go eco-friendly', 'Automate processes',
  'Digital transformation', 'Diversify product line'
];

const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    region: '', businessSector: '', transitionGoal: '',
    experienceLevel: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.region) newErrors.region = 'Please select a region';
    if (!formData.businessSector) newErrors.businessSector = 'Please select a sector';
    if (!formData.transitionGoal) newErrors.transitionGoal = 'Please select a goal';
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Please select experience level';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // 1. Регистрация в auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError || !authData.user) throw new Error(authError?.message || 'Signup failed');

      // 2. Добавляем профиль в таблицу users
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([{
          email: formData.email,
          region: formData.region,
          business_sector: formData.businessSector,
          transition_goal: formData.transitionGoal,
          experience_lvl: formData.experienceLevel,
          status: 'standard' // Принудительно
        }])
        .select()
        .single();

      if (profileError || !profileData) throw new Error(profileError?.message || 'Failed to create user profile');

      login('supabase-token', {
        ...profileData,
        user_id: profileData.id
      });

      toast.success('Registration successful!');
      navigate('/profile');

    } catch (err: any) {
      console.error('❌ Registration error:', err);
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium">Region</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${errors.region ? 'border-red-500' : 'border-gray-300'} px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              >
                <option value="">Select region</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
            </div>

            {/* Business Sector */}
            <div>
              <label className="block text-sm font-medium">Business Sector</label>
              <select
                value={formData.businessSector}
                onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${errors.businessSector ? 'border-red-500' : 'border-gray-300'} px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              >
                <option value="">Select sector</option>
                {BUSINESS_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.businessSector && <p className="text-red-500 text-sm">{errors.businessSector}</p>}
            </div>

            {/* Transition Goal */}
            <div>
              <label className="block text-sm font-medium">Transition Goal</label>
              <select
                value={formData.transitionGoal}
                onChange={(e) => setFormData({ ...formData, transitionGoal: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${errors.transitionGoal ? 'border-red-500' : 'border-gray-300'} px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              >
                <option value="">Select goal</option>
                {TRANSITION_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.transitionGoal && <p className="text-red-500 text-sm">{errors.transitionGoal}</p>}
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className={`mt-1 block w-full rounded-md border ${errors.experienceLevel ? 'border-red-500' : 'border-gray-300'} px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100`}
              >
                <option value="">Select level</option>
                {EXPERIENCE_LEVELS.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
              </select>
              {errors.experienceLevel && <p className="text-red-500 text-sm">{errors.experienceLevel}</p>}
            </div>

            {/* Submit */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
