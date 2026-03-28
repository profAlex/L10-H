// пока не используем
export const generateCombinedId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString().substring(2,5);
    return `${timestamp}-${random}`;
};