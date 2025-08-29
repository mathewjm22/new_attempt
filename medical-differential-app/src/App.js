import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

// --- Mock Data ---
const specialties = [
  "General Principles of Internal Medicine", "Immunologic Disorders", "Diseases of the Blood",
  "Mental Disorders", "Diseases of the Nervous System", "Cardiovascular Disorders",
  "Diseases of the Respiratory System", "Nutritional and Digestive Disorders", "Female Reproductive System",
  "Renal, Urinary, Male Reproductive Systems", "Diseases of the Skin", "Musculoskeletal and Connective Tissue Disorders",
  "Endocrine and Metabolic Disorders", "Infectious Diseases"
];

const nephrologyCase = {
  title: "A 61-Year-Old Man with Kidney Transplant and Shock",
  specialty: "Renal, Urinary, Male Reproductive Systems",
  parts: [
    "A 61-year-old man was transferred to this hospital because of acute hypoxemic respiratory failure and shock. Ten weeks earlier, the patient had undergone deceased-donor kidney transplantation at this hospital for hypertensive nephrosclerosis-related end-stage kidney disease. After transplantation, the patient’s hospitalization was notable for the administration of antithymocyte globulin induction therapy; delayed graft function with hyperkalemia, for which he underwent two sessions of hemodialysis; and urinary retention. On postoperative day 4, he was discharged home with instructions to take oral prednisone, tacrolimus, mycophenolate sodium, trimethoprim–sulfamethoxazole, and valganciclovir.",
    "Six weeks after transplantation (4 weeks before the current admission), during a follow-up visit in the transplantation clinic, the creatinine level was 1.60 mg per deciliter (141 μmol per liter; reference range, 0.60 to 1.50 mg per deciliter [53 to 133 μmol per liter]); however, hyperglycemia was noted, with a glycated hemoglobin level of 7.7% (reference value, <5.7). Treatment with a once-weekly injection of semaglutide was started.",
    "One week later, the patient was evaluated at the emergency department of another hospital for erythema and swelling of the left ankle after being scratched by a domestic cat. A radiograph of the ankle reportedly showed soft-tissue swelling. A course of amoxicillin–clavulanate was prescribed.",
    "During the next week, the patient began to have fatigue, nausea, emesis, polydipsia, and polyuria. Outpatient laboratory test results were notable for a glucose level of 519 mg per deciliter (29 mmol per liter; reference range, 70 to 100 mg per deciliter [3.9 to 5.6 mmol per liter]). At the recommendation of the transplantation team, he was admitted to the other hospital.",
    "On arrival at the other hospital, 10 days before the current admission, the oral temperature was 36.8°C, the heart rate 108 beats per minute, the blood pressure 127/74 mm Hg, the respiratory rate 26 breaths per minute, and the oxygen saturation 97% while the patient was breathing ambient air. The weight was 105.7 kg. The blood levels of calcium, magnesium, and phosphorus were normal. Urinalysis showed 4+ glucose. Nucleic acid testing of a nasopharyngeal swab for severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2) was negative. Electrocardiography reportedly showed sinus tachycardia with premature atrial contractions. Intravenous normal saline and insulin were administered.",
    "On admission to this hospital, additional history was provided by the patient’s wife. In addition to dyspnea, the patient had had nausea, anorexia, progressive abdominal discomfort, and intermittent emesis throughout the first hospitalization, and he was currently not having bowel movements. He also had dull headache and low back pain. He did not have chest pain, palpitations, dizziness, pain or redness at the surgical incision site, or bleeding symptoms.",
    "On examination, the esophageal temperature was 38.1°C, the heart rate 123 beats per minute, and the blood pressure 114/58 mm Hg while the patient was receiving infusions of norepinephrine at a rate of 36 μg per minute and vasopressin. The weight was 109.0 kg. The oxygen saturation was 97% while he was receiving oxygen through a mechanical ventilator in volume-control mode. No oral mucosal lesions were present. Auscultation of the chest revealed diffuse crackles in the lungs. The heart was tachycardic. The abdomen was distended and tense, with few bowel sounds. The kidney allograft site in the right lower quadrant was nonerythematous; no bruit was detected. A purpuric rash was present on the abdomen. Symmetric leg edema was present.",
    "Serum osmolality was normal. Nucleic acid amplification testing of deep tracheal aspirate for influenza A and B viruses, respiratory syncytial virus, and SARS-CoV-2 was negative. Cytomegalovirus DNA viral load was undetectable. Galactomannan was not detected in the blood, and pneumocystis antigen was not detected in the tracheal aspirate. Urine and sputum samples were obtained for culture while the patient was receiving mechanical ventilation. Electrocardiography revealed sinus tachycardia with premature atrial contractions.",
  ],
  finalDiagnosis: "Disseminated Strongyloidiasis",
  discussion: "The final diagnosis was Disseminated Strongyloidiasis. This patient's presentation is complex due to his immunosuppressed state post-kidney transplant. Key features pointing towards this diagnosis include the gastrointestinal symptoms (nausea, emesis, abdominal discomfort), respiratory failure, and purpuric rash, which can be a sign of larva currens in hyperinfection syndrome. While his initial presentation might suggest diabetic ketoacidosis or a bacterial infection, the lack of response to initial therapy and the constellation of multi-organ system involvement in an immunocompromised host should raise suspicion for an opportunistic infection like Strongyloides.",
  teachingPoints: {
    approach: "In an immunocompromised patient presenting with shock and multi-organ failure, the differential diagnosis must be broad. It is crucial to consider opportunistic infections beyond common bacterial and viral pathogens. Strongyloidiasis, often acquired years earlier in an endemic area (like the southern U.S. where this patient briefly lived), can remain dormant for decades and re-activate with immunosuppression, leading to a devastating hyperinfection syndrome.",
    pathophysiology: "Strongyloides stercoralis is a nematode that can persist in the host for life through a unique autoinfection cycle. In immunosuppressed states (especially with corticosteroid use), this cycle can accelerate, leading to hyperinfection. Larvae disseminate widely from the gastrointestinal tract to lungs, skin, and central nervous system, causing a catastrophic, sepsis-like picture with high mortality.",
    diagnosis: "Diagnosis is challenging as stool microscopy has low sensitivity. Serology can be useful but may be negative in acute hyperinfection. The most reliable method is finding larvae in stool, sputum, or other bodily fluids. Eosinophilia is a classic sign but may be absent in hyperinfection due to the overwhelming inflammatory response and corticosteroid use.",
    treatment: "Treatment for disseminated strongyloidiasis is with ivermectin. In severe cases, dual therapy with albendazole may be considered. It is critical to reduce immunosuppression if possible. Prophylactic ivermectin is often recommended for patients from endemic areas who are about to start immunosuppressive therapy.",
    shelfPoints: "Key takeaways for the shelf exam include recognizing the risk factors for Strongyloides hyperinfection (immunosuppression, especially corticosteroids), understanding its varied presentation (GI, pulmonary, skin), and knowing that ivermectin is the treatment of choice. Be aware that eosinophilia may be absent in severe cases."
  }
};

