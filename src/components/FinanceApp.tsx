import React, { useState, useMemo, useCallback } from 'react';
import { FinanceNavigation } from './FinanceNavigation';
import { OverviewDashboard } from './OverviewDashboard';
import { ExpenseManager } from './ExpenseManager';
import { BudgetPlanner } from './BudgetPlanner';
import { SavingsGoalsTracker } from './SavingsGoalsTracker';
import { AdvisorChat } from './AdvisorChat';
import { MonthlyReportView } from './MonthlyReportView';
import { FlaskCodeViewer } from './FlaskCodeViewer';
import { PurchaseSimulatorModal } from './PurchaseSimulatorModal';
import { SpendingInsightsModal } from './SpendingInsightsModal';

import { SCENARIO_PRESETS } from '../data/scenarios';
import {
  ExpenseCategory,
  ExpenseItem,
  FinancialAnalysis,
  FinancialPersona,
  FinancialPersonaId,
  IncomeItem,
  SavingsGoal,
} from '../types/finance';
import {
  calculateFinancialSnapshot,
  generateLocalFinancialAnalysis,
} from '../utils/financeCalculations';

export const FinanceApp: React.FC = () => {
  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<
    'overview' | 'expenses' | 'budget' | 'goals' | 'advisor' | 'report' | 'flask'
  >('overview');

  // Selected Financial Persona Profile (Salaried, Student, Freelancer)
  const [currentPersonaId, setCurrentPersonaId] = useState<FinancialPersonaId>('salaried');
  const currentPersona: FinancialPersona = SCENARIO_PRESETS[currentPersonaId as 'salaried' | 'student' | 'freelancer'].persona;

  // Currency selection
  const [currency, setCurrency] = useState('$');

  // Core Financial Data State
  const [incomes, setIncomes] = useState<IncomeItem[]>(
    () => SCENARIO_PRESETS['salaried'].incomes
  );
  const [expenses, setExpenses] = useState<ExpenseItem[]>(
    () => SCENARIO_PRESETS['salaried'].expenses
  );
  const [budgetLimits, setBudgetLimits] = useState<Record<ExpenseCategory, number>>(
    () => SCENARIO_PRESETS['salaried'].budgetLimits
  );
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(
    () => SCENARIO_PRESETS['salaried'].savingsGoals
  );

  // Computed Financial Snapshot
  const snapshot = useMemo(() => {
    return calculateFinancialSnapshot(incomes, expenses, budgetLimits, savingsGoals, currentPersona);
  }, [incomes, expenses, budgetLimits, savingsGoals, currentPersona]);

  // AI Diagnostic Analysis State
  const [analysis, setAnalysis] = useState<FinancialAnalysis>(() =>
    generateLocalFinancialAnalysis(
      calculateFinancialSnapshot(
        SCENARIO_PRESETS['salaried'].incomes,
        SCENARIO_PRESETS['salaried'].expenses,
        SCENARIO_PRESETS['salaried'].budgetLimits,
        SCENARIO_PRESETS['salaried'].savingsGoals,
        SCENARIO_PRESETS['salaried'].persona
      ),
      SCENARIO_PRESETS['salaried'].persona
    )
  );

  // Modals & Chat Prompts
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string | undefined>(undefined);

  // Switch persona handler
  const handleSelectPersona = (newPersonaId: FinancialPersonaId) => {
    if (newPersonaId === currentPersonaId) return;
    const preset = SCENARIO_PRESETS[newPersonaId as 'salaried' | 'student' | 'freelancer'];
    if (!preset) return;

    setCurrentPersonaId(newPersonaId);
    setIncomes(preset.incomes);
    setExpenses(preset.expenses);
    setBudgetLimits(preset.budgetLimits);
    setSavingsGoals(preset.savingsGoals);

    // Compute fresh analysis
    const newSnapshot = calculateFinancialSnapshot(
      preset.incomes,
      preset.expenses,
      preset.budgetLimits,
      preset.savingsGoals,
      preset.persona
    );
    setAnalysis(generateLocalFinancialAnalysis(newSnapshot, preset.persona));
  };

  // Add / Delete Expense Handlers
  const handleAddExpense = (newExpData: Omit<ExpenseItem, 'id'>) => {
    const newExpense: ExpenseItem = {
      ...newExpData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Add / Delete Income Handlers
  const handleAddIncome = (newIncData: Omit<IncomeItem, 'id'>) => {
    const newIncome: IncomeItem = {
      ...newIncData,
      id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // Budget Limit Update Handlers
  const handleUpdateBudgetLimit = (category: ExpenseCategory, newLimit: number) => {
    setBudgetLimits((prev) => ({
      ...prev,
      [category]: Math.max(0, newLimit),
    }));
  };

  const handleBatchUpdateLimits = (newLimits: Record<ExpenseCategory, number>) => {
    setBudgetLimits(newLimits);
  };

  // Savings Goal Handlers
  const handleAddGoal = (newGoalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoalAmount = (goalId: string, delta: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updated = Math.max(0, g.currentAmount + delta);
          return { ...g, currentAmount: updated };
        }
        return g;
      })
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // Quick Open Advisor with prefilled prompt
  const handleOpenAdvisorWithPrompt = (prompt: string) => {
    setAdvisorInitialPrompt(prompt);
    setActiveTab('advisor');
  };

  // Trigger on-demand server-side AI Diagnostic Analysis
  const handleTriggerAIAnalysis = async () => {
    try {
      const res = await fetch('/api/advisor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot, persona: currentPersona }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.healthScore !== undefined) {
          setAnalysis(data);
        }
      }
    } catch {
      // Graceful local recalculation
      setAnalysis(generateLocalFinancialAnalysis(snapshot, currentPersona));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navigation & Controls */}
      <FinanceNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentPersona={currentPersona}
        onSelectPersona={handleSelectPersona}
        currency={currency}
        onChangeCurrency={setCurrency}
        onOpenSimulator={() => setShowSimulatorModal(true)}
        onOpenInsights={() => {
          handleTriggerAIAnalysis();
          setShowInsightsModal(true);
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Executive Dashboard Overview */}
        {activeTab === 'overview' && (
          <OverviewDashboard
            snapshot={snapshot}
            persona={currentPersona}
            currency={currency}
            analysis={analysis}
            onOpenAddExpense={() => setActiveTab('expenses')}
            onOpenAddIncome={() => setActiveTab('expenses')}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
            onOpenAnalysis={() => {
              handleTriggerAIAnalysis();
              setShowInsightsModal(true);
            }}
            onOpenSimulator={() => setShowSimulatorModal(true)}
            onOpenGoalDeposit={(goal) => {
              setActiveTab('goals');
            }}
            onNavigateToTab={(tab) => {
              if (tab === 'overview' || tab === 'expenses' || tab === 'budget' || tab === 'goals' || tab === 'advisor') {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {/* Tab 2: Expenses & Inflow Management */}
        {activeTab === 'expenses' && (
          <ExpenseManager
            expenses={expenses}
            incomes={incomes}
            currency={currency}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onAddIncome={handleAddIncome}
            onDeleteIncome={handleDeleteIncome}
          />
        )}

        {/* Tab 3: 50/30/20 Budget Planning & Envelopes */}
        {activeTab === 'budget' && (
          <BudgetPlanner
            snapshot={snapshot}
            persona={currentPersona}
            currency={currency}
            onUpdateBudgetLimit={handleUpdateBudgetLimit}
            onBatchUpdateLimits={handleBatchUpdateLimits}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
          />
        )}

        {/* Tab 4: Savings Goals & Milestones */}
        {activeTab === 'goals' && (
          <SavingsGoalsTracker
            goals={savingsGoals}
            currency={currency}
            monthlySurplus={snapshot.netCashFlow}
            onAddGoal={handleAddGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onDeleteGoal={handleDeleteGoal}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
          />
        )}

        {/* Tab 5: AI Financial Advisor Chatbot */}
        {activeTab === 'advisor' && (
          <AdvisorChat
            snapshot={snapshot}
            persona={currentPersona}
            currency={currency}
            initialPrompt={advisorInitialPrompt}
            onClearInitialPrompt={() => setAdvisorInitialPrompt(undefined)}
          />
        )}

        {/* Tab 6: Monthly Statement & Audit Report */}
        {activeTab === 'report' && (
          <MonthlyReportView
            snapshot={snapshot}
            persona={currentPersona}
            currency={currency}
            analysis={analysis}
            expenses={expenses}
            incomes={incomes}
            onBack={() => setActiveTab('overview')}
          />
        )}

        {/* Tab 7: Python Flask Architecture & Codebase */}
        {activeTab === 'flask' && <FlaskCodeViewer />}
      </main>

      {/* "Can I Afford This?" Purchase Stress-Tester Modal */}
      {showSimulatorModal && (
        <PurchaseSimulatorModal
          isOpen={showSimulatorModal}
          onClose={() => setShowSimulatorModal(false)}
          snapshot={snapshot}
          persona={currentPersona}
          currency={currency}
        />
      )}

      {/* AI Spending Health Diagnostics Modal */}
      {showInsightsModal && (
        <SpendingInsightsModal
          isOpen={showInsightsModal}
          onClose={() => setShowInsightsModal(false)}
          analysis={analysis}
          snapshot={snapshot}
          persona={currentPersona}
          currency={currency}
          onOpenReport={() => {
            setShowInsightsModal(false);
            setActiveTab('report');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-400">
              Personal Finance Advisor Bot · Built with Flask, SQLAlchemy, Jinja2 & Gemini AI
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Intelligent budgeting, real-time spending insights, envelope planning, and public deployment via Ngrok.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/download-zip"
              download="personal-finance-advisor-bot.zip"
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Download Project ZIP</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
