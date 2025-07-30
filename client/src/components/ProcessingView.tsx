import { Bot, CheckCircle, Loader2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingViewProps {
  currentStep: number;
  progress: number;
  message: string;
  timer: number; // Changed to number for milliseconds
  logs: Array<{
    timestamp: string;
    message: string;
    step: string;
    duration?: number;
  }>;
}

export function ProcessingView({ currentStep, progress, message, timer, logs }: ProcessingViewProps) {
  const formatTime = (ms: number): string => {
    // Handle NaN, undefined, null, or negative values
    if (!ms || isNaN(ms) || ms < 0) {
      return '0:00';
    }
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    // Ensure we don't get NaN in the output
    const safeMinutes = isNaN(minutes) ? 0 : minutes;
    const safeSeconds = isNaN(remainingSeconds) ? 0 : remainingSeconds;
    
    return `${safeMinutes}:${safeSeconds.toString().padStart(2, '0')}`;
  };

  const getStepIcon = (stepNum: number, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="w-5 h-5 text-secondary" />;
    if (stepNum === currentStep) return <Loader2 className="w-5 h-5 text-purple animate-spin" />;
    return <CheckCircle className="w-5 h-5 text-gray-400" />;
  };

  // Process logs to get timing for each step
  const getStepInfo = (stepType: string) => {
    // First try to find a log with duration from the logs array (from processing state)
    const stepLog = logs.find(log => log.step === stepType && log.duration !== undefined && !isNaN(log.duration));
    if (stepLog && stepLog.duration !== undefined && !isNaN(stepLog.duration)) {
      return {
        isCompleted: true,
        time: formatTime(stepLog.duration),
        timestamp: stepLog.timestamp
      };
    }
    
    // Check if step is currently running and use timer
    const currentTimer = timer && !isNaN(timer) ? timer : 0;
    if (currentStep === 2 && stepType === 'extract') {
      return { isCompleted: false, time: formatTime(currentTimer), timestamp: null };
    }
    if (currentStep === 3 && stepType === 'analyze') {
      return { isCompleted: false, time: formatTime(currentTimer), timestamp: null };
    }
    if (currentStep === 4 && stepType === 'enhance') {
      return { isCompleted: false, time: formatTime(currentTimer), timestamp: null };
    }
    
    return { isCompleted: false, time: '0:00', timestamp: null };
  };

  const extractInfo = getStepInfo('extract');
  const analyzeInfo = getStepInfo('analyze');  
  const enhanceInfo = getStepInfo('enhance');

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
              Finalizing with AI... ({formatTime(timer)})
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          extractInfo.isCompleted ? 'bg-green-50' : currentStep >= 2 ? 'bg-blue-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3">
            {getStepIcon(2, extractInfo.isCompleted)}
            <span className="text-sm text-gray-700">
              {extractInfo.isCompleted ? 'Text Extraction Complete' : 'Text Extraction...'}
            </span>
          </div>
          <span className="text-xs text-gray-500">{extractInfo.time}</span>
        </div>
        
        <div className={`flex items-center justify-between p-4 rounded-lg ${
          analyzeInfo.isCompleted ? 'bg-green-50' : currentStep >= 3 ? 'bg-blue-50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3">
            {getStepIcon(3, analyzeInfo.isCompleted)}
            <span className="text-sm text-gray-700">
              {analyzeInfo.isCompleted ? 'Structure Analysis Complete' : 'Structure Analysis...'}
            </span>
          </div>
          <span className="text-xs text-gray-500">{analyzeInfo.time}</span>
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
          enhanceInfo.isCompleted ? 'bg-green-50 border-green-400' : currentStep >= 4 ? 'bg-purple/5 border-purple' : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center space-x-3">
            {getStepIcon(4, enhanceInfo.isCompleted)}
            <span className="text-sm text-gray-700">
              {enhanceInfo.isCompleted ? 'AI Enhancement Complete' : 'AI Enhancement...'}
            </span>
          </div>
          <span className="text-xs text-gray-500">{enhanceInfo.time}</span>
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


