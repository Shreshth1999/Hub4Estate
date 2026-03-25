import api from './api';
import { InquiryItem } from '../types/inquiry';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';

export interface AIScanResult {
  items: InquiryItem[];
  warnings?: string[];
  needsConfirmation: boolean;
  detectedLocation?: string;
}

export const aiScanService = {
  // Compress image before upload (saves bandwidth, faster uploads!)
  compressImage: async (imageUri: string): Promise<string> => {
    try {
      console.log('📸 Compressing image...');
      const startTime = Date.now();

      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1920 } }, // Max width 1920px (maintains aspect ratio)
        ],
        {
          compress: 0.7, // 70% quality (good balance of size vs quality)
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const compressionTime = Date.now() - startTime;
      console.log(`✅ Image compressed in ${compressionTime}ms`);
      console.log(`📦 Original: ${imageUri}`);
      console.log(`📦 Compressed: ${compressedImage.uri}`);

      return compressedImage.uri;
    } catch (error) {
      console.error('❌ Image compression failed, using original:', error);
      // Fallback to original if compression fails
      return imageUri;
    }
  },

  // Scan image and extract products using AI
  scanImage: async (imageUri: string): Promise<AIScanResult> => {
    try {
      // Step 1: Compress image first (saves 80% bandwidth!)
      const compressedUri = await aiScanService.compressImage(imageUri);

      // Step 2: Prepare form data
      const formData = new FormData();

      // Extract filename safely
      const filename = compressedUri.split('/').pop() || 'slip.jpg';

      formData.append('image', {
        uri: compressedUri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      // Step 3: Upload to AI endpoint
      console.log('🤖 Sending to AI for analysis...');
      const response = await api.post<AIScanResult>(
        '/slip-scanner/parse',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 45000, // AI processing can take longer
        }
      );

      console.log('✅ AI scan complete:', response.data.items?.length || 0, 'items found');
      return response.data;
    } catch (error: any) {
      // Enhanced error handling
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('AI scan timed out. Please try again with a clearer photo.');
        }
        const message = error.response?.data?.message || error.response?.data?.error;
        if (message) {
          throw new Error(message);
        }
      }

      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection.');
      }

      throw new Error(error.message || 'AI scan failed. Please try again.');
    }
  },
};
