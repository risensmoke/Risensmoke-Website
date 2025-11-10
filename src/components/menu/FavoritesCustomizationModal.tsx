'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface SelectionOption {
  label: string;
  price: number;
}

interface ToppingOption extends SelectionOption {
  category: 'topping' | 'dressing';
}

interface FavoritesCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: string;
  meatOptions: SelectionOption[];
  toppingOptions: ToppingOption[];
  condimentOptions: SelectionOption[];
  onComplete: (
    meat: SelectionOption | null,
    includedToppings: ToppingOption[],
    addOnToppings: ToppingOption[],
    condiments: SelectionOption[]
  ) => void;
}

export default function FavoritesCustomizationModal({
  isOpen,
  onClose,
  itemName,
  itemId,
  meatOptions,
  toppingOptions,
  condimentOptions,
  onComplete
}: FavoritesCustomizationModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMeat, setSelectedMeat] = useState<SelectionOption | null>(null);
  const [includedToppings, setIncludedToppings] = useState<ToppingOption[]>([]);
  const [addOnToppings, setAddOnToppings] = useState<ToppingOption[]>([]);
  const [selectedDressing, setSelectedDressing] = useState<ToppingOption | null>(null);
  const [selectedCondiments, setSelectedCondiments] = useState<SelectionOption[]>([]);

  // Determine if meat selection should be shown
  const skipMeatSelection = [
    'red-pit-burrito',
    'baked-potato-plain',
    'baked-potato-stuffed',
    'garden-salad'
  ].includes(itemId);

  // Determine if item is a salad (for dressing selection)
  const isSalad = ['garden-salad', 'chef-salad-meat'].includes(itemId);

  // Auto-select meat for specific items
  useEffect(() => {
    if (isOpen && itemId === 'brisket-nachos') {
      const choppedBrisket = meatOptions.find(m => m.label.toLowerCase().includes('chopped brisket'));
      if (choppedBrisket) {
        setSelectedMeat(choppedBrisket);
      }
    }
  }, [isOpen, itemId, meatOptions]);

  // Auto-select toppings based on item
  useEffect(() => {
    if (isOpen) {
      const autoToppings: ToppingOption[] = [];

      // Shredded Cheddar Cheese auto-selected for specific items
      if (['baked-potato-stuffed', 'baked-potato-loaded', 'chef-salad-meat'].includes(itemId)) {
        const cheese = toppingOptions.find(t => t.label.toLowerCase().includes('shredded cheddar'));
        if (cheese) autoToppings.push(cheese);
      }

      // Sour Cream auto-selected for baked potato items
      if (['baked-potato-stuffed', 'baked-potato-loaded'].includes(itemId)) {
        const sourCream = toppingOptions.find(t => t.label.toLowerCase().includes('sour cream'));
        if (sourCream) autoToppings.push(sourCream);
      }

      // Queso auto-selected for specific items
      if (['brisket-nachos', 'loaded-sidewinder'].includes(itemId)) {
        const queso = toppingOptions.find(t => t.label.toLowerCase().includes('queso'));
        if (queso) autoToppings.push(queso);
      }

      setIncludedToppings(autoToppings);
    }
  }, [isOpen, itemId, toppingOptions]);

  // Get list of auto-selected topping labels for this item (for filtering ADD-ON section)
  const getAutoSelectedLabels = () => {
    const labels: string[] = [];
    if (['baked-potato-stuffed', 'baked-potato-loaded', 'chef-salad-meat'].includes(itemId)) {
      labels.push('Shredded Cheddar Cheese');
    }
    if (['baked-potato-stuffed', 'baked-potato-loaded'].includes(itemId)) {
      labels.push('Sour Cream');
    }
    if (['brisket-nachos', 'loaded-sidewinder'].includes(itemId)) {
      labels.push('Queso');
    }
    return labels;
  };

  const autoSelectedLabels = getAutoSelectedLabels();

  // Filter toppings for salads only (dressings)
  const availableToppings = isSalad
    ? toppingOptions
    : toppingOptions.filter(t => t.category !== 'dressing');

  const regularToppings = availableToppings.filter(t => t.category === 'topping');
  const dressingToppings = availableToppings.filter(t => t.category === 'dressing');

  // Get items that should appear in INCLUDED section (only auto-selected items)
  const includedSectionToppings = regularToppings.filter(t =>
    autoSelectedLabels.includes(t.label)
  );

  // Get items that should appear in ADD-ON section (all items NOT auto-selected)
  let addOnSectionToppings = availableToppings.filter(t =>
    !autoSelectedLabels.includes(t.label)
  );

  // For wraparound, only show Cheddar Cheese and Queso
  if (itemId === 'wraparound') {
    addOnSectionToppings = addOnSectionToppings.filter(t =>
      ['Shredded Cheddar Cheese', 'Queso'].includes(t.label)
    );
  }

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(skipMeatSelection ? 2 : 1);
      if (!skipMeatSelection && itemId !== 'brisket-nachos') {
        setSelectedMeat(null);
      }
      setAddOnToppings([]);
      setSelectedDressing(null);
      setSelectedCondiments([]);
    }
  }, [isOpen, skipMeatSelection, itemId]);

  if (!isOpen) return null;

  const totalSteps = skipMeatSelection ? 2 : 3;

  const handleMeatSelect = (meat: SelectionOption) => {
    // For brisket nachos, meat is locked
    if (itemId === 'brisket-nachos') return;
    setSelectedMeat(meat);
  };

  const handleToppingToggle = (topping: ToppingOption) => {
    // Check if it's in included toppings
    const isIncluded = includedToppings.find(t => t.label === topping.label);

    if (isIncluded) {
      // Remove from included
      setIncludedToppings(includedToppings.filter(t => t.label !== topping.label));
    } else {
      // Check if it's in add-ons
      const isAddOn = addOnToppings.find(t => t.label === topping.label);

      if (isAddOn) {
        // Remove from add-ons
        setAddOnToppings(addOnToppings.filter(t => t.label !== topping.label));
      } else {
        // Add to included (no charge)
        setIncludedToppings([...includedToppings, topping]);
      }
    }
  };

  const handleAddOnToggle = (topping: ToppingOption) => {
    const isAddOn = addOnToppings.find(t => t.label === topping.label);

    if (isAddOn) {
      setAddOnToppings(addOnToppings.filter(t => t.label !== topping.label));
    } else {
      setAddOnToppings([...addOnToppings, topping]);
    }
  };

  const handleDressingSelect = (dressing: ToppingOption) => {
    if (selectedDressing?.label === dressing.label) {
      setSelectedDressing(null);
    } else {
      setSelectedDressing(dressing);
    }
  };

  const handleCondimentToggle = (condiment: SelectionOption) => {
    if (selectedCondiments.find(c => c.label === condiment.label)) {
      setSelectedCondiments(selectedCondiments.filter(c => c.label !== condiment.label));
    } else {
      setSelectedCondiments([...selectedCondiments, condiment]);
    }
  };

  const canProceedFromMeat = skipMeatSelection || selectedMeat !== null;
  const canProceedFromToppings = true; // Toppings are all optional

  const handleNext = () => {
    if (currentStep === 1 && canProceedFromMeat) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedFromToppings) {
      setCurrentStep(skipMeatSelection ? 2 : 3);
    }
  };

  const handleComplete = () => {
    // Combine included toppings with selected dressing (if any)
    const allIncludedToppings = [...includedToppings];
    if (selectedDressing) {
      allIncludedToppings.push(selectedDressing);
    }

    onComplete(selectedMeat, allIncludedToppings, addOnToppings, selectedCondiments);
    onClose();
  };

  const handleSkipCondiments = () => {
    const allIncludedToppings = [...includedToppings];
    if (selectedDressing) {
      allIncludedToppings.push(selectedDressing);
    }

    onComplete(selectedMeat, allIncludedToppings, addOnToppings, []);
    onClose();
  };

  const getStepNumber = () => {
    if (skipMeatSelection) {
      return currentStep === 2 ? 1 : 2;
    }
    return currentStep;
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
                Customize Your Order
              </h2>
              <p className="text-sm mt-1" style={{ color: '#F8F8F8' }}>
                {itemName}
              </p>
              <p className="text-xs mt-1" style={{ color: '#FF6B35' }}>
                Step {getStepNumber()} of {totalSteps}
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
          {!skipMeatSelection && currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8F8F8' }}>
                Choose Your Meat
              </h3>
              <p className="text-sm mb-4" style={{ color: '#999' }}>
                {itemId === 'brisket-nachos' ? 'Chopped Brisket is included' : 'Select one meat'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {meatOptions.map((meat) => {
                  const isSelected = selectedMeat?.label === meat.label;
                  const isLocked = itemId === 'brisket-nachos';

                  return (
                    <button
                      key={meat.label}
                      onClick={() => handleMeatSelect(meat)}
                      disabled={isLocked && isSelected}
                      className="p-4 rounded-lg border-2 transition-all text-left relative"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                        borderColor: isSelected ? '#FF6B35' : 'rgba(255, 107, 53, 0.3)',
                        color: '#F8F8F8',
                        cursor: isLocked && isSelected ? 'not-allowed' : 'pointer'
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
                disabled={!canProceedFromMeat}
                className="w-full py-3 rounded-lg font-bold transition-opacity"
                style={{
                  background: canProceedFromMeat ? 'linear-gradient(135deg, #FF6B35, #D32F2F)' : '#555',
                  color: '#F8F8F8',
                  opacity: canProceedFromMeat ? 1 : 0.5,
                  cursor: canProceedFromMeat ? 'pointer' : 'not-allowed'
                }}
              >
                Continue to Toppings
              </button>
            </div>
          )}

          {/* Step 2: Toppings Selection */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8F8F8' }}>
                Choose Your Toppings
              </h3>
              <p className="text-sm mb-4" style={{ color: '#999' }}>
                Included toppings are free. Add extras for additional charge.
              </p>

              {/* INCLUDED Section - Regular Toppings */}
              {includedSectionToppings.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3" style={{ color: '#FFD700' }}>
                    Toppings - INCLUDED
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {includedSectionToppings.map((topping) => {
                      const isIncluded = includedToppings.find(t => t.label === topping.label);

                      return (
                        <div key={`included-${topping.label}`} className="flex gap-2">
                          {/* Included Toggle */}
                          <button
                            onClick={() => handleToppingToggle(topping)}
                            className="flex-1 p-3 rounded-lg border-2 transition-all text-left"
                            style={{
                              backgroundColor: isIncluded ? 'rgba(255, 107, 53, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                              borderColor: isIncluded ? '#FF6B35' : 'rgba(255, 107, 53, 0.3)',
                              color: '#F8F8F8'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{topping.label}</span>
                              {isIncluded && (
                                <Check className="w-5 h-5" style={{ color: '#FFD700' }} />
                              )}
                            </div>
                          </button>

                          {/* Extra Button */}
                          <button
                            onClick={() => handleAddOnToggle(topping)}
                            className="px-4 py-3 rounded-lg border-2 transition-all"
                            style={{
                              backgroundColor: addOnToppings.find(t => t.label === topping.label) ? 'rgba(255, 215, 0, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                              borderColor: addOnToppings.find(t => t.label === topping.label) ? '#FFD700' : 'rgba(255, 215, 0, 0.3)',
                              color: '#F8F8F8',
                              minWidth: '80px'
                            }}
                          >
                            <div className="text-center">
                              <div className="text-xs mb-1">Extra</div>
                              <div className="font-bold text-sm">${topping.price.toFixed(2)}</div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* INCLUDED Section - Dressings (Single Select for Salads) */}
              {dressingToppings.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3" style={{ color: '#FFD700' }}>
                    Dressings - INCLUDED (Choose One)
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {dressingToppings.map((dressing) => {
                      const isSelected = selectedDressing?.label === dressing.label;

                      return (
                        <div key={`included-${dressing.label}`} className="flex gap-2">
                          {/* Single Select Toggle */}
                          <button
                            onClick={() => handleDressingSelect(dressing)}
                            className="flex-1 p-3 rounded-lg border-2 transition-all text-left"
                            style={{
                              backgroundColor: isSelected ? 'rgba(255, 107, 53, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                              borderColor: isSelected ? '#FF6B35' : 'rgba(255, 107, 53, 0.3)',
                              color: '#F8F8F8'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{dressing.label}</span>
                              {isSelected && (
                                <Check className="w-5 h-5" style={{ color: '#FFD700' }} />
                              )}
                            </div>
                          </button>

                          {/* Extra Button */}
                          <button
                            onClick={() => handleAddOnToggle(dressing)}
                            className="px-4 py-3 rounded-lg border-2 transition-all"
                            style={{
                              backgroundColor: addOnToppings.find(t => t.label === dressing.label) ? 'rgba(255, 215, 0, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                              borderColor: addOnToppings.find(t => t.label === dressing.label) ? '#FFD700' : 'rgba(255, 215, 0, 0.3)',
                              color: '#F8F8F8',
                              minWidth: '80px'
                            }}
                          >
                            <div className="text-center">
                              <div className="text-xs mb-1">Extra</div>
                              <div className="font-bold text-sm">${dressing.price.toFixed(2)}</div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ADD-ON Section - All Additional Toppings */}
              {addOnSectionToppings.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3" style={{ color: '#FFD700' }}>
                    Toppings - ADD-ON
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {addOnSectionToppings.map((topping) => {
                      const isAddOn = addOnToppings.find(t => t.label === topping.label);

                      return (
                        <button
                          key={`addon-${topping.label}`}
                          onClick={() => handleAddOnToggle(topping)}
                          className="p-3 rounded-lg border-2 transition-all text-left"
                          style={{
                            backgroundColor: isAddOn ? 'rgba(255, 215, 0, 0.2)' : 'rgba(40, 40, 40, 0.8)',
                            borderColor: isAddOn ? '#FFD700' : 'rgba(255, 215, 0, 0.3)',
                            color: '#F8F8F8'
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{topping.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold" style={{ color: '#FFD700' }}>
                                ${topping.price.toFixed(2)}
                              </span>
                              {isAddOn && (
                                <Check className="w-5 h-5" style={{ color: '#FFD700' }} />
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {!skipMeatSelection && (
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 rounded-lg font-bold"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#F8F8F8'
                    }}
                  >
                    Back to Meat
                  </button>
                )}
                <button
                  onClick={() => setCurrentStep(skipMeatSelection ? 3 : 3)}
                  className="flex-1 py-3 rounded-lg font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                    color: '#F8F8F8'
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
                  Back to Toppings
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