const cases = {
  "Renal, Urinary, Male Reproductive Systems": nephrologyCase
};

// --- Main App Component ---
function App() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [currentCasePart, setCurrentCasePart] = useState(0);
  const [differentials, setDifferentials] = useState([]);
  const [newDifferential, setNewDifferential] = useState('');
  const [isCaseFinished, setIsCaseFinished] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lockedDiagnosis, setLockedDiagnosis] = useState(null);

  useEffect(() => {
    if (caseData && currentCasePart >= caseData.parts.length - 1) {
      setIsCaseFinished(true);
    }
  }, [currentCasePart, caseData]);

  const handleSpecialtyChange = (e) => {
    const specialty = e.target.value;
    setSelectedSpecialty(specialty);
    // Reset previous case
    setCaseData(null);
    setDifferentials([]);
    setCurrentCasePart(0);
    setIsCaseFinished(false);
    setLockedDiagnosis(null);

    // "Generate" new case
    if (cases[specialty]) {
      setCaseData(cases[specialty]);
    }
  };

  const handleAdvanceCase = () => {
    if (caseData && currentCasePart < caseData.parts.length - 1) {
      setCurrentCasePart(prev => prev + 1);
    }
  };

  const handleAddDifferential = (e) => {
    e.preventDefault();
    if (newDifferential.trim() && !differentials.find(d => d.text === newDifferential.trim())) {
      const newEntry = { id: `diff-${Date.now()}`, text: newDifferential.trim() };
      setDifferentials([...differentials, newEntry]);
      setNewDifferential('');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(differentials);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDifferentials(items);
  };

  const handleRevealDiagnosis = () => {
    setLockedDiagnosis(differentials.length > 0 ? differentials[0].text : "No diagnosis provided");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getAccuracyScore = () => {
    if (!lockedDiagnosis || !caseData) return 0;
    return lockedDiagnosis.toLowerCase() === caseData.finalDiagnosis.toLowerCase() ? 100 : 0;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Differential Diagnosis Trainer</h1>
        <div className="specialty-selector">
          <select value={selectedSpecialty} onChange={handleSpecialtyChange}>
            <option value="" disabled>Select a specialty...</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>
        </div>
      </header>

      {caseData ? (
        <main className="case-container">
          <div className="case-panel">
            <h2>{caseData.title}</h2>
            {caseData.parts.slice(0, currentCasePart + 1).map((part, index) => (
              <div key={index} className={`case-part ${index === currentCasePart ? 'active' : 'faded'}`}>
                <p>{part}</p>
              </div>
            ))}
            {!isCaseFinished ? (
              <button onClick={handleAdvanceCase} className="advance-button">Advance Case</button>
            ) : (
              <button onClick={handleRevealDiagnosis} className="reveal-button">Reveal Diagnosis</button>
            )}
          </div>

          <div className="differential-panel">
            <h2>Differential Diagnosis</h2>
            <form onSubmit={handleAddDifferential}>
              <input
                type="text"
                value={newDifferential}
                onChange={(e) => setNewDifferential(e.target.value)}
                placeholder="Add a differential"
              />
              <button type="submit">Add</button>
            </form>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="differentials">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="differential-list">
                    {differentials.map((diff, index) => (
                      <Draggable key={diff.id} draggableId={diff.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.draggableHandleProps}
                          >
                            <span className="drag-handle">::</span>
                            {diff.text}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </main>
      ) : (
        <div className="placeholder-container">
          <p>Please select a specialty to begin a case.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseModal}>&times;</button>
            <h2>Final Diagnosis & Analysis</h2>
            <div className="diagnosis-comparison">
              <p><strong>Your Top Diagnosis:</strong> {lockedDiagnosis}</p>
              <p><strong>Actual Diagnosis:</strong> {caseData.finalDiagnosis}</p>
              <p><strong>Accuracy Score:</strong> {getAccuracyScore()}%</p>
            </div>
            <div className="teaching-section">
              <h3>Discussion</h3>
              <p>{caseData.discussion}</p>
              <h3>Teaching Points</h3>
              {Object.entries(caseData.teachingPoints).map(([key, value]) => (
                <div key={key}>
                  <h4>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</h4>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
