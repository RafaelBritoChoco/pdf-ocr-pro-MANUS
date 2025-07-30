import { createWorker } from "tesseract.js";

async function testTesseract() {
  try {
    console.log("Attempting to create and initialize Tesseract worker...");
    const worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    console.log("Tesseract worker initialized successfully.");
    await worker.terminate();
    console.log("Tesseract worker terminated.");
  } catch (error) {
    console.error("Error during Tesseract test:", error);
  }
}

testTesseract();


