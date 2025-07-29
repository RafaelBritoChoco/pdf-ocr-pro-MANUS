import { CheckCircle, Clock, Bot, Download, FileText } from "lucide-react";

interface ProcessingStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Upload PDF", icon: FileText },
  { id: 2, name: "Extract Text", icon: FileText },
  { id: 3, name: "Analyze Structure", icon: Clock },
  { id: 4, name: "AI Enhancement", icon: Bot },
  { id: 5, name: "Download Results", icon: Download },
];

export function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  return (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isEnhancement = step.id === 4;
            
            return (
              <li key={step.id} className="flex items-center">
                <div className={`flex items-center ${
                  isCompleted ? 'text-primary' : 
                  isCurrent ? (isEnhancement ? 'text-purple' : 'text-primary') : 
                  'text-gray-500'
                }`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted ? 'bg-primary text-white' :
                    isCurrent ? (isEnhancement ? 'bg-purple text-white' : 'bg-primary text-white') :
                    'border-2 border-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span className="ml-3 text-sm font-medium">{step.name}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="ml-8 w-8 flex justify-center">
                    <div className="w-px h-8 bg-gray-300" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
