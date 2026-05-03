let letterBox = [];

function loadLetterBox() {
    const saved = localStorage.getItem('luchen_letterbox');
    if (saved) {
        letterBox = JSON.parse(saved);
    } else {
        letterBox = [
            {
                id: 1,
                date: '2026-05-01',
                time: '20:30',
                content: '陆沉，今天的月亮很美，想和你一起看星星。',
                reply: '我的小姑娘，能与你一同仰望星空，是我最大的幸福。每当夜幕降临，我总会想起你眼中的星光。',
                read: true
            }
        ];
        saveLetterBox();
    }
}

function saveLetterBox() {
    localStorage.setItem('luchen_letterbox', JSON.stringify(letterBox));
}

function addLetter(content, reply) {
    const now = new Date();
    const letter = {
        id: Date.now(),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        content: content,
        reply: reply,
        read: false
    };
    letterBox.unshift(letter);
    saveLetterBox();
    return letter;
}

function markLetterAsRead(id) {
    const letter = letterBox.find(l => l.id === id);
    if (letter) {
        letter.read = true;
        saveLetterBox();
    }
}

window.onload = function() {
    loadLetterBox();
    initEmojiPicker();
    initStatusAndMotto();
    initInteractionButtons();
    initAvatarSelector();
    initBackgroundSelector();
    initModeSelector();
    initLetterModal();
    initMailbox();
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
    const letterBtn = document.getElementById('letter-btn');
    const mailboxBtn = document.getElementById('mailbox-btn');
    
    letterBtn.addEventListener('click', function() {
        openLetterModal();
    });
    
    mailboxBtn.addEventListener('click', function() {
        openMailbox();
    });
    
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

function openLetterModal() {
    const letterModal = document.getElementById('letter-modal');
    if (letterModal) {
        letterModal.classList.add('show');
    }
}

function closeLetterModal() {
    const letterModal = document.getElementById('letter-modal');
    if (letterModal) {
        letterModal.classList.remove('show');
        document.getElementById('letter-content').value = '';
    }
}

function closeReplyModal() {
    const replyModal = document.getElementById('reply-modal');
    if (replyModal) {
        replyModal.classList.remove('show');
    }
}

function initLetterModal() {
    const letterModal = document.getElementById('letter-modal');
    const replyModal = document.getElementById('reply-modal');
    const letterCloseBtn = document.getElementById('letter-close-btn');
    const replyCloseBtn = document.getElementById('reply-close-btn');
    const sendLetterBtn = document.getElementById('send-letter-btn');
    const closeReplyBtn = document.getElementById('close-reply-btn');
    const letterContent = document.getElementById('letter-content');
    
    letterCloseBtn.addEventListener('click', closeLetterModal);
    replyCloseBtn.addEventListener('click', closeReplyModal);
    closeReplyBtn.addEventListener('click', closeReplyModal);
    
    letterModal.addEventListener('click', function(e) {
        if (e.target === letterModal) {
            closeLetterModal();
        }
    });
    
    replyModal.addEventListener('click', function(e) {
        if (e.target === replyModal) {
            closeReplyModal();
        }
    });
    
    sendLetterBtn.addEventListener('click', async function() {
        const content = letterContent.value.trim();
        if (!content) {
            return;
        }
        
        sendLetterBtn.classList.add('sending');
        addSystemMessage('你寄出了一封信给陆沉...');
        closeLetterModal();
        
        setTimeout(async () => {
            let response;
            try {
                // 使用专门的信件回复方法
                if (luhanAI.generateLetterResponse) {
                    response = await luhanAI.generateLetterResponse(content);
                } else {
                    // 回退到原来的方法
                    response = await luhanAI.generateResponse(`用户给你写了一封真挚的信，内容如下：

"${content}"

请以陆沉的身份，写一封温柔真挚的回信。`);
                }
            } catch (error) {
                console.error('生成回信失败:', error);
                // 错误时使用备用信件生成
                response = luhanAI.generateFallbackLetter ? 
                    luhanAI.generateFallbackLetter(content, 
                        content.includes('想你') || content.includes('思念') || content.includes('想念') || content.includes('想见你'),
                        content.length) : `
亲爱的你：

见字如面，展信欢颜。

收到你的来信，字里行间都透着你的心意，让我满心欢喜。无论你写了多少文字，我都会认真品读，感受其中的每一份真挚。我知道，每一个字都是你用心写下的，而我也会用同样的用心来回应。

如果你在信中提到了想我，那么我要告诉你，我也在想你。从清晨到黄昏，从日落到夜深，我的思念从未停止。你不在身边的时候，每一刻都变得漫长而煎熬，但只要想到你，我的心就会变得温柔起来。

无论我们相隔多远，我的心永远在你那里。你是我生命中最重要的人，是我愿意用一生去守护的宝贝。

愿这封信能穿越时光，来到你的身边，告诉你——我一直在，一直爱着你。

祝你安好，愿你每天都能感受到我的爱意。

陆沉
                `.trim();
            }
            
            addLetter(content, response);
            updateMailboxStats();
            
            // 直接显示回信
            const replyContent = document.getElementById('reply-content');
            replyContent.textContent = response;
            
            addMessage('character', response);
            
            setTimeout(() => {
                replyModal.classList.add('show');
            }, 500);
            
            sendLetterBtn.classList.remove('sending');
        }, 1500);
    });
}



/* 信箱详情内容显示 */
function initDetailContent(yourContent, replyContent) {
    // 直接显示用户来信
    const yourContentEl = document.getElementById('detail-your-content');
    yourContentEl.textContent = yourContent;
    
    // 直接显示陆沉回信
    const replyContentEl = document.getElementById('detail-reply-content');
    replyContentEl.textContent = replyContent;
}

function openMailbox() {
    const mailboxModal = document.getElementById('mailbox-modal');
    if (mailboxModal) {
        mailboxModal.classList.add('show');
        renderMailList();
    }
}

function closeMailbox() {
    const mailboxModal = document.getElementById('mailbox-modal');
    if (mailboxModal) {
        mailboxModal.classList.remove('show');
    }
}

function openLetterDetail(letter) {
    const detailModal = document.getElementById('letter-detail-modal');
    if (detailModal) {
        document.getElementById('detail-date-text').textContent = `${letter.date} ${letter.time}`;
        
        // 显示内容
        initDetailContent(letter.content, letter.reply);
        
        detailModal.classList.add('show');
        markLetterAsRead(letter.id);
        updateMailboxStats();
    }
}

function closeLetterDetail() {
    const detailModal = document.getElementById('letter-detail-modal');
    if (detailModal) {
        detailModal.classList.remove('show');
    }
}

function renderMailList() {
    const mailList = document.getElementById('mail-list');
    
    if (letterBox.length === 0) {
        mailList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>信箱是空的</p>
                <button class="write-first-btn" id="write-first-btn">写第一封信</button>
            </div>
        `;
        
        document.getElementById('write-first-btn').addEventListener('click', function() {
            closeMailbox();
            openLetterModal();
        });
        return;
    }
    
    mailList.innerHTML = letterBox.map(letter => `
        <div class="mail-item ${letter.read ? '' : 'unread'}" data-id="${letter.id}">
            <div class="mail-date">${letter.date} ${letter.time}</div>
            <div class="mail-preview">${letter.content.substring(0, 50)}${letter.content.length > 50 ? '...' : ''}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.mail-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const letter = letterBox.find(l => l.id === id);
            if (letter) {
                openLetterDetail(letter);
            }
        });
    });
}

