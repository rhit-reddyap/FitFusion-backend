// Barcode scanner hook for food tracking
import { useState, useCallback, useRef } from 'react';

interface BarcodeScannerState {
  isScanning: boolean;
  error: string | null;
  result: string | null;
}

interface BarcodeScannerReturn extends BarcodeScannerState {
  startScanning: () => void;
  stopScanning: () => void;
  clearResult: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const useBarcodeScanner = (): BarcodeScannerReturn => {
  const [state, setState] = useState<BarcodeScannerState>({
    isScanning: false,
    error: null,
    result: null
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isScanning: true, error: null }));

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // In a real implementation, you would integrate with a barcode scanning library
      // like QuaggaJS or ZXing-js here
      console.log('Barcode scanner started - integrate with scanning library');

    } catch (error) {
      setState(prev => ({
        ...prev,
        isScanning: false,
        error: 'Camera access denied or not available'
      }));
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState(prev => ({ ...prev, isScanning: false }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null, error: null }));
  }, []);

  // Mock barcode detection for demo purposes
  const simulateBarcodeDetection = useCallback((barcode: string) => {
    setState(prev => ({
      ...prev,
      result: barcode,
      isScanning: false
    }));
    stopScanning();
  }, [stopScanning]);

  return {
    ...state,
    startScanning,
    stopScanning,
    clearResult,
    videoRef
  };
};

