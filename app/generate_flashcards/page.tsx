"use client";
import { Flashcard } from "@/types";
import { Dispatch, SetStateAction, useState } from "react";
import Flashcards from "../components/Flashcards";
import { useUser } from "@clerk/nextjs";
import Alert from "../components/Alert";
import { useRouter } from "next/navigation";
import { showAlert } from "../utils";

function Modal({
  isModalOpen,
  setIsModalOpen,
  subject,
  setSubject,
  numberOfFlashcards,
  setNumberOfFlashcards,
  setFlashcards,
  setOpenAlert,
  setAlertType,
  setAlertMessage,
}: {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  subject: string;
  setSubject: Dispatch<SetStateAction<string>>;
  numberOfFlashcards: number;
  setNumberOfFlashcards: Dispatch<SetStateAction<number>>;
  setFlashcards: Dispatch<SetStateAction<Flashcard[]>>;
  setOpenAlert: Dispatch<SetStateAction<boolean>>;
  setAlertMessage: Dispatch<SetStateAction<string>>;
  setAlertType: Dispatch<SetStateAction<string>>;
}) {
  async function handleRequest() {
    if (!subject) {
      showAlert(
        "Please specify a Subject.",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
      return;
    } else if (!numberOfFlashcards) {
      showAlert(
        "Please specify a Number of Flashcards.",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
      return;
    }

    try {
      showAlert(
        "Saving flashcards...",
        "loading",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );

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
      showAlert(
        "Flashcards generated successfully!",
        "success",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );

      setIsModalOpen(false);
    } catch (message) {
      showAlert(
        "Something went wrong. Try again!",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
    }
  }

  return (
    <div
      className={`${
        isModalOpen ? "fixed" : "hidden"
      } inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50`}
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Generate Flashcards
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full px-2 mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter subject"
              />
            </div>
            <div>
              <label
                htmlFor="numberOfFlashcards"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Flashcards
              </label>
              <input
                type="number"
                id="numberOfFlashcards"
                value={numberOfFlashcards > 0 ? numberOfFlashcards : ""}
                onChange={(e) =>
                  setNumberOfFlashcards(parseInt(e.target.value))
                }
                className="block w-full pl-2 pr-1 mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="Enter number of flashcards"
              />
            </div>
          </form>
          <div className="flex justify-end mt-6 space-x-3">
            <button
              className="px-4 py-2 text-gray-800 bg-gray-300 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
            <button
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300"
              onClick={handleRequest}
            >
              Generate
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
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const router = useRouter();

  async function handleSaveFlashcards() {
    if (!user?.id) {
      showAlert(
        "It seems you are not logged in.",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
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
        showAlert(
          "Flashcards saved successfully!",
          "success",
          setAlertMessage,
          setOpenAlert,
          setAlertType,
        );
        router.push("/home/");
      }
    } catch {
      showAlert(
        "Something went wrong. Try again!",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
    }
  }

  return (
    <div className="px-4 py-8 border-4 border-white rounded-lg grow bg-gradient-to-b from-indigo-100 to-indigo-200 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <Alert message={alertMessage} openAlert={openAlert} type={alertType} />
        {flashcards.length > 0 ? (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center text-indigo-800">
              {subject}
            </h1>
            <Flashcards flashcards={flashcards} />
            <div className="flex flex-col items-center justify-center sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                className="w-full px-6 py-3 text-white bg-indigo-600 sm:w-auto rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300"
                onClick={() => setIsModalOpen(true)}
              >
                Generate Other Flashcards
              </button>
              <button
                className="w-full px-6 py-3 text-white bg-green-600 sm:w-auto rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-300"
                onClick={handleSaveFlashcards}
              >
                Save Flashcards
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="mb-8 text-3xl font-bold text-indigo-800">
              Generate Flashcards
            </h1>
            <button
              className="px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              Generate New Flashcards
            </button>
          </div>
        )}
      </div>
      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        subject={subject}
        setSubject={setSubject}
        numberOfFlashcards={numberOfFlashcards}
        setNumberOfFlashcards={setNumberOfFlashcards}
        setFlashcards={setFlashcards}
        setOpenAlert={setOpenAlert}
        setAlertMessage={setAlertMessage}
        setAlertType={setAlertType}
      />
    </div>
  );
}
