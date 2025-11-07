'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface CondimentOption {
  label: string;
  price: number;
}

interface CondimentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  condimentOptions: CondimentOption[];
  onComplete: (condiments: CondimentOption[]) => void;
}

export default function CondimentSelectionModal({
  isOpen,
  onClose,
  itemName,
  condimentOptions,
  onComplete
}: CondimentSelectionModalProps) {
  const [selectedCondiments, setSelectedCondiments] = useState<CondimentOption[]>([]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCondiments([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCondimentToggle = (condiment: CondimentOption) => {
    if (selectedCondiments.find(c => c.label === condiment.label)) {
      setSelectedCondiments(selectedCondiments.filter(c => c.label !== condiment.label));
    } else {
      setSelectedCondiments([...selectedCondiments, condiment]);
    }
  };

  const handleComplete = () => {
    onComplete(selectedCondiments);
    onClose();
  };

  const handleSkip = () => {
    onComplete([]);
    onClose();
  };

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
          className="w-full max-w-2xl rounded-lg p-6 max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: '#2a2a2a' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#FFD700' }}>
                Select Condiments
              </h2>
              <p className="text-sm mt-1" style={{ color: '#F8F8F8' }}>
                {itemName}
              </p>
              <p className="text-xs mt-1" style={{ color: '#999' }}>
                Optional - Select all that apply
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:opacity-80"
              style={{ color: '#F8F8F8' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Condiment Options */}
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8F8F8' }}>
              Choose Your Condiments
            </h3>
            <p className="text-sm mb-4" style={{ color: '#999' }}>
              {selectedCondiments.length} selected
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {condimentOptions.map((condiment) => {
                const isSelected = selectedCondiments.find(c => c.label === condiment.label);
                return (
                  <button
                    key={condiment.label}
                    onClick={() => handleCondimentToggle(condiment)}
                    className="p-4 rounded-lg border-2 transition-all text-left relative"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                      borderColor: isSelected ? '#FF6B35' : 'rgba(255, 107, 53, 0.3)',
                      color: '#F8F8F8'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{condiment.label}</span>
                      {isSelected && (
                        <Check className="w-5 h-5" style={{ color: '#FFD700' }} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 rounded-lg font-bold"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#F8F8F8'
                }}
              >
                Skip Condiments
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 py-3 rounded-lg font-bold transition-opacity"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                  color: '#F8F8F8'
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
