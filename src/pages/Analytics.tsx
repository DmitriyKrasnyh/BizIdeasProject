// src/pages/Analytics.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  ResponsiveContainer,
  LineChart,  Line,
  AreaChart,  Area,
  PieChart,   Pie, Cell, Legend,
  BarChart,   Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import {
  Loader2, Users, Sparkle, Lightbulb, Tag as TagIcon,
} from 'lucide-react';

/* ---------- тип данных из trendingideas ---------- */
type Idea = {
  idea_id: number;
  created_at: string;         // iso-date
  popularity_score: number;
  tags: string[] | string;    // text[] или csv
};

/* фирменные цвета для pie / bar */
const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#22d3ee',
  '#facc15', '#fb923c', '#6ee7b7', '#f87171',
];

export const Analytics: React.FC = () => {
  const [ideas,  setIdeas]  = useState<Idea[]>([]);
  const [usersN, setUsersN] = useState(0);
  const [load,   setLoad]   = useState(true);

  /* ───── загрузка единожды ───── */
  useEffect(() => {
    (async () => {
      const [{ data: ideaD }, { data: usersD }] = await Promise.all([
        supabase.from('trendingideas')
                .select('idea_id,created_at,popularity_score,tags'),
        supabase.from('users').select('user_id'),
      ]);
      setIdeas((ideaD as any) ?? []);
      setUsersN(usersD?.length ?? 0);
      setLoad(false);
    })();
  }, []);

  /* ───── подготовка данных ───── */
  const byDay = useMemo(() => {
    const map: Record<string,{ t:number; s:number }> = {};
    ideas.forEach(i=>{
      const d=i.created_at.slice(0,10);
      const o=map[d]??={t:0,s:0};
      o.t+=1; o.s+=i.popularity_score??0;
    });
    return Object.entries(map)
      .sort((a,b)=>a[0].localeCompare(b[0]))
      .map(([d,{t,s}])=>({ date:d.slice(5), total:t, avg:+(s/t).toFixed(2) }));
  },[ideas]);

  const tags = useMemo(()=>{
    const m:Record<string,number>={};
    ideas.forEach(i=>{
      (Array.isArray(i.tags)?i.tags:String(i.tags).split(','))
        .map(t=>t.trim()).filter(Boolean)
        .forEach(t=>m[t]=(m[t]??0)+1);
    });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8)
           .map(([name,val],i)=>({ name,value:val,color:COLORS[i%COLORS.length]}));
  },[ideas]);

  /* KPI */
  const kpi = useMemo(()=>{
    if(!ideas.length) return null;
    const total=ideas.length;
    const avg  =(ideas.reduce((s,i)=>s+i.popularity_score,0)/total).toFixed(2);
    return { total, avg, users:usersN, tags:tags.length };
  },[ideas,usersN,tags]);

  /* ───── UI ───── */
  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-16 px-4 text-white
                    bg-gradient-to-br from-[#100018] via-[#070111] to-black">
      <h1 className="text-3xl sm:text-4xl font-bold mb-10 flex items-center gap-3">
        <Sparkle className="w-7 h-7 text-indigo-400" />
        Аналитика платформы
      </h1>

      {load ? (
        <div className="flex justify-center py-40">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : !ideas.length ? (
        <p className="text-gray-400">Данных пока нет 🤷‍♂️</p>
      ) : (
        <>
          {/* KPI */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            <Kpi icon={<Lightbulb className="w-6 h-6" />} label="Идей всего"    value={kpi!.total} />
            <Kpi icon={<Sparkle   className="w-6 h-6" />} label="Ср. score"     value={kpi!.avg}   />
            <Kpi icon={<Users     className="w-6 h-6" />} label="Пользователи"  value={kpi!.users} />
            <Kpi icon={<TagIcon   className="w-6 h-6" />} label="Уник. тегов"   value={kpi!.tags}  />
          </div>

          {/* графики */}
          <div className="grid lg:grid-cols-2 gap-10">
            <Block title="🗓 Идей по дням">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={byDay}>
                  <XAxis dataKey="date" tick={{fill:'#9ca3af',fontSize:11}} />
                  <YAxis tick={{fill:'#9ca3af',fontSize:11}} />
                  <Tooltip contentStyle={{background:'#1f2937',border:'none'}}
                           labelStyle={{color:'#e5e7eb'}}/>
                  <Line dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Block>

            <Block title="⭐ Средний score по дням">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={byDay}>
                  <XAxis dataKey="date" tick={{fill:'#9ca3af',fontSize:11}} />
                  <YAxis tick={{fill:'#9ca3af',fontSize:11}} />
                  <Tooltip contentStyle={{background:'#1f2937',border:'none'}}
                           labelStyle={{color:'#e5e7eb'}}/>
                  <Area dataKey="avg" stroke="#ec4899" fill="#ec4899" fillOpacity={0.25}/>
                </AreaChart>
              </ResponsiveContainer>
            </Block>

            {/* ---- два блока в одну строку ---- */}
            <Block title="🏷 Топ-8 тегов">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={tags}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="none"
                    labelLine={false}
                    label={({percent})=>`${(percent*100).toFixed(0)}%`}
                  >
                    {tags.map(t=><Cell key={t.name} fill={t.color}/>)}
                  </Pie>
                  <Legend wrapperStyle={{color:'#d1d5db',fontSize:12}} />
                </PieChart>
              </ResponsiveContainer>
            </Block>

            <Block title="📊 Частотность тегов">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={tags}>
                  <XAxis dataKey="name" tick={{fill:'#9ca3af',fontSize:11}} interval={0}/>
                  <YAxis tick={{fill:'#9ca3af',fontSize:11}} allowDecimals={false}/>
                  <Tooltip contentStyle={{background:'#1f2937',border:'none'}}
                           labelStyle={{color:'#e5e7eb'}}/>
                  <Bar dataKey="value">
                    {tags.map(t=><Cell key={t.name} fill={t.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Block>
          </div>
        </>
      )}
    </div>
  );
};

/* ---------- мини-компоненты ---------- */
const Kpi = ({icon,label,value}:{
  icon:React.ReactNode;label:string;value:number|string;
})=>(
  <div className="bg-zinc-900/80 backdrop-blur rounded-2xl p-5 flex items-center gap-4 shadow">
    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const Block = ({title,children}:{title:string;children:React.ReactNode})=>(
  <div className="bg-zinc-900/80 backdrop-blur rounded-3xl p-6 shadow-lg shadow-black/40">
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
      {title}
    </h2>
    {children}
  </div>
);
