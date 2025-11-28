import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Platform, GeneratedContent, VideoOperation, PlatformSelections, Tone, TrendAnalysisResult, GroundingSource, SearchIntent } from '../types';
import type { BrandPersona } from './brandPersonaService';
import { trendCacheService } from './trendCacheService';

if (!process.env.API_KEY) {
    // This is a placeholder for environments where the key is not set.
    // In a real scenario, the key would be injected by the runtime.
    console.warn("API_KEY environment variable not set. Using a placeholder.");
    process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Local type definitions based on documentation, if not exported by the library
enum VideoGenerationReferenceType {
    ASSET = 'ASSET',
}

interface VideoGenerationReferenceImage {
    image: {
        imageBytes: string;
        mimeType: string;
    };
    referenceType: VideoGenerationReferenceType;
}

// Generation options with optional Brand Persona
export interface GenerationOptions {
    content: string;
    selections: PlatformSelections;
    context?: 'general' | 'academic';
    tone?: Tone;
    searchIntent?: SearchIntent;
    authorsVoice?: string;
    brandPersona?: BrandPersona | null;
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        platform: { type: Type.STRING, enum: Object.values(Platform) },
        primaryContent: { type: Type.STRING },
        engagementPotential: { type: Type.INTEGER, description: "A score from 0-100 indicating the post's potential to engage its target audience, based on clarity, value, and emotional resonance." },
        analysis: {
            type: Type.OBJECT,
            properties: {
                emotionalTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
                viralPatterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                audienceValue: { type: Type.STRING, description: "A concise, one-sentence explanation of the core problem this content solves or the primary question it answers for the audience." },
            },
            required: ['emotionalTriggers', 'viralPatterns', 'audienceValue'],
        },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        variations: { type: Type.ARRAY, items: { type: Type.STRING } },
        optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        thread: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "For Twitter only. If the content is long, break it into a thread of 2-4 numbered tweets."
        },
        engagementStrategy: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "For Twitter only. Suggest 2-3 strategic replies to post on your own tweet to spark conversation."
        },
        carouselSlides: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "For LinkedIn/Instagram. If content is educational, provide content for 3-7 slides. The 'primaryContent' should be an intro."
        },
        poll: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            description: "For LinkedIn only. If content can be a question, create a poll. 'primaryContent' should introduce it."
        },
        firstComment: {
            type: Type.STRING,
            description: "For LinkedIn only. A suggested first comment to post. CRITICAL: External links MUST go here. Include a warning that ALL external links reduce reach, even in comments. The comment should also add value."
        },
        reelScript: {
            type: Type.OBJECT,
            properties: {
                hook: { type: Type.STRING, description: "A strong visual hook for the first 3 seconds." },
                scenes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of scenes describing the action." },
                cta: { type: Type.STRING, description: "A clear call to action for the end of the video/caption." },
                audioSuggestion: { type: Type.STRING, description: "A suggestion for a type of trending audio to use." }
            },
            description: "For Instagram only. A full script concept for a short-form video. The 'primaryContent' should be the caption."
        },
        tiktokScript: {
            type: Type.OBJECT,
            properties: {
                hook: { type: Type.STRING, description: "A very strong, scroll-stopping hook for the first 3 seconds." },
                scenes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of scenes for a video over 1 minute long to maximize watch time." },
                cta: { type: Type.STRING, description: "A clear call to action that encourages shares and comments." },
                audioSuggestion: { type: Type.STRING, description: "A suggestion for a type of trending audio." },
                seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 primary and secondary SEO keywords to target." },
                onScreenTextSuggestion: { type: Type.STRING, description: "A suggestion for a text overlay that includes one of the main keywords." },
                spokenKeywordsSuggestion: { type: Type.STRING, description: "A reminder to explicitly say the keywords in the video's dialogue." }
            },
            description: "For TikTok SEO only. A full script concept designed for search discoverability. The 'primaryContent' should be the caption, optimized with the keywords."
        },
        pinterestPin: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A keyword-rich, SEO-optimized title for the pin (max 100 characters)." },
                description: { type: Type.STRING, description: "A detailed, keyword-rich description for the pin (max 500 characters)." },
                visualSuggestion: { type: Type.STRING, description: "A detailed suggestion for the visual aspect of the pin, emphasizing a 2:3 vertical aspect ratio." },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-7 relevant SEO keywords." },
                boardName: { type: Type.STRING, description: "A suggested, SEO-friendly board name for this pin." },
                outboundLinkSuggestion: { type: Type.STRING, description: "A suggestion for a relevant outbound URL (e.g., a blog post, product page). Use a placeholder like '[Your Link Here]'." }
            },
            description: "For Pinterest only. A full plan for a high-quality, 'fresh' pin."
        }
    },
    required: [
        'platform', 'primaryContent', 'engagementPotential', 'analysis', 'hashtags', 'variations', 'optimizationTips'
    ]
};

