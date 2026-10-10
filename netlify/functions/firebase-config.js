exports.handler = async function(event, context) {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASUREMENT_ID,
            emailjs: {
                publicKey: process.env.EMAILJS_PUBLIC_KEY,
                serviceId: process.env.EMAILJS_SERVICE_ID,
                templateId: process.env.EMAILJS_TEMPLATE_ID
            }
        })
    };
};
