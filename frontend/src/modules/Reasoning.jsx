import React from "react";

export default function Reasoning({ setCurrentPage }) {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Reasoning Module</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold mb-2 text-cyan-400">Problem Statement</h3>
          <p className="text-gray-300">[Case problem statement will appear here]</p>
          <h4 className="font-semibold mt-4 mb-1 text-cyan-400">Key Findings</h4>
          <ul className="list-disc pl-6 text-gray-300">
            <li>Finding 1</li>
            <li>Finding 2</li>
            <li>Finding 3</li>
          </ul>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
          <span className="text-gray-400 font-semibold">[Interactive Tree Builder Coming Soon]</span>
        </div>
      </div>
      <button className="mt-8 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back to Dashboard</button>
    </div>
  );
}