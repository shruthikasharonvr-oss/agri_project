const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = 'AIzaSyCdzW2MWoXHpUFl8QROJQo-jnYOcx_a6Vk';
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // We can't list directly easily with this SDK version, so let's try 
        // common variations of names that are known to work on various tiers.
        const models = [
            'gemini-1.5-flash',
            'gemini-1.5-flash-8b',
            'gemini-pro',
            'gemini-1.0-pro',
            'gemini-2.0-flash-exp'
        ];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const res = await model.generateContent("test");
                console.log(`Model ${m} : WORKING!`);
                break;
            } catch (e) {
                console.log(`Model ${m} : FAILED (${e.message})`);
            }
        }
    } catch (error) {
        console.error("General error:", error.message);
    }
}

listModels();
