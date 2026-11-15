import { Link } from 'react-router-dom';
import { Radio, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono uppercase tracking-widest text-amber-400 mb-6">
        <Radio className="w-3.5 h-3.5 animate-pulse" /> NO SIGNAL • ERROR 404
      </div>
      <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
        Feed Off-Air.
      </h1>
      <p className="text-sm sm:text-base text-zinc-400 max-w-md mb-8 leading-relaxed">
        The route you requested does not exist or has been moved to a private studio endpoint.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Main Studio
      </Link>
    </div>
  );
};

export default NotFound;