import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { selector, useRecoilState, useRecoilValue } from "recoil";
import questionnaire from "../assets/data/questions2.json";
import { answersState, currentPhaseState } from "../utils/recoil/atoms";

const currentQuestionsState = selector({
  key: "currentQuestionsState",
  get: ({ get }) => {
    const currentPhase = get(currentPhaseState);
    const answers = get(answersState);
    const phaseKey = `phase${currentPhase}`;
    const phaseData = questionnaire.questionnaire[phaseKey];

    if (!phaseData) {
      console.warn(`No data found for ${phaseKey}`);
      return [];
    }

    return currentPhase === 1
      ? phaseData
      : phaseData.filter((data) => (data.conditions ? evaluateConditions(data.conditions, answers) : true));
  },
});

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

const PhasedQuestionnaire = () => {
  const [currentPhase, setCurrentPhase] = useRecoilState(currentPhaseState);
  const [answers, setAnswers] = useRecoilState(answersState);
  const currentQuestions = useRecoilValue(currentQuestionsState);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const totalQuestions = currentQuestions.reduce((acc, data) => acc + data.questions.length, 0);
    const answeredQuestions = currentQuestions.reduce(
      (acc, data) => acc + data.questions.filter((question) => answers[question.id]).length,
      0
    );
    const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    setPhaseProgress(progressPercentage);

    if (currentPhase > 5 || (currentPhase === 5 && progressPercentage === 100) || currentQuestions.length === 0) {
      submitResponsesToBackend();
    }
  }, [currentQuestions, answers, currentPhase]);

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNextPhase = () => {
    if (currentPhase < 5) {
      setCurrentPhase((prev) => prev + 1);
    } else {
      submitResponsesToBackend();
    }
  };

  const submitResponsesToBackend = async () => {
    const payload = Object.entries(answers).map(([id, answer]) => ({
      id,
      question: findQuestionById(id),
      answer,
    }));

    setLoading(true);

    try {
      const response = await fetch("https://ourBackend.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses: payload }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Responses submitted successfully");
        navigate("/chatbot", { state: { data } });
      } else {
        console.error("Failed to submit responses");
      }
    } catch (error) {
      console.error("Error submitting responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const findQuestionById = (id) => {
    for (const phase of Object.values(questionnaire.questionnaire)) {
      for (const domain of phase) {
        const question = domain.questions.find((q) => q.id === id);
        if (question) return question.question;
      }
    }
    return "Question not found";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg">Submitting your responses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Security Assessment Questionnaire</h1>

      <div className="mb-6 sticky top-0 z-50">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${phaseProgress}%` }}
          ></div>
        </div>
        <div className="text-right mt-2 text-sm text-gray-600">{Math.round(phaseProgress)}% complete</div>
      </div>

      {currentQuestions.map((data) => (
        <div key={data.domain} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{data.domain}</h2>
          {data.questions.map((question) => (
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

      {currentQuestions.length > 0 && (
        <button
          onClick={handleNextPhase}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={phaseProgress < 100}
        >
          {currentPhase === 5 ? "Finish and Submit" : "Next Phase"}
        </button>
      )}
    </div>
  );
};

export default PhasedQuestionnaire;
