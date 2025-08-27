import React, { useState } from "react";
import { geminiPrompt } from "../utils/api";

const SPECIALTIES = [
  "Cardiology", "Pulmonology", "Gastroenterology", "Endocrine and Metabolic Disorders",
  "General Principles", "Hematology/Oncology", "Neurology", "Nephrology", "Infectious Diseases"
];

export default function Simulator({ setCurrentPage }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [simData, setSimData] = useState(null);
  const [simState, setSimState] = useState("not-started");
  const [currentStep, setCurrentStep] = useState(0);
  const [actionLog, setActionLog] = useState([]);

  async function generateSimulation() {
    setSimState("loading");
    setActionLog([]);
    setCurrentStep(0);
    const prompt = `
Generate a JSON for a complex, multi-step clinical simulation in ${selectedSpecialty} for a MS-4. The simulation must have at least 10 steps. Include a 'title' and a 'steps' array. Each step needs an 'id', 'scenario' text, 'vitals' object (HR, BP, SpO2), and an 'actions' array. Each action needs a 'name', and an 'outcome' object with 'responseText', optional 'vitalsChange', and optional 'nextStepId'. The final step should have a nextStepId of 'end'. Start with step id 1.
`;
    try {
      const data = await geminiPrompt(prompt);
      setSimData(data);
      setSimState("in-progress");
    } catch {
      setSimState("not-started");
      alert("Could not generate simulation.");
    }
  }

  function handleAction(action) {
    setActionLog([...actionLog, { action: action.name, response: action.outcome.responseText }]);
    if (action.outcome.nextStepId === "end") {
      setSimState("finished");
    } else {
      const idx = simData.steps.findIndex(s => s.id === action.outcome.nextStepId);
      setCurrentStep(idx >= 0 ? idx : currentStep + 1);
    }
  }

  if (simState === "not-started") {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Patient Simulator</h2>
        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 rounded px-2 py-1 text-white mb-4">
          <option value="">Select Specialty...</option>
          {SPECIALTIES.map(spec => <option key={spec} value={spec}>{spec}</option>)}
        </select>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white"
          onClick={generateSimulation} disabled={!selectedSpecialty}>
          Start Simulation
        </button>
        <button className="ml-4 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
      </div>
    );
  }
  if (simState === "loading") {
    return <div className="p-8 text-center text-cyan-400">Generating simulation...</div>;
  }
  if (!simData || simState === "finished") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Simulation Complete!</h2>
        <div className="mb-3">
          <ul className="text-left space-y-1">
            {actionLog.map((entry, idx) => (
              <li key={idx}><span className="font-semibold">{entry.action}:</span> {entry.response}</li>
            ))}
          </ul>
        </div>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white" onClick={() => setSimState("not-started")}>Restart</button>
        <button className="ml-4 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
      </div>
    );
  }
  const step = simData.steps[currentStep];
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">{simData.title}</h2>
      <div className="mb-3 text-cyan-300">
        <span className="font-semibold">Vitals:</span> HR {step.vitals.HR}, BP {step.vitals.BP}, SpO2 {step.vitals.SpO2}
      </div>
      <div className="mb-4 whitespace-pre-wrap">{step.scenario}</div>
      <div className="mb-4 grid grid-cols-1 gap-2">
        {step.actions.map((action, idx) => (
          <button
            key={idx}
            className="bg-cyan-600 px-3 py-2 rounded text-white"
            onClick={() => handleAction(action)}
          >
            {action.name}
          </button>
        ))}
      </div>
      <div className="bg-gray-700 p-3 rounded mb-4 text-sm">
        <div className="font-semibold mb-1">Orders & Results Log:</div>
        {actionLog.length ? (
          <ul>
            {actionLog.map((entry, idx) => <li key={idx}>{entry.action}: {entry.response}</li>)}
          </ul>
        ) : <span>No actions yet.</span>}
      </div>
      <button className="bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
    </div>
  );
}