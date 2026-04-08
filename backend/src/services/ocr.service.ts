import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs/promises';

/**
 * Extract text from image using Tesseract OCR
 * Preprocesses image for better accuracy
 */
export async function parseSlipImage(imagePath: string): Promise<string> {
  try {
    // Preprocess image for better OCR accuracy
    const preprocessedPath = await preprocessImage(imagePath);

    // Perform OCR
    const result = await Tesseract.recognize(preprocessedPath, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          process.stdout.write(JSON.stringify({ level: 'info', event: 'ocr_progress', progress: Math.round(m.progress * 100) }) + '\n');
        }
      },
    });

    // Clean up preprocessed image
    try {
      await fs.unlink(preprocessedPath);
    } catch (err) {
      console.warn('Failed to delete preprocessed image:', err);
    }

    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Preprocess image to improve OCR accuracy
 * - Convert to grayscale
 * - Increase contrast
 * - Resize if too small
 * - Denoise
 */
async function preprocessImage(imagePath: string): Promise<string> {
  const outputPath = imagePath.replace(/(\.[^.]+)$/, '_processed$1');

  await sharp(imagePath)
    .grayscale() // Convert to grayscale
    .normalize() // Normalize contrast
    .sharpen() // Sharpen edges
    .resize(null, 2000, {
      // Resize to min height 2000px for better OCR
      withoutEnlargement: false,
      fit: 'inside',
    })
    .toFile(outputPath);

  return outputPath;
}

/**
 * Alternative: Google Cloud Vision API (if Tesseract accuracy is low)
 * Uncomment and configure if you have Google Cloud credentials
 */
/*
import vision from '@google-cloud/vision';

const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_PATH,
});

export async function parseSlipImageWithGoogle(imagePath: string): Promise<string> {
  try {
    const [result] = await visionClient.textDetection(imagePath);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error('No text detected in image');
    }

    return detections[0].description || '';
  } catch (error) {
    console.error('Google Vision API error:', error);
    throw new Error('Failed to extract text with Google Vision');
  }
}
*/
