'use client';

import { useState, useEffect } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';

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
  const [sideQuantities, setSideQuantities] = useState<Map<string, number>>(new Map());
  const [selectedCondiments, setSelectedCondiments] = useState<SelectionOption[]>([]);

  // Filter out ribs if needed (for Gospel plate)
  const availableMeats = excludeRibs
    ? meatOptions.filter(m => !m.label.toLowerCase().includes('rib'))
    : meatOptions;

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedMeats([]);
      setSideQuantities(new Map());
      setSelectedCondiments([]);
      setCurrentStep(meatCount > 0 ? 1 : 2); // Skip to sides if no meat selection needed
    }
  }, [isOpen, meatCount]);

  // Calculate total sides selected (sum of all quantities)
  const totalSidesSelected = Array.from(sideQuantities.values()).reduce((sum, qty) => sum + qty, 0);

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

  const handleSideIncrease = (side: SelectionOption) => {
    if (totalSidesSelected >= sideCount) return; // Can't add more
    const newQuantities = new Map(sideQuantities);
    const currentQty = newQuantities.get(side.label) || 0;
    newQuantities.set(side.label, currentQty + 1);
    setSideQuantities(newQuantities);
  };

  const handleSideDecrease = (side: SelectionOption) => {
    const newQuantities = new Map(sideQuantities);
    const currentQty = newQuantities.get(side.label) || 0;
    if (currentQty <= 1) {
      newQuantities.delete(side.label);
    } else {
      newQuantities.set(side.label, currentQty - 1);
    }
    setSideQuantities(newQuantities);
  };

  const handleCondimentToggle = (condiment: SelectionOption) => {
    if (selectedCondiments.find(c => c.label === condiment.label)) {
      setSelectedCondiments(selectedCondiments.filter(c => c.label !== condiment.label));
    } else {
      setSelectedCondiments([...selectedCondiments, condiment]);
    }
  };

  const canProceedFromMeats = selectedMeats.length === meatCount;
  const canProceedFromSides = totalSidesSelected === sideCount;

  const handleNext = () => {
    if (currentStep === 1 && canProceedFromMeats) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromSides) {
      setCurrentStep(3);
    }
  };

  // Convert sideQuantities map to array with duplicates for onComplete
  const buildSidesArray = (): SelectionOption[] => {
    const sides: SelectionOption[] = [];
    sideQuantities.forEach((qty, label) => {
      const side = sideOptions.find(s => s.label === label);
      if (side) {
        for (let i = 0; i < qty; i++) {
          sides.push(side);
        }
      }
    });
    return sides;
  };

  const handleComplete = () => {
    onComplete(selectedMeats, buildSidesArray(), selectedCondiments);
    onClose();
  };

  const handleSkipCondiments = () => {
    onComplete(selectedMeats, buildSidesArray(), []);
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
                {totalSidesSelected} of {sideCount} selected
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {sideOptions.map((side) => {
                  const quantity = sideQuantities.get(side.label) || 0;
                  const isSelected = quantity > 0;
                  const canIncrease = totalSidesSelected < sideCount;
                  return (
                    <div
                      key={side.label}
                      className="p-4 rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                        borderColor: isSelected ? '#FF6B35' : 'rgba(255, 107, 53, 0.3)',
                        color: '#F8F8F8'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{side.label}</span>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <button
                              onClick={() => handleSideDecrease(side)}
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: 'rgba(255, 107, 53, 0.5)' }}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                          {isSelected && (
                            <span className="w-6 text-center font-bold" style={{ color: '#FFD700' }}>
                              {quantity}
                            </span>
                          )}
                          <button
                            onClick={() => handleSideIncrease(side)}
                            disabled={!canIncrease}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
                            style={{
                              backgroundColor: canIncrease ? 'rgba(255, 107, 53, 0.5)' : 'rgba(100, 100, 100, 0.3)',
                              opacity: canIncrease ? 1 : 0.5,
                              cursor: canIncrease ? 'pointer' : 'not-allowed'
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
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
