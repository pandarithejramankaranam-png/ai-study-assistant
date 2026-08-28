import React, { useState } from 'react';
import { X, CheckCircle, XCircle, RotateCcw, Award } from 'lucide-react';

export const QuizModal = ({ quizData, onClose }) => {
  const mcqs = quizData?.mcqs || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (mcqs.length === 0) return null;

  const currentQ = mcqs[currentIdx];
  const isSelected = selectedAnswers[currentIdx] !== undefined;

  const handleSelectOption = (optIdx) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    mcqs.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answerIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2B2A]/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FFFFFF] border border-[#E8E1D5] rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-xl relative text-left space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5]">
              Interactive MCQ Quiz
            </span>
            <h2 className="text-lg font-bold text-[#2D2B2A] mt-1">{quizData.topic || 'Study Quiz'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#77736B] hover:text-[#2D2B2A] rounded-xl hover:bg-[#FAF8F2] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!submitted ? (
          <div className="space-y-6">
            {/* Question Counter */}
            <div className="flex items-center justify-between text-xs font-semibold text-[#77736B]">
              <span>Question {currentIdx + 1} of {mcqs.length}</span>
              <span className="capitalize px-2 py-0.5 rounded bg-[#FAF8F2] border border-[#E8E1D5]">{quizData.difficulty || 'medium'}</span>
            </div>

            {/* Question Text */}
            <h3 className="text-sm md:text-base font-bold text-[#2D2B2A] leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isPicked = selectedAnswers[currentIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs font-semibold border transition flex items-center justify-between ${
                      isPicked
                        ? 'bg-[#F5F1E8] border-[#C8A97E] text-[#C8A97E]'
                        : 'bg-[#FAF8F2] border-[#E8E1D5] text-[#2D2B2A] hover:bg-[#F5F1E8]/50'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      isPicked ? 'border-[#C8A97E] bg-[#C8A97E] text-white' : 'border-[#E8E1D5]'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D5]">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 text-xs font-bold text-[#77736B] hover:text-[#2D2B2A] disabled:opacity-30"
              >
                Previous
              </button>

              {currentIdx < mcqs.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-5 py-2 bg-[#C8A97E] hover:bg-[#B8976C] text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  className="px-5 py-2 bg-[#A8B5A2] hover:bg-[#94A48E] text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="py-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#F5F1E8] text-[#C8A97E] border border-[#E8E1D5] flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#2D2B2A]">Quiz Completed!</h3>
              <p className="text-2xl font-bold text-[#C8A97E]">
                Score: {calculateScore()} / {mcqs.length}
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedAnswers({});
                  setSubmitted(false);
                  setCurrentIdx(0);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#FAF8F2] border border-[#E8E1D5] hover:bg-[#F5F1E8] text-[#2D2B2A] rounded-xl transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-[#C8A97E] hover:bg-[#B8976C] text-white rounded-xl shadow-xs transition"
              >
                Close Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
