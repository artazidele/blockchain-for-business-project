import React from 'react';
import { useEffect, useState } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';

const { ethers } = require("ethers");

export function Project() {
    const [account, setAccount] = useState('');

    const [amount, setAmount] = useState();
    const [charityAddress, setCharityAddress] = useState();
    

    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);

    const id = window.location.href.split('/')[3];

    useEffect(() => {
        getProject();
        requestAccount();
    }, []);

    async function requestAccount() {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
        } else {
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(account[0]);
            console.log(account[0]);
        }
    }

    async function getProject() {
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const projectWithId = await thisContract.getProject(id);
            setProject(projectWithId);
            setCharityAddress(projectWithId.charityAddress);
            console.log(projectWithId.charityAddress);

            const milestoneCount = projectWithId.milestoneCount.toString();
            const milestoneArray = [];
            for (let i=0; i<milestoneCount; i++) {
                const milestoneWithId = await thisContract.getMilestone(id, i);
                milestoneArray.push(milestoneWithId);
            }
            setMilestones(milestoneArray);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function deactivateProject() {
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
            const project = await thisContract.deactivateProject(id);
            await project.wait();
            getProject();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function donate(e) {
        e.preventDefault();
        // input validation
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');
        const amountInt = parseInt(amount);

        console.log(charityAddress);

        // try {
        //     const provider = new ethers.providers.Web3Provider(window.ethereum);
        //     const signer = provider.getSigner(signerAddress);
        //     const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
        //     const project = await thisContract.donate(charityAddress, { value: ethers.utils.parseEther("0.1") });
        //     await project.wait();
    
        //     thisContract.on('Transfer', () => {
        //         setAmount("");
        //         // getProject();
        //     })
        // } catch (error) {
        //     console.error("Error:", error);
        // }
    }

    return (
        <div>
        {project && <div>
        <h3 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>{ project.name }</h3>
        <div className='bg-white p-6 rounded-lg border-solid border-2 border-coffee_5'>
            {project.isActive && <div className='w-full text-lime-900 italic text-xl text-right px-12 my-4'><p>Active</p></div>}
            {!project.isActive && <div className='w-full text-red-900 italic text-xl text-right px-12 my-4'><p>Not active</p></div>}
            <h2 className='font-semibold text-xl my-6'>Goal amount: { project.goalAmount.toString() } EUR</h2>
            <h2 className='font-semibold text-xl my-6'>Raised amount: { project.raisedAmount.toString() } EUR</h2>
            <h2 className='font-semibold text-xl my-6 pt-6 border-t-2 border-t-coffee_4'>Milestones: </h2>            
            {milestones && milestones.map((milestone, index) => <div className='my-8 pb-6 border-b border-b-coffee_4' key={index++}>
                <h2 className='font-medium text-lg my-4'>Target amount: { project.goalAmount.toString() } EUR</h2>
                <h2 className='font-medium text-lg my-4'>Description:</h2>
                <p>{ milestone.description }</p>
            </div>)}
            {(account && project) && <div>
                {(account.toLowerCase() === project.charityAddress.toLowerCase() && project.isActive) && <div>
                    <button onClick={deactivateProject} className="bg-white text-center mt-12 hover:text-white hover:bg-red-900 hover:border-red-900 font-semibold text-red-900 py-2 px-4 border-2 border-red-900 rounded-lg">Deactivate Project</button>
                </div>}
                {(account.toLowerCase() !== project.charityAddress.toLowerCase() && project.isActive) && <div>
                    <form>
                        <div className="mt-6 flex items-center justify-between gap-2">
                            <label className='font-semibold'>Amount (EUR): </label>
                            <input onChange={e => setAmount(e.target.value)} className="p-2 bg-transparent border-b-solid border-b-2 border-b-coffee_5 grow"/>                    
                        </div>                    
                        <button onClick={donate} className="bg-white text-center mt-12 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg">Donate</button>
                    </form>
                </div>}
            </div>}
            </div>
        </div>}
        </div>
    );
};