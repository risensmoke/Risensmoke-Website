'use client';

import { X } from 'lucide-react';

interface SizeOption {
  label: string;
  price: number;
}

interface SizeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemImage?: string;
  sizeOptions: SizeOption[];
  onSelectSize: (size: SizeOption) => void;
}

export default function SizeSelectionModal({
  isOpen,
  onClose,
  itemName,
  itemImage,
  sizeOptions,
  onSelectSize
}: SizeSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-[100000]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[100001] p-4">
        <div
          className="w-full max-w-md rounded-lg p-6"
          style={{ backgroundColor: '#2a2a2a' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: '#FFD700' }}>
              Select Size
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:opacity-80"
              style={{ color: '#F8F8F8' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Item Name */}
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#F8F8F8' }}>
            {itemName}
          </h3>

          {/* Size Options */}
          <div className="space-y-3">
            {sizeOptions.map((size) => (
              <button
                key={size.label}
                onClick={() => {
                  onSelectSize(size);
                  onClose();
                }}
                className="w-full p-4 rounded-lg border-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: 'rgba(40, 40, 40, 0.8)',
                  borderColor: 'rgba(255, 107, 53, 0.3)',
                  color: '#F8F8F8'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{size.label}</span>
                  <span className="text-lg font-bold" style={{ color: '#FFD700' }}>
                    ${size.price.toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
