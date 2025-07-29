import { Bot, CheckCircle, Loader2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingViewProps {
  currentStep: number;
  progress: number;
  message: string;
  timer: string;
  logs: Array<{
    timestamp: string;
    message: string;
    step: string;
    duration?: number;
  }>;
}

export function ProcessingView({ currentStep, progress, message, timer, logs }: ProcessingViewProps) {
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStepIcon = (step: number) => {
    if (step <= 3) return <CheckCircle className="w-5 h-5 text-secondary" />;
    if (step === 4) return <Loader2 className="w-5 h-5 text-purple animate-spin" />;
    return <CheckCircle className="w-5 h-5 text-secondary" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="text-purple text-2xl animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-neutral mb-2">{message}</h3>
        <p className="text-gray-500">Applying intelligent formatting and structure analysis...</p>
        {currentStep === 4 && (
          <div className="mt-4">
            <div className="bg-purple text-white px-4 py-2 rounded-full text-sm font-medium inline-block">
              <Clock className="w-4 h-4 mr-2 inline" />
              Finalizing with AI... ({timer})
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-secondary" />
            <span className="text-sm text-gray-700">PDF Analysis Complete</span>
          </div>
          <span className="text-xs text-gray-500">0:32</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStepIcon(2)}
            <span className="text-sm text-gray-700">Text Extraction Complete</span>
          </div>
          <span className="text-xs text-gray-500">1:45</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getStepIcon(3)}
            <span className="text-sm text-gray-700">Structure Analysis Complete</span>
          </div>
          <span className="text-xs text-gray-500">2:30</span>
        </div>
        
        <div className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
          currentStep >= 4 ? 'bg-purple/5 border-purple' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center space-x-3">
            {currentStep >= 4 ? (
              <Loader2 className="w-5 h-5 text-purple animate-spin" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            )}
            <span className="text-sm text-gray-700">AI Enhancement in Progress</span>
          </div>
          <span className={`text-xs font-medium ${
            currentStep >= 4 ? 'text-purple' : 'text-gray-500'
          }`}>
            {currentStep >= 4 ? timer : '--:--'}
          </span>
        </div>
      </div>

      <div>
        <div className="bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-purple h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center">
          Processing {currentStep} of 5 steps complete ({progress}%)
        </p>
      </div>
    </div>
  );
}
