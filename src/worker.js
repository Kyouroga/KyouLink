import { handleGithubWebhook } from './github/webhookHandler.js';

export default {
  async fetch(request, env) {
    const rawBody = await request.arrayBuffer();

    const result = await handleGithubWebhook({
      method: request.method,
      headers: request.headers,
      rawBody,
      parsedBody: undefined,
      env,
      url: request.url
    });

    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
};
