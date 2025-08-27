import React, { useState } from "react";
import { geminiPrompt } from "../utils/api";

// Example prop: caseData={...}
export default function Timeline({ caseData, setCurrentPage }) {
  const [learningFocus, setLearningFocus] = useState("History & Physical");
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [differentialInputs, setDifferentialInputs] = useState([]);
  const [genericFeedback, setGenericFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!caseData) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">No Case Loaded</h2>
        <button className="bg-cyan-700 px-4 py-2 rounded mt-6" onClick={() => setCurrentPage("dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  // Filter timeline for focus
  const filteredTimeline = caseData.timeline.filter(
    node => node.focus && node.focus.includes(learningFocus)
  );
  const currentNode = filteredTimeline[currentNodeIndex];

  function handleMCQ(optionIdx) {
    if (answeredQuestions[currentNode.id]) return;
    const isCorrect = currentNode.options[optionIdx]?.correct;
    setFeedback(currentNode.explanation);
    setScore(s => s + (isCorrect ? currentNode.options[optionIdx]?.points || 1 : 0));
    setAnsweredQuestions({ ...answeredQuestions, [currentNode.id]: optionIdx });
  }

  async function handleDifferentialSubmit() {
    setIsSubmitting(true);
    // Prepare prompt for Gemini feedback
    const prompt = `
You are an AI medical educator providing OSCE-style feedback on a student's differential diagnosis.
Case Summary: ${currentNode.summary} ${currentNode.details}
Expert Differential: ${JSON.stringify(currentNode.expertDifferential)}
Student's Submitted Differential: ${JSON.stringify(differentialInputs)}
Analyze the student's submission. Provide concise, constructive feedback for EVERY diagnosis the student submitted. Address:
1. What they got right (commending correct diagnoses and accurate probability assessments).
2. Any critical diagnoses they missed from the expert list and why they are important.
3. Comment on the likelihood/probability of their suggestions compared to the expert opinion.
Keep the feedback encouraging, educational, and formatted as a simple string with paragraphs.
`;
    try {
      const res = await geminiPrompt(prompt);
      setGenericFeedback(res.feedback || res);
    } catch {
      setGenericFeedback("Could not get expert feedback.");
    }
    setIsSubmitting(false);
  }

  function handleNext() {
    setFeedback("");
    setGenericFeedback("");
    setCurrentNodeIndex(idx => Math.min(filteredTimeline.length - 1, idx + 1));
  }

  function renderNode(node) {
    if (!node) return null;
    if (node.type === "multipleChoice") {
      return (
        <div>
          <h4 className="font-bold mb-2">{node.title}</h4>
          <div className="mb-2">{node.question}</div>
          <div className="flex flex-col gap-2">
            {node.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleMCQ(idx)}
                disabled={answeredQuestions[node.id] !== undefined}
                className={`p-2 rounded border transition-colors ${
                  answeredQuestions[node.id] === idx
                    ? opt.correct
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                    : "bg-gray-700 text-white border-gray-600"
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
          {feedback && (
            <div className="bg-gray-900 border border-cyan-700 rounded p-3 mt-4">
              <strong>Explanation:</strong>
              <div>{feedback}</div>
              <button className="mt-3 bg-cyan-700 px-3 py-1 rounded text-white" onClick={handleNext}>Next Step</button>
            </div>
          )}
        </div>
      );
    }
    if (node.type === "differentialBuilder") {
      return (
        <div>
          <h4 className="font-bold mb-2">{node.title}</h4>
          <div className="mb-2">{node.question}</div>
          <DifferentialInput
            inputs={differentialInputs}
            setInputs={setDifferentialInputs}
          />
          <button
            className="mt-2 bg-cyan-700 px-3 py-1 rounded text-white"
            onClick={handleDifferentialSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Differential"}
          </button>
          {genericFeedback && (
            <div className="bg-gray-900 border border-cyan-700 rounded p-3 mt-4">
              <strong>Expert Feedback:</strong>
              <div>{genericFeedback}</div>
              <button className="mt-3 bg-cyan-700 px-3 py-1 rounded text-white" onClick={handleNext}>Next Step</button>
            </div>
          )}
        </div>
      );
    }
    if (node.type === "reasoningBuilder") {
      return (
        <div>
          <h4 className="font-bold mb-2">{node.title}</h4>
          <div className="mb-2">{node.problemStatement}</div>
          <button
            className="mt-2 bg-cyan-700 px-3 py-1 rounded text-white"
            onClick={() => setCurrentPage("reasoning")}
          >
            Start Reasoning Exercise
          </button>
        </div>
      );
    }
    return <div>Unknown node type</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Case Timeline</h2>
      <div className="mb-4 flex gap-2">
        {["History & Physical", "Differentials & Diagnosis", "Management & Planning"].map(focus => (
          <button
            key={focus}
            className={`px-4 py-2 rounded ${learningFocus === focus ? "bg-cyan-700 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => { setLearningFocus(focus); setCurrentNodeIndex(0); }}
          >
            {focus}
          </button>
        ))}
      </div>
      <div className="mb-2 text-center text-sm text-cyan-300">
        Step {currentNodeIndex + 1} of {filteredTimeline.length}
      </div>
      <div className="my-6 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow">{renderNode(currentNode)}</div>
      <div className="mt-8 text-right">
        <button className="bg-gray-700 px-4 py-2 rounded" onClick={() => setCurrentPage("dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );
}

function DifferentialInput({ inputs, setInputs }) {
  const [entry, setEntry] = useState("");
  const [likelihood, setLikelihood] = useState("High");
  function addDx() {
    if (!entry.trim()) return;
    setInputs([...inputs, { diagnosis: entry, likelihood }]);
    setEntry("");
  }
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          value={entry}
          onChange={e => setEntry(e.target.value)}
          className="px-2 py-1 rounded bg-gray-700 text-white"
          placeholder="Diagnosis"
        />
        <select value={likelihood} onChange={e => setLikelihood(e.target.value)}
          className="bg-gray-700 border-gray-600 rounded text-white">
          <option>High</option>
          <option>Moderate</option>
          <option>Low</option>
        </select>
        <button onClick={addDx} className="bg-cyan-700 px-2 rounded text-white">Add</button>
      </div>
      <div>
        {inputs.map((item, idx) => (
          <div key={idx} className="text-sm bg-gray-700 px-2 py-1 rounded mb-1 flex justify-between">
            <span>{item.diagnosis} <span className="text-xs text-gray-400">({item.likelihood})</span></span>
            <button onClick={() => setInputs(inputs.filter((_, i) => i !== idx))} className="text-red-400 ml-2">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}