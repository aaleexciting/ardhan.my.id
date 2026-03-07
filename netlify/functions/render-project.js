exports.handler = async function(event, context) {
  let projectId = event.queryStringParameters?.id;
  if (!projectId) {
    const pathParts = event.path.split('/');
    projectId = pathParts[pathParts.length - 1];
  }

  if (!projectId || projectId === "render-project") {
      return { statusCode: 302, headers: { Location: '/' } };
  }
  
  const projectIdClean = projectId.replace(/[^a-zA-Z0-9-_]/g, ''); 
  const FIREBASE_PROJECT_ID = "ardhan-s-website";
  
  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${projectIdClean}`;
    const response = await fetch(firestoreUrl);
    
    if (!response.ok) {
      return { statusCode: 302, headers: { Location: '/' } };
    }

    const data = await response.json();
    const project = data.fields;

    const title = project.title ? project.title.stringValue : "Project Details";
    const description = project.description ? project.description.stringValue : "Read about this project.";
    const imageUrl = project.imageUrl ? project.imageUrl.stringValue : "https://ardhan.my.id/banner.png";
    const url = `https://ardhan.my.id/project/${projectIdClean}`;

    const tagsStr = project.tag ? project.tag.stringValue.toLowerCase() : "";
    const isWebApp = tagsStr.includes("web") || tagsStr.includes("app");

    const baseUrl = process.env.URL || 'https://ardhan.my.id';
    const appShellUrl = `${baseUrl}/detail.html?v=${Date.now()}`;
    const shellResponse = await fetch(appShellUrl);
    let htmlTemplate = await shellResponse.text();

    const injectionPayload = `
        <title>${title} - Ardan Ridho</title>
        <meta name="description" content="${description}">
        
        <!-- CURES THE DUPLICATE ERROR: Tells Google this is the master URL -->
        <link rel="canonical" href="${url}" />
        
        <meta property="og:type" content="${isWebApp ? 'website' : 'article'}">
        <meta property="og:title" content="${title} - Ardan Ridho">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:url" content="${url}">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title} - Ardan Ridho">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">
        
        <!-- JSON-LD Schema for rich results -->
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "${isWebApp ? 'SoftwareApplication' : 'Article'}",
            "name": "${title}",
            "headline": "${title}",
            "description": "${description}",
            "image": "${imageUrl}",
            "url": "${url}",
            "author": { "@type": "Person", "name": "Ardan Ridho", "url": "https://ardhan.my.id/" },
            "publisher": { "@type": "Person", "name": "Ardan Ridho" }
          }
        <\/script>

        <!-- INJECT PROJECT ID FOR THE FRONTEND SCRIPT TO USE -->
        <script>window.SERVER_INJECTED_PROJECT_ID = "${projectIdClean}";<\/script>
    `;

    const finalHtml = htmlTemplate.replace('</head>', injectionPayload + '\n</head>');

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "text/html; charset=utf-8", 
        "Cache-Control": "public, max-age=60" 
      },
      body: finalHtml
    };

  } catch (error) {
    console.error("Function crashed during execution:", error);
    return { statusCode: 302, headers: { Location: '/' } };
  }
};