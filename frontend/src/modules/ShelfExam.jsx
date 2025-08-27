import React, { useState } from "react";
import { geminiPrompt } from "../utils/api";
import { SPECIALTY_TIERS } from "../utils/constants";

const SPECIALTIES = Object.keys(SPECIALTY_TIERS);

export default function ShelfExam({ setCurrentPage }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [examState, setExamState] = useState("not-started");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [score, setScore] = useState(0);

  async function generateExamQuestions() {
    setIsLoading(true);
    setExamState("in-progress");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setScore(0);
    setAnswerFeedback("");
    const prompt = `
You are an AI medical educator creating a high-yield, 10-question multiple-choice quiz simulating a medical student's shelf exam for a specific specialty.

**Specialty:** ${selectedSpecialty}

**Style Requirement:**
Each question must be a clinical vignette, similar to NBME-style questions. It should present a patient scenario with history, physical exam, and/or lab findings. The question must ask for the "most likely diagnosis" or "most appropriate next step in management".

**Output Format:**
Generate a JSON object with a single root key: "questions".
The value of "questions" must be an array of exactly 10 question objects.
Each question object must have the following structure:
{
  "question": "...",
  "specialty": "${selectedSpecialty}",
  "options": [
    { "text": "Option A", "correct": false },
    { "text": "Option B", "correct": true },
    { "text": "Option C", "correct": false },
    { "text": "Option D", "correct": false }
  ],
  "explanation": "..."
}
Ensure exactly one option is marked as correct for each question.
`;
    try {
      const data = await geminiPrompt(prompt);
      setQuestions(data.questions || []);
    } catch {
      setQuestions([]);
    }
    setIsLoading(false);
  }

  function handleAnswer(optionIdx) {
    if (userAnswers[currentQuestionIndex] !== undefined) return;
    const correctIdx = questions[currentQuestionIndex].options.findIndex(opt => opt.correct);
    setUserAnswers(ans => {
      const updated = [...ans];
      updated[currentQuestionIndex] = optionIdx;
      return updated;
    });
    setScore(s => s + (questions[currentQuestionIndex].options[optionIdx].correct ? 1 : 0));
    setAnswerFeedback(questions[currentQuestionIndex].explanation);
  }

  function handleNext() {
    setAnswerFeedback("");
    setCurrentQuestionIndex(idx => idx + 1);
  }

  if (examState === "not-started") {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Shelf Exam Challenge</h2>
        <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)}
          className="w-full bg-gray-700 border-gray-600 rounded px-2 py-1 text-white mb-4">
          <option value="">Select Specialty...</option>
          {SPECIALTIES.map(spec => <option key={spec} value={spec}>{spec}</option>)}
        </select>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white"
          onClick={generateExamQuestions} disabled={!selectedSpecialty || isLoading}>
          {isLoading ? "Generating..." : "Begin Challenge"}
        </button>
        <button className="ml-4 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
      </div>
    );
  }

  if (!questions.length) {
    return <div className="p-8 text-center text-cyan-400">Generating questions...</div>;
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Quiz Complete!</h2>
        <div className="mb-3 font-bold text-cyan-400">Score: {score} / {questions.length}</div>
        <div className="mb-6">
          <ul className="text-left space-y-2">
            {questions.map((q, idx) => (
              <li key={idx} className="bg-gray-700 rounded p-3 mb-2">
                <div className="font-semibold mb-1">{q.question}</div>
                <div>Your answer: {q.options[userAnswers[idx]]?.text || "(none)"}</div>
                <div>Correct answer: {q.options.find(opt => opt.correct)?.text}</div>
                <div className="text-sm text-gray-300 mt-1">{q.explanation}</div>
              </li>
            ))}
          </ul>
        </div>
        <button className="bg-cyan-700 px-4 py-2 rounded text-white" onClick={() => setExamState("not-started")}>Retake</button>
        <button className="ml-4 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
      </div>
    );
  }

  const q = questions[currentQuestionIndex];
  const selectedIdx = userAnswers[currentQuestionIndex];
  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-2">Shelf Exam: {selectedSpecialty}</h2>
      <div className="mb-3 font-semibold text-cyan-400">Question {currentQuestionIndex + 1} / {questions.length}</div>
      <div className="mb-3">{q.question}</div>
      <div className="flex flex-col gap-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            disabled={selectedIdx !== undefined}
            className={`p-2 rounded border transition-colors ${
              selectedIdx === idx
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
      {answerFeedback && (
        <div className="bg-gray-900 border border-cyan-700 rounded p-3 mt-4">
          <strong>Explanation:</strong>
          <div>{answerFeedback}</div>
          <button className="mt-3 bg-cyan-700 px-3 py-1 rounded text-white" onClick={handleNext}>Next</button>
        </div>
      )}
      <button className="mt-6 bg-gray-700 px-4 py-2 rounded text-white" onClick={() => setCurrentPage("dashboard")}>Back</button>
    </div>
  );
}