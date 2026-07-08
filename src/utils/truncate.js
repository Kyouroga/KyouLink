// File purpose: Truncate long text to fit Discord embed limits.
export default function truncate(text, max = 1024) {;
    if (!text) return "No content provided.";

    const cleaned = String(text).trim();

    if (cleaned.length <= max) {
        return cleaned;
    }

    return cleaned.slice(0, max - 3) + "...";
};





