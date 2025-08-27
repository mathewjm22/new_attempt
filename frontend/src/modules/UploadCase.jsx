import React, { useState } from "react";
import { geminiPrompt } from "../utils/api";

// This module allows upload of a clinical case and generates an interactive timeline case.
export default function UploadCase({ setCurrentPage, onCaseGenerated }) {
  const [textInputs, setTextInputs] = useState({ context: '', transcript: '', note: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleProcessCase() {
    if (!textInputs.note) return;
    setIsProcessing(true);
    const prompt = `
You are an AI medical educator creating an OSCE-style case simulation. All questions must focus on clinical reasoning and decision-making, simulating what a clinician would do or think in a real scenario. Avoid simple fact-recall questions.

Generate a comprehensive JSON object with three root keys: "title", "specialties", and "timeline".
- "title": A concise, descriptive title for the case.
- "specialties": A string listing the top 3 relevant medical specialties from the official NBME list (e.g., 'Cardiology', 'Pulmonology', etc.).
- "timeline": An array of ~15 interactive node objects, balanced across three focuses: "History & Physical", "Differentials & Diagnosis", and "Management & Planning".

OSCE-Style Question Guidelines:
- "History & Physical": Questions should ask for the next best question to ask or physical exam maneuver to perform to gather critical information.
- "Differentials & Diagnosis": Questions should involve interpreting new data (labs, imaging) to refine the differential or selecting the most appropriate diagnostic test.
- "Management & Planning": Questions should focus on the next best step in management, choosing the most appropriate therapy, or counseling the patient.

Node Formatting:
- Multiple-choice: {id, focus: ["..."], title, date, summary, details, question, options, explanation, type: 'multipleChoice'}.
    - 'options' must be an array of exactly 4 objects ({text, correct, points}). Exactly ONE must be correct.
    - 'explanation' is mandatory and must be detailed. Explain the clinical reasoning for the correct answer AND why the other options are less appropriate in this specific clinical context.
- Differential builder: {id, type: 'differentialBuilder', focus: ["Differentials & Diagnosis"], title, date, summary, details, question, expertDifferential}.
- Reasoning builder: {id, type: 'reasoningBuilder', focus: ["Differentials & Diagnosis"], title, date, summary, details, problemStatement}. This node type should be included once per case. The 'problemStatement' should be a concise summary of the key clinical findings to initiate the reasoning exercise.

Clinical Documents:
Context: ${textInputs.context || 'Not provided'}
Transcript: ${textInputs.transcript || 'Not provided'}
Note: ${textInputs.note}
`;
    try {
      const data = await geminiPrompt(prompt);
      if (onCaseGenerated) {
        onCaseGenerated(data); // Parent can set this to add case & route to timeline
      }
      alert("Case generated! You can now find it in your case list.");
    } catch {
      alert("Failed to generate case.");
    }
    setIsProcessing(false);
  }

  function handleInputChange(e) {
    setTextInputs({ ...textInputs, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Upload a Custom Case</h2>
      <div className="mb-4">
        <label className="block text-gray-400 mb-1 font-semibold">Clinical Context (optional):</label>
        <textarea name="context" className="w-full bg-gray-700 rounded p-2 mb-2 text-white" rows={2} value={textInputs.context} onChange={handleInputChange}/>
        <label className="block text-gray-400 mb-1 font-semibold">Encounter Transcript (optional):</label>
        <textarea name="transcript" className="w-full bg-gray-700 rounded p-2 mb-2 text-white" rows={2} value={textInputs.transcript} onChange={handleInputChange}/>
        <label className="block text-gray-400 mb-1 font-semibold">Clinical Note (required):</label>
        <textarea name="note" className="w-full bg-gray-700 rounded p-2 mb-2 text-white" rows={5} value={textInputs.note} onChange={handleInputChange} required/>
      </div>
      <button
        className="bg-cyan-700 px-4 py-2 rounded text-white"
        onClick={handleProcessCase}
        disabled={!textInputs.note || isProcessing}
      >
        {isProcessing ? "Generating..." : "Generate with AI"}
      </button>
      <button className="ml-4 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
    </div>
  );
}