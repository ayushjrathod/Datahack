import React, { useState } from 'react';
import { ChevronRight, Shield } from 'lucide-react';
import { DomainIcons } from './DomainIcons'; // Assuming this file exists
import questionnaire from './questionnaire.json'; // Import the questionnaire data

const SecurityAssessment = () => {
  const [phase, setPhase] = useState(1);
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextPhase = () => {
    if (phase < 5) {
      setPhase(prev => prev + 1);
    } else {
      // Handle questionnaire completion
      console.log("Final answers:", answers);
    }
  };

  const progress = ((phase - 1) / 4) * 100;

  const DomainIcon = ({ domain }) => {
    const Icon = DomainIcons[domain] || Shield;
    return <Icon className="w-6 h-6 text-blue-500" />;
  };

  const renderQuestions = () => {
    const currentPhaseData = questionnaire[`phase${phase}`];
    return currentPhaseData.map((section) => {
      const sectionKey = Object.keys(section)[0];
      const sectionData = section[sectionKey];
      
      // Check conditions
      const conditionsMet = checkConditions(sectionData.conditions);
      if (!conditionsMet) return null;

      return (
        <div key={sectionKey} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <DomainIcon domain={sectionKey} />
            <h2 className="text-xl font-semibold text-gray-900">{sectionKey}</h2>
          </div>
          
          <div className="space-y-6">
            {sectionData.questions.map((q) => (
              <div key={q.id} className="space-y-4">
                <p className="text-gray-700 font-medium">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, idx) => (
                    <label key={idx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={() => handleAnswerChange(q.id, option)}
                        className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  };

  const checkConditions = (conditions) => {
    if (!conditions) return true;
    if (conditions._init) return true;

    const { AND, OR } = conditions;
    if (AND) {
      return AND.every(condition => checkSingleCondition(condition));
    }
    if (OR) {
      return OR.some(condition => checkSingleCondition(condition));
    }
    return checkSingleCondition(conditions);
  };

  const checkSingleCondition = (condition) => {
    const [questionId, expectedAnswer] = Object.entries(condition)[0];
    if (Array.isArray(expectedAnswer)) {
      return expectedAnswer.includes(answers[questionId]);
    }
    return answers[questionId] === expectedAnswer;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Security Assessment Questionnaire</h1>
        <p className="text-gray-600">Phase {phase} of 5</p>
      </div>

      {/* Progress bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-xs font-semibold text-blue-600 w-full">
            Progress: {Math.round(progress)}%
          </div>
        </div>
        <div className="flex h-2 mb-4 overflow-hidden bg-gray-200 rounded">
          <div 
            style={{ width: `${progress}%` }}
            className="flex flex-col justify-center bg-blue-500 rounded transition-all duration-500"
          />
        </div>
      </div>

      {/* Phase labels */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {['Network Security', 'Data Protection', 'Incident Response', 'Compliance', 'Advanced'].map((label, idx) => (
          <div 
            key={label}
            className={`text-center ${idx + 1 <= phase ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {renderQuestions()}
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6">
        <button
          onClick={handleNextPhase}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {phase === 5 ? 'Complete Assessment' : 'Next Phase'}
          <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SecurityAssessment;