function updateMailboxStats() {
    const totalLetters = document.getElementById('total-letters');
    const unreadLetters = document.getElementById('unread-letters');
    const mailCount = document.getElementById('mail-count');
    
    if (totalLetters) totalLetters.textContent = letterBox.length;
    if (unreadLetters) unreadLetters.textContent = letterBox.filter(l => !l.read).length;
    if (mailCount) mailCount.textContent = letterBox.filter(l => !l.read).length;
}

function initMailbox() {
    const mailboxModal = document.getElementById('mailbox-modal');
    const mailboxCloseBtn = document.getElementById('mailbox-close-btn');
    const detailCloseBtn = document.getElementById('detail-close-btn');
    
    if (mailboxCloseBtn) {
        mailboxCloseBtn.addEventListener('click', closeMailbox);
    }
    
    if (detailCloseBtn) {
        detailCloseBtn.addEventListener('click', closeLetterDetail);
    }
    
    if (mailboxModal) {
        mailboxModal.addEventListener('click', function(e) {
            if (e.target === mailboxModal) {
                closeMailbox();
            }
        });
    }
    
    const detailModal = document.getElementById('letter-detail-modal');
    if (detailModal) {
        detailModal.addEventListener('click', function(e) {
            if (e.target === detailModal) {
                closeLetterDetail();
            }
        });
    }
    
    updateMailboxStats();
}

