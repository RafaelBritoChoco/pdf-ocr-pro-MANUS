import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { pdfProcessor } from "./services/pdfProcessor";
import { geminiService } from "./services/geminiService";
import { TextProcessor } from "./services/textProcessor";
import type { ProcessingSettings, ProcessingState } from "@shared/schema";

const textProcessor = new TextProcessor();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Store processing states in memory
const processingStates = new Map<string, ProcessingState>();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload and process PDF
  app.post("/api/process-pdf", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        console.error("Upload error: No PDF file uploaded");
        return res.status(400).json({ error: "No PDF file uploaded" });
      }

      const settings: ProcessingSettings = req.body.settings ? JSON.parse(req.body.settings) : {
        extractionMethod: "quick",
        aiLevel: "standard",
        outputFormats: { text: true, word: false, markdown: false },
        debugMode: false
      };

      const startTime = new Date();
      
      // Create document record
      const document = await storage.createDocument({
        filename: req.file.originalname,
        status: "processing",
        metadata: settings
      });

      // Initialize processing state
      const processingState: ProcessingState = {
        currentStep: 1,
        status: "processing",
        progress: 10,
        message: "Starting PDF analysis...",
        timer: 0,
        logs: []
      };
      processingStates.set(document.id, processingState);

      // Log start
      await storage.createProcessingLog({
        documentId: document.id,
        step: "upload",
        status: "completed",
        message: `PDF uploaded: ${req.file.originalname}`
      });

      // Start processing asynchronously
      processDocument(document.id, req.file.buffer, settings).catch(error => {
        console.error(`Async processing error for document ${document.id}:`, error);
        // Update document status to failed if async processing fails
        storage.updateDocument(document.id, { status: 'failed' });
        processingStates.set(document.id, { ...processingStates.get(document.id)!, status: 'error', message: `Processing failed: ${error.message}` });
      });

      res.json({
        documentId: document.id,
        status: "processing"
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process PDF" });
    }
  });

  // Get processing status
  app.get("/api/status/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const document = await storage.getDocument(documentId);
      const state = processingStates.get(documentId);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json({
        document,
        processingState: state || {
          currentStep: 5,
          status: "completed",
          progress: 100,
          message: "Processing complete",
          timer: 0,
          logs: []
        }
      });
    } catch (error) {
      console.error("Status error:", error);
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  // Get processing logs
  app.get("/api/logs/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const logs = await storage.getProcessingLogs(documentId);
      res.json({ logs });
    } catch (error) {
      console.error("Logs error:", error);
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  // Download processed text
  app.get("/api/download/:documentId/:format", async (req, res) => {
    try {
      const { documentId, format } = req.params;
      const document = await storage.getDocument(documentId);
      
      if (!document || !document.processedText) {
        return res.status(404).json({ error: "Document or processed text not found" });
      }

      const filename = document.filename.replace(".pdf", "");
      
      if (format === "txt") {
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}_processed.txt"`);
        res.send(document.processedText);
      } else if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}_data.json"`);
        res.json({
          filename: document.filename,
          processedText: document.processedText,
          summary: document.summary,
          metadata: document.metadata,
          wordCount: document.wordCount,
          pageCount: document.pageCount,
          processingTime: document.processingTime
        });
      } else {
        res.status(400).json({ error: "Unsupported format" });
      }
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processDocument(documentId: string, buffer: Buffer, settings: ProcessingSettings) {
  const startTime = new Date();
  let state = processingStates.get(documentId)!;

  // Function to update timer
  const updateTimer = () => {
    const currentTime = new Date();
    state.timer = currentTime.getTime() - startTime.getTime();
    processingStates.set(documentId, state);
  };

  // Start timer updates
  const timerInterval = setInterval(updateTimer, 1000); // Update every second

  try {
    // Step 1: Extract text
    const extractionStartTime = new Date();
    state.currentStep = 2;
    state.message = "Extracting text from PDF...";
    state.progress = 25;
    updateTimer();

    await storage.createProcessingLog({
      documentId,
      step: 'extract',
      status: 'started',
      message: 'Starting text extraction'
    });

    const extractionResult = await pdfProcessor.extractText(buffer, settings);
    const extractionEndTime = new Date();
    const extractionDuration = extractionEndTime.getTime() - extractionStartTime.getTime();
    
    await storage.updateDocument(documentId, {
      originalText: extractionResult.text,
      pageCount: extractionResult.pageCount,
      wordCount: extractionResult.wordCount
    });

    await storage.createProcessingLog({
      documentId,
      step: "extract",
      status: "completed",
      message: `Text extracted: ${extractionResult.wordCount} words, ${extractionResult.pageCount} pages`,
      duration: extractionDuration
    });

    // Step 2: Analyze structure
    const analysisStartTime = new Date();
    state.currentStep = 3;
    state.message = "Analyzing document structure...";
    state.progress = 50;
    state.logs.push({
      timestamp: extractionEndTime.toISOString(),
      message: `Text Extraction Complete`,
      step: "extract",
      duration: extractionDuration
    });
    updateTimer();

    await storage.createProcessingLog({
      documentId,
      step: 'analyze',
      status: 'started',
      message: 'Analyzing document structure'
    });

    // Process text structure
    // Using the textProcessor.reorganizeContent para formatar os parágrafos
    let processedText = textProcessor.reorganizeContent(extractionResult.text);
    const analysisEndTime = new Date();
    const analysisDuration = analysisEndTime.getTime() - analysisStartTime.getTime();

    await storage.createProcessingLog({
      documentId,
      step: "analyze",
      status: "completed",
      message: "Document structure analysis completed",
      duration: analysisDuration
    });

    // Step 3: AI Enhancement
    const enhancementStartTime = new Date();
    state.currentStep = 4;
    state.message = "AI enhancement in progress...";
    state.progress = 75;
    state.logs.push({
      timestamp: analysisEndTime.toISOString(),
      message: `Structure Analysis Complete`,
      step: "analyze",
      duration: analysisDuration
    });
    updateTimer();

    await storage.createProcessingLog({
      documentId,
      step: 'enhance',
      status: 'started',
      message: 'Starting AI enhancement'
    });

    // Process with AI if text is large, chunk it
    if (processedText.length > 20000) {
      const chunks = pdfProcessor.chunkText(processedText, 4000);
      let enhancedChunks: string[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunkStartTime = new Date();
        state.message = `AI analyzing text chunk ${i + 1}/${chunks.length} - Improving formatting and structure...`;
        updateTimer();
        
        const enhanced = await geminiService.processTextChunk(chunks[i], i, chunks.length);
        const chunkEndTime = new Date();
        const chunkDuration = chunkEndTime.getTime() - chunkStartTime.getTime();

        enhancedChunks.push(enhanced);
        
        // Update progress
        const chunkProgress = 75 + (20 * (i + 1) / chunks.length);
        state.progress = chunkProgress;
        state.logs.push({
          timestamp: chunkEndTime.toISOString(),
          message: `AI Chunk ${i + 1} Processed`,
          step: "enhance_chunk",
          duration: chunkDuration
        });
        updateTimer();
      }
      
      processedText = enhancedChunks.join("\n\n");
    } else {
      state.message = 'AI enhancing text quality and structure...';
      updateTimer();
      const enhancementResult = await geminiService.enhanceText(processedText, settings.aiLevel);
      processedText = enhancementResult.enhancedText;
    }

    // Generate summary
    state.message = 'AI generating document summary...';
    updateTimer();
    const summary = await geminiService.generateSummary(processedText);
    const enhancementEndTime = new Date();
    const enhancementDuration = enhancementEndTime.getTime() - enhancementStartTime.getTime();
    
    const endTime = new Date();
    const processingTimeMs = endTime.getTime() - startTime.getTime();
    const processingTimeStr = `${Math.floor(processingTimeMs / 60000)}:${Math.floor((processingTimeMs % 60000) / 1000).toString().padStart(2, "0")}`;

    // Update document with final results
    await storage.updateDocument(documentId, {
      processedText,
      summary: JSON.stringify({
        ...summary,
        totalPages: extractionResult.pageCount,
        wordCount: extractionResult.wordCount,
        processingTime: processingTimeStr
      }),
      status: "completed",
      processingTime: Math.floor(processingTimeMs / 1000)
    });

    await storage.createProcessingLog({
      documentId,
      step: "enhance",
      status: "completed",
      message: "AI enhancement completed successfully",
      duration: enhancementDuration
    });

    // Final state
    state.currentStep = 5;
    state.status = "completed";
    state.message = "Processing completed successfully";
    state.progress = 100;
    state.timer = processingTimeMs; // Update total timer
    state.logs.push({
      timestamp: enhancementEndTime.toISOString(),
      message: `AI Enhancement Complete`,
      step: "enhance",
      duration: enhancementDuration
    });
    updateTimer();
    
    // Clear the timer interval
    clearInterval(timerInterval);

  } catch (error) {
    console.error('Processing error:', error);
    
    await storage.updateDocument(documentId, {
      status: "failed"
    });

    await storage.createProcessingLog({
      documentId,
      step: "error",
      status: "failed",
      message: `Processing failed: ${error}`
    });

    state.status = "error";
    state.message = `Processing failed: ${error}`;
    state.timer = new Date().getTime() - startTime.getTime(); // Update timer on error
    processingStates.set(documentId, state);
  }
}




