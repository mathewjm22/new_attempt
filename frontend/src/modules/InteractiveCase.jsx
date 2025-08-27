import React, { useState } from "react";
import { geminiPrompt } from "../utils/api";
import { SPECIALTY_TIERS } from "../utils/constants";

const SPECIALTIES = Object.keys(SPECIALTY_TIERS);

export default function InteractiveCase({ setCurrentPage }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [feedback, setFeedback] = useState("");

  async function generateCase() {
    setIsLoading(true);
    setCaseData(null);
    setCurrentStep(0);
    setUserResponse("");
    setFeedback("");
    const prompt = `
Generate a complex, multi-step interactive clinical case in the specialty of ${selectedSpecialty} for a MS-4. The case should be a JSON object with a 'title' and a 'steps' array. Each step should have a 'type' ('information', 'question'), 'text', and if it's a question, an 'answer_explanation'.
`;
    try {
      const data = await geminiPrompt(prompt);
      setCaseData(data);
    } catch {
      setCaseData(null);
    }
    setIsLoading(false);
  }

  function handleCheckAnswer() {
    setFeedback(caseData.steps[currentStep].answer_explanation || "No explanation provided.");
  }

  function handleNextStep() {
    setFeedback("");
    setUserResponse("");
    setCurrentStep(idx => idx + 1);
  }

  if (!caseData) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Interactive Case</h2>
        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 rounded px-2 py-1 text-white mb-4">
          <option value="">Select Specialty...</option>
          {SPECIALTIES.map(spec => <option key={spec} value={spec}>{spec}</option>)}
        </select>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white"
          onClick={generateCase} disabled={!selectedSpecialty || isLoading}>
          {isLoading ? "Generating..." : "Start Case"}
        </button>
        <button className="ml-4 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
      </div>
    );
  }

  const step = caseData.steps[currentStep];
  const isQuestion = step.type === "question";
  const isDone = currentStep >= caseData.steps.length;

  if (isDone) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Case Complete!</h2>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white" onClick={() => setCaseData(null)}>Try Another</button>
        <button className="ml-4 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-2">{caseData.title}</h2>
      <div className="mb-3">{step.text}</div>
      {isQuestion && (
        <div className="mb-3">
          <textarea
            className="w-full h-16 bg-gray-700 border-gray-600 rounded text-white p-2"
            value={userResponse}
            onChange={e => setUserResponse(e.target.value)}
            placeholder="Type your response"
          />
        </div>
      )}
      {isQuestion && !feedback && (
        <button className="bg-cyan-700 px-4 py-2 rounded text-white" onClick={handleCheckAnswer}>Check Answer</button>
      )}
      {feedback && (
        <div className="bg-gray-900 border border-cyan-700 rounded p-3 mt-4">
          <strong>Explanation:</strong>
          <div>{feedback}</div>
          <button className="mt-3 bg-cyan-700 px-3 py-1 rounded text-white" onClick={handleNextStep}>Continue</button>
        </div>
      )}
      {!isQuestion && (
        <button className="bg-cyan-700 px-4 py-2 rounded text-white mt-4" onClick={handleNextStep}>Continue</button>
      )}
      <button className="mt-8 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
    </div>
  );
}