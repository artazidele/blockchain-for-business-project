import React from 'react';
import { Footer } from './project/layout/Footer';
import { Header } from './project/layout/Header';
import { NewProject } from './project/components/NewProject';
import { AllProjects } from './project/components/AllProjects';
import { MyDonations } from './project/components/MyDonations';
import { About } from './project/components/About';
import { MyCharity } from './project/components/MyCharity';
import { Project } from './project/components/Project';
import { Example } from './project/components/Example';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <div className="relative min-h-screen font-serif bg-coffee_1 mt-0">
      <Header />
      <div className='w-2/3 m-auto pt-48 pb-64'>
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<Example />}/> */}
            <Route path="/" element={<AllProjects />}/>
            <Route path="/:id" element={<Project />}/>
            <Route path="/new" element={<NewProject />}/>
            <Route path="/about" element={<About />}/>
            <Route path="/donations" element={<MyDonations />}/>
            <Route path="/charity" element={<MyCharity />}/>
            <Route path="*" element={<Navigate to="/"/>} />
          </Routes>
        </BrowserRouter>
        </div>
      <Footer />
    </div>
  );
}

export default App;
