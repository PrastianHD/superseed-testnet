const { ethers } = require('ethers');
const readline = require('readline');
const chalk = require('chalk');
const { log } = require('../utils/logger');

async function promptUser(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(chalk.blueBright(question), (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateRandomAmount() {
    const amounts = Math.floor(Math.random() * 11) + 10;
    return ethers.utils.parseUnits("0.0000000000000000" + amounts, 'ether');
}

function generateRandomAddress() {
    const randomWallet = ethers.Wallet.createRandom();
    return randomWallet.address;
}

function generateMultipleRandomAddresses(count) {
    return Array.from({ length: count }, generateRandomAddress);
}

async function transferEth(RPC_URL) {
    const addressCount = parseInt(await promptUser('How many transactions, for example 100: '), 10);

    let privateKeys = process.env.PRIVATE_KEY;
    if (!privateKeys) {
        throw new Error('PRIVATE_KEY not set in .env file');
    }

    privateKeys = JSON.parse(privateKeys);

    let provider;
    try {
        provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        await provider.getNetwork(); 
    } catch (error) {
        log('ERROR', `Failed to connect to the network: ${error.message}`);
        process.exit(1);
    }

    for (const privateKey of privateKeys) {
        const wallet = new ethers.Wallet(privateKey, provider);
        const balance = await provider.getBalance(wallet.address);
        log('DEBUG', `Current ETH balance of ${wallet.address}: ${ethers.utils.formatEther(balance)} ETH`);

        const randomAddresses = generateMultipleRandomAddresses(addressCount);
        log('INFO', `Starting ETH transfers from wallet ${wallet.address}...`);
        await delay(1000);

        let nonce = await provider.getTransactionCount(wallet.address);

        async function sendTransactions() {
            let successCount = 0;

            for (const recipient of randomAddresses) {
                let retryCount = 0;
                const maxRetries = 3;

                while (retryCount < maxRetries) {
                    try {
                        const tx = {
                            to: recipient,
                            value: generateRandomAmount(),
                            nonce: nonce
                        };

                        const gasLimit = await wallet.estimateGas(tx);
                        tx.gasLimit = gasLimit;

                        const gasPrice = await provider.getGasPrice();
                        tx.gasPrice = gasPrice;

                        const txResponse = await wallet.sendTransaction(tx);

                        successCount++;
                        log('SUCCESS', `Transaction ${successCount} with hash: ${txResponse.hash}`);
                        nonce++;
                        break;
                    } catch (error) {
                        retryCount++;
                        let errorMessage = error.message;
                        if (error.code === ethers.errors.INSUFFICIENT_FUNDS) {
                            errorMessage = 'INSUFFICIENT_FUNDS';
                        }
                        if (error.code === ethers.errors.SERVER_ERROR) {
                            errorMessage = 'Service Temporarily Unavailable';
                        }
                        log('ERROR', `Error sending transaction to ${recipient}: ${errorMessage}`);
                        await delay(500);
                    }
                }

                await delay(10);
            }
        }

        await sendTransactions();
    }
}

module.exports = transferEth;
