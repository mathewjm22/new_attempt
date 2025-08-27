import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import layout components
import Header from './components/Header';

// Import module components
import Dashboard from './modules/Dashboard';
import Differential from './modules/Differential';
import InteractiveCase from './modules/InteractiveCase';
import Simulator from './modules/Simulator';
import Timeline from './modules/Timeline';
import Patterns from './modules/Patterns';
import Reasoning from './modules/Reasoning';
import Imaging from './modules/Imaging';
import CognitiveBias from './modules/CognitiveBias';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="flex-grow p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/differential" element={<Differential />} />
            <Route path="/interactive-case" element={<InteractiveCase />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/reasoning" element={<Reasoning />} />
            <Route path="/imaging" element={<Imaging />} />
            <Route path="/cognitive-bias" element={<CognitiveBias />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
