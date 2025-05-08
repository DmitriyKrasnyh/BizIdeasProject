// src/pages/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import {
  Database,
  LayoutDashboard,
  Plus,
  Save,
  Search,
  ShieldOff,
  CornerUpLeft,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  REGIONS,
  BUSINESS_SECTORS,
  TRANSITION_GOALS,
  EXPERIENCE_LEVELS,
  STATUS_OPTIONS,
} from '../contexts/constants';

const TABLES = [
  'users',
  'trendingideas',
  'parserresults',
  'userideas',
  'userhistory',
  'subscription',
  'translations',
  'er-diagram',
] as const;

const LOCKED_FIELDS = [
  'user_id',
  'email',
  'idea_id',
  'parse_id',
  'activity_id',
  'sub_id',
];

type SearchState = {
  [k: string]: { column: string; query: string };
};

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ───── state ───── */
  const [data, setData] = useState<{ [T in (typeof TABLES)[number]]?: any[] }>(
    {},
  );
  const [active, setActive] = useState<(typeof TABLES)[number]>('users');
  const [search, setSearch] = useState<SearchState>({});
  const [editCell, setEditCell] = useState<{
    table: string;
    row: number;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newRow, setNewRow] = useState<Record<string, any>>({});
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  /* ───── admin check ───── */
  useEffect(() => {
    (async () => {
      if (!user?.email) return;
      const { data } = await supabase
        .from('users')
        .select('status')
        .eq('email', user.email)
        .single();
      setIsAdmin(data?.status === 'admin');
      setLoading(false);
    })();
  }, [user]);

  /* ───── fetch tables ───── */
  useEffect(() => {
    if (!isAdmin || active === 'er-diagram') return;
    (async () => {
      const { data: rows } = await supabase.from(active).select('*');
      if (rows) setData(prev => ({ ...prev, [active]: rows }));
    })();
  }, [active, isAdmin]);

  /* ───── helpers ───── */
  const opts = (col: string) => {
    if (col === 'region') return REGIONS;
    if (col === 'business_sector') return BUSINESS_SECTORS;
    if (col === 'transition_goal') return TRANSITION_GOALS;
    if (col === 'experience_level' || col === 'experience_lvl')
      return EXPERIENCE_LEVELS;
    if (col === 'status') return STATUS_OPTIONS;
    return null;
  };

  const beginEdit = (t: string, r: number, c: string, v: any) => {
    if (LOCKED_FIELDS.includes(c)) return;
    setEditCell({ table: t, row: r, column: c });
    setEditValue(String(v ?? ''));
  };

  const saveEdit = async () => {
    if (!editCell) return;
    const { table, row, column } = editCell;
    const current = data[table]![row];
    if (String(current[column]) === editValue) {
      setEditCell(null);
      return;
    }
    const pk = Object.keys(current)[0];
    const pkVal = current[pk];

    await supabase.from(table).update({ [column]: editValue }).eq(pk, pkVal);
    const updated = [...data[table]!];
    updated[row] = { ...current, [column]: editValue };
    setData(prev => ({ ...prev, [table]: updated }));
    setEditCell(null);
  };

  const addRow = async () => {
    if (!Object.keys(newRow).length) return;
    await supabase.from(active).insert([newRow]);
    const { data: rows } = await supabase.from(active).select('*');
    setData(prev => ({ ...prev, [active]: rows || [] }));
    setNewRow({});
  };

  /* ───── ui ───── */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white animate-pulse">
        Загрузка…
      </div>
    );

  if (!isAdmin)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4">
        <ShieldOff className="w-10 h-10" />
        <p className="text-2xl font-semibold">Доступ запрещён</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          На главную
        </button>
      </div>
    );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0e0e11] via-[#09090b] to-black text-gray-100">
      {/* sidebar */}
      <aside className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-950/95 backdrop-blur-sm p-5 space-y-8">
        <div className="flex items-center gap-2 text-lg font-bold">
          <LayoutDashboard className="w-5 h-5 text-indigo-500" /> Admin Panel
        </div>

        <nav className="space-y-2">
          {TABLES.map(t => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={classNames(
                'w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm capitalize transition',
                active === t
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-zinc-800 text-gray-300',
              )}
            >
              <Database className="w-4 h-4 shrink-0" />
              {t === 'er-diagram' ? 'ER-diagram' : t}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-10 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg text-sm font-medium"
        >
          <CornerUpLeft className="w-4 h-4" />
          На главную
        </button>
      </aside>

      {/* content */}
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 capitalize">
          {active === 'er-diagram' ? 'ER-diagram' : active}
        </h1>

        {/* ER */}
        {active === 'er-diagram' ? (
          <section className="bg-zinc-900 rounded-xl p-6 shadow-xl">
            <div className="flex justify-end gap-2 mb-2">
              <button
                onClick={() => setZoom(z => z + 10)}
                className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded"
              >
                +
              </button>
              <button
                onClick={() => setZoom(z => z - 10)}
                className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded"
              >
                −
              </button>
            </div>
            <div className="overflow-auto">
              <img
                src="/er-diagram.svg"
                alt="er"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                }}
                className="border border-zinc-700 rounded shadow-lg"
              />
            </div>
          </section>
        ) : data[active]?.length ? (
          <>
            {/* search */}
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={
                  search[active]?.column ||
                  Object.keys(data[active]![0])[0] ||
                  ''
                }
                onChange={e =>
                  setSearch(prev => ({
                    ...prev,
                    [active]: {
                      column: e.target.value,
                      query: search[active]?.query || '',
                    },
                  }))
                }
                className="bg-zinc-800 px-3 py-1 rounded text-sm"
              >
                {Object.keys(data[active]![0]).map(k => (
                  <option key={k}>{k}</option>
                ))}
              </select>
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                <input
                  placeholder="Поиск…"
                  value={search[active]?.query || ''}
                  onChange={e =>
                    setSearch(prev => ({
                      ...prev,
                      [active]: {
                        column:
                          prev[active]?.column ||
                          Object.keys(data[active]![0])[0],
                        query: e.target.value.toLowerCase(),
                      },
                    }))
                  }
                  className="bg-zinc-800 pl-9 pr-3 py-1 rounded w-full text-sm"
                />
              </div>
            </div>

            {/* table */}
            <section className="rounded-xl overflow-auto shadow-2xl">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-zinc-800 sticky top-0 shadow">
                  <tr>
                    {Object.keys(data[active]![0]).map(k => (
                      <th
                        key={k}
                        className="px-3 py-2 border border-zinc-700 text-left font-medium"
                      >
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data[active]!
                    .filter(r =>
                      search[active]?.query
                        ? String(
                            r[search[active]!.column] ?? '',
                          )
                            .toLowerCase()
                            .includes(search[active]!.query)
                        : true,
                    )
                    .map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="odd:bg-zinc-900 even:bg-zinc-800/70 hover:bg-indigo-600/30"
                      >
                        {Object.entries(row).map(([col, val], cIdx) => {
                          const editing =
                            editCell?.table === active &&
                            editCell.row === rIdx &&
                            editCell.column === col;
                          const locked = LOCKED_FIELDS.includes(col);
                          const listOpt =
                            active === 'trendingideas' && col === 'tags';
                          const selOpt = opts(col);

                          return (
                            <td
                              key={cIdx}
                              className={classNames(
                                'px-3 py-2 border border-zinc-700 align-top',
                                locked && 'text-gray-500',
                                editing && 'bg-indigo-600/50',
                              )}
                              onDoubleClick={() =>
                                beginEdit(active, rIdx, col, val)
                              }
                            >
                              {editing ? (
                                listOpt ? (
                                  <select
                                    multiple
                                    autoFocus
                                    size={5}
                                    value={editValue.split(',')}
                                    onChange={e =>
                                      setEditValue(
                                        Array.from(
                                          e.target.selectedOptions,
                                        )
                                          .map(o => o.value)
                                          .join(','),
                                      )
                                    }
                                    onBlur={saveEdit}
                                    className="w-full bg-zinc-700 rounded px-2 py-1"
                                  >
                                    {BUSINESS_SECTORS.map(o => (
                                      <option key={o}>{o}</option>
                                    ))}
                                  </select>
                                ) : selOpt ? (
                                  <select
                                    autoFocus
                                    value={editValue}
                                    onChange={e =>
                                      setEditValue(e.target.value)
                                    }
                                    onBlur={saveEdit}
                                    className="w-full bg-zinc-700 rounded px-2 py-1"
                                  >
                                    {selOpt.map(o => (
                                      <option key={o}>{o}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    autoFocus
                                    value={editValue}
                                    onChange={e =>
                                      setEditValue(e.target.value)
                                    }
                                    onBlur={saveEdit}
                                    onKeyDown={e =>
                                      e.key === 'Enter' && saveEdit()
                                    }
                                    className="w-full bg-zinc-700 rounded px-2 py-1"
                                  />
                                )
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>

            {/* add row */}
            {['translations', 'parserresults', 'trendingideas'].includes(
              active,
            ) && (
              <div className="mt-8 bg-zinc-900 p-4 rounded-xl shadow-lg space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Новая запись
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(data[active]![0])
                    .filter(k => !LOCKED_FIELDS.includes(k))
                    .map(key => (
                      <input
                        key={key}
                        placeholder={key}
                        value={newRow[key] || ''}
                        onChange={e =>
                          setNewRow(p => ({ ...p, [key]: e.target.value }))
                        }
                        className="bg-zinc-800 rounded px-3 py-1 text-sm"
                      />
                    ))}
                </div>
                <button
                  onClick={addRow}
                  className="mt-2 flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                >
                  <Save className="w-4 h-4" /> Сохранить
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">Данных нет.</p>
        )}
      </main>
    </div>
  );
};
