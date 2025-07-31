import { FileText, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProcessingSteps } from '@/components/ProcessingSteps';
import { UploadArea } from '@/components/UploadArea';
import { ProcessingView } from '@/components/ProcessingView';
import { ResultsView } from '@/components/ResultsView';
import { SettingsPanel } from '@/components/SettingsPanel';
import { StatusPanel } from '@/components/StatusPanel';
import { usePdfProcessor } from '@/hooks/usePdfProcessor';

export default function Home() {
  const {
    currentStep,
    timer,
    isProcessing,
    isCompleted,
    settings,
    document,
    processingState,
    logs,
    summary,
    isLoading,
    uploadProgress,
    uploadPdf,
    downloadText,
    processNewPdf,
    setSettings,
    isUploading,
    isDownloading,
  } = usePdfProcessor();

  const renderMainContent = () => {
    if (isCompleted && document) {
      return (
        <ResultsView
          document={document}
          summary={summary}
          logs={logs}
          onDownload={downloadText}
          onProcessNew={processNewPdf}
          isDownloading={isDownloading}
        />
      );
    }

    if (isProcessing && processingState) {
      return (
        <ProcessingView
          currentStep={currentStep}
          progress={uploadProgress}
          message={processingState.message || 'Processing...'}
          timer={Number(timer)}
          logs={logs}
        />
      );
    }

    return (
      <UploadArea
        onUpload={uploadPdf}
        isUploading={isUploading}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-neutral">PDF OCR Pro</h1>
              <span className="px-2 py-1 bg-purple text-white text-xs rounded-full">AI Enhanced</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Processing Steps */}
        <ProcessingSteps currentStep={currentStep} />

        <div className={`grid grid-cols-1 gap-8 ${!isProcessing && !isCompleted ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
          {/* Main Content Area */}
          <div className={!isProcessing && !isCompleted ? 'lg:col-span-2' : 'lg:col-span-1'}>
            {renderMainContent()}
          </div>

          {/* Sidebar - Only show when not processing */}
          {!isProcessing && !isCompleted && (
            <div className="lg:col-span-1 space-y-6">
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
              />
              <StatusPanel
                isProcessing={isProcessing}
                queueLength={0}
                apiUsage="0/1000 calls"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
