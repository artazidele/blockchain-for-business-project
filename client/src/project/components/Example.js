import React, { useState } from 'react';
import { ethers } from 'ethers';

const ERC20_ABI = [
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)"
];

const contractAddress = "0x847005165744E719e0881ab0Bb455Be265908Adf"; // Replace with your ERC20 contract address

export function Example() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('');
  const [status, setStatus] = useState('');

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const userAddress = accounts[0];

      // Get token balance of the user
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      setBalance(ethers.utils.formatUnits(balance, 18));  // assuming the token has 18 decimals
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Send token transfer
  const sendToken = async () => {
    if (!recipient || !amount) {
      setStatus('Please fill in all fields.');
      return;
    }

    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);

        const tx = await contract.transfer(
          recipient,
          ethers.utils.parseUnits(amount, 18)  // assuming the token has 18 decimals
        );

        setStatus(`Transaction sent! Hash: ${tx.hash}`);
        await tx.wait();  // wait for the transaction to be mined
        setStatus('Transaction confirmed!');
      } else {
        alert('MetaMask is not installed');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <h1>ERC20 Token Transfer</h1>

      {/* Connect Button */}
      <button onClick={connectWallet}>Connect Wallet</button>

      <div>
        <p>Your Balance: {balance} Tokens</p>

        {/* Recipient and Amount Input */}
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* Transfer Button */}
        <button onClick={sendToken}>Send Token</button>

        {/* Status Message */}
        <p>{status}</p>
      </div>
    </div>
  );
}

