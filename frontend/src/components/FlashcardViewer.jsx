import React, { useState } from 'react';
import { RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const FlashcardViewer = ({ flashcards = [] }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIdx];

  const handleNext = () => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto my-6 text-center">
      <div className="flex items-center justify-between text-xs font-bold text-[#77736B]">
        <span>Flashcard {currentIdx + 1} of {flashcards.length}</span>
        <span className="text-[#C8A97E]">Click card to flip</span>
      </div>

      {/* Card Container */}
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer min-h-[200px] bg-[#FFFFFF] border border-[#E8E1D5] hover:border-[#C8A97E] rounded-3xl p-8 shadow-xs flex flex-col items-center justify-center relative transition group"
      >
        <span className="absolute top-4 right-4 text-[10px] uppercase font-bold text-[#77736B] bg-[#FAF8F2] px-2 py-0.5 rounded border border-[#E8E1D5]">
          {flipped ? 'Answer' : 'Question'}
        </span>

        <p className={`text-sm md:text-base font-bold leading-relaxed ${flipped ? 'text-[#C8A97E]' : 'text-[#2D2B2A]'}`}>
          {flipped ? currentCard.back || currentCard.answer : currentCard.front || currentCard.question}
        </p>

        <div className="absolute bottom-3 text-[11px] text-[#A49F96] flex items-center gap-1">
          <RotateCw className="w-3 h-3" /> Tap to flip
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8E1D5] hover:bg-[#F5F1E8] text-[#2D2B2A] transition shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#77736B]">Use arrows to navigate</span>
        <button
          onClick={handleNext}
          className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E8E1D5] hover:bg-[#F5F1E8] text-[#2D2B2A] transition shadow-2xs"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
