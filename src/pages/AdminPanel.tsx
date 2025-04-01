// src/pages/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState<{ [key: string]: any[] } | null>(null);
  const [searchQueries, setSearchQueries] = useState<{ [key: string]: { column: string; query: string } }>({});
  const [editingCell, setEditingCell] = useState<{ table: string; rowIndex: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const statusOptions = ['standard', 'plus', 'admin'];

  useEffect(() => {
    if (user?.status !== 'admin') return;

    const loadData = async () => {
      try {
        const tableNames = ['users', 'ideas']; // дополни нужные таблицы
        const result: { [key: string]: any[] } = {};

        for (const table of tableNames) {
          const { data, error } = await supabase.from(table).select('*');
          if (error) throw error;
          result[table] = data || [];
        }

        setAdminData(result);
        console.log('📊 Данные загружены из Supabase:', result);
      } catch (error) {
        console.error('❌ Ошибка загрузки данных из Supabase:', error);
      }
    };

    loadData();
  }, [user]);

  const handleSearchChange = (table: string, column: string, query: string) => {
    setSearchQueries(prev => ({
      ...prev,
      [table]: { column, query: query.toLowerCase() },
    }));
  };

  const handleEditStart = (table: string, rowIndex: number, column: string, value: string) => {
    setEditingCell({ table, rowIndex, column });
    setEditValue(value);
  };

  const handleEditSave = async () => {
    if (!editingCell || !adminData) return;

    const { table, rowIndex, column } = editingCell;
    const updated = [...adminData[table]];
    const row = updated[rowIndex];
    const primaryKey = Object.keys(row)[0];
    const primaryValue = row[primaryKey];

    updated[rowIndex] = { ...row, [column]: editValue };
    setAdminData({ ...adminData, [table]: updated });
    setEditingCell(null);

    try {
      const { error } = await supabase
        .from(table)
        .update({ [column]: editValue })
        .eq(primaryKey, primaryValue);

      if (error) throw error;

      console.log('✅ Успешное обновление!');
    } catch (error) {
      console.error('❌ Ошибка обновления:', error);
    }
  };

  if (!user || user.status !== 'admin') {
    return <h2 className="text-red-500 text-center text-2xl mt-10">⛔ Доступ запрещён</h2>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Админ-панель</h1>
      {adminData ? (
        <div className="space-y-8">
          {Object.entries(adminData).map(([tableName, records]) => (
            <div key={tableName} className="border p-4 rounded bg-gray-800 text-white">
              <h2 className="text-xl font-semibold mb-3">{tableName}</h2>

              {records.length > 0 && (
                <div className="flex space-x-4 mb-3">
                  <select
                    className="p-2 bg-gray-700 text-white rounded"
                    value={searchQueries[tableName]?.column || Object.keys(records[0])[0]}
                    onChange={(e) => handleSearchChange(tableName, e.target.value, searchQueries[tableName]?.query || '')}
                  >
                    {Object.keys(records[0]).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="🔍 Введите текст для поиска..."
                    className="p-2 w-full rounded bg-gray-700 text-white"
                    value={searchQueries[tableName]?.query || ''}
                    onChange={(e) => handleSearchChange(tableName, searchQueries[tableName]?.column || Object.keys(records[0])[0], e.target.value)}
                  />
                </div>
              )}

              <table className="w-full border-collapse border border-gray-600">
                <thead>
                  <tr>
                    {records.length > 0 &&
                      Object.keys(records[0]).map((key) => (
                        <th key={key} className="border border-gray-600 p-2">{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {records
                    .filter(row =>
                      searchQueries[tableName]?.query
                        ? String(row[searchQueries[tableName]?.column || '']).toLowerCase().includes(searchQueries[tableName]?.query)
                        : true
                    )
                    .map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border border-gray-600">
                        {Object.entries(row).map(([column, value], idx) => (
                          <td
                            key={idx}
                            className="border border-gray-600 p-2 cursor-pointer"
                            onDoubleClick={() => handleEditStart(tableName, rowIndex, column, String(value))}
                          >
                            {editingCell && editingCell.table === tableName && editingCell.rowIndex === rowIndex && editingCell.column === column ? (
                              column === 'status' ? (
                                <select
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={handleEditSave}
                                  className="bg-gray-700 text-white p-1 rounded w-full"
                                  autoFocus
                                >
                                  {statusOptions.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={handleEditSave}
                                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                                  autoFocus
                                  className="bg-gray-700 text-white p-1 rounded w-full"
                                />
                              )
                            ) : (
                              String(value)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <p>Загрузка данных...</p>
      )}
    </div>
  );
};
