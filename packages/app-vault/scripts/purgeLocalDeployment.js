const fs = require("fs");

const path = `./src/fixtures/deployment`;
const contractPath = `${path}/contracts.json`;
const transactionPath = `${path}/transactions.json`;

const currentContracts = JSON.parse(fs.readFileSync(contractPath).toString());
const newContracts = { ...currentContracts, local: {} }

const currentTransactions = JSON.parse(fs.readFileSync(transactionPath).toString());
const newTransactions = { ...currentTransactions, local: {} }

fs.writeFileSync(contractPath, JSON.stringify(newContracts, null, 2))
fs.writeFileSync(transactionPath, JSON.stringify(newTransactions, null, 2))