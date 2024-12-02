import React from 'react';
import { Footer } from './project/layout/Footer';
import { Header } from './project/layout/Header';
import { NewProject } from './project/components/NewProject';
import { AllProjects } from './project/components/AllProjects';
import { Project } from './project/components/Project';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <div className="justify-center p-0">
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/projects" element={<AllProjects />}/>
          <Route path="/projects/:id" element={<Project />}/>
          <Route path="/new" element={<NewProject />}/>
          <Route path="*" element={<Navigate to="/"/>} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
