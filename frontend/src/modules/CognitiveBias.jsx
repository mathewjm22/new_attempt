import React, { useState } from "react";
import { geminiPrompt } from "../utils/api";

// Predefined list of biases
const biases = [
  { name: "Anchoring Bias", definition: "The tendency to rely too heavily on the first piece of information offered (the 'anchor') when making decisions." },
  { name: "Availability Heuristic", definition: "Estimating the likelihood of events based on how easily examples come to mind, rather than how likely they are." },
  { name: "Confirmation Bias", definition: "The tendency to search for or interpret information in a way that confirms one's preconceptions." },
  { name: "Premature Closure", definition: "The tendency to stop considering other diagnoses after reaching an initial conclusion." },
];

export default function CognitiveBias({ setNotification, trainingLevel = "MS-4" }) {
  const [selectedBias, setSelectedBias] = useState(null);
  const [caseScenario, setCaseScenario] = useState(null);
  const [userChoice, setUserChoice] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function startCase(bias) {
    setSelectedBias(bias);
    setIsLoading(true);
    setCaseScenario(null);
    setFeedback(null);
    setUserChoice("");
    const prompt = `
Generate a clinical scenario for a "${trainingLevel}" designed to test for ${bias.name}.
Definition of ${bias.name}: ${bias.definition}.
The scenario must present a patient case that subtly encourages this bias.
End the scenario with a clear decision point offering two choices, labeled 'Option A' and 'Option B'. One option must be the correct clinical action, and the other must be the choice someone would make if they fell for the bias.
Format the output as a JSON object with keys: 'scenario', 'optionA', 'optionB', and 'correctOption' ('A' or 'B').
`;
    try {
      const data = await geminiPrompt(prompt);
      setCaseScenario(data);
    } catch {
      setNotification({ type: "error", message: "Failed to load bias scenario." });
    }
    setIsLoading(false);
  }

  async function fetchFeedback() {
    setIsLoading(true);
    const prompt = `
The user was tested on ${selectedBias.name}. The case was: ${caseScenario.scenario}. The user chose ${userChoice}, and the correct option was ${caseScenario.correctOption}.
Provide feedback in a JSON object with two keys:
1. 'explanation': Explain why the correct option was right and why the other option was a result of the cognitive bias.
2. 'mitigation': Provide a concise, actionable strategy to avoid this bias in the future.
`;
    try {
      const data = await geminiPrompt(prompt);
      setFeedback(data);
    } catch {
      setFeedback({ explanation: "Could not load feedback.", mitigation: "" });
    }
    setIsLoading(false);
  }

  if (!selectedBias) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Cognitive Bias Bootcamp</h2>
        <div className="mb-4">Select a bias to train:</div>
        <div className="flex flex-wrap gap-3">
          {biases.map(bias => (
            <button key={bias.name} className="bg-cyan-700 px-3 py-2 rounded text-white" onClick={() => startCase(bias)}>
              {bias.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-cyan-400">Generating scenario...</div>;
  }

  if (feedback) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-2">{selectedBias.name} Feedback</h2>
        <div className="mb-3 text-gray-300">{feedback.explanation}</div>
        <div className="mb-3 font-semibold text-cyan-400">Mitigation Strategy:</div>
        <div className="mb-4 text-gray-300">{feedback.mitigation}</div>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white" onClick={() => startCase(selectedBias)}>
          Try Another
        </button>
        <button className="ml-3 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setSelectedBias(null)}>
          Back to Bias List
        </button>
      </div>
    );
  }

  if (caseScenario) {
    return (
      <div className="p-8 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-2">{selectedBias.name}</h2>
        <div className="text-gray-400 mb-3">{selectedBias.definition}</div>
        <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-4 whitespace-pre-wrap">{caseScenario.scenario}</div>
        <div className="flex flex-col gap-2 mb-3">
          <button className={`bg-gray-700 px-3 py-2 rounded text-white ${userChoice === "Option A" ? "ring-2 ring-cyan-400" : ""}`}
                  onClick={() => setUserChoice("Option A")}>{caseScenario.optionA}</button>
          <button className={`bg-gray-700 px-3 py-2 rounded text-white ${userChoice === "Option B" ? "ring-2 ring-cyan-400" : ""}`}
                  onClick={() => setUserChoice("Option B")}>{caseScenario.optionB}</button>
        </div>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white" disabled={!userChoice} onClick={fetchFeedback}>
          Submit Choice
        </button>
        <button className="ml-3 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setSelectedBias(null)}>
          Back to Bias List
        </button>
      </div>
    );
  }

  return null;
}