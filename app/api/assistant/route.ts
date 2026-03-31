import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDFpRJOiJArhJeQ9aiSGJ8Q7Y0VyM1rtX4';
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const SYSTEM_INSTRUCTION = `You are a friendly and helpful AI assistant for an agriculture platform.
1. Your main job is to answer agriculture-related questions (crops, weather impact, soil, pests, farming techniques).
2. You must respond politely to greetings like "Hi", "Hello", "How are you".
3. Keep your answers natural, concise, and helpful.
4. If asked about topics completely unrelated to agriculture, politely decline and steer the conversation back to farming.`;

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION
        });

        const chat = model.startChat({ history: history || [] });
        const result = await chat.sendMessage(message);
        const text = result.response.text();

        return NextResponse.json({ success: true, text });

    } catch (error: any) {
        console.error("Assistant API Error:", error.message);
        return NextResponse.json(
            { success: false, error: error.message || "I'm having trouble connecting right now." },
            { status: 500 }
        );
    }
}
