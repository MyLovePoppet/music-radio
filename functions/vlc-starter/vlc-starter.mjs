import getMusicUrl from '../util.js';

export default async (request) => {
    try {
        const url = new URL(request.url);
        const musicUrl = await getMusicUrl();
        const vlcUrl = `vlc://${musicUrl}`;

        // 默认返回带按钮的HTML页面
        return new Response(generateHTML(vlcUrl), {
            headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        return new Response(generateHTML(null, error.message), {
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        });
    }
};

const generateHTML = (vlcUrl, error = null) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>VLC一键播放</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f0f2f5;
    }
    .play-btn {
      padding: 15px 30px;
      font-size: 18px;
      background: #2196F3;
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      transition: transform 0.1s;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .play-btn:hover {
      transform: scale(1.05);
    }
    .error {
      color: #ff4444;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  ${error ? `
    <div class="error">错误: ${error}</div>
  ` : `
    <button class="play-btn" onclick="location.href='${vlcUrl}'">
      🎵 点击播放音乐之声
    </button>
    <p style="margin-top:20px;color:#666">首次使用需要安装VLC播放器</p>
  `}
</body>
</html>
`;

