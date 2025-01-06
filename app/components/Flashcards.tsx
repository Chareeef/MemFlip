"use client";
import { useState } from "react";
import { Flashcard } from "@/types";

export default function Flashcards({
  flashcards,
}: {
  flashcards: Flashcard[];
}) {
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>(
    {},
  );

  const handleFlip = (index: number) => {
    setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard, index) => (
        <div
          key={index}
          className={`cursor-pointer perspective h-48 w-full`}
          onClick={() => handleFlip(index)}
        >
          <div
            className={`relative w-full h-full max-h-full transition-transform duration-700 transform-style preserve-3d ${
              flippedCards[index] ? "rotate-y-180" : ""
            }`}
          >
            <div className="absolute flex items-center justify-center w-full h-full max-h-full p-4 overflow-auto break-words bg-indigo-100 rounded-lg shadow-md backface-hidden">
              <p className="font-medium text-center text-indigo-800">
                {flashcard.front}
              </p>
            </div>
            <div className="absolute flex items-center justify-center w-full h-full max-h-full p-2 overflow-y-auto font-medium text-center text-black break-words bg-indigo-600 rounded-lg shadow-md md:p-4 backface-hidden rotate-y-180">
              <div className="w-full max-h-full p-1 overflow-y-auto">
                {" "}
                {flashcard.back}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