const fullSchema = {
    type: Type.ARRAY,
    items: responseSchema
};

/**
 * Generate the brand persona instruction for the prompt
 */
const generateBrandPersonaInstruction = (persona: BrandPersona): string => {
    let instruction = `\n**BRAND VOICE PERSONA: "${persona.name}"**
This is a CRITICAL instruction. ALL generated content MUST sound like it was written by this brand persona.

- **Target Audience:** ${persona.audience}
- **Tone & Style:** ${persona.tone}`;

    if (persona.forbiddenWords && persona.forbiddenWords.length > 0) {
        instruction += `\n- **FORBIDDEN WORDS/PHRASES (NEVER USE THESE):** ${persona.forbiddenWords.join(', ')}`;
    }

    if (persona.examplePosts && persona.examplePosts.length > 0) {
        instruction += `\n\n**EXAMPLE POSTS (Match this exact style and voice):**`;
        persona.examplePosts.forEach((example, index) => {
            instruction += `\nExample ${index + 1} (${example.platform}):\n"${example.content}"`;
        });
    }

    instruction += `\n\nCRITICAL: The generated content MUST authentically sound like this persona wrote it. Match the tone exactly.`;

    return instruction;
};

const generatePrompt = (
    content: string, 
    selections: PlatformSelections, 
    context: 'general' | 'academic', 
    tone: Tone, 
    searchIntent: SearchIntent, 
    authorsVoice?: string,
    brandPersona?: BrandPersona | null
): string => {
    const contextInstruction = context === 'academic'
        ? "You are an expert science communicator specializing in translating complex academic research into engaging, accessible social media content. Break down the key findings, implications, and hooks."
        : "You are SocialCraft AI, an expert content strategist. Your goal is to create high-value, 'people-first' content that is helpful, engaging, and trustworthy. Your secondary goal is algorithmic performance.";

    // Brand Persona takes precedence over simple tone selection
    let toneInstruction = "";
    let brandPersonaInstruction = "";
    
    if (brandPersona) {
        brandPersonaInstruction = generateBrandPersonaInstruction(brandPersona);
        // If brand persona has a tone, that overrides the tone selector
    } else if (tone !== 'Auto') {
        toneInstruction = `\n**TONE:** The tone of all generated content MUST be strictly '${tone}'. This is a top priority.`;
    }

    const authorsVoiceInstruction = authorsVoice
        ? `\n**AUTHOR'S VOICE (E-E-A-T):** This is the most critical instruction. You MUST naturally and seamlessly integrate the following personal anecdote, unique perspective, or specific data point into the generated content. This is to demonstrate first-hand **E**xperience, **E**xpertise, **A**uthoritativeness, and **T**rustworthiness. Here is the user's input to integrate:\n---${authorsVoice}\n---`
        : "";

    let intentInstruction = '';
    switch (searchIntent) {
        case 'Informational':
            intentInstruction = `\n**INTENT:** The user's intent is **Informational**. Structure posts to be educational, breaking down topics into easy-to-understand points. The goal is to provide clear answers and build authority.`;
            break;
        case 'Commercial':
            intentInstruction = `\n**INTENT:** The user's intent is **Commercial Investigation**. Structure posts as helpful comparisons or reviews. Use pros/cons, highlight key features, or guide the user towards making an informed choice.`;
            break;
        case 'Transactional':
            intentInstruction = `\n**INTENT:** The user's intent is **Transactional**. Posts MUST have a clear, strong, and urgent call-to-action (CTA). Use action-oriented language to drive a specific conversion (e.g., 'Shop now', 'Sign up today').`;
            break;
        case 'Auto':
        default:
            intentInstruction = `\n**INTENT:** Auto-detect the primary user intent (Informational, Commercial, or Transactional) from the source content and generate the post to best match that intent.`;
            break;
    }

    const platforms = Object.keys(selections) as Platform[];

    let platformInstructions = "";

    // Generate instruction for Twitter if selected
    if (selections.Twitter) {
        platformInstructions += `- Twitter: Posts must be concise and punchy.
    - **CHARACTER LIMITS:** Twitter Free tier has a 280 character limit, Premium has 4,000, and Premium+ has 25,000.
    - **CRITICAL:** The 'primaryContent' MUST be under 280 characters to ensure it works for all users. If you need more space, use the 'thread' field or provide shorter 'variations'.
    - **VARIATIONS:** Provide 2-3 alternative versions in the 'variations' field with DIFFERENT lengths (e.g., one under 200 chars, one under 150 chars) to give users flexibility.
    - **THREADS:** If the content is complex, create a thread of 2-4 tweets in the 'thread' field. The first tweet should be the 'primaryContent' (under 280 chars).
    - **ENGAGEMENT:** Provide an 'engagementStrategy' with 2-3 suggested replies to post on your own tweet to spark conversation, as replies are the most important engagement signal on X.\n`;
    }

    // Generate instruction for LinkedIn if selected, considering the chosen format
    if (selections.LinkedIn) {
        let linkedInInstruction = `- LinkedIn: Posts must be professional and designed for high 'dwell time'. `;
        const format = selections.LinkedIn.format;
        if (format === 'Carousel') {
            linkedInInstruction += `You MUST generate a carousel post. Provide content for 3-7 slides in the 'carouselSlides' field. The 'primaryContent' should serve as an introduction to the carousel.\n`;
        } else if (format === 'Poll') {
            linkedInInstruction += `You MUST generate a poll. Provide a question and 2-4 options in the 'poll' field. The 'primaryContent' should introduce the poll's topic.\n`;
        } else if (format === 'Text') {
            linkedInInstruction += `You MUST generate a text-only post.\n`;
        } else {
            linkedInInstruction += `Based on the source content, choose the BEST format: a text post, a carousel post, or a poll. Carousels and polls are high-engagement.\n`;
        }
        linkedInInstruction += `    - **CRITICAL ALGORITHMIC RULE:** LinkedIn's algorithm heavily penalizes posts with external links. If a link is essential, it MUST be placed in a suggested 'firstComment'. The main post must provide full value on its own. Add an optimization tip warning the user that even links in comments can reduce reach.\n`;
        platformInstructions += linkedInInstruction;
    }

    // Generate instruction for Instagram if selected
    if (selections.Instagram) {
        let instagramInstruction = `- Instagram: The platform prioritizes high-quality visuals and Reels. Captions are for engagement (comments/saves). ALWAYS include a clear CTA.\n`;
        const format = selections.Instagram.format;
        if (format === 'Reel') {
            instagramInstruction += `    - You MUST generate a short-form Reel script. Provide a full, detailed concept in the 'reelScript' field.
    - **Hook:** The hook must be a scroll-stopping visual or statement for the first 3 seconds.
    - **Scenes:** Describe the visuals for 3-5 short scenes. Include suggestions for on-screen text overlays for each scene to enhance the message.
    - **CTA:** The call to action must be clear and encourage engagement (e.g., 'Comment your thoughts below!', 'Save this for later!').
    - **Audio:** Suggest a specific *type* of trending audio (e.g., 'upbeat trending pop song', 'inspirational monologue audio').
    - **Caption:** The 'primaryContent' field will be the final, engagement-optimized caption for the Reel.\n`;
        } else if (format === 'Carousel') {
            instagramInstruction += `    - You MUST generate a multi-slide carousel. Provide content for 3-7 slides in the 'carouselSlides' field. The 'primaryContent' is the introductory caption.\n`;
        } else {
            instagramInstruction += `    - Analyze the source content and choose the BEST format: a standard post, a multi-slide carousel, or a short-form Reel.\n`;
        }
        instagramInstruction += `    - **Optimization Tips** MUST include reminders to use high-quality visuals and to avoid watermarks from other platforms like TikTok.\n`;
        platformInstructions += instagramInstruction;
    }

    // Generate instruction for TikTok if selected
    if (selections.TikTok) {
        platformInstructions += `- TikTok: **Treat TikTok as a search engine.** Content MUST be optimized for search discoverability. Generate a full, detailed script in the 'tiktokScript' field.
    - **SEO is critical:** First, identify 3-5 relevant 'seoKeywords', including a mix of primary (broad) and secondary (long-tail) keywords.
    - **Search-friendly Content:** The video concept should answer a specific question and be over 1 minute long to maximize watch time.
    - **Multi-modal Keywords:** The script must include suggestions for using the keywords everywhere: as 'onScreenTextSuggestion', and as 'spokenKeywordsSuggestion'.
    - **Engagement:** The 'cta' should explicitly ask for shares and comments.
    - **The 'primaryContent' field should be the final, optimized caption, including keywords and hashtags.\n`;
    }

    if (selections.Pinterest) {
        let pinterestInstruction = `- Pinterest: **Treat Pinterest as a visual search engine.** Content MUST be SEO-optimized and visually compelling. Generate a full plan for a 'fresh pin' in the 'pinterestPin' field.\n`;
        const format = selections.Pinterest.format;
        if (format === 'Video Pin') {
            pinterestInstruction += `    - You MUST generate a plan for a Video Pin. The visual suggestion should describe a short, engaging video (6-15 seconds).\n`;
        } else if (format === 'Idea Pin') {
            pinterestInstruction += `    - You MUST generate a plan for a multi-slide Idea Pin. The visual suggestion should outline 3-5 slides with tips or steps.\n`;
        } else {
            pinterestInstruction += `    - The plan should be for a standard, high-quality static image pin.\n`;
        }
        pinterestInstruction += `    - **SEO is paramount:** The 'title' and 'description' must be rich with relevant keywords. Identify 5-7 target 'keywords'.
    - **Visuals are key:** The 'visualSuggestion' must describe a high-quality, vertical visual (2:3 aspect ratio), often with a clear text overlay.
    - **Board & Link:** Suggest an SEO-friendly 'boardName' and a relevant 'outboundLinkSuggestion' (e.g., '[Your Blog Post Link]').
    - **The 'primaryContent' field should be a concise summary or hook to introduce the pin concept.\n`;
        platformInstructions += pinterestInstruction;
    }


    return `${contextInstruction}${brandPersonaInstruction}${toneInstruction}${intentInstruction}${authorsVoiceInstruction}

Analyze the following content and generate optimized posts for these platforms: [${platforms.join(', ')}].

For EACH platform, you MUST include an "optimizationTips" entry that says: "To boost authoritativeness (E-E-A-T), review your post and add links or citations to primary sources where appropriate."

Source Content:
---
${content}
---

For each platform, provide a detailed JSON object based on the provided schema. Follow these platform-specific instructions:
${platformInstructions}`;
};

