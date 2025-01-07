import React from 'react';
import { Link } from "react-router-dom";

const { ethers } = require("ethers");

const DonatedProjectItem = (props) => {
    const project = props.project;
    // Coming from AllProjects.jsx
    const ethToEurRate = props.ethToEurRate || 0;

    // Convert goalAmount and raisedAmount from wei to ETH
    const goalEth = parseFloat(ethers.utils.formatEther(project.goalAmount));
    const raisedEth = parseFloat(ethers.utils.formatEther(project.raisedAmount));
    const donatedEth = parseFloat(ethers.utils.formatEther(project.donatedAmount));

    return (
        <div className='text-left h-full p-4 bg-white rounded-lg border-solid border-2 border-coffee_2'>
            {project && (
                <div>
                    {/* Active/Not active */}
                    {project.isActive && (
                        <div className='w-full text-lime-900 italic text-sm text-right my-4'>
                            <p>Active</p>
                        </div>
                    )}
                    {!project.isActive && (
                        <div className='w-full text-red-900 italic text-sm text-right my-4'>
                            <p>Not active</p>
                        </div>
                    )}

                    {/* Project name */}
                    <h3 className='my-2 text-xl text-coffee_5 italic font-bold'>
                        { project.name }
                    </h3>

                    {/* Display Goal in ETH + approximate EUR */}
                    <p className='my-2'>
                        Goal amount: { goalEth.toFixed(4) } ETH
                        {ethToEurRate > 0 && (
                            <> (~ { (goalEth * ethToEurRate).toFixed(2) } EUR)</>
                        )}
                    </p>

                    {/* Display Raised in ETH + approximate EUR */}
                    <p className='my-2'>
                        Raised amount: { raisedEth.toFixed(4) } ETH
                        {ethToEurRate > 0 && (
                            <> (~ { (raisedEth * ethToEurRate).toFixed(2) } EUR)</>
                        )}
                    </p>

                    {/* Display Donated in ETH + approximate EUR */}
                    <p className='font-semibold my-2'>
                        Donated amount: { donatedEth.toFixed(4) } ETH
                        {ethToEurRate > 0 && (
                            <> (~ { (donatedEth * ethToEurRate).toFixed(2) } EUR)</>
                        )}
                    </p>

                    <div className='w-full'>
                        <Link to={`/${project.id}`}>
                            <button className='text-coffee_5 pl-2 border-b-2 border-white font-semibold hover:border-coffee_2 italic float-right my-6'>
                                Show more &rarr;
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonatedProjectItem;