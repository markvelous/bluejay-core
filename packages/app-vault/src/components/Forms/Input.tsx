import React, { FunctionComponent, useState } from "react";

export const InputWithPercentage: FunctionComponent<{
  steps?: number[];
  value: string;
  maxValue: number;
  onInputChange: (_input: string) => void;
}> = ({ value, maxValue, onInputChange, steps = [100, 75, 50, 25, 0] }) => {
  const [showSteps, setShowSteps] = useState(false);
  const [stepText, setStepText] = useState(`${steps[0]}%`);

  const setStep = (step: number): void => {
    onInputChange(`${((maxValue * step) / 100).toFixed()}`);
    setShowSteps(false);
    setStepText(`${step}%`);
  };

  const handleInputChange = (input: string): void => {
    onInputChange(input);
  };
  return (
    <div className="flex w-full border border-gray-600 rounded-lg items-center">
      <input
        className="rounded-l-lg flex-grow h-10 outline-none px-4"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <div className="bg-blue-600 text-white rounded-lg m-1 w-24 text-center" onClick={() => setShowSteps(!showSteps)}>
        {showSteps && (
          <div className="absolute grid-cols-1 bg-blue-600 w-24 p-2 rounded-lg divide-y divide-blue-500" style={{}}>
            {steps.map((step) => (
              <div key={step} className="p-1 text-center" onClick={() => setStep(step)}>
                {step}%
              </div>
            ))}
          </div>
        )}
        <div className="p-2">
          {stepText} <span className="text-sm">▼</span>
        </div>
      </div>
    </div>
  );
};
