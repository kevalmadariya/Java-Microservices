// import React, { useEffect } from 'react';
// import ApexCharts from 'apexcharts';
// import Navbar from '../Navbar/Navbar';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'semantic-ui-css/semantic.min.css';
// import './Portfolio.css';
// // import { Navbar } from 'react-bootstrap';
// // import './styles/trade_stocks.css';
// // import './styles/dashboard.css';
// // import './styles/bootstrap.min.css';
// // import './styles/icons.min.css';
// // import './styles/fontawesome.min.css';
// // import './styles/tailwind.min.css';


// const Portfolio = ({
//   cashBalance = 0,
//   totalPortfolioValue = 0,
//   totalInvestment = 0,
//   totalUnrealizedPNL = 0,
//   CAGR = 0,
//   MaxDrawdown = 0,
//   SharpeRatio = 0,
//   WinRate = 0,
//   dailyChangePercent = 0,
//   totalUnrealizedPNLPercent = 0,
//   holdings = [],
//   assetCounts = { Stocks: 0, ETFs: 0, "Index Funds": 0 }
// }) => {

//   // useEffect(() => {
//   //   const pnlPositive = holdings.reduce((sum, c) => sum + (c.UnrealizedPNL >= 0 ? c.UnrealizedPNL : 0), 0);
//   //   const pnlNegative = holdings.reduce((sum, c) => sum + (c.UnrealizedPNL < 0 ? -c.UnrealizedPNL : 0), 0);

//   //   const unrealizedOptions = {
//   //     series: [pnlPositive, pnlNegative],
//   //     chart: { type: 'pie', height: 340, width: 340 },
//   //     labels: ['Profitable Holdings', 'Losing Holdings'],
//   //     colors: ['#34c38f', '#f46a6a']
//   //   };
//   //   new ApexCharts(document.querySelector("#unrealized-pnl-chart"), unrealizedOptions).render();

//   //   const assetOptions = {
//   //     series: [assetCounts.Stocks, assetCounts.ETFs, assetCounts["Index Funds"]],
//   //     chart: { type: 'pie', height: 300, width: 300 },
//   //     labels: ['Stocks', 'ETFs', 'Index Funds'],
//   //     colors: ['#ff7f50', '#8a2be2', '#228b22']
//   //   };
//   //   new ApexCharts(document.querySelector("#asset-type-chart"), assetOptions).render();
//   // }, [holdings, assetCounts]);

//   return (
//     <>

//       <Navbar />

//     </>
//   );
// };

// export default Portfolio;



import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import "./Portfolio.css"; // custom styles

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem('userId') || "123"

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const [portfolioRes, holdingsRes] = await Promise.all([
          fetch(`http://localhost:8081/portfolio-microservice/api/portfolio/${userId}`),
          fetch(`http://localhost:8081/portfolio-microservice/api/stock-holdings/user/${userId}`)
        ]);

        const portfolioData = await portfolioRes.json();
        const holdingsData = await holdingsRes.json();

        console.log(holdingsRes)
        console.log(portfolioRes)
        setPortfolio(portfolioData);
        setHoldings(holdingsData);
      } catch (err) {
        console.error("Error fetching portfolio data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [userId]);

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <h2 className="mb-4 text-primary">📊 Portfolio Overview</h2>

        {isLoading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <>
            {portfolio && (
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Total Invested</h6>
                      <h5 className="card-title text-success">${portfolio.investedAmount.toFixed(2)}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Balance</h6>
                      <h5 className="card-title text-primary">${portfolio.balance.toFixed(2)}</h5>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 text-muted">Profit / Loss</h6>
                      <h5 className={`card-title ${portfolio.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        ${portfolio.pnl.toFixed(2)}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h4 className="mb-3">📁 Stock Holdings</h4>
            <div className="table-responsive">
              <table className="table table-bordered table-hover table-striped custom-table">
                <thead className="table-light">
                  <tr>
                    <th>Stock</th>
                    <th>Shares</th>
                    <th>Investment</th>
                    <th>Avg Buy Price</th>
                    <th>PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding) => (
                    <tr key={holding.holdingId}>
                      <td>{holding.stockId}</td>
                      <td>{holding.numberOfShares}</td>
                      <td>${holding.investmentAmount.toFixed(2)}</td>
                      <td>${holding.averageBuyPrice.toFixed(2)}</td>
                      <td>${holding.pnl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Portfolio;
