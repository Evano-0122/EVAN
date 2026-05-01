window.onload = function() {
    initEmojiPicker();
    initStatusAndMotto();
    initInteractionButtons();
    initAvatarSelector();
    initBackgroundSelector();
    initModeSelector();
    initUserAvatarUpload();
    initMusicMode();
    initAutoGreetings();
    
    document.getElementById('send-button').addEventListener('click', sendMessage);
    
    document.getElementById('message-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    document.getElementById('emoji-button').addEventListener('click', toggleEmojiPicker);
    
    showWelcomeMessage();
    
    setInterval(luhanAutoPoke, 30000);
};

function initEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    const emojis = characterData.customEmojis;
    
    emojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.addEventListener('click', function() {
            const input = document.getElementById('message-input');
            input.value += emoji;
            input.focus();
            toggleEmojiPicker();
        });
        emojiPicker.appendChild(emojiItem);
    });
}

function initStatusAndMotto() {
    const statuses = characterData.customStatuses;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    document.getElementById('status-text').textContent = randomStatus;
    
    const mottos = characterData.customMottos;
    const randomMotto = mottos[Math.floor(Math.random() * mottos.length)];
    document.getElementById('motto').textContent = randomMotto;
}

function initInteractionButtons() {
    const pokeBtn = document.getElementById('poke-btn');
    const hugBtn = document.getElementById('hug-btn');
    const kissBtn = document.getElementById('kiss-btn');
    const patBtn = document.getElementById('pat-btn');
    
    pokeBtn.addEventListener('click', function() {
        addSystemMessage('你戳了戳陆沉的脸');
        setTimeout(async () => {
            try {
                const response = await luhanAI.generateResponse('戳了戳陆沉的脸');
                addMessage('character', response);
            } catch (error) {
                console.error('生成回复失败:', error);
                addMessage('character', '我的小姑娘，真调皮。');
            }
        }, 800);
    });
    
    hugBtn.addEventListener('click', function() {
        addSystemMessage('你抱住了陆沉');
        setTimeout(async () => {
            try {
                const response = await luhanAI.generateResponse('抱住了陆沉');
                addMessage('character', response);
            } catch (error) {
                console.error('生成回复失败:', error);
                addMessage('character', '嗯，就这样抱着我。');
            }
        }, 800);
    });
    
    kissBtn.addEventListener('click', function() {
        addSystemMessage('你亲了亲陆沉的脸颊');
        setTimeout(async () => {
            try {
                const response = await luhanAI.generateResponse('亲了亲陆沉的脸颊');
                addMessage('character', response);
            } catch (error) {
                console.error('生成回复失败:', error);
                addMessage('character', '我的小姑娘，真可爱꜀(^. .^꜀  )꜆੭。');
            }
        }, 800);
    });
    
    patBtn.addEventListener('click', function() {
        addSystemMessage('你摸了摸陆沉的头');
        setTimeout(async () => {
            try {
                const response = await luhanAI.generateResponse('摸了摸陆沉的头');
                addMessage('character', response);
            } catch (error) {
                console.error('生成回复失败:', error);
                addMessage('character', '夫人想再多摸一会吗？');
            }
        }, 800);
    });
}

function initAvatarSelector() {
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    const avatarSelector = document.getElementById('avatar-selector');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const characterImage = document.getElementById('character-image');
    const avatarUploadInput = document.getElementById('avatar-upload-input');
    
    if (!changeAvatarBtn || !avatarSelector || !characterImage || !avatarUploadInput) {
        console.error('头像选择器元素未找到');
        return;
    }
    
    changeAvatarBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        avatarSelector.classList.toggle('show');
    });
    
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            const newSrc = this.getAttribute('data-avatar');
            characterImage.src = newSrc;
            avatarSelector.classList.remove('show');
            
            avatarOptions.forEach(opt => opt.style.borderColor = 'transparent');
            this.style.borderColor = 'rgba(184, 17, 36, 0.8)';
        });
    });
    
    // 自定义头像上传
    avatarUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                characterImage.src = e.target.result;
                avatarSelector.classList.remove('show');
            };
            reader.onerror = function() {
                console.error('文件读取失败');
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!avatarSelector.contains(e.target) && e.target !== changeAvatarBtn) {
            avatarSelector.classList.remove('show');
        }
    });
}

