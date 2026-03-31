const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env.local
dotenv.config({ path: path.join(__dirname, ".env.local") });

async function listModels() {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
        console.error("Missing GOOGLE_CLOUD_API_KEY");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // There is no direct listModels in the simple SDK, we have to use the REST API or try a common one
        console.log("Testing with API Key starting with:", apiKey.substring(0, 10));
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("Success with gemini-1.5-flash!");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hi");
            console.log("Success with gemini-pro!");
        } catch (e2) {
            console.error("Error with gemini-pro:", e2.message);
        }
    }
}

listModels();
