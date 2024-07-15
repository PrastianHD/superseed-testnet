const { ethers } = require('ethers');
const readline = require('readline');
const chalk = require('chalk');
const fs = require('fs');
const { log } = require('../utils/logger');

async function promptUser(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() { 
    const minDelay = 10; 
    const maxDelay = 100; 
    return Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
}

function generateRandomAmount() {
    const amounts = Math.floor(Math.random() * 90) + 10; // Menghasilkan angka acak antara 10 dan 100
    const amountInETH = "0.0000000" + amounts.toString().padStart(2, '0'); // Memastikan dua angka desimal
    return ethers.utils.parseUnits(amountInETH, 'ether'); // Konversi ke wei
}

function generateRandomAmountString() {
    const amounts = Math.floor(Math.random() * 90) + 10;
    const amountInETH = "0.0000000" + amounts.toString().padStart(2, '0');
    return amountInETH;
}

async function getTransactionCount() {
    const count = await promptUser(chalk.blue('Berapa banyak transaksi, misalnya 100: '));
    const transactionCount = parseInt(count, 10);
    if (isNaN(transactionCount) || transactionCount <= 0) {
        console.log(chalk.red('Jumlah transaksi tidak valid, menggunakan nilai default 10.'));
        return 10;
    } else {
        return transactionCount;
    }
}

async function executeTransactions(contractWETH, transactionCount, log) {
    let successCount = 0;
    let totalAttempts = 0;

    while (successCount < transactionCount) {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                if (totalAttempts % 2 === 0) {
                    const deposit = await contractWETH.deposit({ value: generateRandomAmount() });
                    successCount++;
                    log('SUCCESS', `Transaksi ${successCount} dengan hash: ${deposit.hash}`);
                    await delay(randomDelay());
                } else {
                    const withdraw = await contractWETH.withdraw(ethers.utils.parseEther(generateRandomAmountString()));
                    successCount++;
                    log('SUCCESS', `Transaksi ${successCount} dengan hash: ${withdraw.hash}`);
                    await delay(randomDelay());
                }
                break;
            } catch (error) {
                retryCount++;
                log('ERROR', `Kesalahan saat mengirim transaksi, coba ulang ${retryCount}: ${error.message}`);
                await delay(100); 
            }
        }
        totalAttempts++;
        await delay(100); 
    }
}

async function addWethAddressToNetwork(networkName) {
    const networkConfig = JSON.parse(fs.readFileSync('./config/network.json', 'utf-8'));
    const wethAddress = await promptUser('Masukkan Alamat WETH: ');

    if (!networkConfig[networkName]) {
        throw new Error(`Network dengan nama ${networkName} tidak ditemukan dalam konfigurasi`);
    }

    networkConfig[networkName].WETH_ADDRESS = wethAddress;

    fs.writeFileSync('./config/network.json', JSON.stringify(networkConfig, null, 2));
    console.log(chalk.greenBright('Alamat WETH berhasil ditambahkan!'));
}

async function interactWeth(RPC_URL, CHAIN_ID, WETH_ADDRESS, networkName) {

    let privateKeys = process.env.PRIVATE_KEY;
    if (!privateKeys) {
        throw new Error('PRIVATE_KEY tidak diset di file .env');
    }

    privateKeys = JSON.parse(privateKeys);

    const transactionCount = await getTransactionCount();
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL, CHAIN_ID);

    for (const privateKey of privateKeys) {
        const wallet = new ethers.Wallet(privateKey, provider);

        const balance = await provider.getBalance(wallet.address);
        log('INFO', `Memeriksa saldo ETH dari ${wallet.address}`);
        await delay(2000);
        log('DEBUG', `Saldo ETH: ${ethers.utils.formatEther(balance)} ETH`);
        await delay(3000);

        const abiWETH = [
            "function balanceOf(address) view returns (uint)",
            "function deposit() payable",
            "function transfer(address, uint) returns (bool)",
            "function withdraw(uint)",
            "function approve(address, uint) returns (bool)",
        ];

        let contractWETH;
        if (!WETH_ADDRESS) {
            await addWethAddressToNetwork(networkName);
            const networkConfig = JSON.parse(fs.readFileSync('./config/network.json', 'utf-8'));
            contractWETH = new ethers.Contract(networkConfig[networkName].WETH_ADDRESS, abiWETH, wallet);
        } else {
            contractWETH = new ethers.Contract(WETH_ADDRESS, abiWETH, wallet);
        }

        log('INFO', `Memulai transaksi dari wallet ${wallet.address}`);
        await executeTransactions(contractWETH, transactionCount, log);
    }
}

module.exports = interactWeth;
