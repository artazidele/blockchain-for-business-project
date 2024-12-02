import React from 'react';
import { useState } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';

const { ethers } = require("ethers");

export function NewProject() {
    const [milestones, setMilestones] = useState([]);

    const [goalAmount, setGoalAmount] = useState("");
    const [title, setTitle] = useState("");

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    const saveMilestone = (e) => {
        e.preventDefault();
        let index = 0;
        if (milestones.length !== 0) {
            index = milestones[milestones.length - 1].index + 1;
        }
        const milestone = {index, amount, description};
        milestones.push(milestone);
        setAmount("");
        setDescription("");
    }

    const removeMilestone = (e) => {
        e.preventDefault();
        setMilestones(milestones => milestones.filter((item) => item.index !== e.target.value));
    }

    async function createProject(e) {
        e.preventDefault();
        // input validation
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');
        const goal = parseInt(goalAmount);
        const milestoneAmounts = [];
        const milestoneDescriptions = [];
        milestones.forEach(milestone => {
            milestoneAmounts.push(parseInt(milestone.amount));
            milestoneDescriptions.push(milestone.description);
        });
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
            const project = await thisContract.createProject(
                title, 
                goal, 
                milestoneDescriptions, 
                milestoneAmounts
            );
            await project.wait();
    
            thisContract.on('ProjectCreated', () => {
                setAmount("");
                setDescription("");
                setTitle("");
                setGoalAmount("");
                window.location = "/projects";
            })
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div className="bg-slate-100 text-center w-full m-0">
            <div className="bg-white w-2/3 p-10 m-auto">
                <h3>New Project</h3>
                <form className='mb-20'>
                    <div className="mt-6 flex items-center justify-between">
                        <label>Title:</label>
                        <input onChange={e => setTitle(e.target.value)} className="bg-transparent border-b-solid border-b border-b-rose-950 w-2/3"/>                    
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                        <label>Goal amount (EUR): </label>
                        <input onChange={e => setGoalAmount(e.target.value)} className="bg-transparent border-b-solid border-b border-b-rose-950 w-2/3"/>                    
                    </div>
                    <div className="text-left mt-6">
                        <h6 className='pb-2 border-b-solid border-b border-b-rose-950'>Milestones:</h6>
                        {milestones && milestones.map((milestone, index) => <div key={index++} className='mt-6 pb-2 border-b-solid border-b border-b-rose-950'>
                            <p>Amount: {milestone.amount} EUR</p>
                            <p>Description: </p>
                            <p>{milestone.description}</p>
                            <button value={milestone.index} onClick={removeMilestone}>Remove milestone</button>
                        </div>)}
                        <h6 className="mt-6">New milestone:</h6>
                        <div className="mt-6 flex items-center justify-between">
                            <label>Amount (EUR):</label>
                            <input onChange={e => setAmount(e.target.value)} value={amount} className="bg-transparent border-b-solid border-b border-b-rose-950 w-2/3"/>                    
                        </div>
                        <div className="mt-6 flex-row items-center justify-between">
                            <label>Description: </label>
                            <textarea onChange={e => setDescription(e.target.value)} value={description} className="p-2 bg-transparent mt-4 rounded-md min-h-32 border-solid border border-rose-950 w-full"/>                   
                        </div>
                        <button onClick={saveMilestone} className="mt-2 bg-rose-950 text-white py-2 px-4 rounded-md">Add Milestone</button>
                    </div>
                    <button onClick={createProject} className="float-right text-center mt-2 bg-rose-950 text-white py-2 px-4 rounded-md">Create Project</button>
                </form>
            </div>
        </div>
    );
};