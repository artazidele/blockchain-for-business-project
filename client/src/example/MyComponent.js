import React, { useEffect } from 'react';
import { useContract } from './ContractContext';

const MyComponent = () => {
  const { contract, account } = useContract();

  useEffect(() => {
    if (contract) {
      // Now you can interact with the contract
      // contract.someMethod().then(result => {
      //   console.log(result);
      // });
    }
  }, [contract]);

  async function getProjects() {
    try {
        const allProjects = await contract.getProjects();
        console.log(allProjects);
    } catch (error) {
        console.error("Error:", error);
    }
}
async function createCharity() {
  try {
      const charity = await contract.addCharity(account);
      const newCharity = await charity.wait();
      // console.log(newCharity);
  } catch (error) {
      console.error("Error:", error);
  }
}

  return (
    <div>
      <p>Connected account: {account}</p>
      <button onClick={createCharity}>CLICK ME</button>
    </div>
  );
};

export default MyComponent;