const handleApiError = (error: any, context: string): never => {
    console.error(`Error during ${context}:`, error);

    let message = `Failed during ${context}. Please try again.`;

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("api key not valid") || errorMessage.includes("permission denied")) {
            message = 'Authentication error. Please ensure your API key is valid and has the required permissions.';
        } else if (errorMessage.includes("400") || errorMessage.includes("invalid argument")) {
            message = `Invalid input for ${context}. Please check your prompt or content.`;
        } else if (errorMessage.includes("429")) {
            message = "Rate limit exceeded. Please wait a moment and try again.";
        } else if (errorMessage.includes("500") || errorMessage.includes("503") || errorMessage.includes("unavailable")) {
            message = `The AI service is currently unavailable. Please try again later.`;
        } else if (errorMessage.includes("requested entity was not found")) {
            message = "API key not found or invalid. Please select a valid API key to proceed.";
        } else {
            if (!errorMessage.includes("network error")) {
                message = error.message;
            }
        }
    }

    throw new Error(message);
};

/**
 * Generate viral content with optional Brand Persona support
 * This is the main generation function used by Generator
 */
export const generateViralContent = async (
    content: string,
    selections: PlatformSelections,
    context: 'general' | 'academic' = 'general',
    tone: Tone = 'Auto',
    searchIntent: SearchIntent = 'Auto',
    authorsVoice?: string,
    brandPersona?: BrandPersona | null
): Promise<GeneratedContent[]> => {
    const platforms = Object.keys(selections) as Platform[];
    if (platforms.length === 0) {
        return [];
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: generatePrompt(content, selections, context, tone, searchIntent, authorsVoice, brandPersona),
            config: {
                responseMimeType: 'application/json',
                responseSchema: fullSchema
            }
        });

        const jsonText = response.text.trim();
        const generatedData = JSON.parse(jsonText) as GeneratedContent[];

        return generatedData.filter(item => platforms.includes(item.platform));

    } catch (error) {
        handleApiError(error, "content generation");
    }
};

