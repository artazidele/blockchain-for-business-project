import React from 'react';
import { Footer } from './project/layout/Footer';
import { Header } from './project/layout/Header';
import { NewProject } from './project/components/NewProject';
import { AllProjects } from './project/components/AllProjects';
import { Project } from './project/components/Project';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <div className="font-serif bg-coffee_1 mt-0">
      <Header />
      <div className='w-2/3 m-auto pt-48 pb-24'>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AllProjects />}/>
            <Route path="/:id" element={<Project />}/>
            <Route path="/new" element={<NewProject />}/>
            <Route path="/about" element={<NewProject />}/>
            <Route path="/donations" element={<NewProject />}/>
            <Route path="/charity" element={<NewProject />}/>
            <Route path="*" element={<Navigate to="/"/>} />
          </Routes>
        </BrowserRouter>
        </div>
      <Footer />
    </div>
  );
}

export default App;
