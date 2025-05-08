import { CheckCircle, Sparkle, Infinity, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Pricing: React.FC = () => (
  <div className="min-h-screen pt-24 md:pt-28 pb-20 px-4
                  bg-gradient-to-br from-[#100018] via-[#070111] to-black text-white">

    <h1 className="text-3xl sm:text-4xl font-bold text-center mb-14">
      Выберите подходящий план
    </h1>

    <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10">
      {/* --------- STANDARD --------- */}
      <PlanCard
        icon={<Sparkle className="w-8 h-8" />}
        title="Standard"
        price="0 ₽"
        cta="По умолчанию"
        gradient="from-indigo-500 via-purple-600 to-pink-600"
        features={[
          'Доступ к популярным бизнес-идеям',
          '1 бесплатный запрос к AI-ассистенту',
          'Базовая аналитика',
        ]}
        disabled
      />

      {/* --------- PLUS --------- */}
      <PlanCard
        icon={<Infinity className="w-8 h-8" />}
        title="Plus"
        price="999 ₽ / мес"
        cta="Оформить"
        gradient="from-emerald-500 via-teal-500 to-cyan-500"
        features={[
          'Безлимитный AI-ассистент',
          'Расширенная аналитика трендов',
          'Ранний доступ к новым функциям',
          'Приоритетная поддержка',
        ]}
        onClick={() => toast('Платёжный модуль в разработке 🚀')}
      />
    </div>
  </div>
);

/* ---------------- helper ---------------- */
const PlanCard = ({
  icon, title, price, cta, features,
  gradient, onClick, disabled,
}: {
  icon: JSX.Element;
  title: string;
  price: string;
  cta: string;
  features: string[];
  gradient: string;        /* tailwind gradient */
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <div className="relative overflow-hidden rounded-3xl p-8 bg-zinc-900/80
                  backdrop-blur shadow-lg shadow-black/40 flex flex-col">
    {/* background ring */}
    <div className={`absolute -inset-0.5 blur-lg opacity-25 pointer-events-none
                    bg-gradient-to-br ${gradient}`} />
    <div className="relative z-10 flex-1 flex flex-col">
      <div className={`p-4 rounded-xl mb-6 text-white bg-gradient-to-br ${gradient}`}>
        {icon}
      </div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-3xl font-extrabold mb-6">{price}</p>

      <ul className="space-y-3 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <button
        disabled={disabled}
        onClick={onClick}
        className={`mt-8 w-full py-2 rounded-lg font-semibold flex items-center
                    justify-center gap-2 transition
          ${disabled
            ? 'bg-zinc-700 cursor-not-allowed'
            : `bg-gradient-to-r ${gradient} hover:brightness-110`}`}
      >
        {disabled ? 'Активен' : <><Zap className="w-4 h-4" /> {cta}</>}
      </button>
    </div>
  </div>
);
