import { apiRequest } from "./queryClient";

export interface ProcessingStatus {
  document: {
    id: string;
    filename: string;
    status: string;
    processedText?: string;
    summary?: string;
    wordCount?: number;
    pageCount?: number;
    processingTime?: number;
  };
  processingState: {
    currentStep: number;
    status: string;
    progress: number;
    message: string;
    timer: number;
    logs: Array<{
      timestamp: string;
      message: string;
      step: string;
      duration?: number;
    }>;
  };
}

export interface ProcessingSettings {
  extractionMethod: 'quick' | 'ai-correction' | 'ai-ocr';
  aiLevel: 'basic' | 'standard' | 'advanced';
  outputFormats: {
    text: boolean;
    word: boolean;
    markdown: boolean;
  };
  debugMode: boolean;
}

export const api = {
  async uploadPdf(file: File, settings: ProcessingSettings): Promise<{ documentId: string; status: string }> {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('settings', JSON.stringify(settings));

    const response = await fetch('/api/process-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  },

  async getStatus(documentId: string): Promise<ProcessingStatus> {
    const response = await apiRequest('GET', `/api/status/${documentId}`);
    return response.json();
  },

  async getLogs(documentId: string): Promise<{ logs: any[] }> {
    const response = await apiRequest('GET', `/api/logs/${documentId}`);
    return response.json();
  },

  async downloadText(documentId: string, format: 'txt' | 'json'): Promise<Blob> {
    const response = await fetch(`/api/download/${documentId}/${format}`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    return response.blob();
  }
};
