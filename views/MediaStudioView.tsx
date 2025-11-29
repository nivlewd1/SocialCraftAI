import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateImage, generateVideo, getVideosOperation, editImage } from '../services/geminiService';
import { VideoOperation, SavedMedia, UploadedImage } from '../types';
import Spinner from '../components/Spinner';
import { Clapperboard, Image as ImageIcon, Sparkles, AlertTriangle, KeyRound, Download, Save, Check, UploadCloud, X, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { CreditBadge, WatermarkOverlay } from '../components/WatermarkOverlay';
import { CREDIT_COSTS } from '../config/pricing';
import { mediaService } from '../services/mediaService';

// Helper function to convert base64 data URL to Blob
const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const byteString = atob(parts[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([intArray], { type: mime });
};

type AspectRatioImage = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
type AspectRatioVideo = '16:9' | '9:16';
type ResolutionVideo = '1080p' | '720p';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface MediaStudioViewProps {
    onOpenAuth: () => void;
}

const MediaStudioView: React.FC<MediaStudioViewProps> = ({ onOpenAuth }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const initialPrompt = location.state?.prompt || '';
    const initialTab = location.state?.tab || 'image';

    const [activeTab, setActiveTab] = useState<'image' | 'video'>(initialTab);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state?.tab]);

    useEffect(() => {
        // Clear state after it's been used to avoid it persisting on reload
        if (location.state) {
            navigate('.', { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight">
                    Media <span className="gradient-text">Studio</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-surface-900">
                    Create or edit stunning visuals and videos from simple text prompts and your own images.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-center border-b border-gray-300">
                    <TabButton
                        label="Image Generation & Editing"
                        icon={<ImageIcon size={16} />}
                        isActive={activeTab === 'image'}
                        onClick={() => setActiveTab('image')}
                    />
                    <TabButton
                        label="Video Generation"
                        icon={<Clapperboard size={16} />}
                        isActive={activeTab === 'video'}
                        onClick={() => setActiveTab('video')}
                    />
                </div>
                <div className="mt-6">
                    {activeTab === 'image' && <ImageGenerator initialPrompt={initialPrompt} onOpenAuth={onOpenAuth} />}
                    {activeTab === 'video' && <VideoGenerator initialPrompt={initialPrompt} onOpenAuth={onOpenAuth} />}
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 ${isActive
            ? 'border-brand-primary text-brand-primary'
            : 'border-transparent text-surface-900 hover:text-brand-primary hover:border-surface-200'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ImagePreview: React.FC<{ src: string; name: string; onRemove: () => void; }> = ({ src, name, onRemove }) => (
    <div className="relative group w-24 h-24 border border-gray-300 rounded-md overflow-hidden flex-shrink-0">
        <img src={src} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
                onClick={onRemove}
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-status-error"
                title="Remove image"
            >
                <X size={16} />
            </button>
        </div>
    </div>
);


const ImageGenerator: React.FC<{ initialPrompt?: string; onOpenAuth: () => void }> = ({ initialPrompt, onOpenAuth }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { subscription, canGenerateType, deductCredits } = useSubscription();

    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [aspectRatio, setAspectRatio] = useState<AspectRatioImage>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creditError, setCreditError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError('Invalid file type. Please upload a JPEG, PNG, or WEBP image.');
            return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage({
                data: (reader.result as string).split(',')[1],
                mimeType: file.type,
                name: file.name
            });
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }

        // Check authentication
        if (!user) {
            onOpenAuth();
            return;
        }

        // Check if user can afford image generation
        if (!canGenerateType('image')) {
            if (confirm('Insufficient credits for image generation. Would you like to view pricing plans?')) {
                navigate('/pricing');
            } else {
                setCreditError('Insufficient credits for image generation. Please top up your credits.');
            }
            return;
        }

        setIsLoading(true);
        setError(null);
        setCreditError(null);
        setGeneratedImage(null);
        setSaveStatus('idle');

        try {
            // Deduct credits before generation
            const deductResult = await deductCredits('image');
            if (!deductResult.success) {
                setCreditError(deductResult.error || 'Failed to deduct credits');
                setIsLoading(false);
                return;
            }

            let image;
            if (uploadedImage) {
                image = await editImage(prompt, uploadedImage);
            } else {
                image = await generateImage(prompt, aspectRatio);
            }
            setGeneratedImage(image);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveImage = async () => {
        if (!generatedImage || !prompt) return;
        setSaveStatus('saving');
        try {
            const blob = dataUrlToBlob(generatedImage);
            await mediaService.uploadMedia(blob, 'image', prompt);
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save media:", error);
            setSaveStatus('idle');
        } finally {
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    return (
        <div className="glass-card rounded-lg p-8 space-y-6">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-900">Describe your image</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={uploadedImage ? "Describe the edits you want to make..." : "e.g., A robot holding a red skateboard in a neon-lit city"}
                    className="w-full h-24 p-4 rounded-lg text-surface-900 placeholder-surface-700 resize-none input-field"
                />
                <p className="text-xs text-gray-500">
                    <strong>Tips:</strong> Be specific about style, colors, and composition. E.g., "A minimalist tech workspace with soft natural lighting, isometric view, clean white background"
                </p>
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-surface-900">Upload an Image to Edit (Optional)</label>
                {uploadedImage ? (
                    <ImagePreview
                        src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`}
                        name={uploadedImage.name}
                        onRemove={() => setUploadedImage(null)}
                    />
                ) : (
                    <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-surface-100/50 transition-colors">
                        <UploadCloud className="h-8 w-8 text-surface-900" />
                        <span className="mt-2 text-sm text-surface-900">Click to upload or drag and drop</span>
                        <span className="text-xs text-surface-900">PNG, JPG, WEBP (Max {MAX_FILE_SIZE_MB}MB)</span>
                        <input type="file" className="hidden" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleFileChange} />
                    </label>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className={`flex-grow ${uploadedImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <label className="block text-sm font-medium text-surface-900 mb-2">Aspect Ratio:</label>
                    <div className="grid grid-cols-5 gap-2">
                        {(['1:1', '16:9', '9:16', '4:3', '3:4'] as AspectRatioImage[]).map(ar => (
                            <button key={ar} onClick={() => setAspectRatio(ar)} disabled={!!uploadedImage} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${aspectRatio === ar ? 'bg-brand-primary text-white' : 'bg-white hover:bg-surface-100'} disabled:cursor-not-allowed`}>
                                {ar}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* Credit Error Display */}
            {creditError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700">{creditError}</p>
                        <button
                            onClick={() => navigate('/pricing')}
                            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                        >
                            View pricing & top-up options
                        </button>
                    </div>
                </div>
            )}

            {/* Credit cost and balance */}
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Credit cost:</span>
                    <CreditBadge type="image" />
                </div>
                {subscription && (
                    <span className="text-sm text-gray-500">
                        Balance: {subscription.totalCredits.toLocaleString()} credits
                    </span>
                )}
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !canGenerateType('image')}
                className="w-full flex items-center justify-center py-3 px-6 rounded-lg shadow-sm text-base font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <><Spinner /> {uploadedImage ? 'Editing Image...' : 'Generating Image...'}</> : <><Sparkles className="mr-2 h-5 w-5" /> {uploadedImage ? 'Edit Image' : 'Generate Image'}</>}
            </button>

            {generatedImage && (
                <div className="mt-6 border-t pt-6 animate-fade-in">
                    <h3 className="text-lg font-semibold text-surface-900 mb-4">Result</h3>
                    <WatermarkOverlay type="image">
                        <img src={generatedImage} alt={prompt} className="rounded-lg w-full object-contain" />
                    </WatermarkOverlay>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <a
                            href={subscription?.hasWatermark ? undefined : generatedImage}
                            download={subscription?.hasWatermark ? undefined : `socialcraft-ai-${new Date().getTime()}.jpeg`}
                            onClick={subscription?.hasWatermark ? () => navigate('/pricing') : undefined}
                            className={`w-full flex items-center justify-center py-2.5 px-5 rounded-lg shadow-sm text-base font-medium ${subscription?.hasWatermark ? 'btn-secondary opacity-75' : 'btn-secondary'}`}
                        >
                            {subscription?.hasWatermark ? (
                                <><Lock className="mr-2 h-5 w-5" /> Upgrade to Download</>
                            ) : (
                                <><Download className="mr-2 h-5 w-5" /> Download</>
                            )}
                        </a>
                        <button
                            onClick={handleSaveImage}
                            disabled={saveStatus !== 'idle'}
                            className="w-full flex items-center justify-center py-2.5 px-5 rounded-lg shadow-sm text-base font-medium text-brand-primary bg-white border border-brand-primary hover:bg-surface-100 disabled:opacity-50 transition-all"
                        >
                            {saveStatus === 'saved' ? <><Check className="mr-2 h-5 w-5 text-brand-primary" /> Saved</> : <><Save className="mr-2 h-5 w-5" /> Save to Media</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const VideoGenerator: React.FC<{ initialPrompt?: string; onOpenAuth: () => void }> = ({ initialPrompt, onOpenAuth }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { subscription, canGenerateType, deductCredits } = useSubscription();

    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [aspectRatio, setAspectRatio] = useState<AspectRatioVideo>('16:9');
    const [resolution, setResolution] = useState<ResolutionVideo>('720p');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [creditError, setCreditError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [hasApiKey, setHasApiKey] = useState(false);
    const [operation, setOperation] = useState<VideoOperation | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

    const isMultiImageMode = uploadedImages.length > 1;

    const checkApiKey = useCallback(async () => {
        const keySelected = await (window as any).aistudio?.hasSelectedApiKey();
        setHasApiKey(keySelected);
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleSelectKey = async () => {
        await (window as any).aistudio?.openSelectKey();
        setHasApiKey(true);
    };

    const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setError(null);
        const filePromises: Promise<UploadedImage>[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (uploadedImages.length + filePromises.length >= 5) {
                setError('You can upload a maximum of 5 images.');
                break;
            }
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setError(`File '${file.name}' has an invalid type. Please use JPEG, PNG, or WEBP.`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                setError(`File '${file.name}' is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
                continue;
            }

            filePromises.push(new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve({
                    data: (reader.result as string).split(',')[1],
                    mimeType: file.type,
                    name: file.name
                });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }));
        }

        Promise.all(filePromises).then(newImages => {
            setUploadedImages(prev => [...prev, ...newImages]);
        }).catch(err => {
            setError("Error reading files.");
            console.error(err);
        });
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const resetState = () => {
        setError(null);
        setOperation(null);
        setIsLoading(false);
        setLoadingMessage('');
        setGeneratedVideoUrl(null);
        setSaveStatus('idle');
    }

    const handleGenerate = async () => {
        if (!prompt.trim() && uploadedImages.length === 0) {
            setError('Please enter a prompt or upload an image.');
            return;
        }
        if (isMultiImageMode && !prompt.trim()) {
            setError('A prompt is required when using multiple reference images.');
            return;
        }

        // Check authentication
        if (!user) {
            onOpenAuth();
            return;
        }

        // Check if user can access video generation (blocked for free tier)
        if (!subscription?.canAccessVideo) {
            if (confirm('Video generation requires a Starter plan or higher. Would you like to upgrade?')) {
                navigate('/pricing');
            } else {
                setCreditError('Video generation requires Starter plan or higher. Upgrade to unlock this feature.');
            }
            return;
        }

        // Check if user can afford video generation
        if (!canGenerateType('video')) {
            if (confirm('Insufficient credits for video generation. Would you like to view pricing plans?')) {
                navigate('/pricing');
            } else {
                setCreditError('Insufficient credits for video generation. Please top up your credits.');
            }
            return;
        }

        resetState();
        setCreditError(null);
        setIsLoading(true);
        setLoadingMessage('Initializing video generation...');

        try {
            // Deduct credits before generation
            const deductResult = await deductCredits('video');
            if (!deductResult.success) {
                setCreditError(deductResult.error || 'Failed to deduct credits');
                setIsLoading(false);
                return;
            }

            const initialOp = await generateVideo(prompt, isMultiImageMode ? '16:9' : aspectRatio, isMultiImageMode ? '720p' : resolution, uploadedImages);
            setOperation(initialOp);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setIsLoading(false);
            if (errorMessage.includes("API key not found or invalid")) {
                setHasApiKey(false);
            }
        }
    };

    const handleSaveVideo = async () => {
        if (!generatedVideoUrl || !prompt) return;
        setSaveStatus('saving');
        try {
            // Fetch the video from the remote URL and convert to Blob
            const response = await fetch(generatedVideoUrl);
            const blob = await response.blob();
            await mediaService.uploadMedia(blob, 'video', prompt);
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save media:", error);
            setSaveStatus('idle');
        } finally {
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    useEffect(() => {
        if (operation && !operation.done && isLoading) {
            const interval = setInterval(async () => {
                try {
                    setLoadingMessage('Checking status (this may take a few minutes)...');
                    const updatedOp = await getVideosOperation(operation);
                    setOperation(updatedOp);

                    if (updatedOp.done) {
                        clearInterval(interval);
                        setLoadingMessage('Video generated successfully!');
                        const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink) {
                            setGeneratedVideoUrl(`${downloadLink}&key=${process.env.API_KEY}`);
                        } else {
                            setError("Generation finished, but no video URL was found.");
                        }
                        setIsLoading(false);
                    }
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during polling.';
                    setError(errorMessage);
                    setIsLoading(false);
                    clearInterval(interval);
                    if (errorMessage.includes("API key not found or invalid")) {
                        setHasApiKey(false);
                    }
                }
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [operation, isLoading]);

    return (
        <div className="glass-card rounded-lg p-8 space-y-6">
            {!hasApiKey ? (
                <div className="text-center p-6 bg-surface-100 border-l-4 border-brand-primary">
                    <KeyRound className="mx-auto h-12 w-12 text-brand-primary" />
                    <h3 className="mt-2 text-lg font-semibold text-surface-900">Video Generation Requires an API Key</h3>
                    <p className="mt-2 text-sm text-surface-900">
                        To use the Veo video generation model, you must select an API key associated with a project that has billing enabled.
                    </p>
                    <p className="mt-1 text-xs text-surface-900">
                        For more details, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline font-medium">billing documentation</a>.
                    </p>
                    <button onClick={handleSelectKey} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-glow hover:bg-brand-glow/80">
                        Select API Key
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-surface-900">Describe your video</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A neon hologram of a cat driving at top speed through a futuristic city"
                            className="w-full h-24 p-4 rounded-lg text-surface-900 placeholder-surface-700 resize-none input-field"
                        />
                        <p className="text-xs text-gray-500">
                            <strong>Tips:</strong> Describe the scene, action, and camera movement. E.g., "Drone shot slowly rising above a sunrise over mountains, golden light, cinematic"
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-surface-900">Upload Reference Images (Optional, up to 5)</label>
                        <div className="flex flex-wrap gap-2">
                            {uploadedImages.map((img, index) => (
                                <ImagePreview key={index} src={`data:${img.mimeType};base64,${img.data}`} name={img.name} onRemove={() => removeImage(index)} />
                            ))}
                        </div>
                        {uploadedImages.length < 5 && (
                            <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-surface-100/50 transition-colors">
                                <UploadCloud className="h-8 w-8 text-surface-900" />
                                <span className="mt-2 text-sm text-surface-900">Click to upload or drag and drop</span>
                                <span className="text-xs text-surface-900">PNG, JPG, WEBP (Max {MAX_FILE_SIZE_MB}MB)</span>
                                <input type="file" multiple className="hidden" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleFilesChange} />
                            </label>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className={`flex-grow ${isMultiImageMode ? 'opacity-50' : ''}`}>
                            <label className="block text-sm font-medium text-surface-900 mb-2">Aspect Ratio:</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['16:9', '9:16'] as AspectRatioVideo[]).map(ar => (
                                    <button key={ar} onClick={() => setAspectRatio(ar)} disabled={isMultiImageMode} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${aspectRatio === ar ? 'bg-brand-primary text-white' : 'bg-white hover:bg-surface-100'} disabled:cursor-not-allowed`}>
                                        {ar}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={`flex-grow ${isMultiImageMode ? 'opacity-50' : ''}`}>
                            <label className="block text-sm font-medium text-surface-900 mb-2">Resolution:</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['720p', '1080p'] as ResolutionVideo[]).map(res => (
                                    <button key={res} onClick={() => setResolution(res)} disabled={isMultiImageMode} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${resolution === res ? 'bg-brand-primary text-white' : 'bg-white hover:bg-surface-100'} disabled:cursor-not-allowed`}>
                                        {res}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {isMultiImageMode && (
                        <div className="text-center text-soft-blue bg-soft-blue/10 p-3 rounded-md border border-soft-blue/20">
                            Multi-image mode is active. Resolution is locked to 720p and aspect ratio to 16:9. A descriptive prompt is required.
                        </div>
                    )}

                    {error && <p className="text-status-error text-sm text-center flex items-center justify-center"><AlertTriangle size={16} className="mr-2" />{error}</p>}

                    {/* Video Access Restriction for Free Tier */}
                    {!subscription?.canAccessVideo && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-amber-800 font-medium">Video Generation Locked</p>
                                <p className="text-sm text-amber-700 mt-1">Video generation is available on Starter plan and above. Upgrade to unlock this powerful feature.</p>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-800 underline"
                                >
                                    View upgrade options
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Credit Error Display */}
                    {creditError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-red-700">{creditError}</p>
                                <button
                                    onClick={() => navigate('/pricing')}
                                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline"
                                >
                                    View pricing & top-up options
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Credit cost and balance */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Credit cost:</span>
                            <CreditBadge type="video" />
                        </div>
                        {subscription && (
                            <span className="text-sm text-gray-500">
                                Balance: {subscription.totalCredits.toLocaleString()} credits
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !subscription?.canAccessVideo || !canGenerateType('video')}
                        className="w-full flex items-center justify-center py-3 px-6 rounded-lg shadow-sm text-base font-medium btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <><Spinner /> {loadingMessage}</>
                        ) : !subscription?.canAccessVideo ? (
                            <><Lock className="mr-2 h-5 w-5" /> Upgrade to Generate Video</>
                        ) : (
                            <><Sparkles className="mr-2 h-5 w-5" /> Generate Video</>
                        )}
                    </button>

                    {generatedVideoUrl && (
                        <div className="mt-6 border-t pt-6 animate-fade-in">
                            <h3 className="text-lg font-semibold text-surface-900 mb-4">Generated Video</h3>
                            <video src={generatedVideoUrl} controls className="rounded-lg w-full mb-4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a
                                    href={generatedVideoUrl}
                                    download={`socialcraft-ai-video-${new Date().getTime()}.mp4`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center py-2.5 px-5 rounded-lg shadow-sm text-base font-medium btn-secondary"
                                >
                                    <Download className="mr-2 h-5 w-5" /> Download Video
                                </a>
                                <button
                                    onClick={handleSaveVideo}
                                    disabled={saveStatus !== 'idle'}
                                    className="w-full flex items-center justify-center py-2.5 px-5 rounded-lg shadow-sm text-base font-medium text-brand-primary bg-white border border-brand-primary hover:bg-surface-100 disabled:opacity-50 transition-all"
                                >
                                    {saveStatus === 'saved' ? <><Check className="mr-2 h-5 w-5 text-brand-primary" /> Saved</> : <><Save className="mr-2 h-5 w-5" /> Save to Media</>}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};


export default MediaStudioView;