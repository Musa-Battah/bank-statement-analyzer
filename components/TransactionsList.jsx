'use client';

export default function TransactionsList({ transactions }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  return (
    <div className="card">
      <h3 className="card-title">Recent Transactions</h3>
      <div className="table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, idx) => (
              <tr key={idx}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td>
                  <span style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {transaction.category}
                  </span>
                </td>
                <td className={transaction.amount > 0 ? 'transaction-credit' : 'transaction-debit'}>
                  {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}