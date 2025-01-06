"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function LandingPage() {
  const features = [
    {
      text: "Ask for flashcards on any topic of your choice.",
      imageURL: "/screenshots/query_flashcards.png",
    },
    {
      text: "Save your generated flashcards, or request a new set.",
      imageURL: "/screenshots/new_flashcards.png",
    },
    {
      text: "Access all your previously saved flashcard sets.",
      imageURL: "/screenshots/home.png",
    },
    {
      text: "Open a flashcard set and begin your review.",
      imageURL: "/screenshots/review_flashcards.png",
    },
  ];

  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary to-tertiary/50">
      {/* Hero Section */}
      <div className="container px-4 py-8 mx-auto sm:py-12">
        <div className="flex flex-col items-center overflow-hidden text-center space-y-6">
          <div className="relative group" data-aos="fade-down">
            <div className="absolute opacity-25 -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl blur group-hover:opacity-75 transition duration-1000"></div>
            <Image
              src="/icons/icon.png"
              alt="App Logo"
              height={510}
              width={510}
              className="relative w-20 h-20 shadow-xl sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-xl transform transition duration-500 group-hover:scale-105"
            />
          </div>
          <h1
            className="p-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600"
            data-aos="fade-up"
          >
            MemFlip
          </h1>
        </div>
      </div>

      {/* Features Section */}
      <div className="container px-4 py-8 mx-auto overflow-hidden">
        <div className="grid gap-8 sm:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-center ${
                index % 2 === 0 ? "lg:grid-flow-col" : "lg:grid-flow-col-dense"
              }`}
              data-aos="fade-up"
            >
              <div
                className={`relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-100/80 to-violet-100/80 backdrop-blur-sm
                  border border-indigo-200 shadow-lg transform transition duration-500 group-hover:scale-105
                  ${index % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}
                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
              >
                <p className="text-lg font-medium text-center text-gray-800 sm:text-xl">
                  {feature.text}
                </p>
              </div>

              <div
                className={`relative rounded-2xl overflow-hidden shadow-xl transform transition duration-500 group-hover:scale-105
                  ${index % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}
                data-aos={index % 2 === 0 ? "fade-left" : "fade-right"}
              >
                <Image
                  src={feature.imageURL}
                  alt={feature.text}
                  width={960}
                  height={571}
                  className="w-full h-auto"
                  quality={90}
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-indigo-500/10 to-violet-500/10" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container px-4 py-12 mx-auto sm:py-16">
        <div className="flex justify-center" data-aos="zoom-in">
          <Link href="/sign-up">
            <button className="relative px-8 py-6 text-lg text-white shadow-lg group sm:text-xl rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transform transition duration-500 hover:scale-105">
              <span className="relative z-10">
                Take Your Reviews To The Next Level!
              </span>
              <div className="absolute inset-0 opacity-25 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-xl blur group-hover:opacity-50 transition duration-500"></div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
