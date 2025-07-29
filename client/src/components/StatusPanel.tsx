import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface StatusPanelProps {
  isProcessing: boolean;
  queueLength?: number;
  apiUsage?: string;
}

export function StatusPanel({ isProcessing, queueLength = 0, apiUsage = "0/1000 calls" }: StatusPanelProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-neutral mb-4">System Status</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Connection</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
            <span className="text-sm text-secondary font-medium">Connected</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Gemini AI Status</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
            <span className="text-sm text-secondary font-medium">Active</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Processing Queue</span>
          <span className="text-sm text-gray-600">{queueLength} documents</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">API Usage Today</span>
          <span className="text-sm text-gray-600">{apiUsage}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Processing Status</h4>
        <div className="space-y-2">
          {isProcessing ? (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="w-3 h-3 text-primary mr-2" />
              <span>Document processing in progress...</span>
            </div>
          ) : (
            <div className="flex items-center text-xs text-gray-500">
              <CheckCircle className="w-3 h-3 text-secondary mr-2" />
              <span>System ready for processing</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
