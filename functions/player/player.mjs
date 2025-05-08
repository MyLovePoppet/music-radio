// netlify/functions/player.mjs

export default async () => {
    // 内联的播放器HTML模板
    const playerHTML = `
<!DOCTYPE html>
<html lang="zh_CN">
<head>
    <title>音乐之声在线播放</title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@1"></script>
    <style>
        /* 隐藏视频元素，只保留控制栏 */
        #audioPlayer {
            width: 0;
            height: 0;
            position: absolute;
            opacity: 0;
        }

        /* 自定义音频控制界面 */
        .audio-container {
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .controls {
            display: flex;
            align-items: center;
            gap: 15px;
        }
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

/* 新增音量控制样式 */
    .volume-control {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    .volume-slider {
      width: 100px;
      height: 4px;
      -webkit-appearance: none;
      background: #ddd;
      border-radius: 2px;
      outline: none;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .volume-slider:hover {
      opacity: 1;
    }

    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      background: #2196F3;
      border-radius: 50%;
      cursor: pointer;
    }

    .mute-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    </style>
</head>
<body>
<!-- 隐藏的video元素承载音频流 -->
<video id="audioPlayer"></video>

<!-- 自定义控制界面 -->
<div class="audio-container">
    <div class="controls">
        <button id="playBtn" class="play-btn">▶/🎵 点击播放音乐之声</button>
        
        <!-- 新增音量控制组件 -->
      <div class="volume-control">
        <input type="range" 
               id="volumeSlider"
               class="volume-slider"
               min="0"
               max="1"
               step="0.1"
               value="0.5">
      </div>
    </div>
</div>

<script>
    let hls = null;
    const player = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');

    // 音量控制逻辑
    const volumeSlider = document.getElementById('volumeSlider');

    // 初始化音量
    player.volume = volumeSlider.value;

    // 音量滑动事件
    volumeSlider.addEventListener('input', (e) => {
      player.volume = parseFloat(e.value);
    });
    
    
    // 获取真实音频流地址
    async function getStreamUrl() {
        // 调用另一个云函数端点获取直播地址
        const response = await fetch('/api/redirect');

        return response.url;
    }

    // 初始化播放器
    async function initPlayer(streamUrl) {
        try {
            if (Hls.isSupported()) {
                if (hls) hls.destroy();

                hls = new Hls({
                    autoStartLoad: true,
                    maxBufferLength: 30
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(player);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    player.play();
                    playBtn.textContent = '⏸/🎵 点击停止播放音乐之声';
                });

            } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
                player.src = streamUrl;
                player.addEventListener('loadedmetadata', () => player.play());
            }
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    // 控制逻辑
    function setupControls() {
        // 播放/暂停
        playBtn.onclick = () => player.paused ? play() : player.pause();

        // 播放状态同步
        player.addEventListener('play', () => playBtn.textContent = '⏸/🎵 点击停止播放音乐之声');
        player.addEventListener('pause', () => playBtn.textContent = '▶/🎵 点击播放音乐之声');

    }

    async function play() {
        const streamUrl = await getStreamUrl();
        // 初始化
        await initPlayer(streamUrl);
        setupControls();
    }
    
    setupControls();
</script>
</body>
</html>
  `;

    return new Response(playerHTML, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
        }
    });
};