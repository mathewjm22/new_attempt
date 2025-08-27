import React, { useState } from "react";
import { geminiPrompt } from "../utils/api";
import { HIGH_YIELD_TOPICS, ADVANCED_TOPICS } from "../utils/constants";

export default function DifferentialBuilder({ setCurrentPage }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [differentials, setDifferentials] = useState([]);
  const [input, setInput] = useState("");
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [score, setScore] = useState(0);

  // Utility: Extract topics for specialty
  function getTopicsForSpecialty(specialty, advanced = false) {
    const topicSource = advanced ? ADVANCED_TOPICS : HIGH_YIELD_TOPICS;
    const regex = new RegExp(`### \\*\\*${specialty.replace("&", "&amp;").replace(/[\(\).]/g, "\\$&")}\\*\\*([\\s\\S]*?)(?=###|$)`);
    const match = topicSource.match(regex);
    return match ? match[1].trim() : topicSource;
  }

  // Generate a realistic case
  async function generateCase() {
    if (!selectedSpecialty) return;
    setIsLoading(true);
    setCaseData(null);
    setDifferentials([]);
    setCurrentStep(0);

    const useAdvanced = Math.random() < 0.2;
    const specialtyTopics = getTopicsForSpecialty(selectedSpecialty, useAdvanced);
    const topicType = useAdvanced ? "advanced/less-common" : "core high-yield";
    const variabilityInstruction = Math.random() < 0.3
      ? "For this case, introduce a significant challenge: either (a) an atypical presentation OR (b) a resource constraint."
      : "Present this case with a classic, textbook presentation.";
    const prompt = `
Generate a JSON object for a complex clinical case for an MS-4 in the specialty of ${selectedSpecialty}.
The final diagnosis MUST be a ${topicType} condition from the following list: ${specialtyTopics}.
${variabilityInstruction}
The case must be detailed, mimicking a real-life patient chart. The JSON must have:
1. "title":...
2. "finalDiagnosis":...
3. "expertRanking":...
4. "discussion":...
5. "steps": An array of 5-7 text snippets that progressively reveal the case. When writing lab values in 'steps', wrap them in this format: [[LAB: Lab Name: Value Units: Normal Range]].
`;

    try {
      const data = await geminiPrompt(prompt);
      if (data.title && data.steps && data.finalDiagnosis) {
        setCaseData(data);
      } else {
        throw new Error("Invalid case format from AI.");
      }
    } catch {
      alert("Failed to generate case!");
    } finally {
      setIsLoading(false);
    }
  }

  function addDifferential(e) {
    e.preventDefault();
    if (input.trim()) {
      setDifferentials([...differentials, { id: Date.now(), text: input.trim() }]);
      setInput("");
    }
  }

  function moveItem(from, to) {
    const newDiffs = [...differentials];
    const [moved] = newDiffs.splice(from, 1);
    newDiffs.splice(to, 0, moved);
    setDifferentials(newDiffs);
  }

  function isMatch(userAnswer, correctAnswer) {
    const userNorm = userAnswer.toLowerCase().trim();
    const correctNorm = correctAnswer.toLowerCase().trim();
    return userNorm === correctNorm || correctNorm.includes(userNorm);
  }

  function handleReveal() {
    let newScore = 0;
    if (differentials.length > 0 && isMatch(differentials[0].text, caseData.finalDiagnosis)) newScore = 100;
    else if (differentials.slice(0, 3).some(d => isMatch(d.text, caseData.finalDiagnosis))) newScore = 75;
    else if (differentials.slice(0, 5).some(d => isMatch(d.text, caseData.finalDiagnosis))) newScore = 50;
    setScore(newScore);
    setIsRevealModalOpen(true);
  }

  function parseAndRenderStep(stepText) {
    if (typeof stepText !== "string") return stepText;
    const parts = stepText.split(/(\[\[LAB:.+?\]\])/g);
    return parts.map((part, idx) => {
      const match = part.match(/\[\[LAB: (.+?): (.+?): (.+?)\]\]/);
      if (match) {
        const [, name, value, range] = match;
        return (
          <span key={idx} className="relative group">
            <span className="bg-cyan-900/50 text-cyan-300 font-medium py-0.5 px-1.5 rounded-md border border-cyan-700/50">{name}: {value}</span>
            <div className="absolute bottom-full mb-2 hidden group-hover:block px-3 py-2 bg-gray-900 text-white text-xs rounded-md shadow-lg border border-gray-700 w-max z-10">
              Normal Range: {range}
            </div>
          </span>
        );
      }
      return part;
    });
  }

  if (!caseData) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Differential Diagnosis Builder