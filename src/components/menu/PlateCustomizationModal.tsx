'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface SelectionOption {
  label: string;
  price: number;
}

interface PlateCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plateName: string;
  meatCount: number; // 0 for ribs-only plates, 1-3 for others
  sideCount: number; // always 2
  meatOptions: SelectionOption[];
  sideOptions: SelectionOption[];
  condimentOptions: SelectionOption[];
  excludeRibs?: boolean; // for Gospel plate
  onComplete: (meats: SelectionOption[], sides: SelectionOption[], condiments: SelectionOption[]) => void;
}

export default function PlateCustomizationModal({
  isOpen,
  onClose,
  plateName,
  meatCount,
  sideCount,
  meatOptions,
  sideOptions,
  condimentOptions,
  excludeRibs = false,
  onComplete
}: PlateCustomizationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMeats, setSelectedMeats] = useState<SelectionOption[]>([]);
  const [selectedSides, setSelectedSides] = useState<SelectionOption[]>([]);
  const [selectedCondiments, setSelectedCondiments] = useState<SelectionOption[]>([]);

  // Filter out ribs if needed (for Gospel plate)
  const availableMeats = excludeRibs
    ? meatOptions.filter(m => !m.label.toLowerCase().includes('rib'))
    : meatOptions;

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedMeats([]);
      setSelectedSides([]);
      setSelectedCondiments([]);
      setCurrentStep(meatCount > 0 ? 1 : 2); // Skip to sides if no meat selection needed
    }
  }, [isOpen, meatCount]);

  if (!isOpen) return null;

  const totalSteps = meatCount > 0 ? 3 : 2; // 3 steps if meats, 2 steps if no meats (ribs-only)
  const displayStep = meatCount > 0 ? currentStep : currentStep - 1;

  const handleMeatToggle = (meat: SelectionOption) => {
    if (selectedMeats.find(m => m.label === meat.label)) {
      setSelectedMeats(selectedMeats.filter(m => m.label !== meat.label));
    } else if (selectedMeats.length < meatCount) {
      setSelectedMeats([...selectedMeats, meat]);
    }
  };

  const handleSideToggle = (side: SelectionOption) => {
    if (selectedSides.find(s => s.label === side.label)) {
      setSelectedSides(selectedSides.filter(s => s.label !== side.label));
    } else if (selectedSides.length < sideCount) {
      setSelectedSides([...selectedSides, side]);
    }
  };

  const handleCondimentToggle = (condiment: SelectionOption) => {
    if (selectedCondiments.find(c => c.label === condiment.label)) {
      setSelectedCondiments(selectedCondiments.filter(c => c.label !== condiment.label));
    } else {
      setSelectedCondiments([...selectedCondiments, condiment]);
    }
  };

  const canProceedFromMeats = selectedMeats.length === meatCount;
  const canProceedFromSides = selectedSides.length === sideCount;

  const handleNext = () => {
    if (currentStep === 1 && canProceedFromMeats) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromSides) {
      setCurrentStep(3);
    }
  };

  const handleComplete = () => {
    onComplete(selectedMeats, selectedSides, selectedCondiments);
    onClose();
  };

  const handleSkipCondiments = () => {
    onComplete(selectedMeats, selectedSides, []);
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
                Customize Your Plate
              </h2>
              <p className="text-sm mt-1" style={{ color: '#F8F8F8' }}>
                {plateName}
              </p>
              <p className="text-xs mt-1" style={{ color: '#FF6B35' }}>
                Step {displayStep} of {totalSteps}
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

          {/* Step 1: Meat Selection */}
          {meatCount > 0 && currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8F8F8' }}>
                Select {meatCount} {meatCount === 1 ? 'Meat' : 'Meats'}
              </h3>
              <p className="text-sm mb-4" style={{ color: '#999' }}>
                {selectedMeats.length} of {meatCount} selected
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {availableMeats.map((meat) => {
                  const isSelected = selectedMeats.find(m => m.label === meat.label);
                  return (
                    <button
                      key={meat.label}
                      onClick={() => handleMeatToggle(meat)}
                      className="p-4 rounded-lg border-2 transition-all text-left relative"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                        borderColor: isSelected ? '#FF6B35' : 'rgba(255, 107, 53, 0.3)',
                        color: '#F8F8F8'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{meat.label}</span>
                        {isSelected && (
                          <Check className="w-5 h-5" style={{ color: '#FFD700' }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceedFromMeats}
                className="w-full py-3 rounded-lg font-bold transition-opacity"
                style={{
                  background: canProceedFromMeats ? 'linear-gradient(135deg, #FF6B35, #D32F2F)' : '#555',
                  color: '#F8F8F8',
                  opacity: canProceedFromMeats ? 1 : 0.5,
                  cursor: canProceedFromMeats ? 'pointer' : 'not-allowed'
                }}
              >
                Continue to Sides
              </button>
            </div>
          )}

          {/* Step 2: Sides Selection */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8F8F8' }}>
                Select {sideCount} Sides
              </h3>
              <p className="text-sm mb-4" style={{ color: '#999' }}>
                {selectedSides.length} of {sideCount} selected
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {sideOptions.map((side) => {
                  const isSelected = selectedSides.find(s => s.label === side.label);
                  return (
                    <button
                      key={side.label}
                      onClick={() => handleSideToggle(side)}
                      className="p-4 rounded-lg border-2 transition-all text-left relative"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                        borderColor: isSelected ? '#FF6B35' : 'rgba(255, 107, 53, 0.3)',
                        color: '#F8F8F8'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{side.label}</span>
                        {isSelected && (
                          <Check className="w-5 h-5" style={{ color: '#FFD700' }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                {meatCount > 0 && (
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 rounded-lg font-bold"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#F8F8F8'
                    }}
                  >
                    Back to Meats
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceedFromSides}
                  className="flex-1 py-3 rounded-lg font-bold transition-opacity"
                  style={{
                    background: canProceedFromSides ? 'linear-gradient(135deg, #FF6B35, #D32F2F)' : '#555',
                    color: '#F8F8F8',
                    opacity: canProceedFromSides ? 1 : 0.5,
                    cursor: canProceedFromSides ? 'pointer' : 'not-allowed'
                  }}
                >
                  Continue to Condiments
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Condiments Selection */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8F8F8' }}>
                Choose Your Condiments
              </h3>
              <p className="text-sm mb-4" style={{ color: '#999' }}>
                Optional - Select all that apply ({selectedCondiments.length} selected)
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

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 rounded-lg font-bold"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#F8F8F8'
                  }}
                >
                  Back to Sides
                </button>
                <button
                  onClick={handleSkipCondiments}
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
                  className="flex-1 py-3 rounded-lg font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                    color: '#F8F8F8'
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
