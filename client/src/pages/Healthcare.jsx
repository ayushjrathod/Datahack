import React, { useEffect, useState } from "react";
import questionnaire from "../assets/data/questions2.json";

const PhasedQuestionnaire = () => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [answers, setAnswers] = useState({});
  const [currentQuestions, setCurrentQuestions] = useState(questionnaire.questionnaire.phase1);
  console.log(currentQuestions);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentPhase === 1) {
      setCurrentQuestions(questionnaire.phase1);
    } else {
      // Logic to determine questions for phases 2-5 based on previous answers
      const phaseQuestions = questionnaire[`phase${currentPhase}`];
      const filteredQuestions = phaseQuestions.filter((domain) => {
        if (domain.conditions) {
          // Check if conditions are met based on previous answers
          return evaluateConditions(domain.conditions, answers);
        }
        return true;
      });
      setCurrentQuestions(filteredQuestions);
    }
    // Update progress
    setProgress((currentPhase - 1) * 25);
  }, [currentPhase, answers]);

  const evaluateConditions = (conditions, answers) => {
    if (conditions.AND) {
      return conditions.AND.every((condition) => evaluateCondition(condition, answers));
    }
    if (conditions.OR) {
      return conditions.OR.some((condition) => evaluateCondition(condition, answers));
    }
    return evaluateCondition(conditions, answers);
  };

  const evaluateCondition = (condition, answers) => {
    const [questionId, expectedAnswer] = Object.entries(condition)[0];
    return answers[questionId] === expectedAnswer;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextPhase = () => {
    if (currentPhase < 5) {
      setCurrentPhase((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Security Assessment Questionnaire</h1>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between mt-2">
          {["Network Security", "Data Protection", "Incident Response", "Compliance", "Advanced"].map(
            (domain, index) => (
              <span key={index} className={`text-sm ${index < currentPhase ? "text-blue-600" : "text-gray-500"}`}>
                {domain}
              </span>
            )
          )}
        </div>
      </div>

      {/* Questions */}
      {currentQuestions.map((domain) => (
        <div key={domain.domain} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{domain.domain}</h2>
          {domain.questions.map((question) => (
            <div key={question.id} className="mb-6">
              <p className="font-medium mb-2">{question.question}</p>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      onChange={() => handleAnswer(question.id, option)}
                      checked={answers[question.id] === option}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Next button */}
      <button
        onClick={handleNextPhase}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={currentPhase === 5}
      >
        {currentPhase === 5 ? "Finish" : "Next Phase"}
      </button>
    </div>
  );
};

export default PhasedQuestionnaire;
