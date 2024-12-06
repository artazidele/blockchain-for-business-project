import React from 'react';
import { Link } from "react-router-dom";

const ProjectsItem = (props) => {

    const project = props.project;

    return (
        // <div className='text-left h-full p-1 bg-white border-solid border-2 border-lime-900'>
        // <div className='text-left h-full p-4 bg-white border-solid border-2 border-red-900'>
        <div className='text-left h-full p-4 bg-white rounded-lg border-solid border-2 border-coffee_5'>
            {project && <div>
                {project.isActive && <div className='w-full text-lime-900 italic text-sm text-right my-4'><p>Active</p></div>}
                {!project.isActive && <div className='w-full text-red-900 italic text-sm text-right my-4'><p>Not active</p></div>}
                <h3 className='my-2 text-xl text-coffee_5 italic font-bold'>{ project.name }</h3>
                <p className='my-2'>Goal amount: {project.goalAmount.toString()} EUR</p>
                <p className='my-2'>Raised amount: {project.raisedAmount.toString()} EUR</p>
                <div className='w-full'>
                    <Link to={`/${project.id}`}>
                        <button className='text-coffee_5  italic float-right my-6'>Show more &rarr;</button>
                    </Link>
                </div>
            </div>}
        </div>
        // {/* </div> */}
    );
};

export default ProjectsItem;