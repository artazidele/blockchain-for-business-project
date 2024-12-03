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
        setMilestones(milestones => milestones.filter((item) => item.index != e.target.value));
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
                window.location = "/";
            })
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
            <div className="">
                <h3 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>New Project</h3>
                <form>
                <div className='bg-white p-6 rounded-lg border-solid border-2 border-coffee_5'>
                
                    <div className="mt-6 flex items-center justify-between gap-2">
                        <label className='font-semibold'>Title:</label>
                        <input onChange={e => setTitle(e.target.value)} className="p-2 bg-transparent border-b-solid border-b-2 border-b-coffee_5 grow"/>                    
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-2">
                        <label className='font-semibold'>Goal amount (EUR): </label>
                        <input onChange={e => setGoalAmount(e.target.value)} className="p-2 bg-transparent border-b-solid border-b-2 border-b-coffee_5 grow"/>                    
                    </div>
                    <div className="text-left mt-6">
                        <h6 className='font-semibold border-t-solid border-t-2 pt-6 border-t-coffee_4'>Milestones:</h6>
                        {milestones && milestones.map((milestone, index) => <div key={index++} className='mt-6 pb-2 border-b-solid border-b border-b-coffee_5'>
                            <div className='flex gap-2'>
                                <p className='font-semibold'>Amount: </p>
                                <p>{milestone.amount} </p>
                                <p>EUR</p>
                            </div>
                            <p className='font-semibold'>Description: </p>
                            <p>{milestone.description}</p>
                            <button value={milestone.index} onClick={removeMilestone} className='w-full text-red-900 italic text-sm text-right'>Remove milestone</button>
                        </div>)}
                        <h6 className="mt-6 font-semibold">New milestone:</h6>
                        <div className="mt-6 flex items-center justify-between gap-2">
                            <label className='font-semibold'>Amount (EUR):</label>
                            <input onChange={e => setAmount(e.target.value)} value={amount} className="p-2 bg-transparent border-b-solid border-b-2 border-b-coffee_5 grow"/>                    
                        </div>
                        <div className="mt-6 flex-row items-center justify-between">
                            <label  className='font-semibold'>Description: </label>
                            <textarea onChange={e => setDescription(e.target.value)} value={description} className="p-2 bg-transparent mt-4 rounded-md min-h-32 border-solid border-2 border-coffee_5 w-full"/>                   
                        </div>
                        <button onClick={saveMilestone} className="mt-2 hover:text-white hover:bg-coffee_4 hover:border-coffee_4 font-semibold text-coffee_5 py-2 px-4 border-2 border-coffee_5 rounded-lg">Add Milestone</button>
                    </div>
                </div>
                <button onClick={createProject} className="bg-white float-right text-center mt-12 hover:text-white hover:bg-coffee_4 hover:border-coffee_4 font-semibold text-coffee_5 py-2 px-4 border-2 border-coffee_5 rounded-lg">Create Project</button>
                </form>
            </div>
    );
};