/**
 * Alternative generation function using options object
 */
export const generateViralContentWithOptions = async (options: GenerationOptions): Promise<GeneratedContent[]> => {
    return generateViralContent(
        options.content,
        options.selections,
        options.context ?? 'general',
        options.tone ?? 'Auto',
        options.searchIntent ?? 'Auto',
        options.authorsVoice,
        options.brandPersona
    );
};

const generateTrendPrompt = (content: string) => {
    return `You are a market research and trend analysis expert. Your task is to analyze the provided source content (which could be a URL or text) and identify the top 3-5 current and emerging trends related to its core topics.

Use Google Search to find the most up-to-date articles, discussions, and data from the last 6-12 months.

Synthesize your findings into a concise summary, a list of distinct trends, and a list of related keywords.

CRITICAL: Your entire response MUST be a single, valid JSON object. Do not include any text, markdown formatting, or code fences before or after the JSON object. The JSON object must conform to this structure:
{
  "overallSummary": "A 2-3 sentence high-level summary of the current trends.",
  "identifiedTrends": [
    {
      "trendTitle": "A catchy, descriptive title for the trend.",
      "description": "A 1-2 sentence explanation of the trend and its significance."
    }
  ],
  "relatedKeywords": ["keyword1", "keyword2"]
}

Source Content:
---
${content}
---`;
};

