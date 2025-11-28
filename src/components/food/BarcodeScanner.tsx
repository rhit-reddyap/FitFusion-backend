"use client";

import React from 'react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected, onClose }) => {
  const { isScanning, error, videoRef, startScanning, stopScanning } = useBarcodeScanner();

  const handleMockBarcode = () => {
    // Mock barcode for demo
    const mockBarcodes = ['1234567890123', '9876543210987', '5555555555555'];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    onBarcodeDetected(randomBarcode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Scan Barcode</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <video
              ref={videoRef}
              className="w-full h-48 bg-gray-700 rounded-lg"
              playsInline
            />
            <p className="text-gray-400 text-sm mt-2">
              Position barcode within the camera view
            </p>
          </div>

          <div className="flex gap-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Stop Scanning
              </button>
            )}

            <button
              onClick={handleMockBarcode}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Mock Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;


















