const {Blockchain, Transaction} = require('./blockchain')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('3df2b58ea4f4745ff106081bf403aaa646dec1caab41bad1cdd1ee00a499f0db');
const myWalletAddress = myKey.getPublic('hex');

let KCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
KCoin.addTransaction(tx1);

console.log('\nStart mining...');
KCoin.miningPendingTransactions(myWalletAddress);

console.log('Balance of xavier is: ', KCoin.getBalanceOfAddress(myWalletAddress));