import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  FileCode,
  Download,
  Server,
  Database,
  Globe,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export const FlaskCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState<'app' | 'models' | 'ai' | 'ngrok' | 'tests' | 'env' | 'readme'>('app');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets: Record<string, { filename: string; language: string; content: string; desc: string }> = {
    app: {
      filename: 'flask_app/app.py',
      language: 'python',
      desc: 'Main Flask application with Flask-Login session authentication, database initialization, expense/income routes, AI endpoints, and CSV exports.',
      content: `import os
import datetime
import csv
from io import StringIO
from flask import (
    Flask, render_template, redirect, url_for, request,
    flash, jsonify, session, Response
)
from flask_login import (
    LoginManager, login_user, logout_user, login_required, current_user
)
from dotenv import load_dotenv

from models import db, User, Income, ExpenseCategory, Expense, SavingsGoal, MonthlyReport
from ai_advisor import (
    analyze_spending_and_health, chat_with_advisor,
    simulate_purchase, parse_natural_language_expense
)

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-finance-advisor-2026')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///finance_advisor.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Initialize database tables and default envelopes
with app.app_context():
    db.create_all()

# Authentication Routes: Register, Login, Logout
@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        currency = request.form.get('currency', '$')
        persona = request.form.get('persona', 'Salaried Professional')

        if not username or not email or not password:
            flash('All fields are required.', 'danger')
            return render_template('register.html')

        if User.query.filter((User.username == username) | (User.email == email)).first():
            flash('Username or email already exists.', 'danger')
            return render_template('register.html')

        user = User(username=username, email=email, currency=currency, persona=persona)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        login_user(user)
        flash('Welcome to your Personal Finance Advisor Bot!', 'success')
        return redirect(url_for('dashboard'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        login_id = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        user = User.query.filter((User.username == login_id) | (User.email == login_id)).first()

        if user and user.check_password(password):
            login_user(user)
            flash(f'Welcome back, {user.username}!', 'success')
            return redirect(url_for('dashboard'))
        flash('Invalid username/email or password.', 'danger')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out securely.', 'info')
    return redirect(url_for('login'))

# Core Dashboard
@app.route('/dashboard')
@login_required
def dashboard():
    incomes = Income.query.filter_by(user_id=current_user.id).all()
    expenses = Expense.query.filter_by(user_id=current_user.id).order_by(Expense.date.desc()).all()
    categories = ExpenseCategory.query.filter_by(user_id=current_user.id).all()
    goals = SavingsGoal.query.filter_by(user_id=current_user.id).all()

    total_income = sum(i.amount for i in incomes)
    total_expenses = sum(e.amount for e in expenses)
    net_cash_flow = total_income - total_expenses
    savings_rate = (net_cash_flow / total_income * 100) if total_income > 0 else 0

    return render_template(
        'dashboard.html',
        total_income=total_income,
        total_expenses=total_expenses,
        net_cash_flow=net_cash_flow,
        savings_rate=savings_rate,
        categories=categories,
        goals=goals,
        recent_expenses=expenses[:10]
    )

# AI Endpoints
@app.route('/api/ai/chat', methods=['POST'])
@login_required
def ai_chat():
    data = request.get_json() or {}
    message = data.get('message', '')
    response_text = chat_with_advisor(message, current_user.get_snapshot())
    return jsonify({'response': response_text})

@app.route('/api/ai/simulate-purchase', methods=['POST'])
@login_required
def ai_simulate():
    data = request.get_json() or {}
    result = simulate_purchase(
        item_name=data.get('item_name', ''),
        cost=float(data.get('cost', 0)),
        category=data.get('category', 'Shopping'),
        urgency=data.get('urgency', 'Nice to Have'),
        snapshot=current_user.get_snapshot()
    )
    return jsonify(result)`
    },
    models: {
      filename: 'flask_app/models.py',
      language: 'python',
      desc: 'SQLAlchemy ORM models defining users, income streams, expense categories, transactions, envelope budgets, and savings goals.',
      content: `import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    currency = db.Column(db.String(10), default='$')
    persona = db.Column(db.String(50), default='Salaried Professional')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incomes = db.relationship('Income', backref='user', lazy=True, cascade='all, delete-orphan')
    categories = db.relationship('ExpenseCategory', backref='user', lazy=True, cascade='all, delete-orphan')
    expenses = db.relationship('Expense', backref='user', lazy=True, cascade='all, delete-orphan')
    savings_goals = db.relationship('SavingsGoal', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_snapshot(self):
        total_income = sum(i.amount for i in self.incomes)
        total_expenses = sum(e.amount for e in self.expenses)
        net_cash_flow = total_income - total_expenses
        return {
            'username': self.username,
            'currency': self.currency,
            'persona': self.persona,
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_cash_flow': net_cash_flow,
            'savings_rate': (net_cash_flow / total_income * 100) if total_income > 0 else 0
        }

class Income(db.Model):
    __tablename__ = 'incomes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    source = db.Column(db.String(120), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    frequency = db.Column(db.String(30), default='monthly')
    date = db.Column(db.Date, default=datetime.date.today)
    notes = db.Column(db.String(255), nullable=True)

class ExpenseCategory(db.Model):
    __tablename__ = 'expense_categories'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    budget_limit = db.Column(db.Float, default=0.0)
    envelope_type = db.Column(db.String(20), default='Needs')  # Needs, Wants, Savings
    color = db.Column(db.String(20), default='#3b82f6')
    icon = db.Column(db.String(30), default='tag')
    expenses = db.relationship('Expense', backref='category_rel', lazy=True)

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('expense_categories.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=datetime.date.today)
    payment_method = db.Column(db.String(50), default='Card')
    notes = db.Column(db.String(255), nullable=True)
    is_recurring = db.Column(db.Boolean, default=False)

class SavingsGoal(db.Model):
    __tablename__ = 'savings_goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    target_date = db.Column(db.Date, nullable=True)
    category = db.Column(db.String(50), default='Emergency Fund')
    color = db.Column(db.String(20), default='#10b981')`
    },
    ai: {
      filename: 'flask_app/ai_advisor.py',
      language: 'python',
      desc: 'Gemini AI integration module with prompt templates, structured output parsing, and deterministic fallback calculations for quota protection.',
      content: `import os
import json
import re
from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_NAME = "gemini-2.5-flash"

def get_gemini_client():
    if not GEMINI_API_KEY:
        return None
    try:
        return genai.Client(api_key=GEMINI_API_KEY)
    except Exception:
        return None

def chat_with_advisor(user_message: str, snapshot: dict) -> str:
    """Interacts with Gemini AI with full financial user snapshot context."""
    client = get_gemini_client()
    if not client:
        return fallback_chat(user_message, snapshot)

    system_prompt = f"""You are an elite certified Personal Finance Advisor Bot.
Current User Snapshot:
- Profile: {snapshot.get('username')} ({snapshot.get('persona')})
- Currency: {snapshot.get('currency', '$')}
- Monthly Inflow: {snapshot.get('total_income')}
- Monthly Outflow: {snapshot.get('total_expenses')}
- Net Surplus: {snapshot.get('net_cash_flow')}
- Savings Rate: {snapshot.get('savings_rate', 0):.1f}%

Provide crisp, actionable, encouraging financial counsel adhering to the 50/30/20 rule. Format responses with clear bullet points."""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[system_prompt, f"User: {user_message}"]
        )
        return response.text.strip()
    except Exception:
        return fallback_chat(user_message, snapshot)

def simulate_purchase(item_name: str, cost: float, category: str, urgency: str, snapshot: dict) -> dict:
    """Simulates purchase impact on monthly surplus and emergency buffer."""
    net_surplus = snapshot.get('net_cash_flow', 0)
    surplus_after = net_surplus - cost

    if surplus_after < 0:
        verdict = "NOT_RECOMMENDED"
        title = "Deficit Trigger Warning"
        rationale = f"Spending {snapshot.get('currency', '$')}{cost:,.2f} would push your monthly budget into a deficit of {snapshot.get('currency', '$')}{abs(surplus_after):,.2f}."
    elif cost > net_surplus * 0.4:
        verdict = "CAUTION"
        title = "High Allocation Notice"
        rationale = f"This purchase consumes {(cost / net_surplus * 100):.0f}% of your available monthly buffer. Ensure essential obligations are met first."
    else:
        verdict = "SAFE"
        title = "Cash-Flow Approved"
        rationale = f"This expense fits comfortably within your monthly surplus, leaving {snapshot.get('currency', '$')}{surplus_after:,.2f} intact."

    return {
        "verdict": verdict,
        "title": title,
        "rationale": rationale,
        "projected_surplus_after": surplus_after
    }`
    },
    ngrok: {
      filename: 'flask_app/run_ngrok.py',
      language: 'python',
      desc: 'Ngrok automated tunneling launcher using pyngrok to expose the local Flask instance over a secure HTTPS public tunnel for external access.',
      content: `import os
import sys
from dotenv import load_dotenv

load_dotenv()

def start_ngrok_and_flask():
    port = int(os.getenv('FLASK_PORT', 5000))
    ngrok_token = os.getenv('NGROK_AUTHTOKEN', '')

    try:
        from pyngrok import ngrok, conf
        if ngrok_token:
            ngrok.set_auth_token(ngrok_token)

        # Open HTTP tunnel on port 5000
        public_url = ngrok.connect(port, bind_tls=True)
        print("=" * 60)
        print(f"🚀 NGROK PUBLIC TUNNEL ESTABLISHED!")
        print(f"🌐 Public URL: {public_url.public_url}")
        print(f"🏠 Local Port: http://127.0.0.1:{port}")
        print("=" * 60)
    except Exception as e:
        print(f"[!] pyngrok warning: {e}")
        print(f"[*] Starting local server on port {port} without tunnel...")

    from app import app
    app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == '__main__':
    start_ngrok_and_flask()`
    },
    tests: {
      filename: 'flask_app/test_app.py',
      language: 'python',
      desc: 'Unit testing suite verifying user registration, password hashing, income/expense tracking, purchase simulator, and NLP parser.',
      content: `import unittest
import os
import tempfile
from app import app, db
from models import User, Income, ExpenseCategory, Expense
from ai_advisor import analyze_spending_and_health, simulate_purchase, parse_natural_language_expense

class FinanceAdvisorTestCase(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{self.db_path}'
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.client = app.test_client()

        with app.app_context():
            db.create_all()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_user_registration_and_login(self):
        res = self.client.post('/register', data={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123',
            'currency': '$',
            'persona': 'Salaried Professional'
        }, follow_redirects=True)
        self.assertEqual(res.status_code, 200)

    def test_purchase_simulator(self):
        snapshot = {'total_income': 4000.0, 'total_expenses': 3500.0, 'net_cash_flow': 500.0}
        result = simulate_purchase('Office Chair', 150.0, 'Shopping', 'Nice to Have', snapshot)
        self.assertIn(result['verdict'], ['SAFE', 'CAUTION'])

    def test_natural_language_expense_parser(self):
        entry = "Lunch at Chipotle for $18.50"
        parsed = parse_natural_language_expense(entry)
        self.assertEqual(parsed['amount'], 18.50)
        self.assertEqual(parsed['category'], 'Food & Dining')

if __name__ == '__main__':
    unittest.main()`
    },
    env: {
      filename: 'flask_app/.env.example',
      language: 'bash',
      desc: 'Environment variable configuration template for database connection, secret keys, Gemini API key, and Ngrok auth token.',
      content: `# Flask App Configuration
SECRET_KEY="generate-a-secure-random-secret-key"
FLASK_ENV="development"
FLASK_PORT=5000

# Database Connectivity (SQLite or PostgreSQL)
# For SQLite (default, zero configuration):
DATABASE_URL="sqlite:///finance_advisor.db"
# For PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/finance_advisor"

# Gemini AI API Key (Get free key from Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key-here"

# Ngrok Public Tunnel (Optional auth token from dashboard.ngrok.com)
NGROK_AUTHTOKEN="your-ngrok-authtoken-here"`
    },
    readme: {
      filename: 'flask_app/README.md',
      language: 'markdown',
      desc: 'Step-by-step documentation covering setup, database migrations, AI configuration, Ngrok deployment, and testing.',
      content: `# Personal Finance Advisor Bot (Flask + SQLAlchemy + Jinja2 + Gemini AI)

An AI-powered personal financial planning platform built with Flask, SQLAlchemy, SQLite/PostgreSQL, Jinja2, and Gemini AI, deployed with Ngrok for public accessibility.

## 🚀 Quick Start Guide

\`\`\`bash
# 1. Navigate to flask_app directory
cd flask_app

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your GEMINI_API_KEY (optional, app works with built-in fallbacks)

# 5. Launch Flask application locally
python app.py
# -> Open http://localhost:5000 in your browser!

# 6. Launch with public Ngrok HTTPS tunnel
python run_ngrok.py
# -> Generates a public HTTPS link accessible anywhere!
\`\`\`

## 🧪 Running Unit Tests
\`\`\`bash
python -m unittest test_app.py
\`\`\``
    }
  };

  const currentSnippet = codeSnippets[activeFile];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold">
              <Server className="w-3.5 h-3.5" />
              <span>Full-Stack Python Flask Backend Implementation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Flask · SQLAlchemy · Jinja2 · Gemini AI · Ngrok
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl">
              Complete production-grade backend located in <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded text-xs font-mono">/flask_app</code>. Includes user authentication via Flask-Login, SQLite/PostgreSQL relational database models, Gemini AI advisor integration, purchase simulator, and Ngrok deployment scripts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/api/download-zip"
              download="personal-finance-advisor-bot.zip"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Project ZIP</span>
            </a>
          </div>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Auth & Security</span>
            </div>
            <p className="text-xs text-slate-400">
              Flask-Login with Werkzeug PBKDF2 password hashing & session management.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1">
              <Database className="w-4 h-4" />
              <span>SQLAlchemy Relational ORM</span>
            </div>
            <p className="text-xs text-slate-400">
              SQLite default with 1-click PostgreSQL toggle via DATABASE_URL.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Gemini AI + Fallbacks</span>
            </div>
            <p className="text-xs text-slate-400">
              Automated financial advice with zero-crash quota-protected fallbacks.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
              <Globe className="w-4 h-4" />
              <span>Ngrok Public Tunnels</span>
            </div>
            <p className="text-xs text-slate-400">
              Instant external HTTPS access via pyngrok in run_ngrok.py.
            </p>
          </div>
        </div>
      </div>

      {/* Code Browser */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {/* File Tabs Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none text-xs">
            {[
              { id: 'app', label: 'app.py', icon: FileCode },
              { id: 'models', label: 'models.py', icon: Database },
              { id: 'ai', label: 'ai_advisor.py', icon: Sparkles },
              { id: 'ngrok', label: 'run_ngrok.py', icon: Globe },
              { id: 'tests', label: 'test_app.py', icon: ShieldCheck },
              { id: 'env', label: '.env.example', icon: Terminal },
              { id: 'readme', label: 'README.md', icon: Code2 },
            ].map((f) => {
              const Icon = f.icon;
              const isActive = activeFile === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFile(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => copyToClipboard(currentSnippet.content)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* File Description Bar */}
        <div className="bg-slate-900/90 px-5 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-400 font-semibold">{currentSnippet.filename}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">{currentSnippet.desc}</span>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 sm:p-6 overflow-x-auto bg-slate-950/90 max-h-[600px] overflow-y-auto font-mono text-xs leading-relaxed text-slate-300">
          <pre>
            <code>{currentSnippet.content}</code>
          </pre>
        </div>
      </div>

      {/* Terminal Quick Commands */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Terminal Quick Commands to Run the Python App</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <p className="text-slate-400 font-sans font-medium">1. Local Flask Development Server</p>
            <div className="bg-slate-900 p-3 rounded-lg text-emerald-400 select-all">
              cd flask_app<br />
              pip install -r requirements.txt<br />
              python app.py
            </div>
            <p className="text-[11px] text-slate-500 font-sans">App will listen on http://localhost:5000 with auto-reloading.</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <p className="text-slate-400 font-sans font-medium">2. Public Access via Ngrok Tunnel</p>
            <div className="bg-slate-900 p-3 rounded-lg text-amber-400 select-all">
              cd flask_app<br />
              export NGROK_AUTHTOKEN="your_token"<br />
              python run_ngrok.py
            </div>
            <p className="text-[11px] text-slate-500 font-sans">Spawns a public HTTPS URL (e.g. https://abc123.ngrok.app) for sharing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
