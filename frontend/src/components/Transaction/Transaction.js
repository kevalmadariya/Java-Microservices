// Transaction.js
const Transaction = ({ transaction }) => {
    return (
      <div className="transaction">
        <p>Transaction ID: {transaction.transactionId}</p>
        <p>User ID: {transaction.userId}</p>
        <p>Symbol: {transaction.symbol}</p>
        <p>Shares: {transaction.shares}</p>
        <p>Transaction Type: {transaction.transactionType}</p>
        <p>Price: {transaction.price}</p>
        <p>Total Value: {transaction.totalValue}</p>
        <p>Timestamp: {new Date(transaction.timestamp).toLocaleString()}</p>
      </div>
    );
  };
  
  export default Transaction;
  