import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ProcessingStatus, type ProcessingSettings } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface DocumentSummary {
  documentType: string;
  totalPages: number;
  wordCount: number;
  processingTime: string;
  aiSummary: string;
}

export function usePdfProcessor() {
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Default processing settings
  const [settings, setSettings] = useState<ProcessingSettings>({
    extractionMethod: 'quick',
    aiLevel: 'standard',
    outputFormats: {
      text: true,
      word: true,
      markdown: false
    },
    debugMode: false
  });

  // Query for processing status
  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/status', currentDocumentId],
    queryFn: () => currentDocumentId ? api.getStatus(currentDocumentId) : null,
    enabled: !!currentDocumentId && !isCompleted,
    refetchInterval: currentDocumentId && !isCompleted ? 2000 : false,
  });

  // Query for logs
  const { data: logsData } = useQuery({
    queryKey: ['/api/logs', currentDocumentId],
    queryFn: () => currentDocumentId ? api.getLogs(currentDocumentId) : null,
    enabled: !!currentDocumentId,
    refetchInterval: currentDocumentId && !isCompleted ? 5000 : false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, settings }: { file: File; settings: ProcessingSettings }) => 
      api.uploadPdf(file, settings),
    onSuccess: (data) => {
      setCurrentDocumentId(data.documentId);
      setCurrentStep(2);
      setTimer(0);
      setIsCompleted(false);
      toast({
        title: "Upload successful",
        description: "PDF upload completed. Processing started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: ({ documentId, format }: { documentId: string; format: 'txt' | 'json' }) =>
      api.downloadText(documentId, format),
    onSuccess: (blob, variables) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_document.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your processed document is being downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentDocumentId && !isCompleted && status?.processingState.status === 'processing') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentDocumentId, isCompleted, status?.processingState.status]);

  // Update current step based on status
  useEffect(() => {
    if (status?.processingState) {
      setCurrentStep(status.processingState.currentStep);
      
      if (status.processingState.status === 'completed') {
        setIsCompleted(true);
        setCurrentStep(5);
      } else if (status.processingState.status === 'error') {
        toast({
          title: "Processing failed",
          description: status.processingState.message,
          variant: "destructive",
        });
      }
    }
  }, [status, toast]);

  const uploadPdf = useCallback((file: File) => {
    uploadMutation.mutate({ file, settings });
  }, [uploadMutation, settings]);

  const downloadText = useCallback((format: 'txt' | 'json' = 'txt') => {
    if (currentDocumentId) {
      downloadMutation.mutate({ documentId: currentDocumentId, format });
    }
  }, [currentDocumentId, downloadMutation]);

  const processNewPdf = useCallback(() => {
    setCurrentDocumentId(null);
    setCurrentStep(1);
    setTimer(0);
    setIsCompleted(false);
    queryClient.clear();
  }, [queryClient]);

  // Parse summary data
  const summary: DocumentSummary | null = status?.document.summary 
    ? (() => {
        try {
          return JSON.parse(status.document.summary);
        } catch {
          return null;
        }
      })()
    : null;

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    // State
    currentStep,
    timer: formatTimer(timer),
    isProcessing: !!currentDocumentId && !isCompleted,
    isCompleted,
    settings,
    
    // Data
    document: status?.document,
    processingState: status?.processingState,
    logs: logsData?.logs || [],
    summary,
    
    // Computed values
    isLoading: isLoading || uploadMutation.isPending,
    uploadProgress: uploadMutation.isPending ? 10 : (status?.processingState.progress || 0),
    
    // Actions
    uploadPdf,
    downloadText,
    processNewPdf,
    setSettings,
    
    // Status flags
    isUploading: uploadMutation.isPending,
    isDownloading: downloadMutation.isPending,
  };
}
