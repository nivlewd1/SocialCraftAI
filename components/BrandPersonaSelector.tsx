import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, User, Plus, Save, Check, Trash2, Star } from 'lucide-react';
import { brandPersonaService, BrandPersona, CreatePersonaInput } from '../services/brandPersonaService';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

interface BrandPersonaSelectorProps {
  selectedPersona: BrandPersona | null;
  onPersonaChange: (persona: BrandPersona | null) => void;
  onOpenAuth?: () => void;
  collapsed?: boolean;
}

const BrandPersonaSelector: React.FC<BrandPersonaSelectorProps> = ({
  selectedPersona,
  onPersonaChange,
  onOpenAuth,
  collapsed: initialCollapsed = true,
}) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [personas, setPersonas] = useState<BrandPersona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state for quick create
  const [formData, setFormData] = useState<CreatePersonaInput>({
    name: '',
    tone: '',
    audience: '',
  });

  // Load saved personas
  useEffect(() => {
    const loadPersonas = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const loaded = await brandPersonaService.getAll();
        setPersonas(loaded);

        // Auto-select default persona if none selected
        if (!selectedPersona) {
          const defaultPersona = loaded.find(p => p.isDefault);
          if (defaultPersona) {
            onPersonaChange(defaultPersona);
          }
        }
      } catch (error) {
        console.error('Failed to load personas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, [user]);

  const handleSelectPersona = (persona: BrandPersona | null) => {
    onPersonaChange(persona);
    if (persona) {
      setFormData({
        name: persona.name,
        tone: persona.tone,
        audience: persona.audience,
      });
    }
  };

  const handleSavePersona = async () => {
    if (!user) {
      onOpenAuth?.();
      return;
    }

    if (!formData.name || !formData.tone || !formData.audience) {
      return;
    }

    setIsSaving(true);
    try {
      const newPersona = await brandPersonaService.create(formData);
      setPersonas(prev => [newPersona, ...prev]);
      onPersonaChange(newPersona);
      setShowCreateForm(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save persona:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (persona: BrandPersona) => {
    try {
      const updated = await brandPersonaService.setAsDefault(persona.id);
      setPersonas(prev => prev.map(p => ({
        ...p,
        isDefault: p.id === updated.id,
      })));
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    if (!confirm('Delete this persona?')) return;

    try {
      await brandPersonaService.delete(personaId);
      setPersonas(prev => prev.filter(p => p.id !== personaId));
      if (selectedPersona?.id === personaId) {
        onPersonaChange(null);
      }
    } catch (error) {
      console.error('Failed to delete persona:', error);
    }
  };

  const handleInputChange = (field: keyof CreatePersonaInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-surface-900">
              Brand Voice
              <span className="ml-2 text-xs font-normal text-gray-400">(Optional)</span>
            </h3>
            {selectedPersona && (
              <p className="text-xs text-purple-600">{selectedPersona.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* Saved Personas Dropdown */}
          {user && personas.length > 0 && (
            <div className="pt-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Saved Personas
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {/* None option */}
                <button
                  onClick={() => handleSelectPersona(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    !selectedPersona
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm text-gray-500">No persona (default voice)</span>
                </button>

                {personas.map(persona => (
                  <div
                    key={persona.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
                      selectedPersona?.id === persona.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectPersona(persona)}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-surface-900">
                          {persona.name}
                        </span>
                        {persona.isDefault && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {persona.audience}
                      </p>
                    </button>
                    <div className="flex items-center gap-1 ml-2">
                      {!persona.isDefault && (
                        <button
                          onClick={() => handleSetDefault(persona)}
                          className="p-1 text-gray-400 hover:text-yellow-500"
                          title="Set as default"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePersona(persona.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Create / Edit Form */}
          <div className="pt-2">
            {!showCreateForm && user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
              >
                <Plus className="w-4 h-4" />
                Create new persona
              </button>
            )}

            {(showCreateForm || !user || personas.length === 0) && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Persona Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Tech Visionary, Friendly Expert"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => handleInputChange('audience', e.target.value)}
                    placeholder="e.g., CTOs, Gen Z, Small Business Owners"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Tone & Style
                  </label>
                  <textarea
                    value={formData.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    placeholder="e.g., Professional yet approachable, data-driven, slightly provocative"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none h-20"
                  />
                </div>

                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePersona}
                      disabled={isSaving || !formData.name || !formData.tone || !formData.audience}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? (
                        <Spinner size="sm" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Persona
                    </button>
                    {showCreateForm && (
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Sign in to save personas
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-400 pt-2">
            Brand personas help maintain consistent voice across all your content.
            The AI will match your specified tone and target your audience.
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandPersonaSelector;
