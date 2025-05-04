// Docs on request and context https://docs.netlify.com/functions/build/#code-your-function-2
import axios from 'axios';
import crypto from 'crypto';

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


const getMusicUrl = async () => {
  try {
    // 1. 获取api.js并提取key
    const apiJsResponse = await axios.get('https://www.radio.cn/pc-portal/js/api.js?061');
    const keyMatch = apiJsResponse.data.match(/var\s+key\s*=\s*['"]([^'"]+)['"]/);
    if (!keyMatch) throw new Error('Key not found in api.js');
    const key = keyMatch[1];

    // 2. 生成签名参数
    const timestamp = Date.now().toString();
    const signText = `categoryId=0&provinceCode=0&timestamp=${timestamp}&key=${key}`;
    const sign = crypto.createHash('md5').update(signText).digest('hex').toUpperCase();

    // 3. 获取播放列表
    const playlistResponse = await axios.get('https://ytmsout.radio.cn/web/appBroadcast/list', {
      params: { categoryId: 0, provinceCode: 0 },
      headers: {
        Timestamp: timestamp,
        Sign: sign,
        'Content-Type': 'application/json',
        equipmentId: '0000',
        platformCode: 'WEB'
      }
    });

    // 4. 验证响应
    if (playlistResponse.data.code !== 0 || !playlistResponse.data.data) {
      throw new Error('Invalid API response');
    }

    // 5. 查找音乐URL
    const musicItem = playlistResponse.data.data.find(item => item.title === '音乐之声');
    if (!musicItem?.mp3PlayUrlHigh) throw new Error('音乐之声 URL not found');

    return musicItem.mp3PlayUrlHigh;
  } catch (error) {
    throw new Error(`Failed to get music URL: ${error.message}`);
  }
};
