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
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-around p-4 overflow-hidden text-center text-black gap-y-4 bg-tertiary">
      <div className="flex flex-col items-center gap-y-2">
        <Image
          src="/icons/icon.png"
          alt="App Logo"
          height={510}
          width={510}
          className="h-[5rem] w-[5rem] rounded-xl shadow-inner"
          data-aos="fade-left"
        />

        <h1 className="text-2xl font-bold" data-aos="fade-right">
          MemFlip
        </h1>
      </div>

      <ul className="flex flex-col w-full gap-0" data-aos="zoom-out-up">
        {features.map((feature, index) => (
          <li
            className="flex flex-col w-full md:grid md:grid-cols-2 gap-0"
            key={index}
          >
            <div
              className={`${index % 2 === 0 ? "border-l-2" : "md:border-r-2 md:order-2"} border-y-2 border-x-2 md:border-y-2 border-indigo-500 shadow-inner bg-gradient-to-r from-indigo-300 to-violet-300 p-2 flex items-center justify-center h-[10em] md:h-auto`}
              data-aos="zoom-in"
            >
              {feature.text}
            </div>

            <Image
              src={feature.imageURL}
              alt={feature.text}
              height={571}
              width={960}
              data-aos={`zoom-out-${index % 2 === 0 ? "left" : "right"}`}
              className={`border-x-2 ${index === features.length - 1 && "border-b-2"} md:border-y-2 md:border-l-2 md:border-r border-indigo-500 h-full`}
            />
          </li>
        ))}
      </ul>

      <Link href="/sign-up" className="my-4 btn-cta" data-aos="zoom-in-right">
        Take Your Reviews To The Next Level !
      </Link>
    </div>
  );
}