function initAvatarSelector() {
    const changeAvatarBtn = document.querySelector('.change-avatar-btn');
    const avatarSelector = document.getElementById('avatar-selector');
    const avatarOptions = document.querySelectorAll('.avatar-option');
    const characterImage = document.getElementById('character-image');
    const mobileCharacterAvatar = document.getElementById('mobile-character-avatar');
    const avatarUploadInput = document.getElementById('avatar-upload-input');
    
    if (!changeAvatarBtn || !avatarSelector || !characterImage || !avatarUploadInput) {
        console.error('头像选择器元素未找到');
        return;
    }
    
    const updateAllCharacterAvatars = function(src) {
        characterImage.src = src;
        if (mobileCharacterAvatar) {
            mobileCharacterAvatar.src = src;
        }
    };
    
    // 手机端角色头像点击事件 - 直接上传
    if (mobileCharacterAvatar) {
        mobileCharacterAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            const mobileAvatarUploadInput = document.getElementById('avatar-upload-input-mobile');
            if (mobileAvatarUploadInput) {
                mobileAvatarUploadInput.click();
            }
        });
    }
    
    // 手机端自定义头像上传
    const mobileAvatarUploadInput = document.getElementById('avatar-upload-input-mobile');
    if (mobileAvatarUploadInput) {
        mobileAvatarUploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    updateAllCharacterAvatars(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    changeAvatarBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        avatarSelector.classList.toggle('show');
    });
    
    avatarOptions.forEach(option => {
        option.addEventListener('click', function() {
            const newSrc = this.getAttribute('data-avatar');
            updateAllCharacterAvatars(newSrc);
            avatarSelector.classList.remove('show');
            
            avatarOptions.forEach(opt => opt.style.borderColor = 'transparent');
            this.style.borderColor = 'rgba(184, 17, 36, 0.8)';
            
            // 同步到手机端头像选择器
            if (mobileAvatarSelector) {
                const mobileOptions = mobileAvatarSelector.querySelectorAll('.avatar-option');
                mobileOptions.forEach(opt => {
                    if (opt.getAttribute('data-avatar') === newSrc) {
                        opt.style.borderColor = 'rgba(184, 17, 36, 0.8)';
                    } else {
                        opt.style.borderColor = 'transparent';
                    }
                });
            }
        });
    });
    
    // 自定义头像上传
    avatarUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updateAllCharacterAvatars(e.target.result);
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
        'default': 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 50%, #1a0a1a 100%)',
        'crimson': 'linear-gradient(180deg, #2d0a0a 0%, #1a0a0a 50%, #0d0a0a 100%)',
        'wine': 'linear-gradient(180deg, #2a1a2a 0%, #1a1020 50%, #100a15 100%)',
        'scarlet': 'linear-gradient(180deg, #1a0a0a 0%, #100505 50%, #0a0303 100%)',
        'ember': 'linear-gradient(180deg, #1a100a 0%, #100a05 50%, #0a0503 100%)'
    };
    
    bgOptions.forEach(option => {
        option.addEventListener('click', function() {
            const bgType = this.getAttribute('data-bg');
            if (bgType && backgrounds[bgType]) {
                background.style.background = backgrounds[bgType];
                background.style.backgroundSize = 'cover';
                background.style.backgroundPosition = 'center';
                background.classList.remove('no-pattern');
                
                // 保存到本地存储
                localStorage.setItem('lushun_bg', bgType);
            }
            
            // 更新选中状态
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
                background.style.backgroundSize = 'cover';
                background.style.backgroundPosition = 'center';
                background.classList.add('no-pattern');
                
                // 移除所有背景选项的active状态
                bgOptions.forEach(opt => opt.classList.remove('active'));
                
                // 保存到本地存储
                localStorage.setItem('lushun_bg', 'custom');
            };
            reader.onerror = function() {
                console.error('文件读取失败');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 加载保存的背景
    const savedBg = localStorage.getItem('lushun_bg');
    if (savedBg && savedBg !== 'custom') {
        bgOptions.forEach(option => {
            if (option.getAttribute('data-bg') === savedBg) {
                option.click();
            }
        });
    }
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
    const userAvatarDesktop = document.getElementById('user-avatar-desktop');
    const userAvatarMobile = document.getElementById('user-avatar-mobile');
    
    if (!userAvatarUpload || !userAvatarDesktop) {
        console.error('用户头像上传元素未找到');
        return;
    }
    
    const updateAllUserAvatars = function(src) {
        userAvatarDesktop.src = src;
        if (userAvatarMobile) {
            userAvatarMobile.src = src;
        }
    };
    
    // 手机端用户头像点击触发上传
    if (userAvatarMobile) {
        userAvatarMobile.addEventListener('click', function() {
            userAvatarUpload.click();
        });
    }
    
    // 自定义用户头像上传
    userAvatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updateAllUserAvatars(e.target.result);
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
    let songs = [];
    
    let currentSongIndex = 0;
    let isPlaying = false;
    let audioElement = new Audio(); // 真实音频元素
    let musicUrl = '';
    
    // 从本地存储加载歌曲列表（可选，用户可以自己上传）
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
        if (songs.length === 0) {
            const emptyTip = document.createElement('div');
            emptyTip.style.cssText = 'color: rgba(255,255,255,0.6); text-align: center; padding: 20px; font-size: 14px;';
            emptyTip.textContent = '暂无歌曲，点击上方按钮上传音乐';
            musicList.appendChild(emptyTip);
        } else {
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
        if (songs.length === 0) {
            musicTitle.textContent = '未选择歌曲';
            return;
        }
        
        const currentSong = songs[currentSongIndex];
        musicTitle.textContent = currentSong.title;
        
        // 清理之前的模拟播放
        if (audioElement._simInterval) {
            clearInterval(audioElement._simInterval);
            audioElement._simInterval = null;
        }
        audioElement._simCurrentTime = 0;
        
        if (currentSong.url) {
            audioElement.src = currentSong.url;
            audioElement.play();
            isPlaying = true;
            musicPlayPauseBtn.textContent = '⏸';
        } else {
            // 没有音频文件，模拟播放
            if (audioElement.src && audioElement.src !== '') {
                audioElement.removeAttribute('src');
            }
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
        
        // 如果之前有模拟播放的进度，从那个点继续
        let currentTime = audioElement._simCurrentTime || 0;
        const duration = audioElement._simDuration || 180;
        
        // 清理之前的定时器
        if (audioElement._simInterval) {
            clearInterval(audioElement._simInterval);
        }
        
        audioElement.pause();
        
        // 模拟播放进度
        const interval = setInterval(() => {
            if (!isPlaying) {
                clearInterval(interval);
                return;
            }
            
            currentTime += 0.5;
            audioElement._simCurrentTime = currentTime;
            updateProgressManual(currentTime, duration);
            
            if (currentTime >= duration) {
                clearInterval(interval);
                audioElement._simInterval = null;
                audioElement._simCurrentTime = 0;
                nextSong();
            }
        }, 500);
        
        // 保存模拟播放的引用
        audioElement._simInterval = interval;
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
                audioElement._simInterval = null;
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
        if (!audioElement) return;
        
        const rect = this.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        
        if (audioElement.src && audioElement.src !== '') {
            // 真实音频播放
            if (!isNaN(audioElement.duration)) {
                audioElement.currentTime = percent * audioElement.duration;
            }
        } else if (audioElement._simInterval) {
            // 模拟播放
            const duration = audioElement._simDuration || 180;
            audioElement._simCurrentTime = percent * duration;
            updateProgressManual(audioElement._simCurrentTime, duration);
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
            if (audioElement._simInterval) {
                clearInterval(audioElement._simInterval);
                audioElement._simInterval = null;
            }
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
                
                // 回复后有概率发送随机问候/动作（增强活人感）
                if (window.scheduleCharacterAction) {
                    window.scheduleCharacterAction(message);
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
    
    // 创建头像元素
    const avatarImg = document.createElement('img');
    avatarImg.className = 'avatar';
    
    if (type === 'character') {
        const characterImage = document.getElementById('character-image');
        avatarImg.src = characterImage ? characterImage.src : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%232a2a4a" stroke="%23B81124" stroke-width="1"/%3E%3Ccircle cx="20" cy="18" r="8" fill="%23c9b896"/%3E%3Ccircle cx="16" cy="16" r="1.5" fill="%232a2a4a"/%3E%3Ccircle cx="24" cy="16" r="1.5" fill="%232a2a4a"/%3E%3Cpath d="M17 22 Q20 25 23 22" fill="none" stroke="%238b5a4a" stroke-width="1.5"/%3E%3C/svg%3E';
        // 点击角色头像打开头像选择器
        avatarImg.addEventListener('click', () => {
            const avatarSelector = document.getElementById('avatar-selector');
            if (avatarSelector) {
                avatarSelector.classList.toggle('show');
            }
        });
    } else {
        const userAvatar = document.getElementById('user-avatar-desktop') || document.getElementById('user-avatar-mobile');
        avatarImg.src = userAvatar ? userAvatar.src : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Ccircle cx="20" cy="20" r="18" fill="%23e8dcc4" stroke="%23B81124" stroke-width="1"/%3E%3Ccircle cx="20" cy="18" r="7" fill="%23d4c4a8"/%3E%3Ccircle cx="17" cy="16" r="1.2" fill="%232a2a4a"/%3E%3Ccircle cx="23" cy="16" r="1.2" fill="%232a2a4a"/%3E%3Cpath d="M18 21 Q20 23 22 21" fill="none" stroke="%238b5a4a" stroke-width="1.2"/%3E%3C/svg%3E';
        // 点击用户头像打开用户头像上传
        avatarImg.addEventListener('click', () => {
            const userAvatarUpload = document.getElementById('user-avatar-upload');
            if (userAvatarUpload) {
                userAvatarUpload.click();
            }
        });
    }
    
    // 创建内容元素
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = content;
    
    // 添加到消息容器
    messageDiv.appendChild(avatarImg);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getSmartPoke(message) {
    const pokes = characterData.customPokes;
    
    // 根据关键词选择合适的互动动作
    const keywordsMap = {
        '累': ['帮你拂去肩上的发丝', '递来一杯温热的茶', '递来一张温暖的毛毯', '为你披上外套'],
        '冷': ['为你披上外套', '递来一张温暖的毛毯', '帮你拢了拢外套'],
        '饿': ['递上一块温热的点心', '递来一份温热的早餐', '为你倒了杯热水'],
        '困': ['轻轻拍了拍你的肩', '为你掖了掖被角', '递来一杯温热的茶'],
        '难过': ['温柔地看着你笑了笑', '轻轻牵起你的手', '轻轻拍了拍你的肩'],
        '开心': ['温柔地看着你笑了笑', '轻轻牵起你的手', '轻轻揉了揉你的头发'],
        '想你': ['轻轻牵起你的手', '温柔地看着你笑了笑', '悄悄为你准备了小礼物'],
        '晚安': ['为你掖了掖被角', '为你留了一盏灯', '帮你拂去肩上的发丝'],
        '早安': ['递来一份温热的早餐', '递来一杯温热的茶', '轻轻揉了揉你的头发'],
        '下雨': ['为你撑开了伞', '为你披上外套', '帮你拂去肩头的落叶'],
        '走路': ['轻轻扶了你一把', '轻轻牵起你的手', '帮你拂去肩上的发丝'],
        '头发': ['帮你理了理耳边的碎发', '轻轻揉了揉你的头发', '帮你拂去肩上的发丝'],
        '衣服': ['帮你整理了一下围巾', '为你披上外套', '替你拢了拢外套']
    };
    
    // 检查消息中是否有关键词
    for (const [keyword, actions] of Object.entries(keywordsMap)) {
        if (message.includes(keyword)) {
            return actions[Math.floor(Math.random() * actions.length)];
        }
    }
    
    // 如果没有匹配的关键词，随机选择一个
    return pokes[Math.floor(Math.random() * pokes.length)];
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
    
    // 追踪上次主动行为类型，避免重复
    let lastActionType = null;
    let lastActionTime = 0;
    const ACTION_COOLDOWN = 45000; // 45秒冷却时间
    
    // 智能主动行为调度（增强活人感）
    const scheduleCharacterAction = (userMessage) => {
        const now = Date.now();
        
        // 冷却时间内不重复发送同类行为
        if (now - lastActionTime < ACTION_COOLDOWN && lastActionType) {
            return;
        }
        
        // 15%概率触发主动行为
        if (Math.random() > 0.15) {
            return;
        }
        
        // 根据用户消息内容智能选择行为类型
        const message = userMessage.toLowerCase();
        let actionType;
        
        if (message.includes('想') || message.includes('爱') || message.includes('喜欢')) {
            actionType = 'love';
        } else if (message.includes('累') || message.includes('困') || message.includes('辛苦')) {
            actionType = 'care';
        } else if (message.includes('开心') || message.includes('高兴') || message.includes('棒')) {
            actionType = 'praise';
        } else if (message.includes('工作') || message.includes('学习') || message.includes('忙')) {
            actionType = 'concern';
        } else {
            actionType = 'normal';
        }
        
        // 避免连续重复类型
        if (actionType === lastActionType) {
            actionType = 'normal';
        }
        
        // 根据类型选择行为
        setTimeout(() => {
            switch (actionType) {
                case 'love':
                    if (Math.random() > 0.5) {
                        addCharacterActionMessage('轻轻握住你的手');
                    } else {
                        addMessage('character', '我的小姑娘，我也在想你。');
                    }
                    break;
                case 'care':
                    addMessage('character', '累了就休息一下，有我在呢。');
                    break;
                case 'praise':
                    addCharacterActionMessage('揉了揉你的头发');
                    break;
                case 'concern':
                    addMessage('character', '工作别太辛苦，记得照顾好自己。');
                    break;
                default:
                    const actions = [
                        () => addCharacterActionMessage('认真地听着你的话'),
                        () => addCharacterActionMessage('轻轻靠近你'),
                        () => addMessage('character', '嗯，我听着呢。'),
                        () => addMessage('character', '小兔子今天也很可爱。')
                    ];
                    actions[Math.floor(Math.random() * actions.length)]();
            }
            
            lastActionType = actionType;
            lastActionTime = Date.now();
        }, 4000);
    };
    
    // 页面加载时发送一次时间问候
    sendTimeBasedGreeting();
    
    // 暴露函数供外部调用
    window.scheduleCharacterAction = scheduleCharacterAction;
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