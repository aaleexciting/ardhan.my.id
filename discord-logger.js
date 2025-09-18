async function collectAndSendDeviceData() {
    const deviceData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
    };

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        deviceData.webglRenderer = gl ? (gl.getExtension('WEBGL_debug_renderer_info') ? gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL) : 'N/A') : 'WebGL not supported';
    } catch (e) {
        deviceData.webglRenderer = 'Error getting WebGL info';
    }

    if (window.innerWidth < 768) {
        deviceData.deviceType = 'Mobile';
    } else if (window.innerWidth < 1024) {
        deviceData.deviceType = 'Tablet';
    } else {
        deviceData.deviceType = 'Desktop';
    }

    try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        const discordPayload = {
            username: 'Hanser Web Activity Logger',
            avatar_url: 'https://res.cloudinary.com/ddrtdofqo/image/upload/v1758215682/pfppfp_222_fgqlan.jpg',
            embeds: [{
                title: 'New Website Visit Detected!',
                description: `A user visited your website at ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} (WIB).`,
                color: 3447003,
                fields: [
                    { name: 'IP Address', value: ipData.ip || 'Unknown', inline: true },
                    { name: 'Location', value: `${ipData.city || 'N/A'}, ${ipData.country_name || 'N/A'}`, inline: true },
                    { name: 'ISP/Org', value: ipData.org || 'Unknown', inline: true },
                    { name: 'User Agent', value: `\`${deviceData.userAgent}\``, inline: false },
                    { name: 'Language', value: deviceData.language, inline: true },
                    { name: 'Screen Size', value: `${deviceData.screenWidth}x${deviceData.screenHeight}`, inline: true },
                    { name: 'Device Type', value: deviceData.deviceType, inline: true },
                    { name: 'GPU Renderer', value: `\`${deviceData.webglRenderer}\``, inline: false },
                ],
                footer: { text: 'Data logged via Netlify Serverless Function' },
                timestamp: new Date().toISOString()
            }]
        };

        const response = await fetch('/.netlify/functions/log-visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        });
        
        if (response.ok) {
            console.log('Visitor data relayed to logging function successfully!');
        } else {
            console.error('Error sending log via function:', response.statusText);
        }
    } catch (error) {
        console.error('Error during data collection or sending:', error);
    }
}

window.addEventListener('pageshow', collectAndSendDeviceData);