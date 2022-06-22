const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    caculateHash(){
      return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
      if(signingKey.getPublic('hex') !== this.fromAddress){
        throw new Error('You cannot  sign transaction for other wallets!');
      }

      const hashTx = this.caculateHash();
      const sig = signingKey.sign(hashTx,'base64');
      this.signature = sig.toDER('hex');
    }

    isValid(){
      if(this.fromAddress === null) return true;

      if(!this.signature || this.signature.length === 0){
        throw new Error('No sign in this transaction');
      }

      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
      return publicKey.verify(this.caculateHash(), this.signature);
    }
}
class Block{
    constructor(timestamp, transaction, previousHash = ''){
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.hash = this.caculateHash();
        this.nonce = 0;
    }

    caculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.caculateHash();
        }

        console.log('Block mined: ' + this.hash);
    }

    hasValidTransaction(){
      for(const tx of this.transaction){
        if(!tx.isValid()){
            return false;
        }
      }

      return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 0;
        this.pendingTransaction = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block(0, "01/01/2022", "Genesis block", "0");
    }

    getLastestBlock(){
        return this.chain[this.chain.length - 1];
    }

    miningPendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransaction);
        block.mineBlock(this.difficulty);

        console.log('Block sucessfully mined!');
        this.chain.push(block);

        this.pendingTransaction = [new Transaction(null, miningRewardAddress, this.miningReward)];
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
          throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error ('Cannot add invaid transaction to chain');
        }
        this.pendingTransaction.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transaction) {
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid(){
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransaction()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.caculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;