function initBackgroundSelector() {
    const bgOptions = document.querySelectorAll('.bg-option');
    const background = document.getElementById('background');
    const bgUploadInput = document.getElementById('bg-upload-input');
    
    if (!background || !bgUploadInput) {
        console.error('背景选择器元素未找到');
        return;
    }
    
    const backgrounds = {
        'default': '#1a1a2e',
        'crimson': '#0d0d0d',
        'wine': '#1a1a1a',
        'scarlet': '#121212',
        'ember': '#0a0a0a'
    };
    
    bgOptions.forEach(option => {
        option.addEventListener('click', function() {
            const bgType = this.getAttribute('data-bg');
            background.style.background = backgrounds[bgType];
            
            bgOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 自定义背景上传
    bgUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                background.style.background = "url('" + e.target.result + "') center/cover";
                
                // 移除所有背景选项的active状态
                bgOptions.forEach(opt => opt.classList.remove('active'));
            };
            reader.onerror = function() {
                console.error('文件读取失败');
            };
            reader.readAsDataURL(file);
        }
    });
}

function initModeSelector() {
    const morningBtn = document.getElementById('morning-btn');
    const nightBtn = document.getElementById('night-btn');
    const body = document.body;
    
    if (!morningBtn || !nightBtn) {
        console.error('模式切换按钮未找到');
        return;
    }
    
    // 默认设置为晚上模式
    body.classList.add('night-mode');
    body.classList.remove('morning-mode');
    
    morningBtn.addEventListener('click', function() {
        body.classList.add('morning-mode');
        body.classList.remove('night-mode');
        morningBtn.classList.add('active');
        nightBtn.classList.remove('active');
        
        // 陆沉的回应
        setTimeout(() => {
            addMessage('character', '新的一天开始了，我的小姑娘。早安。');
        }, 500);
    });
    
    nightBtn.addEventListener('click', function() {
        body.classList.add('night-mode');
        body.classList.remove('morning-mode');
        nightBtn.classList.add('active');
        morningBtn.classList.remove('active');
        
        // 陆沉的回应
        setTimeout(() => {
            addMessage('character', '夜色很美，就像你一样。');
        }, 500);
    });
}

function initUserAvatarUpload() {
    const userAvatarUpload = document.getElementById('user-avatar-upload');
    const userAvatar = document.getElementById('user-avatar');
    
    if (!userAvatarUpload || !userAvatar) {
        console.error('用户头像上传元素未找到');
        return;
    }
    
    // 自定义用户头像上传
    userAvatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                userAvatar.src = e.target.result;
            };
            reader.onerror = function() {
                console.error('文件读取失败');
            };
            reader.readAsDataURL(file);
        }
    });
}

