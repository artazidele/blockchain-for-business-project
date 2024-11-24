import React from 'react';
import { useEffect, useState } from 'react';
import SimpleStorageContract from '../contracts/SimpleStorage.json';

const { ethers } = require("ethers");

export function Test2() {
    const [account, setAccount] = useState('');
    const [result, setResult] = useState(null);
    const [contractResult, setContractResult] = useState(null);
    const [balance, setBalance] = useState('');

    async function requestAccount() {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
        } else {
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(account[0]);
        }
    }

    useEffect(() => {
        requestAccount();
    }, []);

    useEffect(() => {
        requestBalance();
    }, [account]);

    async function requestBalance() {
        if (account) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const newBalance = await provider.getBalance(account.toString());
            setBalance(ethers.formatEther(newBalance));
        }
    }

    async function sendTransaction() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const tx = await signer.sendTransaction({
            to: "0xf8ac046254d706d3b3187511658F49c0886dB341",
            value: ethers.parseEther("3.0")
        });
          
        const receipt = await tx.wait();
        setResult(ethers.formatEther(receipt.fee.toString()));
        requestBalance();
    }

    async function createContract() {

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const abi = SimpleStorageContract.abi;
        const bytecode = SimpleStorageContract.bytecode;

        const factory = new ethers.ContractFactory(abi, bytecode, signer)
        const contract = await factory.deploy();

        const setValue = await contract.set(ethers.parseEther("3.0"));
        await setValue.wait();

        const value = await contract.get();


        console.log(value);
    }

    return (
        <div className="">
            {account && <p>Account: {account}</p>}
            {balance && <p>Balance: {balance}</p>}
            <button onClick={sendTransaction}>SEND TRANSACTION</button>
            {result && <p>{result}</p>}
            <button onClick={createContract}>CONTRACT</button>
            {contractResult && <p>{contractResult}</p>}
        </div>
    );
};