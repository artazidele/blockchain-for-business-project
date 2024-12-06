import React from 'react';
import { useEffect, useState } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';
import DonationTokenContract from '../../contracts/DonationToken.json';

const { ethers } = require("ethers");

export function Admin() {

    const [newCharity, setNewCharity] = useState("");
    const [existingCharity, setExistingCharity] = useState("");
    const [account, setAccount] = useState("");

    useEffect(() => {
        requestAccount();
    }, []);

    async function requestAccount() {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
        } else {
            const currentAccount = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const uppercaseAddress = ethers.utils.getAddress(account[0]);
            setAccount(uppercaseAddress);
        }
    }

    async function createNewCharityPlatform() {
        localStorage.removeItem('signer');
        localStorage.removeItem('contract');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const providerSigner = await provider.getSigner();

        const abi = DonationTokenContract.abi;
        const bytecode = DonationTokenContract.bytecode;
        const factory = new ethers.ContractFactory(abi, bytecode, providerSigner)
        const contract = await factory.deploy();
            
        const platformAbi = CharityPlatformContract.abi;
        const platformBytecode = CharityPlatformContract.bytecode;
        const platformFactory = new ethers.ContractFactory(platformAbi, platformBytecode, providerSigner)
        const platformContract = await platformFactory.deploy(contract.address);
            
        const address = await providerSigner.getAddress();
        localStorage.setItem('contract', platformContract.address);
        localStorage.setItem('signer', address);
    }

    async function addCharityRole() {
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('signer');
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const contract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
            await contract.addCharity(newCharity);
            setNewCharity("");
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function removeCharityRole() {
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('signer');
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const contract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
            await contract.removeCharity(existingCharity);
            setExistingCharity("");
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div className="">
            <h3 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>Hello, Admin!</h3>
            {account && <div>
                <div className='bg-white p-6 rounded-lg border-solid border-2 border-coffee_5'>
                    <p className='pb-2 text-xl my-12'>Here you can create new charity platform, and add or remove charity role to any account.</p>
                    <p className='pb-12 font-semibold'>Your account address: {account}</p>
                    <div className='flex flex-col'>
                        <div className='border-t-2 border-coffee_1 py-12 text-center'>
                            <p className='pb-2 text-xl'>To create completely new system, click the button "Create New Charity Platform". This action will delete all previously created projects.</p>
                            <button className="bg-white text-center mt-6 hover:text-white hover:bg-red-900 hover:border-red-900 font-semibold text-red-900 py-2 px-4 border-2 border-red-900 rounded-lg" onClick={createNewCharityPlatform}>Create New Charity Platform</button>
                        </div>
                        <div className='border-t-2 border-coffee_1 py-12'>
                            <p className='pb-2 text-xl'>To add new charity role, type a new address and click the button "Add Charity Role".</p>
                            <div className="mt-6 flex items-center justify-between gap-2">
                                <label className='font-semibold'>New charity address:</label>
                                <input value={newCharity} onChange={e => setNewCharity(e.target.value)} className="p-2 bg-transparent border-b-solid border-b-2 border-b-coffee_5 grow"/>                    
                            </div>
                            <button className="float-right bg-white text-center mt-6 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg" onClick={addCharityRole}>Add Charity Role</button>
                        </div>
                        <div className='border-t-2 border-coffee_1 py-12'>
                            <p className='pb-2 text-xl'>To remove existing charity role, type the address and click the button "Remove Charity Role".</p>                        
                            <div className="mt-6 flex items-center justify-between gap-2">
                                <label className='font-semibold'>Existing charity address:</label>
                                <input value={existingCharity} onChange={e => setExistingCharity(e.target.value)} className="p-2 bg-transparent border-b-solid border-b-2 border-b-coffee_5 grow"/>                    
                            </div>
                            <button className="float-right bg-white text-center mt-6 hover:text-white hover:bg-red-900 hover:border-red-900 font-semibold text-red-900 py-2 px-4 border-2 border-red-900 rounded-lg" onClick={removeCharityRole}>Remove Charity Role</button>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
};