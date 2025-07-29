import { useState } from 'react';
import { Download, FileText, Plus, Copy, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DocumentSummary } from '@/hooks/usePdfProcessor';

interface ResultsViewProps {
  document: any;
  summary: DocumentSummary | null;
  logs: any[];
  onDownload: (format: 'txt' | 'json') => void;
  onProcessNew: () => void;
  isDownloading: boolean;
}

export function ResultsView({ 
  document, 
  summary, 
  logs, 
  onDownload, 
  onProcessNew, 
  isDownloading 
}: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const formatDebugLogs = () => {
    return logs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      return `[${timestamp}] ${log.message}`;
    }).join('<br>');
  };

  const copyToClipboard = async () => {
    if (document?.processedText) {
      await navigator.clipboard.writeText(document.processedText);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-gray-200">
          <TabsList className="w-full justify-start px-6 bg-transparent">
            <TabsTrigger value="summary" className="border-b-2 border-transparent data-[state=active]:border-primary">
              Summary
            </TabsTrigger>
            <TabsTrigger value="finalText" className="border-b-2 border-transparent data-[state=active]:border-primary">
              Final Text
            </TabsTrigger>
            <TabsTrigger value="debug" className="border-b-2 border-transparent data-[state=active]:border-primary">
              Debug Log
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="summary" className="mt-0">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Document Type</h4>
                <p className="text-lg font-semibold text-neutral">
                  {summary?.documentType || 'Unknown Document'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Pages</h4>
                <p className="text-lg font-semibold text-neutral">
                  {document?.pageCount || summary?.totalPages || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Word Count</h4>
                <p className="text-lg font-semibold text-neutral">
                  {document?.wordCount?.toLocaleString() || summary?.wordCount?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Processing Time</h4>
                <p className="text-lg font-semibold text-neutral">
                  {summary?.processingTime || '0:00'}
                </p>
              </div>
            </div>

            {summary?.aiSummary && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-neutral mb-3">Document Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {summary.aiSummary}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => onDownload('txt')}
                disabled={isDownloading}
                className="bg-secondary text-white hover:bg-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Text (.txt)
              </Button>
              <Button 
                onClick={() => onDownload('json')}
                disabled={isDownloading}
                className="bg-primary text-white hover:bg-blue-600"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Data (.json)
              </Button>
              <Button 
                variant="outline"
                onClick={onProcessNew}
              >
                <Plus className="w-4 h-4 mr-2" />
                Process New PDF
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="finalText" className="mt-0">
            <div className="mb-4 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-neutral">Enhanced Text Output</h4>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Search in text"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {document?.processedText || 'No processed text available.'}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="mt-0">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-neutral">Processing Debug Log</h4>
              <p className="text-sm text-gray-500">Detailed information about the processing steps</p>
            </div>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg max-h-96 overflow-y-auto font-mono text-xs">
              <div dangerouslySetInnerHTML={{ __html: formatDebugLogs() }} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
