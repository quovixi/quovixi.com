const fetch = require('node-fetch');

exports.handler = async function () {
    const SHEET_ID = '1ETd8ZgatNS7e6_3RkqBF2gzQMsJ5UYpWU9pVJ862cGI';
    const RANGE = 'Sheet1!A:F';
    const API_KEY = process.env.GOOGLE_API_KEY;

    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`,
            {
                headers: {
                    Referer: 'https://your-site-domain/', // Replace with your actual site domain
                },
            }
        );
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }),
        };
    }
};
