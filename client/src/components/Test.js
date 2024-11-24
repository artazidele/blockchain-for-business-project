import React from 'react';
import { useEffect, useState } from 'react';

const { ethers } = require("ethers");

export function Test() {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [blockNumber, setBlockNumber] = useState('');
    const [result, setResult] = useState(null);

    async function requestAccount() {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
        } else {
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(account[0]);
        }
    }

    async function requestBlockNumber() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const newBlockNumber = await provider.getBlockNumber();
        setBlockNumber(newBlockNumber);
    }

    async function requestBalance() {
        if (account) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const newBalance = await provider.getBalance(account.toString());
            // const newBalance = await provider.getBalance("0x15faa99e68f256cfc6a61703c1b209aac059254b");
            setBalance(ethers.formatEther(newBalance));
        }
    }

    useEffect(() => {
        requestAccount();
    }, []);

    useEffect(() => {
        requestBalance();
        requestBlockNumber();
    }, [account]);

    async function callFunction() {
        sendTransaction();
    }

    async function sendTransaction() {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
            to: "0xf8ac046254d706d3b3187511658F49c0886dB341",
            value: ethers.parseEther("1.0")
        });
          
        const receipt = await tx.wait();
        setResult(ethers.formatEther(receipt.fee.toString()));
        requestBalance();
    }

    async function createContract() {
        
    }

    return (
        <div className="">
            {account && <p>Account: {account}</p>}
            {balance && <p>Balance: {balance}</p>}
            {blockNumber && <p>Block Number: {blockNumber}</p>}
            <button onClick={callFunction}>BUTTON</button>
            {result && <p>{result}</p>}
        </div>
    );
};