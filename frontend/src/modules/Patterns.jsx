import React, { useState } from "react";

// Example static pattern library data
const patternLibraryData = [
  {
    specialty: 'Cardiology',
    patterns: [
      {
        name: 'Acute Coronary Syndrome (ACS)',
        summary: 'A spectrum of conditions associated with sudden, reduced blood flow to the heart.',
        keyFeatures: ['Chest pain (pressure, tightness), often radiating to arm/jaw', 'Shortness of breath', 'Diaphoresis, nausea'],
        evolution: 'Can present as unstable angina, NSTEMI, or STEMI, depending on EKG changes and cardiac biomarkers.',
        redFlags: ['Persistent chest pain despite nitroglycerin', 'Hemodynamic instability (hypotension, shock)', 'New heart murmur or signs of heart failure'],
      },
      {
        name: 'Congestive Heart Failure (CHF) Exacerbation',
        summary: 'A clinical syndrome where the heart cannot pump enough blood to meet the body\'s needs, leading to fluid backup.',
        keyFeatures: ['Dyspnea on exertion', 'Orthopnea and PND', 'Bilateral lower extremity edema', 'Jugular venous distention (JVD)'],
        evolution: 'Often triggered by medication non-compliance, dietary indiscretion (high salt), or a new cardiac event.',
        redFlags: ['Hypoxia', 'Altered mental status', 'Hypotension with signs of poor perfusion (cool extremities)'],
      }
    ]
  },
  {
    specialty: 'Pulmonology',
    patterns: [
      {
        name: 'Community-Acquired Pneumonia (CAP)',
        summary: 'An infection of the lung parenchyma acquired outside of a hospital setting.',
        keyFeatures: ['Fever, cough with sputum', 'Pleuritic chest pain', 'Tachypnea and tachycardia', 'Consolidation on chest X-ray'],
        evolution: 'Typically improves within 48-72 hours of appropriate antibiotic therapy.',
        redFlags: ['Sepsis criteria (hypotension, altered mental status)', 'Multilobar infiltrates', 'Failure to improve on initial antibiotics'],
      }
    ]
  }
];

export default function Patterns({ setCurrentPage }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState(patternLibraryData[0]);
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Clinical Patterns Library</h2>
      <div className="flex gap-4 border-b border-gray-700 mb-4">
        {patternLibraryData.map((spec, idx) => (
          <button
            key={spec.specialty}
            className={`pb-2 px-4 text-lg font-semibold border-b-2 transition-colors ${
              selectedSpecialty.specialty === spec.specialty ? "border-cyan-500 text-cyan-400" : "border-transparent text-gray-400"
            }`}
            onClick={() => setSelectedSpecialty(spec)}
          >
            {spec.specialty}
          </button>
        ))}
      </div>
      <div>
        {selectedSpecialty.patterns.map((pat, idx) => (
          <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-cyan-300 mb-2">{pat.name}</h3>
            <p className="text-gray-200 mb-3">{pat.summary}</p>
            <div className="mb-2">
              <span className="font-bold text-white">Key Features:</span>
              <ul className="list-disc pl-6 text-gray-300">
                {pat.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div className="mb-2">
              <span className="font-bold text-white">Typical Evolution:</span>
              <span className="ml-2 text-gray-300">{pat.evolution}</span>
            </div>
            <div>
              <span className="font-bold text-white">Red Flags:</span>
              <ul className="list-disc pl-6 text-red-400">
                {pat.redFlags.map((rf, i) => <li key={i}>{rf}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setCurrentPage("dashboard")} className="mt-8 bg-gray-700 px-4 py-2 rounded text-white">Back to Dashboard</button>
    </div>
  );
}