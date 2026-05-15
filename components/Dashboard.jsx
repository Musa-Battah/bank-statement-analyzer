'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard({ analysis }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Total Income</div>
        <div className="stat-value positive">{formatCurrency(analysis.totalIncome)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Total Expenses</div>
        <div className="stat-value negative">{formatCurrency(analysis.totalExpenses)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Net Savings</div>
        <div className={`stat-value ${analysis.netSavings >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(analysis.netSavings)}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Savings Rate</div>
        <div className="stat-value">{analysis.savingsRate}%</div>
      </div>
    </div>
  );
}