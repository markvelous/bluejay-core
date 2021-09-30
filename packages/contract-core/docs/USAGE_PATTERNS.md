slither contracts/Ledger.sol --print human-summary
slither contracts/Ledger.sol

1. Basic Scan
2. Usage pattern
3. Events
4. Parameter restrictions


Ledger

As a user:
- know my own internal stablecoin balance
- know my non-normalized debt
- know my collateral posted

System owner:
- know overall debt drawn (for calculating stability fee)
- know unbacked debt
- 