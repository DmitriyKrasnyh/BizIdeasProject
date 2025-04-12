// src/pages/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { REGIONS, BUSINESS_SECTORS, TRANSITION_GOALS, EXPERIENCE_LEVELS } from '../contexts/constants.ts';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    region: '',
    businessSector: '',
    transitionGoal: '',
    experienceLevel: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Неверный формат email';

    if (!formData.password) newErrors.password = 'Введите пароль';
    else if (formData.password.length < 6) newErrors.password = 'Минимум 6 символов';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Пароли не совпадают';

    if (!formData.region) newErrors.region = 'Выберите регион';
    if (!formData.businessSector) newErrors.businessSector = 'Выберите сектор';
    if (!formData.transitionGoal) newErrors.transitionGoal = 'Укажите цель';
    if (!formData.experienceLevel) newErrors.experienceLevel = 'Укажите опыт';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'Слабый', color: 'bg-red-500', width: 'w-1/3', tips: ['Добавьте цифры и спецсимволы', 'Минимум 8 символов'] };
    if (score === 3 || score === 4) return { level: 'Средний', color: 'bg-yellow-500', width: 'w-2/3', tips: ['Добавьте больше символов', 'Комбинируйте заглавные и строчные буквы'] };
    return { level: 'Надежный', color: 'bg-green-500', width: 'w-full', tips: [] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError || !authData.user) throw new Error(authError?.message || 'Ошибка регистрации');

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert([{
          email: formData.email,
          region: formData.region,
          business_sector: formData.businessSector,
          transition_goal: formData.transitionGoal,
          experience_lvl: formData.experienceLevel,
          status: 'standard'
        }])
        .select()
        .single();

      if (profileError || !profileData) throw new Error(profileError?.message || 'Ошибка создания профиля');

      toast.success('🎉 Аккаунт создан! Подтвердите email по ссылке в письме.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      console.error('❌ Ошибка:', err.message);
      toast.error(err.message || 'Что-то пошло не так');
    }

    setLoading(false);
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-bold mb-2">Создай аккаунт</h2>
        <p className="text-gray-400">Адаптируй бизнес под тренды вместе с BizIdeas</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-gray-900 rounded-xl shadow-xl p-8 space-y-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5">
            <InputField label="Email" type="email" value={formData.email} onChange={(val) => handleChange('email', val)} error={errors.email} />
            <InputField label="Пароль" type="password" value={formData.password} onChange={(val) => handleChange('password', val)} error={errors.password} />
            <PasswordStrengthIndicator passwordStrength={passwordStrength} />
            <InputField label="Подтвердите пароль" type="password" value={formData.confirmPassword} onChange={(val) => handleChange('confirmPassword', val)} error={errors.confirmPassword} />
          </div>

          {[{
            label: 'Регион', field: 'region', options: REGIONS
          }, {
            label: 'Сектор бизнеса', field: 'businessSector', options: BUSINESS_SECTORS
          }, {
            label: 'Цель перехода', field: 'transitionGoal', options: TRANSITION_GOALS
          }, {
            label: 'Уровень опыта', field: 'experienceLevel', options: EXPERIENCE_LEVELS
          }].map(({ label, field, options }) => (
            <SelectField
              key={field}
              label={label}
              value={(formData as any)[field]}
              onChange={(val) => handleChange(field, val)}
              options={options}
              error={errors[field]}
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 mt-6 py-2 px-4 font-semibold rounded-md bg-blue-600 hover:bg-blue-700 transition duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Регистрируем...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, type, value, onChange, error }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? 'border-red-500' : 'border-gray-700'}`}
    />
    {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options, error }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 rounded-md bg-gray-800 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? 'border-red-500' : 'border-gray-700'}`}
    >
      <option value="">Выберите...</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
  </div>
);

const PasswordStrengthIndicator = ({ passwordStrength }: any) => (
  <>
    <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-2 ${passwordStrength.color} ${passwordStrength.width} transition-all duration-700 ease-in-out rounded-full`} />
    </div>
    <p className="text-sm mt-1">Уровень: <span className="font-semibold">{passwordStrength.level}</span></p>
    {passwordStrength.tips.length > 0 && (
      <ul className="text-xs text-gray-400 mt-1 list-disc ml-5">
        {passwordStrength.tips.map((tip: string, idx: number) => (
          <li key={idx}>{tip}</li>
        ))}
      </ul>
    )}
  </>
);
