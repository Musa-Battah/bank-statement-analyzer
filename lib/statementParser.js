import Papa from 'papaparse';

// Categories and their keywords
const categoryKeywords = {
  'Food & Dining': ['restaurant', 'cafe', 'starbucks', 'mcdonald', 'pizza', 'food', 'grocery', 'supermarket', 'meal', 'lunch', 'dinner', 'breakfast'],
  'Transport': ['uber', 'lyft', 'taxi', 'bus', 'train', 'gas', 'fuel', 'parking', 'toll', 'subway'],
  'Shopping': ['amazon', 'walmart', 'target', 'best buy', 'mall', 'store', 'shop', 'ebay', 'alibaba', 'zara', 'h&m'],
  'Entertainment': ['netflix', 'spotify', 'disney', 'hulu', 'cinema', 'movie', 'concert', 'game', 'playstation', 'xbox'],
  'Bills & Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone bill', 'utility', 'rent', 'mortgage', 'wifi'],
  'Healthcare': ['pharmacy', 'doctor', 'hospital', 'clinic', 'medical', 'dental', 'health', 'medication', 'drugstore'],
  'Travel': ['flight', 'hotel', 'airbnb', 'booking', 'vacation', 'trip', 'airline', 'cruise'],
  'Income': ['salary', 'payroll', 'deposit', 'credit', 'payment received', 'transfer from', 'refund', 'reimbursement'],
  'Transfer': ['transfer', 'withdrawal', 'sent money', 'received money', 'zelle', 'venmo', 'paypal'],
  'Subscription': ['subscription', 'monthly fee', 'recurring', 'membership', 'premium'],
  'Coffee & Snacks': ['starbucks', 'dunkin', 'coffee', 'snack', 'pastry', 'bagel'],
  'Alcohol & Bars': ['bar', 'beer', 'wine', 'cocktail', 'brewery', 'liquor']
};

// Parse CSV file
export async function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const transactions = [];
        
        results.data.forEach(row => {
          // Try multiple possible column names
          const date = row.Date || row.date || row['Transaction Date'] || row.DATE || row['Date'];
          let amount = parseFloat(row.Amount || row.amount || row.Debit || row.Credit || row['Amount'] || 0);
          const description = row.Description || row.description || row.Narrative || row.Details || row['Payee'] || row['Merchant'] || '';
          
          // Handle credit/debit columns
          if (row.Debit && !amount) amount = -parseFloat(row.Debit);
          if (row.Credit && !amount) amount = parseFloat(row.Credit);
          
          if (date && amount !== 0 && description) {
            transactions.push({
              date: date,
              amount: amount,
              description: description.substring(0, 200),
              type: amount > 0 ? 'credit' : 'debit',
              category: 'Uncategorized'
            });
          }
        });
        
        resolve(transactions);
      },
      error: (error) => reject(error)
    });
  });
}

// Simple PDF text extraction (without complex parsing)
export async function parsePDF(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        // For PDF parsing, we'll use a simpler approach - just extract text
        // Since pdf-parse is problematic, we'll show a message to use CSV instead
        console.warn('PDF parsing is limited. Please use CSV format for better results.');
        reject(new Error('Please use CSV format for now. CSV files are fully supported.'));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

// Categorize transactions
export function categorizeTransactions(transactions) {
  return transactions.map(transaction => {
    const description = (transaction.description || '').toLowerCase();
    let category = 'Other';
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (description.includes(keyword.toLowerCase())) {
          category = cat;
          break;
        }
      }
      if (category !== 'Other') break;
    }
    
    // Special handling based on amount sign
    if (transaction.type === 'credit' && transaction.amount > 0) {
      if (category === 'Other') category = 'Income';
    } else if (transaction.type === 'debit' && transaction.amount < 0) {
      if (category === 'Other') category = 'Other Expenses';
    }
    
    return { ...transaction, category };
  });
}

// Analyze transactions
export function analyzeTransactions(transactions) {
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100).toFixed(1) : 0;
  
  // Find top spending category
  const categoryTotals = {};
  transactions.forEach(t => {
    if (t.amount < 0) {
      const amount = Math.abs(t.amount);
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
    }
  });
  
  let topCategory = 'None';
  let maxSpending = 0;
  for (const [cat, amount] of Object.entries(categoryTotals)) {
    if (amount > maxSpending) {
      maxSpending = amount;
      topCategory = cat;
    }
  }
  
  // Find most active day
  const dayTotals = {};
  transactions.forEach(t => {
    if (t.date) {
      const day = t.date;
      dayTotals[day] = (dayTotals[day] || 0) + Math.abs(t.amount);
    }
  });
  
  let mostActiveDay = 'None';
  let maxDayTotal = 0;
  for (const [day, total] of Object.entries(dayTotals)) {
    if (total > maxDayTotal) {
      maxDayTotal = total;
      mostActiveDay = day;
    }
  }
  
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  const averageTransaction = expenseTransactions.length > 0 
    ? totalExpenses / expenseTransactions.length 
    : 0;
  
  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate: parseFloat(savingsRate),
    topCategory,
    mostActiveDay,
    averageTransaction,
    transactionCount: transactions.length,
    expenseCount: expenseTransactions.length,
    incomeCount: transactions.filter(t => t.amount > 0).length
  };
}

// Generate sample CSV template
export function generateSampleCSV() {
  const sampleData = [
    { Date: '2024-01-15', Description: 'Starbucks Coffee', Amount: -15.50 },
    { Date: '2024-01-16', Description: 'Uber Ride', Amount: -25.00 },
    { Date: '2024-01-17', Description: 'Salary Deposit', Amount: 5000.00 },
    { Date: '2024-01-18', Description: 'Amazon Purchase', Amount: -120.00 },
    { Date: '2024-01-19', Description: 'Netflix Subscription', Amount: -15.99 },
    { Date: '2024-01-20', Description: 'Grocery Store', Amount: -85.00 },
    { Date: '2024-01-21', Description: 'Electric Bill', Amount: -95.00 },
    { Date: '2024-01-22', Description: 'Restaurant Dinner', Amount: -65.00 }
  ];
  
  const csv = Papa.unparse(sampleData);
  return csv;
}