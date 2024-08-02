const { ethers } = require('ethers');
const { log } = require('../utils/logger');
const fs = require('fs');

async function mintPhase0() {
    const rawTransactionData = "0x57bc3d780000000000000000000000000006f67c5936c337d2335ac75ac953e6ed9994e600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
    const contractAddress = '0xEEDec37F316386bbec315B5D9F1c718FB66F64c4';
    const transactionValue = ethers.utils.parseEther("0.0003"); 

    let privateKeys = process.env.PRIVATE_KEY;
    if (!privateKeys) {
        throw new Error('PRIVATE_KEY not set in .env');
    }

    privateKeys = JSON.parse(privateKeys);

    const networkConfig = JSON.parse(fs.readFileSync('./config/network.json', 'utf-8'));
    const selectedNetwork = networkConfig['Superseed Testnet'];
    const { RPC_URL, CHAIN_ID } = selectedNetwork;

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);

    for (let i = 0; i < privateKeys.length; i++) {
        const privateKey = privateKeys[i];
        const wallet = new ethers.Wallet(privateKey, provider);

        try {
            const balance = await provider.getBalance(wallet.address);
            log('INFO', `Wallet ${i + 1}: ${wallet.address} | balance: ${ethers.utils.formatEther(balance)} ETH`);

            const requiredBalance = transactionValue.add(ethers.utils.parseEther("0.0005"));
            if (balance.lt(requiredBalance)) {
                log('ERROR', `Wallet ${i + 1}: Insufficient balance for transaction and gas: ${ethers.utils.formatEther(balance)} ETH`);
                continue;
            }

            const gasPrice = await provider.getGasPrice();

            const tx = await wallet.sendTransaction({
                to: contractAddress,
                value: transactionValue,
                data: rawTransactionData,
                gasLimit: 300000, 
                gasPrice: gasPrice
            });
            await tx.wait();
            log('SUCCESS', `Wallet ${i + 1}: Mint successfully: https://sepolia-explorer.superseed.xyz/tx/${tx.hash}`);

        } catch (error) {
            log('ERROR', `Wallet ${i + 1}: Error sending mint transaction: ${error.message}`);
        
        }
    }
}

module.exports = mintPhase0;
