'use client';

import { useTranslation } from '../contexts/TranslationContext';

export default function TranslationTestPage() {
    const { t, currentLang } = useTranslation();

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-green-700">
                {t("Translation System Demo")}
            </h1>

            <p className="text-gray-600">
                {t("Current Language")}: <span className="font-mono font-bold text-blue-600 uppercase">{currentLang}</span>
            </p>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100 space-y-4">
                <h2 className="text-xl font-semibold">{t("Hook Usage (Manual)")}</h2>
                <p>{t("This text is manually wrapped in the t() hook. It will be translated via Google AI if not in cache.")}</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    {t("Click Me to Save")}
                </button>
            </div>

            <div className="bg-green-50 p-6 rounded-xl shadow-lg border border-green-200 space-y-4">
                <h2 className="text-xl font-semibold text-green-900">{t("Automated Usage (No Hook)")}</h2>
                <p>This text is NOT wrapped in a hook. Our AutoTranslator component will detect this text in the DOM and translate it automatically using the MutationObserver and the same AI API.</p>
                <input
                    type="text"
                    placeholder="I will be translated automatically"
                    className="w-full p-2 border rounded-md"
                />
            </div>

            <div className="text-sm text-gray-400 italic">
                {t("Note: New translations might take a second to appear as they are fetched from the Google Cloud API and then cached locally.")}
            </div>
        </div>
    );
}
