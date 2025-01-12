exports.handler = async function () {
    return {
        statusCode: 200,
        body: JSON.stringify({ apiKey: process.env.GOOGLE_API_KEY }),
    };
};