const { GoogleGenerativeAI } = require("@google/generative-ai");

const keys = [
    'AIzaSyB1SJQt39im4TVHA47InAHD-uyshT8oq7w', // Firebase
    'AIzaSyCdzW2MWoXHpUFl8QROJQo-jnYOcx_a6Vk'  // Translation
];

async function findWorkingKey() {
    for (const k of keys) {
        console.log(`\n--- Testing Key: ${k.substring(0, 8)}... ---`);
        const genAI = new GoogleGenerativeAI(k);
        const models = ['gemini-1.5-flash', 'gemini-pro'];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const res = await model.generateContent("Say 'Ready'");
                console.log(`[${m}]: SUCCESS!`);
                return k; // Found one!
            } catch (e) {
                console.log(`[${m}]: FAILED (${e.message})`);
            }
        }
    }
    return null;
}

findWorkingKey().then(k => {
    if (k) console.log("\nWORKING KEY FOUND:", k);
    else console.log("\nNO WORKING KEY FOUND.");
});
