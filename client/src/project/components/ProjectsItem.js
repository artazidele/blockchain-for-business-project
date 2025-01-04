import React from 'react';
import { Link } from "react-router-dom";
const { ethers } = require("ethers");

const ProjectsItem = (props) => {

    const project = props.project;

    return (
        <div className='text-left h-full p-4 bg-white rounded-lg border-solid border-2 border-coffee_2'>
            {project && <div>
                {project.isActive && <div className='w-full text-lime-900 italic text-sm text-right my-4'><p>Active</p></div>}
                {!project.isActive && <div className='w-full text-red-900 italic text-sm text-right my-4'><p>Not active</p></div>}
                <h3 className='my-2 text-xl text-coffee_5 italic font-bold'>{ project.name }</h3>
                <p className='my-2'>Goal amount: {(ethers.utils.formatEther(project.goalAmount)*3.50248).toFixed(2)} EUR</p>
                <p className='my-2'>Raised amount: {(ethers.utils.formatEther(project.raisedAmount)*3.50248).toFixed(2)} EUR</p>
                <div className='w-full'>
                    <Link to={`/${project.id}`}>
                        <button className='text-coffee_5 pl-2 border-b-2 border-white font-semibold hover:border-coffee_2 italic float-right my-6'>Show more &rarr;</button>
                    </Link>
                </div>
            </div>}
        </div>
    );
};

export default ProjectsItem;