/**
 * Find trends with automatic caching
 * This function checks the cache first to avoid expensive API calls
 * 
 * COST OPTIMIZATION:
 * - Google Search Grounding costs $0.035 per request
 * - Cache TTL: 24 hours
 * - Identical queries within 24h return cached results at $0 cost
 */
export const findTrends = async (content: string): Promise<TrendAnalysisResult> => {
    // Check cache first
    const cached = await trendCacheService.getCached(content);
    if (cached) {
        console.log('[findTrends] Returning cached result');
        return cached;
    }

    // Cache miss - call the API
    console.log('[findTrends] Cache miss - calling Gemini API with Grounding');
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: generateTrendPrompt(content),
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let jsonText: string;
        if (response.text) {
            jsonText = response.text.trim();
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            jsonText = response.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Gemini response missing text. Full response:", JSON.stringify(response, null, 2));
            throw new Error("No text generated from AI model. The request might have been blocked or returned only tool calls.");
        }

        if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
            jsonText = jsonText.replace(/^```(json)?\s*/, '').replace(/```$/, '').trim();
        }

        const parsedData = JSON.parse(jsonText);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled Source'
            }))
            .filter((source: GroundingSource) => source.uri);

        const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());

        const result: TrendAnalysisResult = { ...parsedData, sources: uniqueSources };

        // Store in cache for future requests
        await trendCacheService.setCache(content, result);

        return result;
    } catch (error) {
        handleApiError(error, "trend analysis");
    }
};