function initMusicMode() {
    // 歌曲列表
    let songs = [
        { id: 1, title: '光与夜之恋 - 陆沉角色曲' },
        { id: 2, title: '浪漫之夜' },
        { id: 3, title: '心跳旋律' },
        { id: 4, title: '星空下的约定' },
        { id: 5, title: '温柔的守护' }
    ];
    
    let currentSongIndex = 0;
    let isPlaying = false;
    let audioElement = new Audio(); // 真实音频元素
    let musicUrl = '';
    
    // 从本地存储加载歌曲列表
    const savedSongs = localStorage.getItem('lushun_songs');
    if (savedSongs) {
        songs = JSON.parse(savedSongs);
    }
    
    // DOM元素
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const musicPlayer = document.getElementById('music-player');
    const musicTitle = document.getElementById('music-title');
    const musicPlayPauseBtn = document.getElementById('music-play-pause');
    const musicPrevBtn = document.getElementById('music-prev');
    const musicNextBtn = document.getElementById('music-next');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const musicList = document.getElementById('music-list');
    
    // 添加上传音乐按钮到音乐区域
    const addUploadBtn = () => {
        const uploadDiv = document.createElement('div');
        uploadDiv.style.cssText = 'margin-bottom: 15px; text-align: center;';
        uploadDiv.innerHTML = `
            <input type="file" id="music-file-input" accept="audio/*" style="display: none;">
            <button id="upload-music-btn" style="background: linear-gradient(135deg, #B81124 0%, #9E0D20 100%); color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.3s ease; width: 100%;">📁 上传音乐</button>
        `;
        musicPlayer.insertBefore(uploadDiv, musicPlayer.firstChild);
        
        // 绑定上传事件
        const uploadBtn = document.getElementById('upload-music-btn');
        const fileInput = document.getElementById('music-file-input');
        
        uploadBtn.addEventListener('click', () => fileInput.click());
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                const title = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
                songs.push({ id: Date.now(), title: title, url: url });
                localStorage.setItem('lushun_songs', JSON.stringify(songs));
                initSongList();
                currentSongIndex = songs.length - 1;
                playSong();
            }
        });
    };
    
    // 初始化歌曲列表
    function initSongList() {
        musicList.innerHTML = '';
        songs.forEach((song, index) => {
            const listItem = document.createElement('div');
            listItem.className = `music-list-item ${index === currentSongIndex ? 'active' : ''}`;
            listItem.textContent = song.title;
            listItem.addEventListener('click', () => {
                currentSongIndex = index;
                updateSongListActive();
                playSong();
            });
            musicList.appendChild(listItem);
        });
    }
    
    // 更新歌曲列表的活跃状态
    function updateSongListActive() {
        const listItems = document.querySelectorAll('.music-list-item');
        listItems.forEach((item, index) => {
            if (index === currentSongIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // 格式化时间
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 播放歌曲
    function playSong() {
        const currentSong = songs[currentSongIndex];
        musicTitle.textContent = currentSong.title;
        
        if (currentSong.url) {
            audioElement.src = currentSong.url;
            audioElement.play();
            isPlaying = true;
            musicPlayPauseBtn.textContent = '⏸';
        } else {
            // 没有音频文件，模拟播放
            if (!audioElement.src || audioElement.src === '') {
                audioElement.removeAttribute('src');
            }
            audioElement.currentTime = 0;
            audioElement.duration = 180;
            simulatePlayback();
        }
        
        // 陆沉的听歌回应
        setTimeout(() => {
            const responses = [
                `这首歌很不错，你喜欢吗？`,
                `和你一起听歌的感觉，很好。`,
                `音乐能传递很多情感，就像我们之间的关系。`,
                `这首歌的旋律很动人，就像你一样。`,
                `和你分享音乐，是一件很幸福的事。`
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage('character', randomResponse);
        }, 2000);
    }
    
    // 模拟播放（对于没有音频文件的歌曲）
    function simulatePlayback() {
        isPlaying = true;
        musicPlayPauseBtn.textContent = '⏸';
        let currentTime = 0;
        const duration = 180;
        
        audioElement.pause();
        
        // 模拟播放进度
        const interval = setInterval(() => {
            if (!isPlaying) {
                clearInterval(interval);
                return;
            }
            
            currentTime += 0.5;
            updateProgressManual(currentTime, duration);
            
            if (currentTime >= duration) {
                clearInterval(interval);
                nextSong();
            }
        }, 500);
        
        // 保存模拟播放的引用
        audioElement._simInterval = interval;
        audioElement._simCurrentTime = currentTime;
        audioElement._simDuration = duration;
    }
    
    // 更新进度条（手动，用于模拟）
    function updateProgressManual(currentTime, duration) {
        const progress = (currentTime / duration) * 100;
        progressFill.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(duration);
    }
    
    // 音频事件监听
    audioElement.addEventListener('loadedmetadata', () => {
        updateProgress();
    });
    
    audioElement.addEventListener('timeupdate', () => {
        updateProgress();
    });
    
    audioElement.addEventListener('ended', () => {
        nextSong();
    });
    
    audioElement.addEventListener('error', (e) => {
        console.error('音频播放错误:', e);
        // 如果播放错误，使用模拟播放
        if (!audioElement._simInterval) {
            simulatePlayback();
        }
    });
    
    // 更新进度条
    function updateProgress() {
        if (!audioElement) return;
        
        const duration = isNaN(audioElement.duration) ? 180 : audioElement.duration;
        const currentTime = isNaN(audioElement.currentTime) ? 0 : audioElement.currentTime;
        
        const progress = (currentTime / duration) * 100;
        progressFill.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(duration);
    }
    
    // 上一曲
    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        updateSongListActive();
        playSong();
    }
    
    // 下一曲
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        updateSongListActive();
        playSong();
    }
    
    // 播放/暂停切换
    function togglePlayPause() {
        if (isPlaying) {
            if (audioElement.src && audioElement.src !== '') {
                audioElement.pause();
            } else if (audioElement._simInterval) {
                clearInterval(audioElement._simInterval);
            }
            isPlaying = false;
            musicPlayPauseBtn.textContent = '▶';
        } else {
            if (audioElement.src && audioElement.src !== '') {
                audioElement.play();
            } else {
                simulatePlayback();
            }
            isPlaying = true;
            musicPlayPauseBtn.textContent = '⏸';
        }
    }
    
    // 进度条点击事件
    progressBar.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        if (audioElement.src && audioElement.src !== '') {
            audioElement.currentTime = percent * audioElement.duration;
        }
    });
    
    // 切换听歌模式
    musicToggleBtn.addEventListener('click', function() {
        if (musicPlayer.style.display === 'none') {
            musicPlayer.style.display = 'block';
            musicToggleBtn.textContent = '关闭听歌模式';
            addUploadBtn();
            initSongList();
            
            // 陆沉的回应
            setTimeout(() => {
                addMessage('character', '想和我一起听歌吗？选一首你喜欢的吧。');
            }, 1000);
        } else {
            musicPlayer.style.display = 'none';
            musicToggleBtn.textContent = '开启听歌模式';
            
            // 停止播放
            audioElement.pause();
            isPlaying = false;
        }
    });
    
    // 播放/暂停按钮
    musicPlayPauseBtn.addEventListener('click', togglePlayPause);
    
    // 上一曲按钮
    musicPrevBtn.addEventListener('click', prevSong);
    
    // 下一曲按钮
    musicNextBtn.addEventListener('click', nextSong);
    
    // 进度条点击
    progressBar.addEventListener('click', function(e) {
        if (!audioElement) return;
        
        const rect = this.getBoundingClientRect();
        const progress = (e.clientX - rect.left) / rect.width;
        audioElement.currentTime = progress * audioElement.duration;
        updateProgress();
    });
}

