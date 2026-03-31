import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!GEMINI_KEY) {
            return NextResponse.json({ error: 'Gemini AI not configured. Please add GEMINI_API_KEY.' }, { status: 500 });
        }

        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-2.0-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ];

        const systemInstruction = `You are the 'Agri-Assistant' for FarmToHome. 
        WISDOM: Soil science, crop rotation, and seasonal planting.
        NAV: /market-place (Buy), /adoptions (Adopt Asset), /add-product (Farmer Sell), /weather (Forecast).
        Keep responses brief, warm and professional. 🌱`;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                const isModern = modelName.includes('1.5') || modelName.includes('2.0');
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    ...(isModern ? { systemInstruction } : {}),
                });

                const chat = model.startChat({ history: Array.isArray(history) ? history : [] });
                const prompt = isModern ? message : `Instruction: ${systemInstruction}\n\nUser: ${message}`;

                const result = await chat.sendMessage(prompt);
                const response = await result.response;
                const text = response.text();

                if (text) return NextResponse.json({ text });
            } catch (err: any) {
                lastError = err;
                continue; // Try next model on any error
            }
        }

        // Final Fallback for common questions
        const lowMsg = message.toLowerCase();
        let fallback = "Our AI brain is refreshing! 🚜 Here is a tip: Planting Marigolds near your vegetables helps keep pests away Naturally! 🌱";

        if (lowMsg.includes('mango')) {
            fallback = "For Mangoes 🥭, organic fertilizers like Bone Meal and cow manure apply at the rainy season are best. 🌱";
        } else if (lowMsg.includes('red soil')) {
            fallback = "Red soil is amazing for Groundnut and Ragi! 🥜 Remember to add compost!";
        } else if (lowMsg.includes('pest') || lowMsg.includes('insect')) {
            fallback = "Neem oil is the best organic spray for garden pests! 🐞";
        }

        return NextResponse.json({ text: fallback });

    } catch (error: any) {
        return NextResponse.json(
            { error: "Our AI brain is refreshing. 🍃 Please try again in a few moments." },
            { status: 500 }
        );
    }
}
