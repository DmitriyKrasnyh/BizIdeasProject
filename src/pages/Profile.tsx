// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { User as UserIcon } from 'lucide-react';

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
const BUSINESS_SECTORS = ['IT & Technology', 'Food & Beverage', 'Retail', 'Healthcare', 'Education', 'Manufacturing', 'Services', 'Eco & Sustainability'];
const TRANSITION_GOALS = ['Expand to new markets', 'Go eco-friendly', 'Automate processes', 'Digital transformation', 'Diversify product line'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    region: '',
    businessSector: '',
    transitionGoal: '',
    experienceLevel: '',
    status: 'standard',
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, region, business_sector, transition_goal, experience_lvl, status')
        .eq('email', user.email)
        .single();

      if (error) {
        console.error('❌ Ошибка загрузки профиля:', error.message);
      } else if (data) {
        setProfileData({
          region: data.region || '',
          businessSector: data.business_sector || '',
          transitionGoal: data.transition_goal || '',
          experienceLevel: data.experience_lvl || '',
          status: data.status || 'standard',
        });

        // 👇 Обновляем пользователя, добавляя user_id
        updateUser({
          ...user,
          user_id: data.user_id,
        });
      }
    };

    loadProfile();
  }, [user, updateUser]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 py-12 text-center">
        <p>{t('noUserData') || 'No user data available. Please log in.'}</p>
      </div>
    );
  }

  const handleSave = async () => {
    const { error } = await supabase
      .from('users')
      .update({
        region: profileData.region,
        business_sector: profileData.businessSector,
        transition_goal: profileData.transitionGoal,
        experience_lvl: profileData.experienceLevel,
        status: profileData.status,
      })
      .eq('email', user.email);

    if (error) {
      console.error('❌ Ошибка обновления пользователя:', error.message);
    } else {
      updateUser({ ...user, ...profileData });
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <UserIcon className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold">{t('profileInfo')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">{t('email')}</label>
                <p className="mt-1 text-lg">{user.email}</p>
              </div>

              {[
                { key: 'region', label: t('regionLabel'), options: REGIONS },
                { key: 'businessSector', label: t('businessSectorLabel'), options: BUSINESS_SECTORS },
                { key: 'transitionGoal', label: t('transitionGoalLabel'), options: TRANSITION_GOALS },
                { key: 'experienceLevel', label: t('experienceLevelLabel'), options: EXPERIENCE_LEVELS },
                { key: 'status', label: t('statusLabel'), options: ['standard', 'plus', 'admin'] },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="block text-sm font-medium">{label}</label>
                  {isEditing ? (
                    <select
                      value={(profileData as any)[key]}
                      onChange={(e) => setProfileData({ ...profileData, [key]: e.target.value })}
                      className="mt-1 block w-full rounded-md border dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="">{t(`select${key.charAt(0).toUpperCase() + key.slice(1)}`)}</option>
                      {options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-lg">{(profileData as any)[key]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {isEditing ? (
                <div className="flex gap-3">
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    {t('saveBtn')}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    {t('cancelBtn')}
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {t('editProfileBtn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
