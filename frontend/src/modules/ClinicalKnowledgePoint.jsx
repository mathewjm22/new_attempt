import React, { useState, useCallback, useEffect } from "react";
import { geminiPrompt } from "../utils/api";
import { HIGH_YIELD_TOPICS } from "../utils/constants";

export default function ClinicalKnowledgePoint({ trainingLevel, semester, setNotification, onStartCase }) {
  const [knowledgePoint, setKnowledgePoint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPearl = useCallback(async () => {
    setIsLoading(true);
    setKnowledgePoint(null);

    const prompt = `Generate a single, high-yield, testable medical fact suitable for a ${trainingLevel} student. The fact must be related to one of the following conditions: ${HIGH_YIELD_TOPICS}. Format as a JSON object with four keys: "specialty" (the relevant specialty), "pearl" (a concise, one-sentence fact), "expandedDiscussion" (a detailed, three-paragraph explanation covering pathophysiology, clinical presentation, and initial workup/treatment), and "teachingPoints" (an array of 2-3 bullet-point style strings).`;

    try {
      const response = await geminiPrompt(prompt);
      if (response.pearl && response.expandedDiscussion && response.teachingPoints && response.specialty) {
        setKnowledgePoint(response);
      } else {
        throw new Error("Invalid format for knowledge point.");
      }
    } catch (e) {
      setNotification({ type: "error", message: "Failed to fetch clinical knowledge point." });
      setKnowledgePoint({ pearl: "Could not load a knowledge point.", expandedDiscussion: "There was an error generating the detailed content.", teachingPoints: [], specialty: "General Principles" });
    } finally {
      setIsLoading(false);
    }
  }, [trainingLevel, setNotification]);

  useEffect(() => { fetchPearl(); }, [fetchPearl]);

  function handleGenerateCaseClick() {
    onStartCase(knowledgePoint.specialty);
    setIsModalOpen(false);
  }

  function KnowledgePointModal() {
    if (!isModalOpen || !knowledgePoint) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 animate-fadeIn" onClick={() => setIsModalOpen(false)}>
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-w-2xl w-full flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
          <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-cyan-400">Expanded Discussion</h3>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
          </div>
          <div className="overflow-y-auto p-6">
            <p className="text-lg italic text-white mb-4">"{knowledgePoint.pearl}"</p>
            <div className="text-gray-300 mb-6 whitespace-pre-wrap">{knowledgePoint.expandedDiscussion}</div>
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-semibold text-white mb-3">Major Teaching Points</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {knowledgePoint.teachingPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex-shrink-0 p-4 bg-gray-900/50 border-t border-gray-700 text-right">
            <button onClick={handleGenerateCaseClick} className="py-2 px-5 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold text-white transition-colors">
              Generate Case in {knowledgePoint.specialty}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-8">
      <h3 className="text-xl font-semibold mb-2 text-white">Clinical Knowledge Point</h3>
      <div className="min-h-[60px]">
        {isLoading ? (
          <p className="text-gray-500 italic">Generating...</p>
        ) : (
          <button onClick={() => setIsModalOpen(true)} className="text-left w-full text-cyan-300 italic hover:text-cyan-200 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded p-1">
            "{knowledgePoint?.pearl}"
          </button>
        )}
      </div>
      <div className="text-right mt-2">
        <button onClick={fetchPearl} disabled={isLoading} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors disabled:opacity-50">New Point</button>
      </div>
      <KnowledgePointModal />
    </div>
  );
}