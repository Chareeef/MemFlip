"use client";
import { Flashcard } from "@/types";
import { Dispatch, SetStateAction, useState } from "react";
import Flashcards from "../components/Flashcards";
import { useUser } from "@clerk/nextjs";
import ErrorAlert from "../components/Error";
import { useRouter } from "next/navigation";
import { showError } from "../utils";

function Modal({
  isModalOpen,
  setIsModalOpen,
  subject,
  setSubject,
  numberOfFlashcards,
  setNumberOfFlashcards,
  setFlashcards,
}: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  subject: string;
  setSubject: Dispatch<SetStateAction<string>>;
  numberOfFlashcards: number;
  setNumberOfFlashcards: Dispatch<SetStateAction<number>>;
  setFlashcards: Dispatch<SetStateAction<Flashcard[]>>;
}) {
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState("");

  async function handleRequest() {
    if (!subject) {
      showError("Please specify a Subject.", setError, setOpenError);
      return;
    } else if (!numberOfFlashcards) {
      showError(
        "Please specify a Number of Flashcards.",
        setError,
        setOpenError,
      );
      return;
    }

    try {
      const response = await fetch("/api/generate_flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, numberOfFlashcards }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      } else {
        setFlashcards(data.properties.flashcards.items);
      }

      setIsModalOpen(false);
    } catch (error) {
      showError("Something went wrong. Try again!", setError, setOpenError);
    }
  }

  return (
    <div
      className={`${isModalOpen ? "fixed" : "hidden"} w-[100dvw] h-[100dvh] top-0 bg-black/40 flex items-center justify-center overflow-y-auto`}
    >
      <div className="flex flex-col items-center p-4 justify-evenly gap-y-4">
        <ErrorAlert error={error} openError={openError} />
        <div className="bg-slate-300 rounded-lg min-w-[33dvw] flex flex-col items-center p-4">
          {/* Inputs */}
          <form className="flex flex-col p-4 my-4 border-gray-400 shadow-2xl gap-y-4 border-y-2">
            <legend className="mb-2 text-xl font-bold">
              What would you like to learn today?
            </legend>
            <div className="flex flex-col items-center">
              <label className="font-bold">Subject</label>
              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="p-1 mt-4 text-center border-gray-400 rounded focus:border-gray-600"
              />
            </div>
            <div className="flex flex-col items-center">
              <label className="font-bold">Number of Flashcards</label>
              <input
                type="number"
                placeholder="Number of Flashcards"
                value={numberOfFlashcards > 0 ? numberOfFlashcards : ""}
                onChange={(e) =>
                  setNumberOfFlashcards(parseInt(e.target.value))
                }
                className="p-1 mt-4 text-center border-gray-400 rounded focus:border-gray-600 w-fit"
              />
            </div>
          </form>

          {/* Buttons */}
          <div className="flex justify-around gap-x-4">
            <button className="btn-cta" onClick={handleRequest}>
              Generate
            </button>
            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GenerateFlashcards() {
  const { user } = useUser();
  const [subject, setSubject] = useState("");
  const [numberOfFlashcards, setNumberOfFlashcards] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [openError, setOpenError] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSaveFlashcards() {
    if (!user?.id) {
      showError("It seems you don't have an ID", setError, setOpenError);
      return;
    }

    try {
      const response = await fetch("/api/firestore/save_flashcards/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, subject, flashcards }),
      });

      if (!response.ok) {
        throw new Error();
      } else {
        router.push("/home/");
      }
    } catch (error) {
      showError("Something went wrong. Try again!", setError, setOpenError);
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center relative justify-center w-full gap-4 p-4 bg-tertiary text-center text-black">
      <ErrorAlert error={error} openError={openError} />
      {flashcards.length > 0 ? (
        <>
          <h1 className="text-xl font-bold">{subject}</h1>

          <Flashcards flashcards={flashcards} />

          <div className="flex flex-col items-center md:flex-row gap-4">
            <button
              className="w-full btn-cta md:w-fit"
              onClick={() => setIsModalOpen(true)}
            >
              Generate Other Flashcards
            </button>

            <button
              className="w-full btn-save md:w-fit"
              onClick={handleSaveFlashcards}
            >
              Save Flashcards
            </button>
          </div>
        </>
      ) : (
        <button className="btn-cta" onClick={() => setIsModalOpen(true)}>
          Generate New Flashcards
        </button>
      )}

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        subject={subject}
        setSubject={setSubject}
        numberOfFlashcards={numberOfFlashcards}
        setNumberOfFlashcards={setNumberOfFlashcards}
        setFlashcards={setFlashcards}
      />
    </div>
  );
}
