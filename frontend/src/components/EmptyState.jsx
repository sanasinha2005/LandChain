import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FileQuestion,
  title = 'No Records Found',
  description = 'There are no records matching your current filter criteria.',
  actionText,
  actionLink
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mt-1 mb-6 leading-relaxed">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-950/50 transition-all"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

