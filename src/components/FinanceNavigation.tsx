import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Target,
  Bot,
  FileSpreadsheet,
  Code2,
  Sparkles,
  HelpCircle,
  Download,
  Wallet,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { FinancialPersona, FinancialPersonaId } from '../types/finance';
import { SCENARIO_PRESETS } from '../data/scenarios';

interface FinanceNavigationProps {
  activeTab: 'overview' | 'expenses' | 'budget' | 'goals' | 'advisor' | 'report' | 'flask';
  onTabChange: (tab: 'overview' | 'expenses' | 'budget' | 'goals' | 'advisor' | 'report' | 'flask') => void;
  currentPersona: FinancialPersona;
  onSelectPersona: (personaId: FinancialPersonaId) => void;
  currency: string;
  onChangeCurrency: (currency: string) => void;
  onOpenSimulator: () => void;
  onOpenInsights: () => void;
}

export const FinanceNavigation: React.FC<FinanceNavigationProps> = ({
  activeTab,
  onTabChange,
  currentPersona,
  onSelectPersona,
  currency,
  onChangeCurrency,
  onOpenSimulator,
  onOpenInsights,
}) => {
  const currencies = [
    { symbol: '$', label: 'USD ($)' },
    { symbol: '€', label: 'EUR (€)' },
    { symbol: '£', label: 'GBP (£)' },
    { symbol: '¥', label: 'JPY (¥)' },
    { symbol: '₹', label: 'INR (₹)' },
  ];

  const personas = [
    { id: 'salaried', label: 'Alex Bennett', role: 'Salaried Professional', avatar: '💼' },
    { id: 'student', label: 'Maya Chen', role: 'College Student', avatar: '🎓' },
    { id: 'freelancer', label: 'Marcus Vance', role: 'Freelance Designer', avatar: '🎨' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/95 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-800/80 gap-3">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  Personal Finance Advisor Bot
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Flask + Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                50/30/20 Budgeting · Expense Tracking · Real-Time AI Financial Advisor
              </p>
            </div>
          </div>

          {/* Persona & Currency Switchers & Quick Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Persona Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700/60 text-xs">
              <span className="text-slate-400 px-2 font-medium hidden md:inline">Profile:</span>
              {personas.map((p) => {
                const isSelected = currentPersona.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPersona(p.id as FinancialPersonaId)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                    title={`${p.role}: ${p.label}`}
                  >
                    <span>{p.avatar}</span>
                    <span className="hidden sm:inline">{p.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700/60 text-xs px-2 py-1">
              <span className="text-slate-400 mr-1.5 hidden lg:inline">Currency:</span>
              <select
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value)}
                className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.symbol} value={c.symbol} className="bg-slate-800 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* "Can I Afford This?" Simulator trigger */}
            <button
              onClick={onOpenSimulator}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test if an upcoming purchase fits into your monthly cash flow"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Can I Afford This?</span>
              <span className="md:hidden">Afford?</span>
            </button>

            {/* AI Diagnostics trigger */}
            <button
              onClick={onOpenInsights}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View AI Financial Health Diagnostics"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Health</span>
            </button>

            {/* Download Project Zip */}
            <a
              href="/api/download-zip"
              download="personal-finance-advisor-bot.zip"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              title="Download complete project ZIP with Flask, SQLAlchemy, Jinja2 & React code"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download ZIP</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('expenses')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expenses & Inflow</span>
          </button>

          <button
            onClick={() => onTabChange('budget')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>50/30/20 Budget</span>
          </button>

          <button
            onClick={() => onTabChange('goals')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Savings Goals</span>
          </button>

          <button
            onClick={() => onTabChange('advisor')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'advisor'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AI Advisor Bot</span>
          </button>

          <button
            onClick={() => onTabChange('report')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'report'
                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Monthly Statement</span>
          </button>

          <button
            onClick={() => onTabChange('flask')}
            className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'flask'
                ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-xs'
                : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>Python Flask Code</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300">Ngrok</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
