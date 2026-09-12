const db = require('../config/database');

class RiskEngine {
  calculateRiskScore(txData, walletHistory = []) {
    let score = 0;
    const factors = [];

    // Factor 1: Transaction Value
    const value = parseFloat(txData.value) || 0;
    if (value > 100) {
      score += 25;
      factors.push({ name: 'High Transaction Value', contribution: 25, desc: `Value: ${value.toFixed(4)} ETH exceeds 100 ETH threshold` });
    } else if (value > 50) {
      score += 18;
      factors.push({ name: 'High Transaction Value', contribution: 18, desc: `Value: ${value.toFixed(4)} ETH exceeds 50 ETH threshold` });
    } else if (value > 10) {
      score += 10;
      factors.push({ name: 'Elevated Transaction Value', contribution: 10, desc: `Value: ${value.toFixed(4)} ETH exceeds 10 ETH threshold` });
    } else if (value > 1) {
      score += 5;
      factors.push({ name: 'Moderate Transaction Value', contribution: 5, desc: `Value: ${value.toFixed(4)} ETH` });
    }

    // Factor 2: Gas Price Anomaly
    const gasPrice = parseFloat(txData.gasPrice) || 0;
    if (gasPrice > 100) {
      score += 12;
      factors.push({ name: 'High Gas Price', contribution: 12, desc: `Gas price: ${gasPrice.toFixed(2)} Gwei indicates urgency` });
    } else if (gasPrice > 50) {
      score += 6;
      factors.push({ name: 'Elevated Gas Price', contribution: 6, desc: `Gas price: ${gasPrice.toFixed(2)} Gwei` });
    }

    // Factor 3: Contract Interaction (to is contract)
    if (txData.to && txData.input && txData.input !== '0x') {
      score += 8;
      factors.push({ name: 'Smart Contract Interaction', contribution: 8, desc: 'Transaction involves smart contract execution' });
    }

    // Factor 4: New/Unknown Wallet
    if (walletHistory.length === 0) {
      score += 15;
      factors.push({ name: 'Unknown Counterparty', contribution: 15, desc: 'Limited historical data available for counterparty' });
    }

    // Factor 5: Rapid Fund Movement (if we have history)
    const recentTxs = walletHistory.filter(w => {
      const txTime = w.timestamp || Date.now();
      return (Date.now() - txTime) < 3600000; // 1 hour
    });
    if (recentTxs.length > 5) {
      score += 20;
      factors.push({ name: 'Rapid Fund Movement', contribution: 20, desc: `${recentTxs.length} transactions in last hour` });
    } else if (recentTxs.length > 2) {
      score += 10;
      factors.push({ name: 'Elevated Activity', contribution: 10, desc: `${recentTxs.length} transactions in last hour` });
    }

    // Factor 6: Zero Value with Data (potential attack vector)
    if (value === 0 && txData.input && txData.input.length > 10) {
      score += 10;
      factors.push({ name: 'Zero Value with Payload', contribution: 10, desc: 'Transaction carries data with zero ETH transfer' });
    }

    // Factor 7: Failed Transaction
    if (txData.status === 'failed') {
      score += 5;
      factors.push({ name: 'Failed Transaction', contribution: 5, desc: 'Previous failed attempt may indicate probing' });
    }

    score = Math.min(100, Math.max(0, score));

    let level = 'LOW';
    if (score >= 80) level = 'CRITICAL';
    else if (score >= 60) level = 'HIGH';
    else if (score >= 30) level = 'MEDIUM';

    return { score, level, factors };
  }

  calculateWalletRisk(address, balance, txCount, transfers = []) {
    let score = 0;
    const factors = [];

    // Low balance but high activity
    if (balance < 0.01 && txCount > 100) {
      score += 20;
      factors.push({ name: 'High Activity Low Balance', contribution: 20, desc: 'Wallet shows high transaction count with minimal balance' });
    }

    // Very high transaction count
    if (txCount > 10000) {
      score += 15;
      factors.push({ name: 'Extremely High Activity', contribution: 15, desc: `${txCount} total transactions` });
    }

    // Large number of counterparties
    const uniqueCounterparties = new Set();
    transfers.forEach(t => {
      if (t.from) uniqueCounterparties.add(t.from.toLowerCase());
      if (t.to) uniqueCounterparties.add(t.to.toLowerCase());
    });
    if (uniqueCounterparties.size > 50) {
      score += 12;
      factors.push({ name: 'Many Counterparties', contribution: 12, desc: `Interacted with ${uniqueCounterparties.size} unique addresses` });
    }

    // Large outflows
    const totalOut = transfers
      .filter(t => t.from && t.from.toLowerCase() === address.toLowerCase())
      .reduce((sum, t) => sum + (parseFloat(t.value) || 0), 0);
    if (totalOut > 1000) {
      score += 18;
      factors.push({ name: 'Large Total Outflows', contribution: 18, desc: `${totalOut.toFixed(2)} ETH total sent` });
    }

    score = Math.min(100, Math.max(0, score));
    let level = 'LOW';
    if (score >= 80) level = 'CRITICAL';
    else if (score >= 60) level = 'HIGH';
    else if (score >= 30) level = 'MEDIUM';

    return { score, level, factors, counterpartyCount: uniqueCounterparties.size };
  }

  saveRiskFactors(txHash, factors) {
    const stmt = db.prepare(`
      INSERT INTO risk_factors (tx_hash, factor_name, contribution, description)
      VALUES (?, ?, ?, ?)
    `);
    factors.forEach(f => {
      try { stmt.run(txHash, f.name, f.contribution, f.desc); } catch (e) {}
    });
  }
}

module.exports = new RiskEngine();
