"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import React, { useState } from "react";
import SelectLesson from "./(components)/SelectLesson";

const steps = [
  { id: 1, label: "Select Lesson" },
  { id: 2, label: "Create Quiz" },
];
const CreateQuizz = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      <div className="">
        <h1 className="text-xl font-bold">Create a New Quiz</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* Dot */}
              <div
                className={`w-8 h-8 rounded-full flex items-center  justify-center z-10 text-sm
                ${index === currentStep ? " border-4 border-indigo-600 " : "bg-gray-300 text-gray-700"}`}
              >
                <span
                  className={`${index < currentStep ? "bg-indigo-600 text-white" : "bg-gray-300"} rounded-full w-6 h-6 items-center `}
                ></span>
              </div>
              {/* Label */}
              <div className="mt-2 text-base text-center">{step.label}</div>

              {/* Line (except last step) */}
              {index < steps.length - 1 && (
                <div className="absolute  top-1/4 left-1/2 w-full right-4 h-1 z-1 rounded">
                  <div
                    className={`h-1  ${currentStep > index ? "bg-blue-600" : "bg-gray-300"}`}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
        <Separator />

        {/* Step Content */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          {currentStep === 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Step 1: Select Lesson
              </h2>
              {/* Simulated lesson selection UI */}
              <p>
                Please select the lessons you d like to assign to your class
                from the list below.
              </p>
              <SelectLesson/>
              <Button className="mt-4" onClick={() => setCurrentStep(1)}>
                Next: Create Quiz →
              </Button>
            </>
          )}

          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                Step 2: Create Quiz
              </h2>
              <p>Here the teacher adds questions, answers, and types.</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  ← Back
                </Button>
                <Button>Save Quiz</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuizz;