function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    emojiPicker.classList.toggle('show');
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message) {
        addMessage('user', message);
        input.value = '';
        document.getElementById('emoji-picker').classList.remove('show');
        
        setTimeout(async () => {
            try {
                const response = await luhanAI.generateResponse(message);
                addMessage('character', response);
                
                // 回复后有30%概率发送随机问候
                if (window.sendRandomGreetingAfterReply) {
                    window.sendRandomGreetingAfterReply();
                }
            } catch (error) {
                console.error('生成回复失败:', error);
                addMessage('character', '我的小姑娘，我有点累了，让我休息一下好吗？');
            }
        }, 800);
    }
}

function addMessage(type, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function luhanAutoPoke() {
    const pokes = characterData.customPokes;
    const randomPoke = pokes[Math.floor(Math.random() * pokes.length)];
    addCharacterActionMessage(randomPoke);
}

function addSystemMessage(content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addCharacterActionMessage(content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'character-action-message';
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showWelcomeMessage() {
    const hour = new Date().getHours();
    let welcomeMessage = '';
    
    if (hour < 6) {
        welcomeMessage = '这么晚了还没睡，是不是想我了？';
    } else if (hour < 12) {
        welcomeMessage = '早安，我的小姑娘。';
    } else if (hour < 18) {
        welcomeMessage = '下午好。希望这个下午，有我陪你会更好。';
    } else {
        welcomeMessage = '晚上好，我的小姑娘。今天过得怎么样？';
    }
    
    setTimeout(() => {
        addMessage('character', welcomeMessage);
    }, 500);
}

function initAutoGreetings() {
    // 早中晚问候内容
    const timeBasedGreetings = {
        morning: [
            '早安，我的小姑娘。',
            '小兔子，早上好。今天有什么计划吗？',
            '夫人，早安。希望今天是美好的一天。',
            '我的小姑娘，起床了吗？记得吃早餐。',
            '小兔子，早安。今天的阳光很明媚，就像你一样。'
        ],
        afternoon: [
            '下午好，我的小姑娘。工作辛苦了。',
            '小兔子，下午好。要不要休息一下？',
            '夫人，下午好。今天过得怎么样？',
            '我的小姑娘，下午好。想我了吗？',
            '小兔子，下午好。天气有点热，记得多喝水。'
        ],
        evening: [
            '晚上好，我的小姑娘。今天过得怎么样？',
            '小兔子，晚上好。要不要一起吃晚餐？',
            '夫人，晚上好。今天工作辛苦了。',
            '我的小姑娘，晚上好。想不想和我聊聊天？',
            '小兔子，晚上好。今天有没有发生什么有趣的事？'
        ]
    };
    
    // 随机问候内容
    const randomGreetings = [
        '我的小姑娘，在忙什么呢？',
        '小兔子，今天过得怎么样？',
        '夫人，想我了吗？',
        '我的小姑娘，有什么有趣的事发生吗？',
        '小兔子，要不要和我聊聊天？',
        '夫人，今天有没有想我？',
        '我的小姑娘，最近过得好吗？',
        '小兔子，天气变冷了，记得多穿点衣服。',
        '夫人，工作辛苦了，我在这里等你。',
        '我的小姑娘，今天有没有好好照顾自己？',
        '小兔子，想不想听听我的声音？',
        '夫人，今天的你一定很美。',
        '我的小姑娘，最近有没有什么烦恼？',
        '小兔子，要不要我陪你做点什么？',
        '夫人，我一直在想你。'
    ];
    
    // 获取当前时间段
    const getCurrentTimeSlot = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        return 'evening';
    };
    
    // 计算到下一个时间段的时间
    const getNextTimeSlotTime = () => {
        const hour = new Date().getHours();
        let nextHour;
        
        if (hour < 6) {
            nextHour = 6; // 早上6点
        } else if (hour < 12) {
            nextHour = 12; // 中午12点
        } else if (hour < 18) {
            nextHour = 18; // 晚上6点
        } else {
            nextHour = 6; // 第二天早上6点
        }
        
        const now = new Date();
        const nextTime = new Date(now);
        nextTime.setHours(nextHour, 0, 0, 0);
        
        if (nextHour < now.getHours()) {
            nextTime.setDate(nextTime.getDate() + 1);
        }
        
        return nextTime.getTime() - now.getTime();
    };
    
    // 发送时间相关问候（仅在页面加载时发送一次）
    const sendTimeBasedGreeting = () => {
        const timeSlot = getCurrentTimeSlot();
        const greetings = timeBasedGreetings[timeSlot];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        addMessage('character', randomGreeting);
    };
    
    // 用户对话后随机发送问候（30%概率）
    const sendRandomGreetingAfterReply = () => {
        // 30%概率发送随机问候
        if (Math.random() > 0.7) {
            const randomGreeting = randomGreetings[Math.floor(Math.random() * randomGreetings.length)];
            setTimeout(() => {
                addMessage('character', randomGreeting);
            }, 3000); // 延迟3秒发送
        }
    };
    
    // 页面加载时发送一次时间问候
    sendTimeBasedGreeting();
    
    // 暴露函数供外部调用
    window.sendRandomGreetingAfterReply = sendRandomGreetingAfterReply;
}

// 初始化AI实例
let luhanAI;
try {
    luhanAI = new LuhanAI();
    console.log('AI初始化成功');
} catch (error) {
    console.error('AI初始化失败:', error);
    // 备用方案：创建一个简单的回复系统
    luhanAI = {
        generateResponse: function(message) {
            const replies = [
                '我的小姑娘，你说什么？',
                '小兔子，我在听呢。',
                '夫人，你想聊点什么？',
                '我在呢，我的小姑娘。',
                '小兔子，有什么事吗？'
            ];
            return replies[Math.floor(Math.random() * replies.length)];
        }
    };
    console.log('使用备用回复系统');
}