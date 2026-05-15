'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548', '#607D8B'];

export default function CategoryBreakdown({ categories, totalExpenses }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const pieData = categories.map(cat => ({
    name: cat.name,
    value: cat.total,
    percentage: cat.percentage
  }));

  return (
    <div className="card">
      <h3 className="card-title">Spending by Category</h3>
      
      {pieData.length > 0 && (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      )}
      
      <div className="categories-grid">
        {categories.map(cat => (
          <div key={cat.name} className="category-item">
            <span className="category-name">{cat.name}</span>
            <span className="category-amount">{formatCurrency(cat.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}