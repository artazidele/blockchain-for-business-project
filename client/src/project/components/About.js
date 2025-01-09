import React from 'react';

export function About() {
    return (
        <div className="">
            <h3 className="ml-6 my-8 text-4xl italic text-coffee_5 font-semibold">About</h3>
            <div className="bg-white p-6 rounded-lg border-solid border-2 border-coffee_2">
                <p className="my-4">
                    <strong>Charity Platform</strong> is a decentralized application aimed at 
                    revolutionizing how charitable donations are handled. Our mission is 
                    to leverage blockchain technology to bring transparency, accountability, 
                    and trust to charitable contributions.
                </p>

                <p className="my-4">
                    Our smart contracts allow charities to create fundraising campaigns with 
                    clearly defined goals and milestones. Donors can easily track where their 
                    donations are going and see the progress of each milestone.
                </p>

                <p className="my-4">
                    <strong>Key Features:</strong>
                    <ul className="list-disc ml-8 mt-2">
                        <li>Transparent milestone-based funding</li>
                        <li>Tokenized proof-of-donation for every donor</li>
                        <li>Easy project management for registered charities</li>
                        <li>Full visibility into campaign progress and fund usage</li>
                    </ul>
                </p>

                <p className="my-4">
                    By holding funds in a smart contract and releasing them only as 
                    milestones are achieved, donors can be confident that their contributions 
                    are being used effectively. If a project doesn’t reach its goal or 
                    encounters issues, our system can manage refunds in a fair and transparent manner.
                </p>

                <p className="my-4">
                    We believe that the future of charitable giving is decentralized, secure, 
                    and user-driven. Join us in making a positive impact!
                </p>

                <p className="my-4 italic text-sm text-gray-600">
                    <em>
                        *This project is currently in development. If you have any questions, 
                        feedback, or suggestions, please reach out to us through our official channels.
                    </em>
                </p>
            </div>
        </div>
    );
}