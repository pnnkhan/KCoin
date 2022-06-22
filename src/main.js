const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
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

    createTransaction(transaction){
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

let KCoin = new Blockchain();

KCoin.createTransaction(new Transaction('address1', 'address2', 100));
KCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\nStart mining...')
KCoin.miningPendingTransactions('Khan')

console.log('Balance of Khan is: ', KCoin.getBalanceOfAddress('Khan'))

console.log('\nStart mining again...')
KCoin.miningPendingTransactions('Khan')

console.log('Balance of Khan is: ', KCoin.getBalanceOfAddress('Khan'))