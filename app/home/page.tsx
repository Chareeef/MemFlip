"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Flashcard } from "@/types";
import Flashcards from "../components/Flashcards";
import { useUser } from "@clerk/nextjs";
import ErrorAlert from "../components/Error";
import { useEffect } from "react";
import { showError } from "../utils";

function FlashcardsModal({
  subject,
  flashcards,
  isOpen,
  onClose,
}: {
  subject: string;
  flashcards: Flashcard[];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-indigo-800">{subject}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <Flashcards flashcards={flashcards} />
        </div>
      </div>
    </div>
  );
}

function FlashcardsSubjects({
  subjects,
  onSubjectClick,
}: {
  subjects: string[];
  onSubjectClick: (subject: string) => void;
}) {
  return (
    <div className="w-full grid sm:grid-cols-2 md:grid-cols-4 gap-4">
      {subjects.map((subject, index) => (
        <button
          key={index}
          onClick={() => onSubjectClick(subject)}
          className="h-24 overflow-auto break-words bg-white rounded-lg shadow-md sm:h-32 hover:shadow-lg transition-shadow duration-300 group"
        >
          <div className="flex items-center justify-center w-full h-full p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300 transition-colors duration-300">
            <span className="font-medium text-center text-indigo-800 break-words group-hover:text-indigo-900 transition-colors duration-300">
              {subject}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const [flashcardsSubjects, setFlashcardsSubjects] = useState<string[]>([]);
  const [openedFlashcards, setOpenedFlashcards] = useState<Flashcard[]>([]);
  const [openedSubject, setOpenedSubject] = useState<string>("");
  const [isOpenFlashcardsModal, setIsOpenFlashcardsModal] =
    useState<boolean>(false);
  const [openError, setOpenError] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    const getSubjects = async () => {
      try {
        const response = await fetch("/api/firestore/get_flashcards_subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();
        setFlashcardsSubjects(data.subjects);
      } catch (error) {
        showError("Something went wrong. Try again!", setError, setOpenError);
      }
    };

    getSubjects();
  }, [user, isLoaded]);

  if (!isLoaded || !user) {
    return (
      <div className="flex flex-col items-center justify-center grow">
        <p className="font-bold text-white">Wait a moment...</p>
      </div>
    );
  }

  async function openFlashcardsSet(subject: string) {
    try {
      const response = await fetch("/api/firestore/get_flashcards_set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, subject }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      setOpenedSubject(subject);
      setOpenedFlashcards(data.flashcardsSet);
      setIsOpenFlashcardsModal(true);
    } catch (error) {
      showError("Something went wrong. Try again!", setError, setOpenError);
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-indigo-100 to-indigo-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Profile info */}
        <div className="mb-8 overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 sm:flex-row">
            <Image
              src={user.imageUrl}
              alt="Profile picture"
              width={120}
              height={120}
              className="mb-4 border-4 border-indigo-500 rounded-full sm:mb-0 sm:mr-6"
            />
            <div className="text-center sm:text-left">
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                {user.fullName}
              </h2>
              <p className="text-indigo-600">Flashcard Enthusiast</p>
            </div>
          </div>
        </div>

        {/* Generate new flashcards button */}
        <div className="mb-8 text-center">
          <Link
            href="/generate_flashcards"
            className="inline-block px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Generate New Flashcards
          </Link>
        </div>

        {/* Flashcard sets */}
        <div className="overflow-hidden bg-white rounded-lg shadow-lg">
          <div className="p-6 sm:p-8">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Your Flashcard Sets
            </h3>
            <FlashcardsSubjects
              subjects={flashcardsSubjects}
              onSubjectClick={openFlashcardsSet}
            />
          </div>
        </div>
      </div>

      <FlashcardsModal
        subject={openedSubject}
        flashcards={openedFlashcards}
        isOpen={isOpenFlashcardsModal}
        onClose={() => setIsOpenFlashcardsModal(false)}
      />
      <ErrorAlert error={error} openError={openError} />
    </div>
  );
}
