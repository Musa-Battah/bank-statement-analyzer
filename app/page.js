'use client';

import { useState } from 'react';
import { parseCSV, parsePDF, analyzeTransactions, categorizeTransactions, generateSampleCSV } from '@/lib/statementParser';
import Dashboard from '@/components/Dashboard';
import TransactionsList from '@/components/TransactionsList';
import CategoryBreakdown from '@/components/CategoryBreakdown';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [categories, setCategories] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      let parsedTransactions = [];
      const fileType = file.name.split('.').pop().toLowerCase();
      
      if (fileType === 'csv') {
        parsedTransactions = await parseCSV(file);
      } else if (fileType === 'pdf') {
        parsedTransactions = await parsePDF(file);
      } else {
        setError('Please upload a CSV or PDF file');
        setLoading(false);
        return;
      }
      
      if (parsedTransactions.length === 0) {
        setError('No transactions found in file. Please check the format.');
        setLoading(false);
        return;
      }
      
      // Categorize transactions
      const categorized = categorizeTransactions(parsedTransactions);
      setTransactions(categorized);
      
      // Analyze transactions
      const stats = analyzeTransactions(categorized);
      setAnalysis(stats);
      
      // Get category breakdown
      const categoryData = getCategoryBreakdown(categorized, stats);
      setCategories(categoryData);
      
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Failed to parse file. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBreakdown = (transactions, stats) => {
    const breakdown = {};
    transactions.forEach(t => {
      if (t.amount < 0) { // Only expenses
        const amount = Math.abs(t.amount);
        if (!breakdown[t.category]) {
          breakdown[t.category] = { total: 0, count: 0, transactions: [] };
        }
        breakdown[t.category].total += amount;
        breakdown[t.category].count++;
        breakdown[t.category].transactions.push(t);
      }
    });
    
    return Object.entries(breakdown).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      percentage: stats.totalExpenses > 0 ? (data.total / stats.totalExpenses) * 100 : 0
    })).sort((a, b) => b.total - a.total);
  };

  const downloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-bank-statement.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Upload Section */}
      <div className="upload-area" onClick={() => document.getElementById('fileInput').click()}>
        <div className="upload-icon">📁</div>
        <div className="upload-text">Click or drag to upload bank statement</div>
        <div className="upload-subtext">Supports CSV files (PDF support coming soon)</div>
        <input
          id="fileInput"
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </div>
      
      {/* Sample CSV Download */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={downloadSampleCSV}
          className="btn-secondary"
          style={{ fontSize: '14px' }}
        >
          📥 Download Sample CSV Template
        </button>
      </div>
      
      {error && (
        <div className="card" style={{ backgroundColor: 'rgba(255,68,68,0.1)', borderColor: '#ff4444' }}>
          <div style={{ color: '#ff4444' }}>⚠️ {error}</div>
        </div>
      )}
      
      {loading && (
        <div className="loading">
          <div>📊 Processing your statement...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', color: '#888' }}>This may take a moment</div>
        </div>
      )}
      
      {analysis && transactions.length > 0 && (
        <>
          <Dashboard analysis={analysis} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <CategoryBreakdown categories={categories} totalExpenses={analysis.totalExpenses} />
            <div className="card">
              <h3 className="card-title">Quick Insights</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #222' }}>
                  💰 Highest spending: <strong>{analysis.topCategory}</strong>
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #222' }}>
                  📅 Most active day: <strong>{analysis.mostActiveDay}</strong>
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #222' }}>
                  🏦 Average transaction: ${analysis.averageTransaction.toFixed(2)}
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid #222' }}>
                  📊 Total transactions: <strong>{analysis.transactionCount}</strong>
                </li>
                <li style={{ padding: '10px 0' }}>
                  📈 Savings rate: <strong>{analysis.savingsRate}%</strong>
                </li>
              </ul>
            </div>
          </div>
          
          <TransactionsList transactions={transactions.slice(0, 20)} />
          
          {transactions.length > 20 && (
            <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '20px' }}>
              <button 
                onClick={() => {
                  // Show all transactions - could implement modal or expand
                  alert(`Total ${transactions.length} transactions. Upgrade to view all.`);
                }}
                className="btn-secondary"
              >
                View All {transactions.length} Transactions →
              </button>
            </div>
          )}
        </>
      )}
      
      {!analysis && !loading && !error && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
          <h3>Welcome to Bank Statement Analyzer</h3>
          <p style={{ color: '#888', marginTop: '10px' }}>
            Upload your bank statement (CSV format) to get started.<br />
            Download the sample template to see the expected format.
          </p>
        </div>
      )}
    </div>
  );
};