/**
 * Find trends WITHOUT using cache
 * Use this for "force refresh" scenarios where user explicitly requests fresh data
 */
export const findTrendsNoCache = async (content: string): Promise<TrendAnalysisResult> => {
    console.log('[findTrendsNoCache] Bypassing cache - fresh API call');
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: generateTrendPrompt(content),
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let jsonText: string;
        if (response.text) {
            jsonText = response.text.trim();
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            jsonText = response.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error("No text generated from AI model.");
        }

        if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
            jsonText = jsonText.replace(/^```(json)?\s*/, '').replace(/```$/, '').trim();
        }

        const parsedData = JSON.parse(jsonText);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Untitled Source'
            }))
            .filter((source: GroundingSource) => source.uri);

        const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());

        const result: TrendAnalysisResult = { ...parsedData, sources: uniqueSources };

        // Update cache with fresh data
        await trendCacheService.setCache(content, result);

        return result;
    } catch (error) {
        handleApiError(error, "trend analysis");
    }
};

export const editImage = async (
    prompt: string,
    imageData: { data: string; mimeType: string; }
): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageData.data,
                            mimeType: imageData.mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image was generated from the edit.");
    } catch (error) {
        handleApiError(error, "image editing");
    }
};

export const generateImage = async (
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio,
            },
        });

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        handleApiError(error, "image generation");
    }
};

export const generateVideo = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    resolution: '1080p' | '720p',
    images?: { data: string; mimeType: string }[]
): Promise<VideoOperation> => {
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
        if (images && images.length > 1) {
            const referenceImagesPayload: VideoGenerationReferenceImage[] = images.map(img => ({
                image: {
                    imageBytes: img.data,
                    mimeType: img.mimeType,
                },
                referenceType: VideoGenerationReferenceType.ASSET,
            }));

            const operation = await videoAi.models.generateVideos({
                model: 'veo-3.1-generate-preview',
                prompt,
                config: {
                    numberOfVideos: 1,
                    referenceImages: referenceImagesPayload,
                    resolution: '720p',
                    aspectRatio: '16:9',
                }
            });
            return operation;

        } else {
            const imagePayload = images && images.length === 1 ? {
                image: {
                    imageBytes: images[0].data,
                    mimeType: images[0].mimeType
                }
            } : {};

            const operation = await videoAi.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                ...imagePayload,
                config: {
                    numberOfVideos: 1,
                    resolution,
                    aspectRatio,
                }
            });
            return operation;
        }

    } catch (error) {
        handleApiError(error, "video generation");
    }
};

export const getVideosOperation = async (operation: VideoOperation): Promise<VideoOperation> => {
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
        const updatedOperation = await videoAi.operations.getVideosOperation({ operation });
        return updatedOperation;
    } catch (error) {
        handleApiError(error, "checking video status");
    }
};

