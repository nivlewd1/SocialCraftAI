import React, { useState } from 'react';
import { X, Zap, Check, CreditCard, Sparkles } from 'lucide-react';
import { TOPUP_PACKS, CREDIT_COSTS, calculatePotentialGenerations } from '../config/pricing';
import { useSubscription } from '../contexts/SubscriptionContext';

// =====================================================
// TopUpModal Component
// =====================================================
// Modal for purchasing additional credits
// Shows pack options with volume discounts
// =====================================================

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (packId: string) => Promise<void>;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
}) => {
  const { subscription } = useSubscription();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedPack || !onPurchase) return;

    setIsProcessing(true);
    setError(null);

    try {
      await onPurchase(selectedPack);
      onClose();
    } catch (err) {
      setError('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPricePerCredit = (credits: number, price: number): string => {
    return (price / credits).toFixed(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Top Up Credits</h2>
              <p className="text-sm text-gray-400">
                Purchased credits never expire
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current balance */}
        {subscription && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <span className="text-sm text-gray-400">Current Balance</span>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">Monthly</div>
                  <div className="text-white font-medium">
                    {subscription.subscriptionCredits.toLocaleString()}
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-700" />
                <div className="text-right">
                  <div className="text-sm text-gray-500">Purchased</div>
                  <div className="text-purple-400 font-medium">
                    {subscription.purchasedCredits.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pack options */}
        <div className="p-6 space-y-3">
          {TOPUP_PACKS.map((pack) => {
            const isSelected = selectedPack === pack.id;
            const generations = calculatePotentialGenerations(pack.credits);

            return (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">
                        {pack.name}
                      </span>
                      {pack.savings && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                          {pack.savings}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      {pack.credits.toLocaleString()} credits
                      <span className="text-gray-600 ml-2">
                        (${getPricePerCredit(pack.credits, pack.price)}/credit)
                      </span>
                    </div>

                    {/* What you can create */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                        {generations.text} texts
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                        {generations.image} images
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                        {generations.video} videos
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-white">
                      ${pack.price}
                    </span>
                    <div
                      className={`mt-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Credit exchange info */}
        <div className="px-6 pb-4">
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">
                Credit Exchange Rates
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Text</div>
                <div className="text-white font-medium">{CREDIT_COSTS.text} credit</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Image</div>
                <div className="text-white font-medium">{CREDIT_COSTS.image} credits</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-gray-400">Video</div>
                <div className="text-white font-medium">{CREDIT_COSTS.video} credits</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-800">
          <button
            onClick={handlePurchase}
            disabled={!selectedPack || isProcessing}
            className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              selectedPack && !isProcessing
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                {selectedPack
                  ? `Purchase ${TOPUP_PACKS.find((p) => p.id === selectedPack)?.name}`
                  : 'Select a pack'}
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            Secure payment powered by Stripe. Credits are added instantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
