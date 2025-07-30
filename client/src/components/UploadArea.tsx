import { useCallback, useState } from 'react';
import { Upload, FileText, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadAreaProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function UploadArea({ onUpload, isUploading }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onUpload(file);
      }
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  }, [onUpload]);

  const handleLoadSample = useCallback(() => {
    // Create a reference to the attached PDF file
    fetch('/attached_assets/Pakistan-Sri Lanka FTA_1753791356677.pdf')
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], 'Pakistan-Sri Lanka FTA_1753791356677.pdf', { type: 'application/pdf' });
        onUpload(file);
      })
      .catch(error => {
        console.error('Error loading sample PDF:', error);
      });
  }, [onUpload]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="text-primary text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-neutral mb-2">Upload PDF Document</h3>
        <p className="text-gray-500 mb-6">Drag and drop your PDF file here, or click to browse</p>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <div className="text-center">
            <FileText className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Choose PDF file or drag it here</p>
            <p className="text-sm text-gray-400">Maximum file size: 50MB</p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 mt-6">
          <Button 
            onClick={() => document.getElementById('file-input')?.click()}
            disabled={isUploading}
            className="bg-primary text-white hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Select File
          </Button>
          <Button 
            variant="outline"
            onClick={handleLoadSample}
            disabled={isUploading}
          >
            <Download className="w-4 h-4 mr-2" />
            Use Sample PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