export const generateVisualPrompt = async (postContent: GeneratedContent): Promise<string> => {
    const prompt = `<persona>
You are a professional art director with a keen eye for creating viral, visually-stunning media for social platforms.
</persona>

<task>
Based on the provided social media content plan, generate a single, concise, and descriptive prompt (under 30 words) for an AI image or video generator.
</task>

<principles_of_a_good_prompt>
- Focus ONLY on the core visual element.
- Suggest a composition, lighting style (e.g., cinematic, soft light), color palette, and overall mood.
- Specify an artistic style (e.g., photorealistic, minimalist, watercolor, 3D render).
- Be evocative and inspiring.
</principles_of_a_good_prompt>

<what_to_avoid>
- Do NOT include text overlays, calls to action, hashtags, or scene numbers.
- Do NOT just summarize the text; translate the *idea* into a visual concept.
</what_to_avoid>

<examples>
Content Plan: A TikTok script about a creator frustrated with generic AI results.
GOOD Prompt: "A marketing professional looking frustrated at a laptop screen showing a generic AI response, cinematic and moody lighting, cool color palette."
BAD Prompt: "Scene 1: Creator frustrated at screen. Text: 'Getting generic AI outputs?'"

Content Plan: A LinkedIn post about the future of AI in business strategy.
GOOD Prompt: "An abstract 3D render of a glowing neural network integrated with a classic chessboard, symbolizing the fusion of AI and strategy, minimalist and sophisticated."
BAD Prompt: "A business person pointing at a chart about AI."
</examples>

<user_request>
Here is the social media content plan. Generate the final, single-sentence visual prompt now.

Content Plan:
---
${JSON.stringify(postContent, null, 2)}
---
</user_request>`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        handleApiError(error, "visual prompt generation");
    }
};

export const fetchAgenticTrends = async (niche: string): Promise<{ text: string; sources: { title: string; url: string; }[] }> => {
    const prompt = `You are a market research expert. Analyze the current trends in the "${niche}" industry using Google Search.

Provide a comprehensive trend report in markdown format with:
- An executive summary
- Key insights and emerging trends
- Data points and statistics where available

Be specific and actionable.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        let text: string;
        if (response.text) {
            text = response.text.trim();
        } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = response.candidates[0].content.parts[0].text.trim();
        } else {
            console.error("Gemini response missing text in agentic trends. Full response:", JSON.stringify(response, null, 2));
            throw new Error("No text generated from AI model.");
        }

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map((chunk: any) => ({
                title: chunk.web?.title || 'Untitled Source',
                url: chunk.web?.uri || ''
            }))
            .filter((source: { title: string; url: string }) => source.url);

        const uniqueSources = Array.from(new Map(sources.map((item: { title: string; url: string }) => [item.url, item])).values());

        return { text, sources: uniqueSources };
    } catch (error) {
        handleApiError(error, "agentic trend analysis");
    }
};

/**
 * @deprecated Use generateViralContent with brandPersona parameter instead
 * This function is kept for backward compatibility with BrandAmplifier
 */
export const generateBrandedContent = async (
    trendContent: string,
    persona: { name: string; tone: string; audience: string },
    platform: string
): Promise<{ platform: string; content: string; hashtags: string[]; imagePrompt: string }[]> => {
    const prompt = `You are a social media content strategist. Based on the following trend analysis and brand persona, create engaging social media posts.

Brand Persona:
- Name: ${persona.name}
- Tone: ${persona.tone}
- Target Audience: ${persona.audience}

Platform: ${platform}

Trend Analysis:
${trendContent}

Generate 2-3 social media posts for the specified platform. Each post should:
1. Align with the brand persona's tone
2. Be relevant to the target audience
3. Incorporate insights from the trend analysis
4. Include relevant hashtags
5. Include an image prompt suggestion

Return a JSON array with objects containing: platform, content, hashtags (array), imagePrompt`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        let jsonText = response.text.trim();
        if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
            jsonText = jsonText.replace(/^```(json)?\s*/, '').replace(/```$/, '').trim();
        }

        return JSON.parse(jsonText);
    } catch (error) {
        handleApiError(error, "branded content generation");
    }
};
