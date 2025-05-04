// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
import getMusicUrl from '../util.js';


export default async (request, context) => {
  try {
    // const url = new URL(request.url)
    // const subject = url.searchParams.get('name') || 'World'
    //
    // return new Response(`Hello ${subject}`)


    // 音乐重定向功能
    const musicUrl = await getMusicUrl();
    return new Response(null, {
      status: 302,
      headers: {
        'Location': musicUrl,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(error.toString(), {
      status: 500,
    })
  }
}
