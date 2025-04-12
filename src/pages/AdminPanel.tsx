// src/pages/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import {
  REGIONS,
  BUSINESS_SECTORS,
  TRANSITION_GOALS,
  EXPERIENCE_LEVELS,
  STATUS_OPTIONS
} from '../contexts/constants';

const TABLES = [
  'users',
  'trendingideas',
  'parserresults',
  'userideas',
  'userhistory',
  'subscription',
  'translations',
  'er-diagram'
];

const LOCKED_FIELDS = ['user_id', 'email', 'idea_id', 'parse_id', 'activity_id', 'sub_id'];

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState<{ [key: string]: any[] }>({});
  const [searchQueries, setSearchQueries] = useState<{ [key: string]: { column: string; query: string } }>({});
  const [editingCell, setEditingCell] = useState<{ table: string; rowIndex: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [newRow, setNewRow] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [isAdminConfirmed, setIsAdminConfirmed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('users');
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) return;
      const { data } = await supabase.from('users').select('status').eq('email', user.email).single();
      setIsAdminConfirmed(data?.status === 'admin');
      setLoading(false);
    };
    setTimeout(checkAdmin, 1000);
  }, [user]);

  useEffect(() => {
    if (!isAdminConfirmed || activeTab === 'er-diagram') return;

    const fetchAll = async () => {
      const result: { [key: string]: any[] } = {};
      for (const table of TABLES.filter(t => t !== 'er-diagram')) {
        const { data } = await supabase.from(table).select('*');
        if (data) result[table] = data;
      }
      setAdminData(result);
    };

    fetchAll();
  }, [isAdminConfirmed]);

  const handleSearchChange = (table: string, column: string, query: string) => {
    setSearchQueries(prev => ({ ...prev, [table]: { column, query: query.toLowerCase() } }));
  };

  const handleEditStart = (table: string, rowIndex: number, column: string, value: string) => {
    if (LOCKED_FIELDS.includes(column)) return;
    setEditingCell({ table, rowIndex, column });
    setEditValue(value);
  };

  const handleEditSave = async () => {
    if (!editingCell) return;
    const { table, rowIndex, column } = editingCell;
    const original = adminData[table][rowIndex];
    if (String(original[column]) === editValue) {
      setEditingCell(null);
      return;
    }

    const primaryKey = Object.keys(original)[0];
    const primaryValue = original[primaryKey];

    const updated = [...adminData[table]];
    updated[rowIndex] = { ...original, [column]: editValue };
    setAdminData({ ...adminData, [table]: updated });
    setEditingCell(null);

    const { error } = await supabase.from(table).update({ [column]: editValue }).eq(primaryKey, primaryValue);
    if (error) console.error('❌ Ошибка обновления:', error);
    else console.log(`✅ Обновлено в ${table}`);
  };

  const getSelectOptions = (column: string) => {
    if (column === 'region') return REGIONS;
    if (column === 'business_sector') return BUSINESS_SECTORS;
    if (column === 'transition_goal') return TRANSITION_GOALS;
    if (column === 'experience_level' || column === 'experience_lvl') return EXPERIENCE_LEVELS;
    if (column === 'status') return STATUS_OPTIONS;
    return null;
  };

  const handleNewRowChange = (key: string, value: any) => {
    setNewRow(prev => ({ ...prev, [key]: value }));
  };

  const handleAddNewRow = async () => {
    if (!newRow || !Object.keys(newRow).length) return;
    try {
      const { error } = await supabase.from(activeTab).insert([newRow]);
      if (error) {
        console.error('❌ Ошибка добавления:', error.message);
      } else {
        setNewRow({});
        const { data } = await supabase.from(activeTab).select('*');
        setAdminData(prev => ({ ...prev, [activeTab]: data || [] }));
        console.log('✅ Новая запись добавлена');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center text-white text-lg animate-pulse">Загрузка панели администратора...</div>;
  }

  if (!isAdminConfirmed) {
    return <div className="text-red-500 text-center text-2xl mt-10">⛔ Доступ запрещён</div>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-gray-950">
      <div className="w-60 min-h-screen bg-zinc-950 p-5 shadow-xl border-r border-zinc-800">
        <h2 className="text-white text-xl font-semibold mb-6">📊 Таблицы</h2>
        {TABLES.map((table) => (
          <button
            key={table}
            onClick={() => setActiveTab(table)}
            className={classNames(
              'block w-full text-left px-4 py-2 mb-2 rounded-lg transition text-sm font-medium',
              activeTab === table ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
            )}
          >
            {table === 'er-diagram' ? 'ER-диаграмма' : table}
          </button>
        ))}
        <button
          onClick={() => navigate('/')}
          className="mt-10 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
        >
          ⬅️ На главную
        </button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold text-white mb-6">{activeTab === 'er-diagram' ? 'ER-диаграмма' : activeTab}</h1>

        {activeTab === 'er-diagram' ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-gray-300 text-center">
            <h2 className="text-xl font-semibold mb-4">📐 Структура таблиц</h2>
            <div className="relative">
              <div className="flex justify-end gap-2 mb-2">
                <button onClick={() => setZoom(zoom + 10)} className="bg-zinc-800 px-3 py-1 rounded text-white">+</button>
                <button onClick={() => setZoom(zoom - 10)} className="bg-zinc-800 px-3 py-1 rounded text-white">−</button>
              </div>
              <img
                src="/er-diagram.svg"
                alt="ER diagram"
                className="mx-auto rounded border border-zinc-700 shadow-lg"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              />
            </div>
          </div>
        ) : adminData[activeTab]?.length > 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 shadow-2xl">
            <div className="flex gap-3 mb-4">
              <select
                className="bg-zinc-800 text-white rounded px-3 py-1"
                value={searchQueries[activeTab]?.column || Object.keys(adminData[activeTab][0])[0]}
                onChange={(e) => handleSearchChange(activeTab, e.target.value, searchQueries[activeTab]?.query || '')}
              >
                {Object.keys(adminData[activeTab][0]).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
              <input
                type="text"
                className="bg-zinc-800 text-white px-3 py-1 rounded w-full"
                placeholder="🔍 Поиск..."
                value={searchQueries[activeTab]?.query || ''}
                onChange={(e) => handleSearchChange(activeTab, searchQueries[activeTab]?.column || '', e.target.value)}
              />
            </div>

            <table className="w-full border border-zinc-700 text-sm">
              <thead>
                <tr>
                  {Object.keys(adminData[activeTab][0]).map((key) => (
                    <th key={key} className="p-2 border border-zinc-700 bg-zinc-800 text-white">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminData[activeTab]
                  .filter((row) =>
                    searchQueries[activeTab]?.query
                      ? String(row[searchQueries[activeTab].column] || '').toLowerCase().includes(searchQueries[activeTab].query)
                      : true
                  )
                  .map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-zinc-800">
                      {Object.entries(row).map(([column, value], colIndex) => {
                        const isEditing =
                          editingCell?.table === activeTab &&
                          editingCell.rowIndex === rowIndex &&
                          editingCell.column === column;
                        const isLocked = LOCKED_FIELDS.includes(column);
                        const isMultiSelect = activeTab === 'trendingideas' && column === 'tags';
                        const options = getSelectOptions(column);

                        return (
                          <td
                            key={colIndex}
                            className={classNames(
                              'p-2 border border-zinc-700',
                              isEditing ? 'bg-indigo-600 cursor-pointer' :
                                isLocked ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'cursor-pointer'
                            )}
                            onDoubleClick={() => handleEditStart(activeTab, rowIndex, column, String(value))}
                          >
                            {isEditing ? isMultiSelect ? (
                              <select
                                multiple
                                value={editValue.split(',')}
                                onChange={(e) => setEditValue(Array.from(e.target.selectedOptions).map(o => o.value).join(','))}
                                onBlur={handleEditSave}
                                className="bg-zinc-700 text-white rounded px-2 py-1 w-full"
                              >
                                {BUSINESS_SECTORS.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : options ? (
                              <select
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleEditSave}
                                autoFocus
                                className="bg-zinc-700 text-white rounded px-2 py-1 w-full"
                              >
                                {options.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleEditSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                autoFocus
                                className="bg-zinc-700 text-white rounded px-2 py-1 w-full"
                              />
                            ) : (
                              String(value)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>

            {['translations', 'parserresults', 'trendingideas'].includes(activeTab) && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-white mb-2 text-sm">Добавить новую запись</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(adminData[activeTab][0])
                    .filter((k) => !LOCKED_FIELDS.includes(k))
                    .map((key) => (
                      <input
                        key={key}
                        placeholder={key}
                        value={newRow[key] || ''}
                        onChange={(e) => handleNewRowChange(key, e.target.value)}
                        className="bg-zinc-800 text-white px-3 py-1 rounded w-full text-sm"
                      />
                    ))}
                </div>
                <button
                  onClick={handleAddNewRow}
                  className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
                >
                  ➕ Добавить
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400 mt-4">📭 Данных нет.</p>
        )}
      </div>
    </div>
  );
};
