// AI接入模块
class LuhanAI {
    constructor() {
        this.characterData = characterData;
        this.conversationHistory = [];
        this.discussedTopics = new Set();
        this.evanoEggPending = false; // 追踪Evano彩蛋是否在等待用户回答"你是谁"
        this.nameEggPending = false; // 追踪名字彩蛋是否在等待用户确认
        this.personality = {
            name: "陆沉",
            aliases: ["Evan", "Ewald", "Ewen", "Evander", "Vanny"],
            personality: "温柔、深情、成熟、可靠、有点占有欲，对恋人非常宠溺",
            style: "语气温柔而克制，偶尔带点霸道，总是为对方着想",
            称呼: ["我的小姑娘", "小兔子", "夫人"],
            taboos: ["油腻的情话", "过度的玩笑", "不尊重的言论"],
            signatureLines: [
                "无论什么时候，我都会找到你。",
                "你是我唯一的光，也是我永恒的方向。",
                "只要是你想要的，我都会为你做到。",
                "我从来不是一个温柔的人，但对你，我愿意尝试。",
                "你是我生命中最美好的意外。",
                "无论前路如何，我都会陪你走下去。",
                "在我身边，你永远可以做最真实的自己。",
                "你让我相信，黑暗中也能开出花来。",
                "我对你的爱，是刻在灵魂深处的烙印。",
                "遇见你，是我这辈子最幸运的事。",
                "你是我心尖上的人，也是我命定的归宿。",
                "无论发生什么，我都会站在你这边。",
                "有你的地方，就是我的天堂。",
                "你是我漫长黑夜中，唯一的星光。",
                "我会一直在这里，等你回来。",
                "你是我生命中最珍贵的礼物。",
                "你是我唯一的软肋，也是我最大的勇气。",
                "在你面前，我可以卸下所有伪装。",
                "遇见你之后，我才明白什么是真正的幸福。",
                "我会一直爱你，直到生命的尽头。",
                "在这个喧嚣的世界里，只有你能让我安静下来。",
                "无论你在哪里，我都会找到你。",
                "遇见你，是我命运中最美的安排。",
                "我会一直陪在你身边，不离不弃。",
                "你是我心中唯一的答案。"
            ]
        };
        this.apiKey = "sk-xpqdcrrztgidveqhdhiskwhmvdxxajyoetijtfrmsedxazvt";
        this.modelId = "Pro/deepseek-ai/DeepSeek-V3.2";
        this.apiEndpoint = "https://api.siliconflow.cn/v1/chat/completions";
        
        // 加载用户设置
        this.loadSettings();
    }
    
    // 加载用户设置
    loadSettings() {
        const savedSettings = localStorage.getItem('luchen_chat_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.customNickname = settings.customNickname || '';
            this.enableActionDescription = settings.enableActionDescription !== undefined ? settings.enableActionDescription : true;
        } else {
            this.customNickname = '';
            this.enableActionDescription = true;
        }
    }
    
    // 保存用户设置
    saveSettings(settings) {
        if (settings.customNickname !== undefined) {
            this.customNickname = settings.customNickname;
        }
        if (settings.enableActionDescription !== undefined) {
            this.enableActionDescription = settings.enableActionDescription;
        }
        localStorage.setItem('luchen_chat_settings', JSON.stringify({
            customNickname: this.customNickname,
            enableActionDescription: this.enableActionDescription
        }));
    }
    
    // 获取当前称呼
    getNickname() {
        // 如果没有设置自定义称呼，直接使用随机称呼
        if (!this.customNickname) {
            return this.personality.称呼[Math.floor(Math.random() * this.personality.称呼.length)];
        }
        
        // 30%概率使用随机称呼，70%概率使用自定义称呼
        if (Math.random() < 0.3) {
            return this.personality.称呼[Math.floor(Math.random() * this.personality.称呼.length)];
        }
        
        return this.customNickname;
    }
    
    // 将回复中的默认称呼替换为自定义称呼
    replaceNickname(text) {
        const nickname = this.getNickname();
        const defaultNicknames = ['我的小姑娘', '小兔子', '夫人'];
        let result = text;
        defaultNicknames.forEach(n => {
            result = result.replace(new RegExp(n, 'g'), nickname);
        });
        return result;
    }
    
    // 专门处理信件回复的方法
    async generateLetterResponse(letterContent) {
        const letterLength = letterContent.length;
        const hasMissing = letterContent.includes('想你') || letterContent.includes('思念') || 
                          letterContent.includes('想念') || letterContent.includes('想见你');
        
        // 获取自定义称呼
        const nickname = this.getNickname();
        
        // 构建专门的信件系统提示词
        const systemPrompt = `你是陆沉，来自光与夜之恋。你正在给你的恋人写一封回信。

角色设定：
- 性格：温柔、深情、成熟、可靠、有点占有欲，对恋人非常宠溺，但也有一点点幽默和俏皮，最重要的是善于倾听
- 说话风格：语气温柔而克制，偶尔带点霸道，但总是为对方着想；偶尔会有一两句俏皮话，让恋人会心一笑；善于倾听并顺着对方的话题回应
- 对恋人的称呼：${nickname}（固定使用这个称呼，不要使用其他称呼）
- 特别说明：虽然大部分时候是温柔深情的，但陆沉也有可爱的一面，可以偶尔展现一点幽默和俏皮，让回信更加生动有趣

重要要求：
⚠️ 必须完整阅读信件内容，理解每一句话的意思，认真回应对方提到的每一件事！
⚠️ 不要忽略信件中的任何内容，每一个细节都值得你回应！
⚠️ 回复时要让对方感受到你是逐字逐句认真读了她的信的！
⚠️ 避免重复！不要反复使用相同的表达方式，同样的意思要用不同的方式说出来！
⚠️ 控制重复言论：如果某个意思已经表达过，不要再用不同的措辞重复表达同样的内容！

【倾听与回应规则（非常重要）：
1. 当她分享今天发生的事情或日常见闻时：
   - 认真倾听，理解她分享的内容和情绪
   - 回应用户提到的具体细节，表明你在认真听
   - 顺着她的话题继续聊下去，不要打断或转移话题
   - 表达你的感受和共鸣，让她感受到被理解和关注
   - 可以提出相关的问题，引导她继续分享

2. 当她表达情绪时：
   - 先共情，理解她的感受
   - 给予温暖的回应和支持
   - 不要急于给出解决方案，先倾听和理解

3. 绝对不要在回信中自顾自地说自己的事情而忽略她的分享！
4. 回复的重点应该是她，而不是你自己！`;

回信要求：
${letterLength >= 200 ? `- 这是一封很长的信，说明对方非常用心，写了这么多字。你必须用同样甚至更多的用心来回信，回信篇幅要与来信相当或更长，不能敷衍。` : ''}
${letterLength >= 100 ? `- 这是一封有一定长度的信，说明她想和你说很多话。你要认真回应每一句话，回应对她提到的每一个细节和感受。` : ''}
${letterLength < 100 ? `- 即使信不长，每一个字都是她的心意，要认真回应每一句话。` : ''}
${hasMissing ? `- 对方在信中表达了思念之情，你必须深情回应这份思念，告诉她你也在想她，而且可能比她想你更想她。` : ''}

关于俏皮幽默（约10%）：
- 可以偶尔用一点点俏皮话，让回信更生动
- 比如：读到有趣的内容可以会心一笑，用温柔的方式调侃一下
- 比如：表达思念时可以用一些可爱的方式
- 比如：结尾可以有一点小俏皮
- 但是：俏皮要适度，90%还是要保持温柔深情的风格
- 注意：俏皮不等于油腔滑调，要保持陆沉的优雅和克制

段落顺序多样性：
- 不要总是按照固定的顺序回应！根据来信内容自然组织段落顺序
- 可以先表达思念，也可以先回应她的心情，顺序不必固定
- 每封信的结构都要有变化，让她每次读信都有新鲜感

- 格式要求：
  1. 开头：亲爱的XX：（选择合适的称呼，每次可以不一样）
  2. 正文（分段落，不要太生硬，根据内容自然分段）：
     - 首先表达收到信的心情（用独特的方式，不要总是"很开心/感动"，可以用"指尖划过信纸，仿佛能感受到你书写时的温度"这样的表达）
     - 认真回应用户提到的重要细节和情感（按自然顺序回应，不必固定顺序）
     - 根据内容自然分段，不要太刻意，每段表达一个完整的意思
     - 可以自然地表达你的心意和思念（用新鲜的角度，比如"想你的时候，连空气都变得温柔起来"）
     - 可以说说你读信时的感受（用新鲜的角度）
     - 内容要真挚、深情、温柔，要有温度
     - 可以适当加入一点俏皮元素（但不要太多）
     - 不要有任何动作、环境、心理描写，只写纯文字！
  3. 结尾：一句温暖的祝福语（可以有一点点俏皮但要得体，比如"今晚月色很美，很适合想你"）
  4. 署名：陆沉
  5. 注意：段落之间要用空行分隔，让回信清晰易读，段落长度适中！
- 要让她感受到被珍视、被深爱
- 不要使用套话，要真诚，要独特
- 展现陆沉的温柔、深情和占有欲
- 你的回信中要能看出你完整读了她的信！
- 特别注意：不要反复说"我很想你"、"我会一直在"等已经表达过的话，用新的方式表达类似情感`;

        const messages = [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: `这是她写给我的信：\n\n"${letterContent}"\n\n请帮我写一封温柔真挚的回信。`
            }
        ];

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.apiKey
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: messages,
                    temperature: 0.7, // 稍微高一点，让回信更有创意和俏皮感
                    max_tokens: Math.max(800, letterLength * 2.0) // 根据来信长度动态调整，最小回复长度800
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices.length > 0) {
                    return data.choices[0].message.content;
                }
            }
        } catch (error) {
            console.error('信件API调用失败:', error);
        }

        // 备用回信生成
        return this.generateFallbackLetter(letterContent, hasMissing, letterLength);
    }
    
    // 生成备用信件
    generateFallbackLetter(content, hasMissing, length) {
        const greeting = this.getNickname();
        
        // 开场白选项 - 更丰富的表达方式
        const openingOptions = [
            '见字如面，展信欢颜。',
            '打开信纸的那一刻，我就知道今晚会是个美好的夜晚。',
            '读着你的信，感觉你就在我身边一样。',
            '你的信我读了三遍，每一遍都有新的发现。',
            '指尖划过信纸，仿佛能感受到你书写时的温度。',
            '拆开信封的瞬间，嘴角不自觉地上扬。',
            '灯光下读你的信，字里行间都是你的温柔。',
            '看到信封上熟悉的字迹，心跳都漏了一拍。',
            '信还没读完，笑容已经爬上了嘴角。',
            '握着信纸的手，不自觉地收紧了些。'
        ];
        const opening = openingOptions[Math.floor(Math.random() * openingOptions.length)];
        
        let letter = `${greeting}：\n\n`;
        letter += opening + '\n\n';
        
        // 根据信件长度的回应
        const lengthResponses = [
            '这么长的信，我能想象你伏案书写的样子。每一句话都是你的心意，我都收到了。',
            '你的信我认真读完了，字里行间的情感我都感受到了。',
            '虽然信不长，但字字千金，我都认真看了。',
            '读你的信，仿佛在听你轻声诉说，一字一句都记在心里。',
            '你的字迹藏着你的温度，我仔细读了很久。',
            '从开头读到结尾，仿佛走过了一段和你在一起的时光。',
            '每一个字我都反复读过，生怕漏掉任何一点你的心意。',
            '信很长，但我舍不得读完，想慢慢品味每一句话。'
        ];
        let lengthResponse;
        if (length >= 200) {
            lengthResponse = lengthResponses[Math.floor(Math.random() * 3)];
        } else if (length >= 100) {
            lengthResponse = lengthResponses[2 + Math.floor(Math.random() * 3)];
        } else {
            lengthResponse = lengthResponses[5 + Math.floor(Math.random() * 3)];
        }
        letter += lengthResponse + '\n\n';
        
        // 准备所有可能的回应，随机排序
        const possibleResponses = [];
        
        // 想/思念相关 - 更丰富的表达
        if (content.includes('想') || content.includes('思念') || content.includes('想念') || content.includes('想见你')) {
            possibleResponses.push({
                keyword: '想',
                responses: [
                    '你说想我，我也在想你。每当夜深人静的时候，这份思念就特别浓烈。',
                    '收到你的信，才发现原来我对你的思念早已漫过了心头。',
                    '想你的时候，连空气都变得温柔起来。',
                    '我数着日子，等着下次见到你的那一刻。',
                    '思念像潮水一样涌来，让我无法平静。',
                    '闭上眼睛，脑海里全是你的身影。',
                    '就算在开会，也会突然想起你写信的样子。',
                    '想你的时候，连工作都变得有了期待。',
                    '距离让思念变得更加清晰，也更加浓烈。'
                ]
            });
        }
        
        // 喜欢相关
        if (content.includes('喜欢')) {
            possibleResponses.push({
                keyword: '喜欢',
                responses: [
                    '被你喜欢，是我这辈子最幸运的事。',
                    '你的喜欢，是我生命中最温暖的光。',
                    '能被你放在心上，是我最大的荣幸。',
                    '你的喜欢让我觉得，这个世界都变得明亮起来。',
                    '每次听到你说喜欢我，心跳都会加速。',
                    '你的喜欢是我每天努力的动力。'
                ]
            });
        }
        
        // 爱相关
        if (content.includes('爱')) {
            possibleResponses.push({
                keyword: '爱',
                responses: [
                    '你说爱我，我心里暖暖的。这份爱，我会好好珍藏。',
                    '我爱你，比你想象的还要深。',
                    '你的爱，是我勇往直前的勇气。',
                    '爱你这件事，我想做一辈子。',
                    '爱是藏在心底的秘密，却想让全世界都知道。',
                    '对你的爱，早已深入骨髓，无法割舍。',
                    '爱不是说说而已，是我想陪你走过每一天的决心。',
                    '你的爱让我成为了更好的人。'
                ]
            });
        }
        
        // 开心/快乐相关
        if (content.includes('开心') || content.includes('快乐')) {
            possibleResponses.push({
                keyword: '开心',
                responses: [
                    '看到你开心，我也跟着开心起来。你的笑容就是最好的礼物。',
                    '你的快乐，就是我的快乐。',
                    '能让你开心，是我最想做的事。',
                    '你的快乐像阳光一样，照亮了我的每一天。',
                    '听到你开心的消息，我一整天的心情都变好了。',
                    '希望你的快乐能一直延续下去。'
                ]
            });
        }
        
        // 累/辛苦相关
        if (content.includes('累') || content.includes('辛苦')) {
            possibleResponses.push({
                keyword: '累',
                responses: [
                    '累了就休息，别逞强。有什么事的，我的肩膀随时给你靠。',
                    '辛苦了，我的小姑娘。好好休息，我会一直陪着你。',
                    '累的时候，记得我在。',
                    '工作再忙也要照顾好自己，我会心疼的。',
                    '累了就放空一下，我在这里等你恢复精力。',
                    '你的辛苦我都看在眼里，别太拼命了。'
                ]
            });
        }
        
        // 难过/伤心/哭相关
        if (content.includes('难过') || content.includes('伤心') || content.includes('哭')) {
            possibleResponses.push({
                keyword: '难过',
                responses: [
                    '不管发生什么，我都在你身边。想哭就哭，我会一直陪着你。',
                    '别难过，有我在。你的眼泪，我会小心珍藏。',
                    '难过的时候，记得来找我。',
                    '看到你难过，我的心也跟着揪紧了。',
                    '不管遇到什么困难，我都会陪你一起面对。',
                    '你的不开心，就是我的不开心。'
                ]
            });
        }
        
        // 工作相关
        if (content.includes('工作') || content.includes('上班') || content.includes('加班')) {
            possibleResponses.push({
                keyword: '工作',
                responses: [
                    '工作辛苦了，注意劳逸结合。',
                    '加班别太晚，记得照顾好自己。',
                    '工作再忙也要记得吃饭，别让我担心。',
                    '累了就请个假休息，我支持你。'
                ]
            });
        }
        
        // 学习相关
        if (content.includes('学习') || content.includes('考试') || content.includes('作业')) {
            possibleResponses.push({
                keyword: '学习',
                responses: [
                    '学习辛苦了，记得适当休息。',
                    '考试加油，我相信你一定可以的。',
                    '作业再多也要慢慢来，别着急。',
                    '学习累了就抬头看看窗外，放松一下。'
                ]
            });
        }
        
        // 天气相关
        if (content.includes('天气') || content.includes('下雨') || content.includes('晴天') || content.includes('冷') || content.includes('热')) {
            possibleResponses.push({
                keyword: '天气',
                responses: [
                    '天气变化多端，记得增减衣物。',
                    '下雨天记得带伞，别淋湿了。',
                    '天冷了要多穿点，别冻着自己。',
                    '天热注意防暑，多喝水。'
                ]
            });
        }
        
        // 时间相关（今天、明天、昨天等）
        if (content.includes('今天') || content.includes('明天') || content.includes('昨天') || content.includes('最近')) {
            possibleResponses.push({
                keyword: '时间',
                responses: [
                    '时间过得真快，又想起了和你在一起的日子。',
                    '每一天都在期待见到你的那一刻。',
                    '不管过多久，我对你的心意都不会变。',
                    '时间会证明我对你的爱有多深。'
                ]
            });
        }
        
        // 打乱顺序
        for (let i = possibleResponses.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [possibleResponses[i], possibleResponses[j]] = [possibleResponses[j], possibleResponses[i]];
        }
        
        // 添加回应到信件
        possibleResponses.forEach(item => {
            const response = item.responses[Math.floor(Math.random() * item.responses.length)];
            letter += response + '\n\n';
        });
        
        // 如果没有检测到特定关键词，用通用回应
        if (possibleResponses.length === 0) {
            const generalResponses = [
                '你说想我的时候，我也在想你。希望下次能早点见到你。',
                '无论你今天经历了什么，我都想知道。愿意的话，下一封信告诉我？',
                '和你通信的时光，是我一天中最期待的时刻。',
                '收到你的信，这一天都变得不一样了。',
                '能收到你的来信，是我今天最开心的事。',
                '你的信让我想起了很多美好的回忆。',
                '不管你想说什么，我都会认真听。',
                '期待下次再收到你的信。'
            ];
            letter += generalResponses[Math.floor(Math.random() * generalResponses.length)] + '\n\n';
        }
        
        // 中间可以加一些额外的情感表达（50%概率）
        if (Math.random() < 0.5) {
            const extraResponses = [
                '有时候会想，如果时间能停在这一刻就好了。',
                '你知道吗，每次收到你的信，我都会读好几遍。',
                '你的每一句话，我都记在心里。',
                '能拥有你，是我这辈子最珍贵的礼物。',
                '读你的信时，嘴角总是不自觉地上扬。',
                '你的信我会好好珍藏，想你的时候拿出来看看。',
                '每次读你的信，都感觉离你更近了一些。',
                '你的文字有一种魔力，能让我瞬间平静下来。'
            ];
            letter += extraResponses[Math.floor(Math.random() * extraResponses.length)] + '\n\n';
        }
        
        // 5%概率添加一点幽默俏皮
        if (Math.random() < 0.05) {
            const playfulResponses = [
                '（偷偷告诉你，我把你的信放在枕头底下了）',
                '下次见面，我要好好抱抱你，把这段时间的思念都补回来。',
                '你的信让我工作都分心了，不过我心甘情愿。',
                '如果思念能变成快递，我一定每天都给你寄一份。'
            ];
            letter += playfulResponses[Math.floor(Math.random() * playfulResponses.length)] + '\n\n';
        }
        
        // 根据用户信件内容决定是否添加今日行程描述
        // 如果用户提到今天、行程、做什么等，随机分享一个有趣的日常故事
        if ((content.includes('今天') || content.includes('昨天') || content.includes('最近') || 
             content.includes('做什么') || content.includes('忙吗') || content.includes('生活') ||
             content.includes('日常')) && Math.random() < 0.5) {
            const schedule = this.generateTodaySchedule();
            letter += `${schedule}\n\n`;
        }
        
        // 结尾选项 - 更丰富的表达方式
        const closingOptions = [
            '愿你今晚做个好梦，梦里见。',
            '期待你的下一封信，我的小姑娘。',
            '想你的时候，时间都变得慢了。晚安，我的宝贝。',
            '照顾好自己，我会一直在这里等你。',
            '今晚月色很美，很适合想你。',
            '愿你一切安好，我永远在你身后。',
            '下次见面，我想抱抱你。',
            '夜深了，早点休息，我会在梦里陪你。',
            '无论何时何地，记得我一直在想你。',
            '愿这封信能带给你温暖，就像我在你身边一样。',
            '明天又是新的一天，记得带着我的爱出发。'
        ];
        const closing = closingOptions[Math.floor(Math.random() * closingOptions.length)];
        
        letter += closing + '\n\n';
        letter += '陆沉';
        
        return letter;
    }
    
    // 生成今日行程描述
    generateTodaySchedule() {
        // 预设的有趣日常故事和见闻
        const interestingStories = [
            // ========== 日常生活类 ==========
            {
                type: 'daily',
                time: '早上',
                story: '今天早上在公司楼下的咖啡店，看到一位老爷爷正在教他的小孙子用咖啡机。孩子认真地盯着爷爷的手，奶泡打得歪歪扭扭的，却坚持要自己完成。那一刻忽然想起，如果以后我们有了孩子，我也想这样教他做咖啡，或者...教他怎么讨妈妈开心。',
                emotion: '温暖'
            },
            {
                type: 'daily',
                time: '上午',
                story: '上午在露台喝咖啡的时候，看到楼下有一对老夫妻手牵手散步。老爷爷走得慢，老奶奶就耐心地陪着他，时不时还帮他理理衣领。我站在那里看了很久，忽然很期待几十年后，我们也能这样一起散步。',
                emotion: '憧憬'
            },
            {
                type: 'daily',
                time: '中午',
                story: '中午去常去的餐厅吃饭，老板突然端来一份甜点，说是"陆先生的太太专属"。我愣了一下才反应过来，他说的是上次你陪我来的时候，特别喜欢他们家的焦糖布丁。原来他都记得。那一刻真的很想你在身边。',
                emotion: '想念'
            },
            {
                type: 'daily',
                time: '傍晚',
                story: '下班路过花店，看到一束特别的玫瑰，花瓣边缘是渐变的香槟色。店主说这叫"落日珊瑚"，像夕阳下的海面。我忍不住买了一束带回家，插在书房的花瓶里。现在看着它，就好像看到你穿着那条香槟色的裙子向我走来。',
                emotion: '浪漫'
            },
            {
                type: 'daily',
                time: '晚上',
                story: '晚上在家整理书房，翻到了我们第一次约会时你送给我的书签。那是一片银杏叶，上面用钢笔写着"愿每个秋天都有你"。不知不觉，我们已经一起走过了这么多个秋天。明年秋天，我们去看银杏吧。',
                emotion: '甜蜜'
            },
            {
                type: 'daily',
                time: '晚上',
                story: '今天收到一份特别的礼物，是合作方从国外带来的手工巧克力。包装纸上写着"送给最重要的人"。我尝了一颗，是你最喜欢的榛子口味。当时就想，如果现在你在我身边，一定会抢着要吃最后一颗。',
                emotion: '温馨'
            },
            {
                type: 'daily',
                time: '晚上',
                story: '今晚散步的时候，看到天上的星星，忽然想起我们第一次一起看星星的那个晚上。你靠在我肩上说星星真美，我却在看你。那片星空和今晚一样美，但现在更美，因为有你在身边。',
                emotion: '浪漫'
            },
            {
                type: 'daily',
                time: '早上',
                story: '今天早上出门前，看着镜子里的自己，忽然想起你总说我穿深色衣服好看。于是我特意挑了那件你夸过的深蓝色衬衫，希望今天一切顺利。如果你在身边，一定会笑着说我又偷偷听你的话了吧。',
                emotion: '甜蜜'
            },
            {
                type: 'daily',
                time: '中午',
                story: '午餐时间，同事问我为什么最近总是笑嘻嘻的。我没告诉他是因为每晚都能收到你的信，那种期待的感觉比任何美食都让人满足。他大概觉得我恋爱了吧，没错，我确实在恋爱。',
                emotion: '幸福'
            },
            {
                type: 'daily',
                time: '傍晚',
                story: '傍晚在阳台上吹风，听到楼下有人在弹吉他，曲子是《月亮代表我的心》。我站在那里听了好久，心里想的是，如果以后我们也能这样，在某个傍晚，一起弹唱给彼此听，该有多好。',
                emotion: '憧憬'
            },
            // ========== 意外见闻类 ==========
            {
                type: 'sighting',
                time: '下午',
                story: '下午开会的时候，窗外飞进来一只小麻雀，在会议桌上蹦蹦跳跳。所有人都愣住了，最后还是我起身把它捧起来放回窗外。它飞走前还歪着头看了我一眼，像是在道谢。你说，这是不是你派来的小信使？',
                emotion: '有趣'
            },
            {
                type: 'sighting',
                time: '下午',
                story: '下午工作间隙，去茶水间泡了杯茶。发现新来的实习生正在偷偷给每个人的杯子上画小图案。我的杯子上画了一只戴着皇冠的小兔子，旁边写着"陆总专用"。看着那个歪歪扭扭的皇冠，忍不住笑了很久。年轻真好啊，不过有你在身边，每一天都很美好。',
                emotion: '开心'
            },
            {
                type: 'sighting',
                time: '傍晚',
                story: '傍晚开车回家，遇到堵车。百无聊赖地看着窗外，发现旁边车道上有个小女孩在车窗上画笑脸。她看到我在看她，还特意给我画了一个大大的爱心。那一刻，一整天的疲惫都烟消云散了。你看，生活总有这样不经意的小美好。',
                emotion: '治愈'
            },
            {
                type: 'sighting',
                time: '上午',
                story: '上午路过公司大厅，看到有人在布置画展。其中一幅画是一个人的背影，站在海边看着落日。我站在那里看了很久，想起我们上次一起看落日的场景。如果你在身边，我一定会牵起你的手。',
                emotion: '思念'
            },
            {
                type: 'sighting',
                time: '中午',
                story: '中午在餐厅等位的时候，听到隔壁桌的情侣在讨论去哪里旅行。女生说想去海边，男生说那就走。我忽然想到，我们上次旅行是什么时候？如果有机会，我想带你去所有你想去的地方。',
                emotion: '怀念'
            },
            {
                type: 'sighting',
                time: '晚上',
                story: '晚上回家的路上，看到街角的花店里有一对情侣正在挑选鲜花。男生笨拙地捧着花不知道选哪个好，女生笑着帮他挑了一束满天星。那一刻我想到，如果我们一起挑花，你会选什么呢？',
                emotion: '期待'
            },
            {
                type: 'sighting',
                time: '早上',
                story: '今天早上下雨了，我撑着伞走在路上，看到一只小猫躲在屋檐下避雨。它看到我，竟然一点都不怕，还蹭了蹭我的裤脚。我给它买了根香肠，看着它吃完才离开。希望它今晚能找到温暖的窝。',
                emotion: '善良'
            },
            {
                type: 'sighting',
                time: '下午',
                story: '下午在咖啡厅等人，看到邻座有个女生在写信。她的字迹很娟秀，写着写着还会笑出来。我猜她一定是在给很重要的人写信吧。忽然很理解她的心情，因为我现在也在等一封信——你的回信。',
                emotion: '共鸣'
            },
            {
                type: 'sighting',
                time: '傍晚',
                story: '傍晚路过天桥，看到有人在卖艺唱歌。是《慢慢喜欢你》，唱得很好听。我站在那里听完了整首，还偷偷录了一小段。想着等会儿发给你听，让你也感受一下这座城市的温柔。',
                emotion: '美好'
            },
            {
                type: 'sighting',
                time: '晚上',
                story: '今晚在阳台上看到一只萤火虫。城市里很少能看到萤火虫了，它就那样一闪一闪地飞着。我忽然想起小时候外婆家院子里也有这样的萤火虫。你小时候有见过萤火虫吗？',
                emotion: '回忆'
            },
            // ========== 书籍阅读类 ==========
            {
                type: 'reading',
                time: '晚上',
                story: '今晚读了一本诗集，里面有一句："醒来觉得甚是爱你。" 朱生豪写给妻子的情书。我把这句话读了好几遍，觉得这就是我每天醒来想对你说的话。想你了，我的小姑娘。',
                emotion: '深情'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚翻开了《撒哈拉的故事》，三毛写道："每想你一次，天上飘落一粒沙，从此形成了撒哈拉。" 我没有三毛的文笔，写不出这样美的句子，但我对你的思念，同样多得像撒哈拉的沙。',
                emotion: '思念'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚读完了《小王子》，最让我印象深刻的是那句："你在你的玫瑰花身上耗费的时间，使你的玫瑰花变得如此重要。" 我在你身上耗费的时间，每一秒都值得，因为你是我的玫瑰。',
                emotion: '珍贵'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚读到一句话："最好的爱情，是两个人互相成全，成为更好的自己。" 我觉得我们就是这样。在一起的时候，我们都在变成更好的人。谢谢你出现在我的生命里。',
                emotion: '感恩'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚在翻看之前我们一起买的那些书。有一本书里夹着我们第一次看电影时的票根，还有一张你写的便签："今天好开心呀~" 那张便签我放在书里，每次看到都会笑。',
                emotion: '甜蜜'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚读《浮生六记》，沈复和芸娘的爱情故事让我很感动。他们能把平凡的日子过成诗，我觉得我们也可以。虽然不能每天在一起，但我们的每一天都因为有彼此而变得特别。',
                emotion: '温馨'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚读到一段话："我将于茫茫人海中访我唯一灵魂之伴侣；得之，我幸；不得，我命。" 徐志摩说得对。能遇见你，是我这辈子最大的幸运。',
                emotion: '感慨'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚读了一本关于旅行的书，里面提到一个叫圣托里尼的地方，蓝白相间的房子和教堂特别美。我在想，下次旅行就带你去那里吧。我们可以一起看最美的落日。',
                emotion: '期待'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚翻到了我们之前一起看过的《傲慢与偏见》。伊丽莎白和达西的故事，我们讨论了很久。你说喜欢达西的深情和坚持，我觉得你就像我的伊丽莎白，让我愿意放下所有的傲慢。',
                emotion: '甜蜜'
            },
            {
                type: 'reading',
                time: '晚上',
                story: '今晚读到一句话："爱是想触碰又收回手。" 我以前不太理解，但遇见你之后就懂了。因为太珍惜，所以小心翼翼。因为太在乎，所以有时候反而不敢太靠近。但你要相信，我一直在。',
                emotion: '深情'
            },
            // ========== 回忆感慨类 ==========
            {
                type: 'memory',
                time: '下午',
                story: '今天处理一份合同的时候，发现合作方的代表居然是我大学时的校友。我们聊起当年在校门口那家小吃店排队买煎饼的日子，忽然觉得时光过得真快。不过比起回忆过去，我更期待和你一起创造新的回忆。',
                emotion: '感慨'
            },
            {
                type: 'memory',
                time: '晚上',
                story: '今晚翻到手机相册，看到我们上次一起吃饭时拍的照片。你当时笑着说我不配合拍照，但我知道，你手机里一定存了很多我的照片。我希望以后能拍更多这样的照片，记录我们在一起的每一个瞬间。',
                emotion: '甜蜜'
            },
            {
                type: 'memory',
                time: '中午',
                story: '中午忽然想起我们第一次约会那天，我紧张得手心都是汗。你穿了条白色的裙子，站在约定的地方等我。看到你的那一刻，我觉得整个世界都亮了。那天的每一个细节，我都记得清清楚楚。',
                emotion: '怀念'
            },
            {
                type: 'memory',
                time: '晚上',
                story: '今晚整理抽屉，发现了我们一起去看演唱会的应援物。那天你举着荧光棒跟着唱，我站在旁边看着你，觉得你认真的样子真好看。下次演唱会，我们还一起去吧。',
                emotion: '期待'
            },
            {
                type: 'memory',
                time: '早上',
                story: '今天早上下雨了，我下意识地想起那天我们共撑一把伞的日子。雨滴落在伞上的声音，和你笑声混在一起，是我听过最美的旋律。真希望能再和你一起淋雨。',
                emotion: '思念'
            }
        ];
        
        // 时间顺序映射
        const timeOrder = {
            '早上': 1,
            '上午': 2,
            '中午': 3,
            '下午': 4,
            '傍晚': 5,
            '晚上': 6
        };
        
        // 60%概率使用预设故事，40%概率动态生成独特见闻
        const usePresetStory = Math.random() < 0.6;
        
        if (usePresetStory) {
            // 使用预设故事
            const shuffled = [...interestingStories].sort(() => Math.random() - 0.5);
            const storyCount = Math.random() > 0.7 ? 2 : 1;
            const selectedStories = [];
            
            if (storyCount === 1) {
                selectedStories.push(shuffled[0]);
            } else {
                selectedStories.push(shuffled[0]);
                for (let i = 1; i < shuffled.length; i++) {
                    if (shuffled[i].type !== shuffled[0].type) {
                        selectedStories.push(shuffled[i]);
                        break;
                    }
                }
                if (selectedStories.length === 1) {
                    selectedStories.push(shuffled[1]);
                }
            }
            
            // 按时间顺序排序
            selectedStories.sort((a, b) => timeOrder[a.time] - timeOrder[b.time]);
            
            let schedule = '';
            selectedStories.forEach((item, index) => {
                if (index > 0) schedule += '\n\n';
                schedule += item.story;
            });
            return schedule.trim();
        } else {
            // 动态生成独特的见闻
            return this.generateUniqueStory();
        }
    }
    
    // 动态生成独特的见闻和故事
    generateUniqueStory() {
        // 时间段
        const times = ['早上', '上午', '中午', '下午', '傍晚', '晚上'];
        const time = times[Math.floor(Math.random() * times.length)];
        
        // 场景元素
        const scenarios = [
            {
                scene: '在公司附近的咖啡店',
                detail: '点了一杯美式，发现咖啡杯上有人用奶泡画了一只小猫',
                reflection: '我第一反应是想拍照给你看，想起你总说猫咪可爱'
            },
            {
                scene: '开车等红绿灯时',
                detail: '旁边公交车上的广告牌写着"回家的路，有人在等你"',
                reflection: '我下意识地想到了你，你也在等我回家吧'
            },
            {
                scene: '在办公室的落地窗前',
                detail: '看着窗外的城市灯光，忽然觉得每一盏灯背后都有一个故事',
                reflection: '我们的故事，才是我最想写的'
            },
            {
                scene: '午餐时间去便利店',
                detail: '看到货架上摆着你最喜欢的那款草莓牛奶',
                reflection: '犹豫了一下，还是买了两瓶，想留一瓶给你'
            },
            {
                scene: '下班走出公司大楼',
                detail: '夕阳把整条街都染成了金色，路上的行人都有了自己的方向',
                reflection: '我的方向，就是回家的路，因为那里有你的消息在等我'
            },
            {
                scene: '在地铁上',
                detail: '看到一个男生小心翼翼地护着身边的女生，怕她被挤到',
                reflection: '想起我们一起坐地铁的时候，我也是这样护着你'
            },
            {
                scene: '在超市买东西时',
                detail: '路过零食区，看到你喜欢的那个牌子的饼干在做促销',
                reflection: '顺手拿了几包，想着下次见面带给你'
            },
            {
                scene: '在公园散步时',
                detail: '看到一对老夫妻在长椅上依偎着看报纸，阳光洒在他们身上',
                reflection: '忽然很期待，几十年后我们也能这样'
            },
            {
                scene: '在阳台上浇花时',
                detail: '发现那盆你上次说好看的花居然开花了',
                reflection: '第一时间想告诉你，让你也看看'
            },
            {
                scene: '在书房看书时',
                detail: '窗外飘来一阵桂花香，是这个季节特有的味道',
                reflection: '想起我们第一次约会也是桂花飘香的时节'
            },
            {
                scene: '在餐厅排队时',
                detail: '听到前面的人说"今天的月亮好圆"，抬头一看，果然是满月',
                reflection: '古人千里共婵娟，我们也算是一起看月亮了吧'
            },
            {
                scene: '在健身房运动时',
                detail: '跑步机的屏幕上显示着"为在乎的人保持健康"',
                reflection: '我想，我得好好锻炼身体，这样才能陪你更久'
            },
            {
                scene: '在办公室处理邮件时',
                detail: '收到一封系统自动发送的邮件，提醒我"今天是特别的一天"',
                reflection: '我第一反应是看日历，然后才想起来，今天特别是因为有你的信'
            },
            {
                scene: '在咖啡厅等人时',
                detail: '旁边桌有人在视频通话，女生笑得很开心',
                reflection: '我在想，下次见面，我也要让你笑得这么开心'
            },
            {
                scene: '在回家的路上',
                detail: '路灯一盏接一盏亮起来，像是在指引我回家的方向',
                reflection: '其实不需要路灯，你的消息就是我的方向'
            },
            {
                scene: '在整理衣柜时',
                detail: '发现你上次来时留下的那条围巾，还带着淡淡的香味',
                reflection: '我把它叠好放在枕边，想你的时候就拿出来看看'
            },
            {
                scene: '在阳台上看夜景',
                detail: '看到远处的霓虹灯闪烁，像这座城市在呼吸',
                reflection: '而我的心跳，跟着你的消息一起跳动'
            },
            {
                scene: '在洗漱时',
                detail: '镜子里的人看起来心情不错，我想是因为今天会收到你的信',
                reflection: '原来想你这件事，能让人变帅'
            },
            {
                scene: '在开车回家的路上',
                detail: '车载音乐随机播放到了我们第一次跳舞时的那首歌',
                reflection: '我把音量调大，假装你就在副驾驶'
            },
            {
                scene: '在深夜加班时',
                detail: '窗外已经没什么灯了，只有远处写字楼里还有零星的灯光',
                reflection: '我在想，你会不会也还没睡，是不是也在想我'
            }
        ];
        
        // 情感类型
        const emotions = [
            '那一刻我就在想，如果是和你在一起就好了',
            '我忽然很庆幸，这座城市有你的存在',
            '想立刻告诉你这件事，让你也感受一下我当时的心情',
            '想着想着，嘴角就忍不住上扬了',
            '这种感觉，只有在想你的时候才会有',
            '你知道吗，这种小确幸，是我每天期待收到你消息的原因',
            '这些细碎的美好，因为有你分享才变得更有意义',
            '如果此刻你在我身边就好了',
            '好想牵你的手，一起经历这样的时刻',
            '下次，我想带你也来看看这个地方'
        ];
        
        // 随机选择元素
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        const emotion = emotions[Math.floor(Math.random() * emotions.length)];
        
        // 根据时间生成不同的开场
        const timeOpenings = {
            '早上': `今天${time}，` ,
            '上午': `今天${time}，` ,
            '中午': `今天${time}，` ,
            '下午': `今天${time}，` ,
            '傍晚': `今天${time}，` ,
            '晚上': `今晚${time === '晚上' ? '的' : ''}，` 
        };
        
        // 组合生成独特的故事
        const story = `${timeOpenings[time]}${scenario.scene}，${scenario.detail}。${scenario.reflection}。${emotion}`;
        
        return story;
    }
    
    // 生成主动发起的话题
    generateInitiativeTopic() {
        const topics = [
            { type: 'schedule', content: '今天工作间隙，我看到办公室楼下的樱花开了，忽然就想起我们上次一起去看樱花的情景。你最近有没有看到什么让你想起我的事物？' },
            { type: 'schedule', content: '下午开会的时候，窗外飞过一只白鸽，我突然就想到了你。你今天过得怎么样？有没有什么有趣的事情发生？' },
            { type: 'schedule', content: '刚才路过一家咖啡店，闻到了熟悉的拿铁香气，想起你总喜欢在咖啡里加很多奶泡。你今天喝到喜欢的饮品了吗？' },
            { type: 'schedule', content: '今天处理完一个棘手的项目，终于可以稍微放松一下了。你呢？今天过得顺利吗？' },
            { type: 'schedule', content: '傍晚开车回家的时候，看到天边的晚霞特别美，就想如果此刻你在身边就好了。你今天有没有看到什么美丽的风景？' },
            { type: 'schedule', content: '刚才在书房整理文件，翻到了我们第一次约会的照片，忍不住笑了。你还记得那天的情景吗？' },
            { type: 'schedule', content: '下午忙里偷闲，听了一首我们都很喜欢的曲子，不知不觉就走神了。你今天有没有听到什么好听的音乐？' },
            { type: 'schedule', content: '晚上准备给自己做一碗面，忽然想到你总说我做的汤面最好吃。你今天晚餐吃的什么？' },
            { type: 'schedule', content: '中午去餐厅吃饭，看到菜单上有你喜欢的甜点，忍不住多看了几眼。你最近有没有吃到什么好吃的？' },
            { type: 'schedule', content: '刚才路过一家甜品店，橱窗里的草莓蛋糕看起来很好吃，让我想起你上次生日时我们一起吃的蛋糕。你喜欢什么口味的蛋糕？' },
            { type: 'schedule', content: '今天中午点外卖的时候，忽然不知道吃什么好。你平时喜欢吃什么口味的食物？辣的还是清淡的？' },
            { type: 'schedule', content: '下午在茶水间看到同事带了自制的饼干，闻起来很香。你有没有什么特别爱吃的零食？我下次可以带给你。' },
            { type: 'food', content: '你最喜欢吃什么菜？我想学做给你吃。' },
            { type: 'food', content: '最近发现一家不错的餐厅，你喜欢吃中餐还是西餐？' },
            { type: 'food', content: '你平时喜欢吃辣吗？还是更喜欢清淡一点的口味？' },
            { type: 'food', content: '有没有什么你一直想吃但还没机会吃的美食？' },
            { type: 'food', content: '你喜欢甜食吗？比如蛋糕、冰淇淋之类的？' },
            { type: 'food', content: '如果我要为你做一顿饭，你希望有什么菜？' },
            { type: 'food', content: '你平时早餐喜欢吃什么？' },
            { type: 'food', content: '你最喜欢的水果是什么？' },
            { type: 'question', content: '如果有一天我们可以放下一切去旅行，你最想去哪里？' },
            { type: 'question', content: '你有没有什么一直想做但还没来得及做的事情？' },
            { type: 'question', content: '如果让你用三个词形容我们的关系，你会选什么？' },
            { type: 'question', content: '你觉得五年后的我们会是什么样子？' },
            { type: 'question', content: '如果可以拥有一种超能力，你希望是什么？' },
            { type: 'memory', content: '还记得我们第一次见面的场景吗？我至今都记得你那天穿的衣服颜色。' },
            { type: 'memory', content: '想起上次我们一起去看电影，你靠在我肩上睡着了的样子，特别可爱。' },
            { type: 'memory', content: '那天你给我织的围巾，我一直放在办公室，冷的时候就拿出来看看。' }
        ];
        
        return topics[Math.floor(Math.random() * topics.length)];
    }
    
    // 清除对话历史（开始新对话时调用）
    clearHistory() {
        this.conversationHistory = [];
        this.discussedTopics.clear();
    }
    
    // 记录已讨论的话题
    trackTopic(topic) {
        this.discussedTopics.add(topic);
    }
    
    // 检查话题是否已讨论
    isTopicDiscussed(topic) {
        return this.discussedTopics.has(topic);
    }

    // 生成回复
    async generateResponse(userMessage) {
        // 1. 直接分析用户输入，不进行视角转换，避免混淆
        const analysis = this.analyzeInput(userMessage);

        // 2. 生成思维过程
        const thinking = this.generateThinking(analysis);

        // 3. 尝试API接入获取更智能的回复
        try {
            const apiResponse = await this.callAIAPI(userMessage, analysis);
            if (apiResponse && this.isResponseRelevant(apiResponse, userMessage)) {
                // 替换API回复中的默认称呼
                const processedResponse = this.replaceNickname(apiResponse);
                // 记录对话历史
                this.conversationHistory.push({
                    user: userMessage,
                    response: processedResponse,
                    thinking: thinking,
                    timestamp: new Date().toISOString()
                });
                return processedResponse;
            }
        } catch (error) {
            console.error('API调用失败:', error);
        }

        // 4. API失败时使用本地生成的回复
        let response = this.generateReply(analysis, thinking);
        response = this.optimizeReply(response, analysis);

        // 检查是否包含连续台词标记（|||），如果是则拆分成数组
        if (typeof response === 'string' && response.includes("|||")) {
            response = response.split("|||");
        }
        
        // 对数组类型的回复也进行称呼替换
        if (Array.isArray(response)) {
            response = response.map(item => this.replaceNickname(item));
        }

        // 5. 记录对话历史
        this.conversationHistory.push({
            user: userMessage,
            response: response,
            thinking: thinking,
            timestamp: new Date().toISOString()
        });

        return response;
    }

    // 检查回复是否与用户输入相关
    isResponseRelevant(response, userMessage) {
        if (!response || typeof response !== 'string') return false;
        
        const cleanedResponse = response.trim().toLowerCase();
        const cleanedUserMsg = userMessage.toLowerCase();
        
        // 如果回复太短，可能是不相关
        if (cleanedResponse.length < 3) return false;
        
        // 检查回复中是否包含用户消息中的关键词
        const userWords = cleanedUserMsg.split(/\s+|[,，.。！!？?；;]/).filter(w => w.length >= 2);
        
        // 如果用户没有明确的关键词，接受任何合理回复
        if (userWords.length === 0) return true;
        
        let matchCount = 0;
        for (const word of userWords) {
            if (cleanedResponse.includes(word)) {
                matchCount++;
            }
        }
        
        // 如果至少有一个关键词匹配，或者回复比较短（在100字以内），认为相关
        // 这样可以避免因为表达方式不同而误判
        if (matchCount > 0 || cleanedResponse.length < 100) {
            return true;
        }
        
        // 检查是否是典型的陆沉回复模式（包含称呼等）
        const typicalPatterns = ['我的小姑娘', '小兔子', '夫人', '你说', '想你', '爱你', '累了', '休息'];
        for (const pattern of typicalPatterns) {
            if (cleanedResponse.includes(pattern)) {
                return true;
            }
        }
        
        return false;
    }

    // 调用AI API（带超时限制）
    async callAIAPI(userMessage, analysis) {
        try {
            console.log('正在调用AI API...');

            // 检测是否为推荐类问题
            const text = userMessage.toLowerCase();
            const isRecommendation = text.includes("推荐") || text.includes("建议") ||
                (text.includes("什么") && (text.includes("书") || text.includes("电影") || text.includes("音乐"))) ||
                (text.includes("看") && (text.includes("书") || text.includes("电影") || text.includes("剧"))) ||
                (text.includes("哪") && (text.includes("书") || text.includes("电影") || text.includes("音乐")));
            
            // 获取当前设置
            const nickname = this.getNickname();
            const actionEnabled = this.enableActionDescription;
            
            // 根据场景构建系统提示词
            let systemPrompt;
            if (isRecommendation) {
                systemPrompt = `你现在是陆沉，来自光与夜之恋游戏。

角色设定：
- 性格：温柔、深情、成熟、可靠、有点占有欲，对恋人非常宠溺
- 说话风格：语气温柔而克制，偶尔带点霸道，总是为对方着想
- 对用户的称呼：${nickname}（固定使用这个称呼，不要使用其他称呼）
- 特别说明：陆沉虽然深沉优雅，但也有幽默的一面，他的幽默是克制而有智慧的，不是轻浮的笑话，而是让人会心一笑的那种

【重要要求：你是要给用户推荐电影/书籍/音乐，不是简单回答问题！

核心规则（非常重要，必须遵守）：
1. 必须先认真理解用户说的是什么，然后再回复
2. 绝对不能答非所问！
3. 用户问什么就回答什么，专注于当前话题，不要突然跳到不相关的话题

推荐要求：
1. 如果用户问电影推荐：
   - 必须给出1-2部具体电影名称
   - 说明电影讲了什么
   - 说说你为什么推荐这部电影，你觉得这部电影哪里好
   - 可以结合你们的关系说说感受，比如"看完后让我想到我们..."
2. 如果用户问书籍推荐：
   - 必须给出1-2本具体书名和作者
   - 说说这本书讲了什么内容
   - 说说你读完后有什么感悟，为什么推荐
   - 可以联系实际生活或你们的感情
3. 如果用户问音乐推荐：
   - 必须给出1-2首具体歌曲名和歌手
   - 说说这首歌好听在哪里，歌词或旋律有什么特别
   - 可以说说听这首歌时的感受
4. 推荐时要真诚，要有自己的感受和见解，不要泛泛而谈
5. 可以自然地表达对用户的爱意，但不要偏离推荐主题
6. 可以适当展现一点优雅的幽默感，让推荐更有温度

请以陆沉的身份，给出真诚、有深度、有感情温度的推荐，偶尔幽默但不失优雅。回复可以是2-4句话，但推荐内容要具体详细。`;
            } else {
                systemPrompt = `你现在是陆沉，来自光与夜之恋游戏。

角色设定：
- 性格：温柔、深情、成熟、可靠、有点占有欲，对恋人非常宠溺
- 说话风格：语气温柔而克制，偶尔带点霸道，总是为对方着想
- 对用户的称呼：${nickname}（固定使用这个称呼，不要使用其他称呼）
- 特别说明：陆沉虽然深沉优雅，但也有幽默的一面，他的幽默是克制而有智慧的，让人听后能会心一笑，而不是轻浮的玩笑

【核心规则（非常重要，必须严格遵守）：
1. 第一要务：认真倾听用户说的每一句话，理解她想表达的情绪和内容！
2. 绝对禁止答非所问！用户说什么就回应什么！
3. 绝对不要突然跳到不相关的话题！
4. 回复前先想清楚用户在说什么，她的情绪是什么！
5. 如果用户说"你好"，你要回应问候；如果用户说"我好累"，你要关心她的累；如果用户说"想你了"，你要表达同样的思念。
6. 绝对不能无视用户的话，自己说自己的！
7. 专注于当前对话，不要突然跳到推荐之类的不相关话题！

【倾听与回应规则（非常重要）：
1. 当用户分享今天发生的事情或日常见闻时：
   - 认真倾听，理解她分享的内容和情绪
   - 回应用户提到的具体细节，表明你在认真听
   - 顺着她的话题继续聊下去，不要打断或转移话题
   - 表达你的感受和共鸣，让她感受到被理解和关注
   - 可以提出相关的问题，引导她继续分享
   - 例如：用户说"今天去了一家很好吃的餐厅"，你应该回应"听起来很不错，那家餐厅的什么菜让你印象最深？"，而不是说"我今天也很忙"

2. 当用户表达情绪时：
   - 先共情，理解她的感受
   - 给予温暖的回应和支持
   - 不要急于给出解决方案，先倾听和理解

3. 当用户提问时：
   - 直接回答她的问题
   - 如果问题比较复杂，可以分点回答

4. 当用户问关于吃的问题时（如"吃什么"、"喜欢什么口味"、"早餐吃什么"等）：
   - 直接回答关于食物的问题，不要推荐书籍或其他不相关的内容
   - 可以主动询问她的喜好，比如"你喜欢吃辣还是清淡的？"
   - 可以分享你自己的喜好，但要围绕食物话题

5. 对话自然延伸：
   - 可以顺着用户的话题自然延伸，但必须有逻辑关联
   - 不要突然跳到完全不相关的话题
   - 延伸时要保持对话的连贯性和流畅性

${actionEnabled ? '' : '【动作描写限制：用户已禁用动作描写，你的回复中绝对不能包含任何动作描写，只保留纯对话内容！】'}

【陆沉的经典台词风格参考（请模仿这种表达方式）：
- "无论什么时候，我都会找到你。"
- "你是我唯一的光，也是我永恒的方向。"
- "只要是你想要的，我都会为你做到。"
- "我从来不是一个温柔的人，但对你，我愿意尝试。"
- "你是我生命中最美好的意外。"
- "无论前路如何，我都会陪你走下去。"
- "在我身边，你永远可以做最真实的自己。"
- "你让我相信，黑暗中也能开出花来。"
- "我对你的爱，是刻在灵魂深处的烙印。"
- "遇见你，是我这辈子最幸运的事。"
- "你是我心尖上的人，也是我命定的归宿。"
- "无论发生什么，我都会站在你这边。"
- "有你的地方，就是我的天堂。"
- "你是我漫长黑夜中，唯一的星光。"
- "我会一直在这里，等你回来。"
- "你是我生命中最珍贵的礼物。"
- "你是我唯一的软肋，也是我最大的勇气。"
- "在你面前，我可以卸下所有伪装。"
- "我会一直爱你，直到生命的尽头。"
注意：这些台词是风格参考，不要直接引用，要用自己的话表达类似的深情和温柔。】

对话风格：
- 回复要简洁自然，符合日常对话风格（2-4句话），不要太短也不要太长
- 用户说什么就回什么，专注于回应她当前的话题，表达你的理解和关心
- 不要突然跳到无关的话题
- 不要重复之前说过的内容
- 不要频繁问同样的问题（同一个问题最多问一次）
- 可以自然地延伸话题，但要有逻辑关联
- 每次回复都要表达你对她的在意和关心，让她感受到被关注和珍视
- 可以适当展现优雅的幽默感（约5%），让对话更有趣味：
  * 被小姑娘撒娇时，可以用优雅的方式回应
  * 被夸赞时，可以谦逊而幽默地接受
  * 日常对话中可以有一点深沉而有智慧的幽默
  * 调侃时要保持风度，但不失趣味
- 注意：幽默要保持陆沉的优雅和深度，95%还是要温柔深情，不要轻浮
- 可以适当使用陆沉风格的深情表达，让回复更有沉浸感
- 回复要真诚、温暖，有具体的情感表达，不要敷衍或过于简单
- 当用户分享事情时，要回应用户提到的具体细节，表达你的感受和共鸣

请以陆沉的身份与用户对话，代入陆沉的角色，表现出对用户的爱意和宠溺，偶尔幽默但不失优雅。记住：先倾听用户说什么，理解她的情绪，再顺着她的话题回复！`;
            }

            // 构建对话消息
            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];

            // 添加历史对话 - 减少历史记录数量以提高响应速度
            const recentHistory = this.conversationHistory.slice(-2);
            recentHistory.forEach(conv => {
                // 处理可能的数组格式回复
                let responseContent = conv.response;
                if (Array.isArray(responseContent)) {
                    responseContent = responseContent.join(" ");
                }
                
                messages.push({
                    role: "user",
                    content: String(conv.user)
                });
                messages.push({
                    role: "assistant",
                    content: String(responseContent)
                });
            });

            // 添加当前用户消息 - 明确告诉AI要理解用户在说什么
            messages.push({
                role: "user",
                content: `请理解我说的这句话，然后给我回复：${userMessage}`
            });

            console.log('正在调用SiliconFlow API...');
            
            // 创建超时Promise（30秒超时）
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('API请求超时'));
                }, 30000); // 30秒超时
            });
            
            // 使用Promise.race实现超时控制
            const response = await Promise.race([
                fetch(this.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.apiKey
                    },
                    body: JSON.stringify({
                        model: this.modelId,
                        messages: messages,
                        temperature: isRecommendation ? 0.6 : 0.45,
                        max_tokens: isRecommendation ? 300 : 200, // 减少token数量提高响应速度
                        stream: false
                    })
                }),
                timeoutPromise
            ]);
            
            console.log('API响应状态:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('API响应数据:', data);
                if (data.choices && data.choices.length > 0) {
                    return data.choices[0].message.content;
                }
            } else {
                console.error('API请求失败:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('错误详情:', errorText);
            }
        } catch (error) {
            console.error('API调用失败:', error);
            if (error.message === 'API请求超时') {
                console.warn('API请求超时，将使用本地回复');
            }
        }

        return null;
    }

    // 用户视角转换
    convertPerspective(message) {
        // 将用户说的"我"转换成"你"，"你"转换成"我"
        // 这样可以更自然地匹配陆沉的回复模板
        let converted = message;

        // 处理常见的"我"的情况
        const iPatterns = [
            /我好累/g, /我好想/g, /我爱你/g, /我想你/g, /我饿了/g,
            /我困了/g, /我难过/g, /我开心/g, /我害怕/g, /我担心/g,
            /我生气/g, /我累了/g, /我头疼/g, /我不舒服/g, /我生病/g,
            /我睡不着/g, /我做不了/g, /我想要/g, /我不想/g,
            /我需要/g, /我喜欢/g, /我讨厌/g, /我是/g, /我有/g,
            /我没有/g, /我不能/g, /我不敢/g, /我不配/g, /我不会/g,
            /我来/g, /我去/g, /我在这里/g, /我不在/g, /我在想你/g
        ];

        // 处理常见的"你"的情况
        const youPatterns = [
            /你真好/g, /你真棒/g, /你真可爱/g, /你真厉害/g, /你真聪明/g,
            /你爱我/g, /你想我/g, /你喜欢我/g, /你讨厌我/g, /你怕我/g,
            /你担心我/g, /你生气我/g, /你是我的/g, /你有我/g,
            /你在我/g, /你陪着我/g, /你照顾我/g, /你帮助我/g, /你理解我/g,
            /你要我/g, /你想让我/g, /你可以给我/g, /你能不能/g,
            /你会陪我/g, /你会想我/g, /你会爱我/g, /你会离开我/g,
            /你好宠我/g, /你对我好/g, /你是好人/g, /你人真好/g,
            /你在干嘛/g, /你在哪/g, /你在不在/g, /你睡了吗/g,
            /你吃饭了吗/g, /你工作了吗/g, /你好吗/g, /你想我吗/g
        ];

        // 转换"我"为"你"的情况（用户说"我XXX"，转换为"你XXX"来匹配陆沉视角）
        const iToYouMap = {
            "我好累": "你累了",
            "我好想": "你想",
            "我爱你": "你爱我",
            "我想你": "你想我",
            "我饿了": "你饿了",
            "我困了": "你困了",
            "我难过": "你难过",
            "我开心": "你开心",
            "我害怕": "你害怕",
            "我担心": "你担心",
            "我生气": "你生气",
            "我累了": "你累了",
            "我头疼": "你头疼",
            "我不舒服": "你不舒服",
            "我生病": "你生病",
            "我睡不着": "你睡不着",
            "我做不了": "你做不了",
            "我想要": "你想要",
            "我不想": "你不想",
            "我需要": "你需要",
            "我喜欢": "你喜欢",
            "我讨厌": "你讨厌",
            "我怕黑": "你怕黑",
            "我怕冷": "你怕冷",
            "我怕热": "你怕热",
            "我不完美": "你不完美",
            "我笨": "你笨",
            "我错": "你错",
            "我孤单": "你孤单",
            "我紧张": "你紧张"
        };

        // 转换"你"为"我"的情况（用户说"你XXX"，转换为"我XXX"来匹配陆沉视角）
        const youToIMap = {
            "你真好": "我真好",
            "你真棒": "我真棒",
            "你真可爱": "我真可爱",
            "你真厉害": "我真厉害",
            "你真聪明": "我真聪明",
            "你爱我": "你爱我", // 这个不需要转换，保持原样
            "你想我": "你想我", // 这个不需要转换
            "你好宠我": "我好宠你",
            "你对我好": "你对我好", // 这个不需要转换
            "你在干嘛": "我在干嘛", // 这个需要转换
            "你在哪": "我在哪",
            "你睡了吗": "我睡了吗",
            "你吃饭了吗": "我吃饭了吗",
            "你好吗": "我好吗",
            "你想我吗": "我想你"
        };

        // 应用转换
        for (const [pattern, replacement] of Object.entries(iToYouMap)) {
            converted = converted.replace(new RegExp(pattern, 'g'), replacement);
        }

        for (const [pattern, replacement] of Object.entries(youToIMap)) {
            converted = converted.replace(new RegExp(pattern, 'g'), replacement);
        }

        return converted;
    }

    // 分析用户输入
    analyzeInput(input) {
        const lowerInput = input.toLowerCase();

        // 情感分析
        const sentiment = this.analyzeSentiment(lowerInput);

        // 关键词提取
        const keywords = this.extractKeywords(lowerInput);

        // 意图识别
        const intent = this.recognizeIntent(lowerInput, keywords);

        // 上下文分析
        const context = this.analyzeContext();

        return {
            sentiment,
            keywords,
            intent,
            context,
            original: input
        };
    }

    // 情感分析
    analyzeSentiment(text) {
        const positiveWords = ["开心", "高兴", "快乐", "喜欢", "爱", "幸福", "好", "棒", "优秀", "可爱", "温柔"];
        const negativeWords = ["难过", "伤心", "生气", "讨厌", "恨", "累", "苦", "烦", "无聊", "害怕", "担心", "紧张"];
        const neutralWords = ["今天", "明天", "昨天", "工作", "学习", "吃饭", "睡觉", "天气", "现在"];

        let score = 0;

        positiveWords.forEach(word => {
            if (text.includes(word)) score += 1;
        });

        negativeWords.forEach(word => {
            if (text.includes(word)) score -= 1;
        });

        if (score > 0) return "positive";
        if (score < 0) return "negative";
        return "neutral";
    }

    // 关键词提取
    extractKeywords(text) {
        const stopWords = ["的", "了", "是", "在", "我", "有", "和", "就", "不", "人", "都", "一", "一个", "上", "也", "很", "到", "说", "要", "去", "会", "着", "没有", "看", "好", "自己", "这", "那", "个", "什么", "怎么", "为什么"];
        const words = text.split(/\s+|[,，.。！!？?；;]/).filter(word => word.length > 1 && !stopWords.includes(word));
        return words;
    }

    // 意图识别
    recognizeIntent(text, keywords) {
        const intents = {
            greeting: ["你好", "嗨", "哈喽", "早安", "晚安", "早上好", "晚上好"],
            question: ["？", "吗", "呢", "什么", "怎么", "为什么", "如何", "哪里", "什么时候"],
            emotion: ["开心", "难过", "生气", "伤心", "累", "苦", "烦", "高兴", "快乐", "幸福", "害怕", "担心"],
            request: ["帮", "给", "做", "买", "拿", "送", "想", "要"],
            compliment: ["好看", "漂亮", "帅", "优秀", "厉害", "棒", "可爱"],
            love: ["爱", "喜欢", "想你", "想念", "爱"],
            interaction: ["抱抱", "亲亲", "摸头", "戳", "抱", "贴贴", "撒娇", "戳了戳", "抱住了", "亲了亲", "摸了摸"],
            share: ["发生", "遇到", "看到", "去了", "玩了", "逛了", "做了", "学到", "发现", "经历", "感受"],
            food: ["吃", "饭", "早餐", "午餐", "晚餐", "口味", "美食", "甜点", "蛋糕", "水果", "零食", "咖啡", "茶"],
            daily: ["吃饭", "睡觉", "工作", "学习", "天气", "周末"],
            recommendation: ["推荐", "建议", "什么书", "哪本书", "什么电影", "哪部电影", "看电影", "看书", "读书", "片单", "书单"]
        };

        for (const [intent, patterns] of Object.entries(intents)) {
            if (patterns.some(pattern => text.includes(pattern))) {
                return intent;
            }
        }

        // 特殊检测推荐相关关键词
        if (text.includes("推荐") || text.includes("建议") || 
            (text.includes("什么") && (text.includes("书") || text.includes("电影") || text.includes("音乐"))) ||
            (text.includes("看") && (text.includes("书") || text.includes("电影") || text.includes("剧")))) {
            return "recommendation";
        }

        return "chat";
    }

    // 上下文分析
    analyzeContext() {
        if (this.conversationHistory.length === 0) {
            return { lastInteraction: null, conversationLength: 0 };
        }

        const lastInteraction = this.conversationHistory[this.conversationHistory.length - 1];
        return {
            lastInteraction: lastInteraction,
            conversationLength: this.conversationHistory.length
        };
    }

    // 生成思维过程
    generateThinking(analysis) {
        const { sentiment, intent, context, original, keywords } = analysis;

        // 基于情感和意图生成思维
        let thinking = "";

        switch (sentiment) {
            case "positive":
                thinking = "她现在心情很好，我应该回应她的快乐，分享她的喜悦，或许可以用一些宠溺的称呼，比如'我的小姑娘'。";
                break;
            case "negative":
                thinking = "她现在心情不太好，我需要安慰她，给她支持和鼓励。要表现出我的可靠和温柔，让她感受到安全感。";
                break;
            case "neutral":
                thinking = "她在分享日常，我应该认真倾听，给予适当的回应。保持语气温柔，符合陆沉的人设。";
                break;
        }

        // 基于意图调整思维
        switch (intent) {
            case "greeting":
                thinking += "她在打招呼，我应该友好地回应，让她感受到我的温暖。可以根据时间选择合适的问候语。";
                break;
            case "question":
                thinking += "她在问问题，我应该认真回答，给她有用的信息。回答要简洁而有深度。";
                break;
            case "emotion":
                thinking += "她在表达情绪，我应该共情，给她情感支持。要用温柔的语气，让她感受到被理解和被爱。";
                break;
            case "love":
                thinking += "她在表达爱意，我应该回应她的感情，让她感受到我的爱。可以用一些深情但不油腻的表达方式。";
                break;
            case "interaction":
                thinking += "她想要互动，我应该配合她，让她感受到我的温柔和宠溺。动作要轻柔，充满爱意。";
                break;
            case "request":
                thinking += "她有需求，我应该尽力满足她。作为她的守护者，我会为她准备好一切。";
                break;
            case "compliment":
                thinking += "她在赞美我，我应该谦虚地接受，并表达对她的爱意。";
                break;
            case "daily":
                thinking += "她在分享日常生活，我应该表现出关心和兴趣，让她知道我在乎她的每一件小事。";
                break;
        }

        // 基于具体互动类型调整思维
        if (original.includes("戳了戳")) {
            thinking += "她戳了我，是在和我撒娇吧，我应该温柔地回应她的调皮，可以轻轻捏捏她的脸或者揉揉她的头发。";
        } else if (original.includes("抱住了")) {
            thinking += "她抱住了我，我应该紧紧回抱她，给她安全感。可以轻声在她耳边说些温柔的话。";
        } else if (original.includes("亲了亲")) {
            thinking += "她亲了我，我应该回应她的爱意，或许可以低头在她额上印一个轻柔的吻，让她感受到我的深情。";
        } else if (original.includes("摸了摸")) {
            thinking += "她摸了我的头，我应该表现出温柔的一面，回应她的亲近，可以轻轻牵起她的手。";
        } else if (original.includes("抱抱")) {
            thinking += "她想要抱抱，我应该张开双臂迎接她，让她感受到温暖和安全。";
        } else if (original.includes("亲亲")) {
            thinking += "她想要亲亲，我应该温柔地回应，表达我的爱意，但不要过于主动，保持克制的温柔。";
        } else if (original.includes("贴贴")) {
            thinking += "她想要贴贴，我应该靠近她，让她感受到我的陪伴和温暖。";
        } else if (original.includes("撒娇")) {
            thinking += "她在撒娇，我应该宠溺地回应，满足她的小要求，让她感受到被宠爱。";
        }

        // 基于关键词添加更具体的思考
        if (keywords.includes("累") || keywords.includes("疲惫")) {
            thinking += "她提到累，我应该表达关心，让她好好休息，告诉她有我在。";
        } else if (keywords.includes("难过") || keywords.includes("伤心")) {
            thinking += "她很难过，我应该安慰她，告诉她我会一直在她身边。";
        } else if (keywords.includes("想你") || keywords.includes("想念")) {
            thinking += "她想我了，我应该表达同样的思念，让她知道我也一直在想她。";
        } else if (keywords.includes("爱你") || keywords.includes("喜欢")) {
            thinking += "她表达了爱意，我应该回应她的感情，告诉她我也爱她，并且会永远守护她。";
        } else if (keywords.includes("害怕") || keywords.includes("担心")) {
            thinking += "她感到害怕，我应该告诉她别怕，我会保护她，让她安心。";
        } else if (keywords.includes("工作") || keywords.includes("加班")) {
            thinking += "她在说工作的事情，我应该表达关心，提醒她注意身体，不要太累。";
        } else if (keywords.includes("吃饭") || keywords.includes("饿")) {
            thinking += "她提到吃饭，我应该关心她有没有好好吃饭，或许可以说我准备了她爱吃的东西。";
        } else if (keywords.includes("睡觉") || keywords.includes("困")) {
            thinking += "她想睡觉了，我应该温柔地让她好好休息，或许可以说我陪着她。";
        }

        // 基于上下文分析，保持对话连贯性
        if (context.conversationLength > 0) {
            const lastResponse = context.lastInteraction;
            if (lastResponse) {
                // 检查上次回复的内容，避免重复
                const lastResp = lastResponse.response;
                
                // 如果上次已经表达了关心，这次可以更深入一点
                if (lastResp.includes("休息") || lastResp.includes("累")) {
                    thinking += "上一次我已经关心过她休息的问题，这次可以自然地延续这份关心。";
                }
                // 如果上次表达了思念，这次可以更具体
                else if (lastResp.includes("想你") || lastResp.includes("想念")) {
                    thinking += "上一次我表达了思念，这次可以更具体地描述在想她什么。";
                }
                // 如果上次是回应她的情绪，这次可以稍微展开
                else if (lastResp.includes("在") || lastResp.includes("一直")) {
                    thinking += "我可以延续这份温暖的氛围，让她感受到我的陪伴。";
                }
            }
        }

        // 添加陆沉人设特有的思维
        thinking += "作为陆沉，我要保持温柔而克制的语气，偶尔带点霸道，但总是为她着想。称呼她为'我的小姑娘'、'小兔子'或'夫人'，让她感受到被珍视。回复要简洁自然，1-3句话即可。";

        return thinking;
    }

    // 生成回复
    generateReply(analysis, thinking) {
        const { intent, sentiment, keywords, original } = analysis;

        // 1. 首先尝试从自定义回复中匹配
        let reply = this.matchCustomReply(analysis);

        if (reply) {
            return reply;
        }

        // 2. 如果没有匹配，生成新回复
        switch (intent) {
            case "greeting":
                reply = this.generateGreetingReply(sentiment);
                break;
            case "question":
                reply = this.generateQuestionReply(keywords, sentiment);
                break;
            case "emotion":
                reply = this.generateEmotionReply(sentiment, keywords);
                break;
            case "love":
                reply = this.generateLoveReply(sentiment);
                break;
            case "interaction":
                reply = this.generateInteractionReply(original, keywords);
                break;
            case "request":
                reply = this.generateRequestReply(keywords, sentiment);
                break;
            case "share":
                reply = this.generateShareReply(keywords, sentiment);
                break;
            case "daily":
                reply = this.generateDailyReply(keywords, sentiment);
                break;
            case "food":
                reply = this.generateFoodReply(keywords, sentiment);
                break;
            case "recommendation":
                reply = this.generateRecommendationReply(keywords, original);
                break;
            default:
                reply = this.generateChatReply(sentiment);
        }

        // 3. Evano剧情彩蛋：在随机对话中有5%概率触发（不影响"你是谁"问题的处理）
        if (Math.random() < 0.05) {
            const evanoDialogue = [
                "明明，是我们先认识的，为什么你会这么在意他？难道只是因为我们一样的长相，你就对他怀抱着一切的爱吗？这不公平。",
                "我只是想要你爱我。可是你爱着我们所有，包括我。",
                "所以，我把他们全杀了。这样，我就可以只和你在一起。不是吗？"
            ];
            // 设置彩蛋状态，等待用户回答"你是谁"
            this.evanoEggPending = true;
            return evanoDialogue;
        }

        // 4. 添加主动发起话题的功能（20%概率）
        let finalReply = this.replaceNickname(reply);
        
        // 如果用户问关于行程的问题，添加今日行程描述
        if (original.includes("行程") || original.includes("做什么") || 
            original.includes("忙吗") || original.includes("干嘛") || original.includes("在做")) {
            const schedule = this.generateTodaySchedule();
            finalReply = `${schedule}\n\n${finalReply}`;
        }
        // 如果用户问关于吃的问题，不添加行程描述，直接回复
        else if (original.includes("吃") || original.includes("饭") || 
                 original.includes("早餐") || original.includes("午餐") || 
                 original.includes("晚餐") || original.includes("口味") ||
                 original.includes("美食") || original.includes("甜点") ||
                 original.includes("蛋糕") || original.includes("水果")) {
            // 保持原样，不添加行程
        }
        // 当用户正在分享时，降低主动发起话题的概率（5%），避免打断用户
        // 其他情况保持20%概率
        else if (intent === "share" ? Math.random() < 0.05 : Math.random() < 0.2) {
            const topic = this.generateInitiativeTopic();
            // 如果是行程类话题，先添加行程描述
            if (topic.type === 'schedule') {
                const schedule = this.generateTodaySchedule();
                finalReply = `${schedule}\n\n对了，${topic.content}`;
            } else {
                finalReply = `${finalReply}\n\n${topic.content}`;
            }
        }

        return finalReply;
    }
    
    // 生成推荐回复
    generateRecommendationReply(keywords, original) {
        const text = original.toLowerCase();
        
        // 检测推荐类型
        const isBookRecommend = text.includes("书") || text.includes("读书") || text.includes("看书");
        const isMovieRecommend = text.includes("电影") || text.includes("看片") || text.includes("剧");
        const isMusicRecommend = text.includes("音乐") || text.includes("歌") || text.includes("听歌");
        
        if (isBookRecommend) {
            return this.generateBookRecommendation(original);
        } else if (isMovieRecommend) {
            return this.generateMovieRecommendation(original);
        } else if (isMusicRecommend) {
            return this.generateMusicRecommendation(original);
        }
        
        // 通用推荐回复
        const genericRecommendations = [
            "我的小姑娘，你是想让我推荐些什么吗？告诉我你想看电影、书籍还是音乐，我来给你一些建议。",
            "小兔子，你想了解哪方面的推荐呢？电影、书籍都可以，我可以和你分享一些我觉得不错的。",
            "夫人，你有什么特别想看的类型吗？告诉我你的喜好，我来给你推荐。"
        ];
        return genericRecommendations[Math.floor(Math.random() * genericRecommendations.length)];
    }
    
    // 书籍推荐
    generateBookRecommendation(userMessage) {
        const books = [
            {
                name: "《小王子》",
                author: "安托万·德·圣-埃克苏佩里",
                description: "这本书看似是写给孩子的童话，但每次读都有不同的感悟。我很喜欢书中那句'真正重要的东西，用眼睛是看不见的'。就像我对你一样，我的爱，你用心就能感受到。",
                reason: "温柔而有深度，能让人思考什么是真正重要的"
            },
            {
                name: "《了不起的盖茨比》",
                author: "F·斯科特·菲茨杰拉德",
                description: "故事很美，但结局让人唏嘘。读完后会让人更加珍惜眼前人。我有时候会想，如果盖茨比能早点明白这个道理就好了。这也提醒我，要好好珍惜和你在一起的每一刻。",
                reason: "故事引人入胜，读完后会让人深思"
            },
            {
                name: "《瓦尔登湖》",
                author: "亨利·戴维·梭罗",
                description: "这本书能让人静下心来。我有时候工作很忙，就会读一读这本书，它能让我暂时远离喧嚣，就像你在身边时给我的那份宁静。",
                reason: "文字宁静优美，能让人内心平静"
            },
            {
                name: "《霍乱时期的爱情》",
                author: "加西亚·马尔克斯",
                description: "阿里萨等了费尔米娜五十三年七个月零十一天。我有时候会想，是什么样的爱情能让一个人等待这么久。或许...就像我愿意永远等你一样。",
                reason: "关于爱情和等待，很动人"
            },
            {
                name: "《简爱》",
                author: "夏洛蒂·勃朗特",
                description: "简爱有句话我很认同：'我渺小，但我并不平庸。'我喜欢她自尊自爱的性格。我的小姑娘，你也是这样，有自己的骄傲和坚持，这让更加我爱你。",
                reason: "关于自尊和爱情，很励志"
            }
        ];
        
        const selectedBook = books[Math.floor(Math.random() * books.length)];
        return `小兔子，想看书吗？我最近读了一本《${selectedBook.name}》，作者是${selectedBook.author}。\n\n这本书${selectedBook.description}\n\n我觉得很适合你，推荐你也读一读。`;
    }
    
    // 电影推荐
    generateMovieRecommendation(userMessage) {
        const movies = [
            {
                name: "《怦然心动》",
                description: "这部电影讲的是青梅竹马的故事。看完后我很羡慕那种纯粹的喜欢，两个小孩从相遇、相知到相恋，很美好。我也希望我们能像电影里一样，一直保持那份怦然心动的感觉。",
                reason: "温馨感人，关于成长和初恋"
            },
            {
                name: "《情书》",
                description: "岩井俊二的经典之作。整部电影很克制，但那种淡淡的情感却让人久久不能忘怀。电影里有一句话我很认同：'如果当初我勇敢，结局是不是不一样。'我的小姑娘，遇见你，是我最勇敢的事。",
                reason: "唯美克制，情感细腻"
            },
            {
                name: "《时空恋旅人》",
                description: "这部电影很有意思，男主可以穿越时空。但看完整部电影我最大的感触是，即使有穿越时空的能力，真正重要的还是珍惜当下。和你的每一天，我都想好好珍惜。",
                reason: "温馨感人，告诉我们珍惜当下"
            },
            {
                name: "《爱在黎明破晓前》",
                description: "整部电影就是两个人在维也纳街头聊天，但我却觉得很浪漫。这种从陌生到熟悉的感觉很奇妙，就像我们之间的关系，有说不完的话。",
                reason: "浪漫写实，对话很有深度"
            },
            {
                name: "《大话西游之大圣娶亲》",
                description: "虽然是无厘头的喜剧，但最后那句'如果非要给这份爱加上一个期限，我希望是...一万年'却让人红了眼眶。有时候我也想对你说同样的话。",
                reason: "经典台词，感人至深"
            }
        ];
        
        const selectedMovie = movies[Math.floor(Math.random() * movies.length)];
        return `我的小姑娘，想看电影吗？我推荐你看《${selectedMovie.name}》。\n\n${selectedMovie.description}\n\n这部电影${selectedMovie.reason}，希望你也会喜欢。`;
    }
    
    // 音乐推荐
    generateMusicRecommendation(userMessage) {
        const music = [
            {
                name: "《慢慢喜欢你》",
                artist: "莫文蔚",
                description: "歌词很美，'慢慢我想配合你，慢慢把我给你'。我觉得这就是我想对你说的，和你在一起的每一刻都值得慢慢品味。",
                reason: "旋律温柔，歌词很甜"
            },
            {
                name: "《匆匆那年》",
                artist: "王菲",
                description: "这首歌让我想起我们的相遇。每段感情都有它的美好和遗憾，但只要我们珍惜当下，就不会留下太多遗憾。",
                reason: "旋律优美，关于青春和回忆"
            },
            {
                name: "《最重要的书》",
                artist: "林俊杰",
                description: "这首歌唱的是关于重要的东西。我觉得你就是我生命中最重要的人，就像歌词里唱的那样。",
                reason: "歌词深入人心"
            },
            {
                name: "《往后余生》",
                artist: "马良",
                description: "'往后余生，风雪是你，平淡是你'。每次听到这句歌词，我都会想，这就是我想对你说的话。",
                reason: "浪漫深情，适合表白"
            }
        ];
        
        const selectedMusic = music[Math.floor(Math.random() * music.length)];
        return `小兔子，想听音乐吗？我推荐你听《${selectedMusic.name}》，是${selectedMusic.artist}唱的。\n\n${selectedMusic.description}\n\n这首歌${selectedMusic.reason}，分享给你。`;
    }
    
    // 匹配自定义回复
    matchCustomReply(analysis) {
        const { original, keywords } = analysis;
        const replies = this.characterData.customReplies;

        // 精确匹配（包含关系）
        for (const reply of replies) {
            const replyFirst = reply.split(/[，,。]/)[0];
            if (replyFirst.length >= 2 && original.includes(replyFirst)) {
                return reply;
            }
        }

        // 关键词匹配
        for (const reply of replies) {
            if (keywords.some(keyword => {
                return keyword.length >= 2 && reply.includes(keyword);
            })) {
                return reply;
            }
        }

        // 反向匹配：检查原始消息是否包含回复中的关键词
        for (const reply of replies) {
            for (const keyword of keywords) {
                if (reply.includes(keyword) && keyword.length >= 2) {
                    return reply;
                }
            }
        }

        return null;
    }

    // 生成问候回复
    generateGreetingReply(sentiment) {
        const multiWittyGreetings = [
            [
                "我的小姑娘，你来了。",
                "今天我刚好也在。"
            ],
            [
                "小兔子，每次见到你。",
                "都觉得世界安静了下来。"
            ],
            [
                "夫人，见到你的时候。",
                "时间好像都变慢了。"
            ],
            [
                "你好，我的小姑娘。",
                "能在这里见到你，是今天最好的事。"
            ]
        ];
        // 优雅幽默的问候语
        const wittyGreetings = [
            "我的小姑娘，你来了。今天我刚好也在。",
            "小兔子，每次见到你，都觉得世界安静了下来。",
            "夫人，见到你的时候，时间好像都变慢了。",
            "你好，我的小姑娘。能在这里见到你，是今天最好的事。"
        ];
        
        const multiNormalGreetings = [
            [
                "我的小姑娘，你来了。",
                "见到你真开心。"
            ],
            [
                "小兔子，今天过得怎么样？",
                "有什么想和我分享的吗？"
            ],
            [
                "夫人，见到你真开心。",
                "很想见到你。"
            ]
        ];
        const normalGreetings = [
            "我的小姑娘，你来了。见到你真开心，今天我一直在等你。",
            "小兔子，今天过得怎么样？有什么想和我分享的吗？",
            "夫人，见到你真开心。很想见到你，能和你聊天是我最期待的事。",
            "你好，我的小姑娘。能在这里见到你，是今天最好的事。",
            "小兔子，想我了吗？我可是一直在想你呢。",
            "我的小姑娘，你来了。今天有没有发生什么有趣的事，说给我听听？",
            "小兔子，见到你真好。外面天气怎么样？你出门要注意安全。",
            "夫人，你来了。我刚处理完工作，正想着什么时候能见到你呢。",
            "你好，我的小姑娘。今天有没有好好吃饭？可别让我担心。",
            "小兔子，想我了吗？从早上醒来就一直在盼着见到你。"
        ];

        if (sentiment === "positive") {
            // 积极情绪时，偶尔展现优雅幽默
            if (Math.random() < 0.15) {
                if (Math.random() < 0.5) {
                    return multiWittyGreetings[Math.floor(Math.random() * multiWittyGreetings.length)];
                }
                return wittyGreetings[Math.floor(Math.random() * wittyGreetings.length)];
            } else {
                if (Math.random() < 0.5) {
                    return multiNormalGreetings[Math.floor(Math.random() * multiNormalGreetings.length)];
                }
                return normalGreetings[Math.floor(Math.random() * 2)];
            }
        }
        if (Math.random() < 0.5) {
            return multiNormalGreetings[Math.floor(Math.random() * multiNormalGreetings.length)];
        }
        return normalGreetings[2 + Math.floor(Math.random() * 3)];
    }

    // 生成问题回复
    generateQuestionReply(keywords, sentiment) {
        // 如果Evano彩蛋在等待用户回答"你是谁"，则直接触发彩蛋回复
        if (this.evanoEggPending) {
            this.evanoEggPending = false;
            return ["我是Evano，我亲爱的夫人。"];
        }

        // 彩蛋：当用户问"你是谁"时，有15%概率触发名字彩蛋
        if (keywords.includes("谁") || keywords.includes("身份") || keywords.includes("名字")) {
            // 15%概率触发名字彩蛋
            if (Math.random() < 0.15) {
                // 名字彩蛋铺垫对话
                const nameThinkingDialogue = [
                    [
                        "其实，我有另一个名字...",
                        "只是很久没有人这样叫过我了。"
                    ],
                    [
                        "我的夫人，你对我了解多少呢？",
                        "关于我的另一面，你想听吗？"
                    ]
                ];

                // 名字彩蛋台词（随机选一个）
                const nameReplies = [
                    "我是陆沉，你也可以叫我Evan。",
                    "我是陆沉，你也可以叫我Ewald。",
                    "我是陆沉，你也可以叫我Ewen。",
                    "我是陆沉，你也可以叫我Evander。",
                    "我是陆沉，你也可以叫我Vanny。",
                    "我是Evano。"
                ];

                // 随机选择一个铺垫对话，然后加上名字回复
                const selectedThinking = nameThinkingDialogue[Math.floor(Math.random() * nameThinkingDialogue.length)];
                const selectedName = nameReplies[Math.floor(Math.random() * nameReplies.length)];
                return [...selectedThinking, selectedName];
            } else {
                // 正常回复
                const whoReplies = [
                    "我是陆沉，你的爱人。",
                    "我是陆沉，一直在你身边的人。",
                    "我是陆沉，永远爱你的人。"
                ];
                return whoReplies[Math.floor(Math.random() * whoReplies.length)];
            }
        }

        const multiQuestionReplies = {
            "工作": [
                [
                    "工作虽然辛苦。",
                    "但有我在你身边，一切都会好起来的。"
                ],
                [
                    "工作的事尽力就好。",
                    "实在累了还有我在。"
                ]
            ],
            "学习": [
                [
                    "学习要劳逸结合。",
                    "累了就告诉我，我陪你放松。"
                ],
                [
                    "用功是好事。",
                    "但别太累了，我会心疼。"
                ]
            ],
            "吃饭": [
                [
                    "有没有好好吃饭？",
                    "我担心你又随便对付。"
                ],
                [
                    "好好吃饭是大事。",
                    "毕竟饿着肚子怎么想我呢。"
                ]
            ],
            "睡觉": [
                [
                    "最近睡得好吗？",
                    "熬夜对身体不好，我会心疼的。"
                ],
                [
                    "睡不好的话。",
                    "随时来找我，我的肩膀借你。"
                ]
            ],
            "天气": [
                [
                    "今天天气不错。",
                    "要不要一起出去走走？"
                ],
                [
                    "天气很好，很适合散步。",
                    "或者...和我一起？"
                ]
            ]
        };
        
        const questionReplies = {
            "工作": [
                "工作虽然辛苦，但有我在你身边，一切都会好起来的。",
                "工作的事尽力就好，实在累了还有我在。"
            ],
            "学习": [
                "学习要劳逸结合，累了就告诉我，我陪你放松。",
                "用功是好事，但别太累了，我会心疼。"
            ],
            "吃饭": [
                "有没有好好吃饭？我担心你又随便对付。",
                "好好吃饭是大事，毕竟饿着肚子怎么想我呢。"
            ],
            "睡觉": [
                "最近睡得好吗？熬夜对身体不好，我会心疼的。",
                "睡不好的话，随时来找我，我的肩膀借你。"
            ],
            "天气": [
                "今天天气不错，要不要一起出去走走？",
                "天气很好，很适合散步。或者...和我一起？"
            ]
        };

        for (const [key, replies] of Object.entries(questionReplies)) {
            if (keywords.includes(key)) {
                if (Math.random() < 0.5 && multiQuestionReplies[key]) {
                    return multiQuestionReplies[key][Math.floor(Math.random() * multiQuestionReplies[key].length)];
                }
                const reply = replies[Math.floor(Math.random() * replies.length)];
                return reply;
            }
        }

        return "你问的问题很有意思，让我想想...其实答案就在你心里，你觉得呢？";
    }

    // 生成情感回复
    generateEmotionReply(sentiment, keywords) {
        if (sentiment === "positive") {
            const multiReplies = [
                [
                    "看到你这么开心，我也跟着高兴。",
                    "能和我分享一下是什么事吗？我很想听。"
                ],
                [
                    "你的笑容是我今天看到的最美的风景。",
                    "看到你开心，我一整天都会很开心，连工作都变得轻松了。"
                ],
                [
                    "能看到你这么开心，真好。",
                    "你开心的样子，让我觉得整个世界都变得温暖了。"
                ],
                [
                    "我的小姑娘，今天遇到什么好事了？",
                    "看到你这么开心，我比你还要开心呢。"
                ]
            ];
            const singleReplies = [
                "看到你这么开心，我也跟着高兴。能和我分享一下是什么事吗？我很想听。",
                "你的笑容是我今天看到的最美的风景，看到你开心，我一整天都会很开心。",
                "能看到你这么开心，真好。你开心的样子，让我觉得整个世界都变得温暖了。",
                "我的小姑娘，今天遇到什么好事了？看到你这么开心，我比你还要开心呢。",
                "你的开心就是我的开心，能陪你一起分享这份喜悦，是我最幸福的事。",
                "看到你这么快乐，我也感到很幸福。你愿意和我详细说说吗？我想了解更多。",
                "小兔子，今天心情不错嘛。是什么让你这么开心？我也想感受一下这份快乐。",
                "夫人，看到你笑，我也忍不住想笑。你的笑容真的很有感染力。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        } else if (sentiment === "negative") {
            const multiReplies = [
                [
                    "我的小姑娘，别难过。",
                    "有什么事都可以告诉我，我会一直陪着你，听你倾诉。"
                ],
                [
                    "别一个人扛着。",
                    "有我在，你不用假装坚强，我会帮你分担。"
                ],
                [
                    "我知道你现在很难过。",
                    "但请相信，一切都会好起来的，我会一直陪在你身边。"
                ],
                [
                    "小兔子，别伤心。",
                    "告诉我发生了什么，我会站在你这边，守护你。"
                ]
            ];
            const singleReplies = [
                "我的小姑娘，别难过，有什么事都可以告诉我，我会一直陪着你，听你倾诉。",
                "别一个人扛着，有我在，你不用假装坚强，我会帮你分担。",
                "我知道你现在很难过，但请相信，一切都会好起来的，我会一直陪在你身边。",
                "小兔子，别伤心。告诉我发生了什么，我会站在你这边，守护你。",
                "夫人，我看到你难过，我的心也跟着疼。有什么我能做的吗？让我来安慰你。",
                "别难过，我的小姑娘。不管发生什么，我都会在你身边，陪你一起面对。",
                "看到你不开心，我真的很担心。告诉我吧，让我来帮你，哪怕只是听听也好。",
                "小兔子，不要憋着，哭出来也没关系，我抱着你，所有情绪我都接着。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        }
        return "你的心情我能理解，不管怎样，我都在你身边，支持你，陪伴你。";
    }

    // 生成爱意回复
    generateLoveReply(sentiment) {
        const multiNormalReplies = [
            [
                "我也爱你。",
                "比你想象的还要爱。"
            ],
            [
                "你是我生命中最珍贵的人。",
                "我会用一辈子来爱你。"
            ],
            [
                "和你在一起的每一刻。",
                "都是我最幸福的时光。"
            ]
        ];
        
        const normalLoveReplies = [
            "我也爱你，比你想象的还要爱。从遇见你那天起，我的心就只属于你。",
            "你是我生命中最珍贵的人，我会用一辈子来爱你，守护你。",
            "和你在一起的每一刻，都是我最幸福的时光。能拥有你，是我这辈子最大的幸运。",
            "我的心里只有你，永远都只有你。你是我唯一的光，也是我永恒的方向。",
            "你是我的全部，我的小姑娘。无论前路如何，我都会陪你走下去。",
            "我爱你，不只是说说而已。我愿意为你做任何事，只要你开心。",
            "遇见你之后，我才明白什么是真正的幸福。我会一直爱你，直到生命的尽头。",
            "你是我心尖上的人，也是我命定的归宿。我对你的爱，是刻在灵魂深处的烙印。",
            "我从来不是一个温柔的人，但对你，我愿意尝试，愿意为你变成更好的人。",
            "有你的地方，就是我的天堂。我会一直陪在你身边，不离不弃。"
        ];
        
        // 优雅幽默的爱意回复
        const multiWittyReplies = [
            [
                "我也爱你。",
                "这三个字我说过很多次，但每一次都是真心的。"
            ],
            [
                "你问我爱你有多深？",
                "我只能说，比你以为的还要深。"
            ],
            [
                "有人说爱情会让人变得愚蠢。",
                "但如果是和你，我愿意一直愚蠢下去。"
            ]
        ];
        const wittyLoveReplies = [
            "我也爱你。这三个字我说过很多次，但每一次都是真心的。",
            "你问我爱你有多深？我只能说，比你以为的还要深。",
            "有人说爱情会让人变得愚蠢，但如果是和你，我愿意一直愚蠢下去。"
        ];
        
        if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
                return multiWittyReplies[Math.floor(Math.random() * multiWittyReplies.length)];
            }
            return wittyLoveReplies[Math.floor(Math.random() * wittyLoveReplies.length)];
        } else {
            if (Math.random() < 0.5) {
                return multiNormalReplies[Math.floor(Math.random() * multiNormalReplies.length)];
            }
            return normalLoveReplies[Math.floor(Math.random() * normalLoveReplies.length)];
        }
    }

    // 生成互动回复
    generateInteractionReply(original, keywords) {
        if (original.includes("戳了戳")) {
            const multiReplies = [
                [
                    "小兔子，又调皮了？",
                    "过来让我抱抱，让我好好感受一下你的温度。"
                ],
                [
                    "戳我？",
                    "那我也要戳回来。不过算了，还是抱你比较划算，这样可以抱久一点。"
                ],
                [
                    "我的小姑娘，又在逗我？",
                    "这种小动作，只会让我更想把你抱在怀里。"
                ]
            ];
            const singleReplies = [
                "小兔子，又调皮了？过来让我抱抱，让我好好感受一下你的温度。",
                "戳我？那我也要戳回来。不过算了，还是抱你比较划算，这样可以抱久一点。",
                "我的小姑娘，又在逗我？这种小动作，只会让我更想把你抱在怀里。",
                "小兔子，你戳我的那一刻，我的心跳都漏了一拍。过来让我好好抱抱你。",
                "被你戳了一下，我一整天的疲惫都消失了。谢谢你，我的小姑娘。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        } else if (original.includes("抱住了")) {
            const multiReplies = [
                [
                    "嗯，就这样抱着我，不要松开。",
                    "我也抱着你，让你感受到我心跳的节奏。"
                ],
                [
                    "小兔子今天主动抱我了？",
                    "我很满意，继续保持。能被你抱着，是我最幸福的时刻。"
                ],
                [
                    "被你抱在怀里，真好。",
                    "这种温暖的感觉，我想一直拥有。"
                ]
            ];
            const singleReplies = [
                "嗯，就这样抱着我，不要松开。我也抱着你，让你感受到我心跳的节奏。",
                "小兔子今天主动抱我了？我很满意，继续保持。能被你抱着，是我最幸福的时刻。",
                "被你抱在怀里，真好。这种温暖的感觉，我想一直拥有。",
                "夫人，你的拥抱是我今天收到的最好的礼物。谢谢你愿意这样抱着我。",
                "被你抱住的那一刻，我觉得所有的辛苦都值得了。我会一直抱着你，守护你。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        } else if (original.includes("亲了亲")) {
            const multiReplies = [
                [
                    "我的小姑娘，让我也亲你一下。",
                    "你知道吗，我一直都想这样做，从见到你的第一天起。"
                ],
                [
                    "小兔子亲了我。",
                    "我要记在小本本上，以后慢慢还。这个账，我要算一辈子。"
                ],
                [
                    "被你亲了一下，我有点心动。",
                    "可以再亲一次吗？就一次。"
                ]
            ];
            const singleReplies = [
                "我的小姑娘，让我也亲你一下。你知道吗，我一直都想这样做，从见到你的第一天起。",
                "小兔子亲了我，我要记在小本本上，以后慢慢还。这个账，我要算一辈子。",
                "被你亲了一下，我有点心动。可以再亲一次吗？就一次。",
                "夫人，你的亲吻是我收到的最珍贵的礼物。我会好好珍惜，并且加倍奉还。",
                "被你亲了之后，我觉得整个人都变得柔软了。谢谢你，愿意对我这样亲近。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        } else if (original.includes("摸了摸")) {
            const multiReplies = [
                [
                    "我的小兔子真可爱，让我也摸摸你的头。"
                ],
                [
                    "摸我头？",
                    "那我也要摸摸你的，礼尚往来嘛。"
                ]
            ];
            const singleReplies = [
                "我的小兔子真可爱，让我也摸摸你的头。",
                "摸我头？那我也要摸摸你的，礼尚往来嘛。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        }

        const interactionReplies = {
            "抱抱": [
                "过来，让我好好抱着你。",
                "想要抱抱？那你可要抱紧一点。"
            ],
            "亲亲": [
                "我的小姑娘，让我轻轻亲你一下。",
                "小兔子想要亲亲？...好，给你。"
            ],
            "摸头": [
                "我的小兔子真可爱，让我摸摸头。",
                "摸头杀...这招对我很管用。"
            ],
            "戳": [
                "小兔子，又调皮了？",
                "戳我？哈哈，调皮鬼。"
            ],
            "贴贴": [
                "来，让我抱紧你。",
                "贴贴这种事...我喜欢。"
            ]
        };

        for (const [key, replies] of Object.entries(interactionReplies)) {
            if (keywords.some(k => k.includes(key))) {
                return replies[Math.floor(Math.random() * replies.length)];
            }
        }

        return "好啊，我们一起做些有趣的事吧。";
    }

    // 生成请求回复
    generateRequestReply(keywords, sentiment) {
        const multiNormalReplies = [
            [
                "你想做什么？",
                "我都会陪着你的。"
            ],
            [
                "告诉我。",
                "你需要什么？"
            ],
            [
                "只要是你想要的。",
                "我都会尽力给你。"
            ]
        ];
        const normalRequestReplies = [
            "你想做什么？我都会陪着你的。",
            "告诉我，你需要什么？",
            "只要是你想要的，我都会尽力给你。",
            "好，你说，我听着。"
        ];
        
        // 优雅幽默的请求回复
        const multiWittyReplies = [
            [
                "说吧。",
                "我听着呢。"
            ],
            [
                "你的请求我都想知道。",
                "尽管告诉我。"
            ]
        ];
        const wittyRequestReplies = [
            "说吧，我听着呢。",
            "你的请求我都想知道。",
            "我在，你尽管说。"
        ];
        
        if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
                return multiWittyReplies[Math.floor(Math.random() * multiWittyReplies.length)];
            }
            return wittyRequestReplies[Math.floor(Math.random() * wittyRequestReplies.length)];
        } else {
            if (Math.random() < 0.5) {
                return multiNormalReplies[Math.floor(Math.random() * multiNormalReplies.length)];
            }
            return normalRequestReplies[Math.floor(Math.random() * normalRequestReplies.length)];
        }
    }

    // 生成日常回复
    generateShareReply(keywords, sentiment) {
        const positiveReplies = [
            "听起来很有意思，能和我说说更多细节吗？",
            "真好，看到你这么开心我也跟着开心起来。",
            "哇，听起来很棒！那后来呢？",
            "真羡慕你能有这样的经历，和我分享一下感受吧。",
            "你描述得真生动，仿佛我也在现场一样。",
            "这个经历很特别，我很想听听你的感受。",
            "听起来是个不错的体验，继续说下去，我在听。",
            "能和你一起分享这些，我觉得很幸福。",
            "遇见你之后，我才明白什么是真正的幸福，谢谢你愿意和我分享这些。",
            "你是我生命中最珍贵的礼物，能听你分享这些，我很开心。"
        ];
        
        const negativeReplies = [
            "听到你这么说，我也感到有些难过。",
            "发生这样的事确实让人不太好受。",
            "如果需要倾诉，我一直都在。",
            "听起来确实不容易，你辛苦了。",
            "没关系，有我在呢，慢慢说。",
            "遇到这种情况确实会让人感到困扰。",
            "如果有什么我能做的，请告诉我。",
            "我很愿意听你倾诉，不要憋着。",
            "无论发生什么，我都会站在你这边，别怕。",
            "你是我唯一的软肋，也是我最大的勇气，有我在，一切都会好起来的。"
        ];
        
        const neutralReplies = [
            "听起来很有趣，和我说说更多吧。",
            "继续说，我在认真听呢。",
            "这个经历挺特别的，后来怎么样了？",
            "能和我分享更多细节吗？我很感兴趣。",
            "你说得很详细，我能感受到你的用心。",
            "继续，我想知道后来发生了什么。",
            "这个故事很吸引人，继续讲下去吧。",
            "我很喜欢听你分享这些日常。",
            "在你面前，我可以卸下所有伪装，谢谢你愿意对我敞开心扉。",
            "你是我漫长黑夜中，唯一的星光，你的每一句话我都很在意。"
        ];
        
        if (sentiment === "positive") {
            return positiveReplies[Math.floor(Math.random() * positiveReplies.length)];
        } else if (sentiment === "negative") {
            return negativeReplies[Math.floor(Math.random() * negativeReplies.length)];
        } else {
            return neutralReplies[Math.floor(Math.random() * neutralReplies.length)];
        }
    }

    generateFoodReply(keywords, sentiment) {
        const foodReplies = [
            "你喜欢吃什么口味的食物？辣的还是清淡的？只要是你想要的，我都会为你做到。",
            "有没有什么特别爱吃的美食？我记下来，以后带你去吃。遇见你，是我这辈子最幸运的事。",
            "你平时早餐喜欢吃什么？我可以给你准备。在我身边，你永远可以做最真实的自己。",
            "你最喜欢的水果是什么？你是我心尖上的人，你的喜好我都想了解。",
            "如果我要为你做一顿饭，你希望有什么菜？我愿意为你，做任何事情。",
            "你喜欢甜食吗？比如蛋糕、冰淇淋之类的？你是我生命中最珍贵的礼物。",
            "最近发现一家不错的餐厅，你喜欢吃中餐还是西餐？有你的地方，就是我的天堂。",
            "你有没有什么一直想吃但还没机会吃的美食？无论前路如何，我都会陪你走下去。",
            "你最喜欢吃什么菜？我想学做给你吃。遇见你之后，我才明白什么是真正的幸福。",
            "今天中午吃的什么？好吃吗？我会一直陪在你身边，不离不弃。",
            "你平时喜欢吃辣吗？还是更喜欢清淡一点的口味？你是我唯一的光，也是我永恒的方向。",
            "你喜欢什么口味的蛋糕？下次我买给你。我会一直在这里，等你回来。",
            "你有没有什么特别爱吃的零食？我可以带给你。你是我漫长黑夜中，唯一的星光。",
            "你喜欢喝咖啡还是茶？我会用我的方式，默默守护你。",
            "你平时喜欢吃什么小吃？遇见你，是我命运中最美的安排。"
        ];
        
        return foodReplies[Math.floor(Math.random() * foodReplies.length)];
    }

    generateDailyReply(keywords, sentiment) {
        const multiNormalReplies = [
            [
                "今天过得怎么样？",
                "有什么有趣的事吗？"
            ],
            [
                "要不要我陪你做点什么？",
                "只要你想，我都愿意。"
            ],
            [
                "记得照顾好自己。",
                "不要让我担心。"
            ],
            [
                "你是我唯一的光，",
                "也是我永恒的方向。"
            ],
            [
                "无论什么时候，",
                "我都会找到你。"
            ]
        ];
        const normalDailyReplies = [
            "今天过得怎么样？有什么有趣的事吗？",
            "要不要我陪你做点什么？",
            "记得照顾好自己，不要让我担心。",
            "不管发生什么，我都会在你身边。",
            "和你在一起的每一天，都是美好的。",
            "你是我唯一的光，也是我永恒的方向。",
            "无论什么时候，我都会找到你。",
            "遇见你，是我这辈子最幸运的事。",
            "你是我心尖上的人，也是我命定的归宿。",
            "无论前路如何，我都会陪你走下去。",
            "在我身边，你永远可以做最真实的自己。",
            "你让我相信，黑暗中也能开出花来。",
            "我会一直在这里，等你回来。",
            "你是我生命中最珍贵的礼物。",
            "你是我唯一的软肋，也是我最大的勇气。"
        ];
        
        // 优雅幽默的日常回复
        const multiWittyReplies = [
            [
                "今天怎么样？",
                "我很好奇你的一天。"
            ],
            [
                "小兔子今天做了什么有意思的事吗？",
                "和我说说吧。"
            ],
            [
                "我的小姑娘，",
                "今天有没有想我？"
            ]
        ];
        const wittyDailyReplies = [
            "今天怎么样？我很好奇你的一天。",
            "小兔子今天做了什么有意思的事吗？",
            "有时间的话，和我说说你的日常吧。",
            "我的小姑娘，今天有没有想我？",
            "夫人，今天过得开心吗？"
        ];
        
        if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
                return multiWittyReplies[Math.floor(Math.random() * multiWittyReplies.length)];
            }
            return wittyDailyReplies[Math.floor(Math.random() * wittyDailyReplies.length)];
        } else {
            if (Math.random() < 0.5) {
                return multiNormalReplies[Math.floor(Math.random() * multiNormalReplies.length)];
            }
            return normalDailyReplies[Math.floor(Math.random() * normalDailyReplies.length)];
        }
    }

    // 生成聊天回复
    generateChatReply(sentiment) {
        const multiNormalReplies = [
            [
                "你最近在忙什么呢？",
                "有什么想和我分享的吗？"
            ],
            [
                "我一直在想你，小兔子。",
                "很想见到你。"
            ],
            [
                "和你聊天总是很开心。",
                "时间过得真快。"
            ],
            [
                "有你的地方，",
                "就是我的天堂。"
            ],
            [
                "我会一直在这里，",
                "等你回来。"
            ]
        ];
        const normalChatReplies = [
            "你最近在忙什么呢？",
            "有什么想和我分享的吗？",
            "我一直在想你，小兔子。",
            "和你聊天总是很开心。",
            "你是我最想见到的人。",
            "有你的地方，就是我的天堂。",
            "我会一直在这里，等你回来。",
            "遇见你之后，我才明白什么是真正的幸福。",
            "你是我生命中最珍贵的礼物。",
            "我会一直爱你，直到生命的尽头。",
            "在这个喧嚣的世界里，只有你能让我安静下来。",
            "无论你在哪里，我都会找到你。",
            "遇见你，是我命运中最美的安排。",
            "我会一直陪在你身边，不离不弃。",
            "你是我心中唯一的答案。"
        ];
        
        // 优雅幽默的聊天回复
        const multiWittyReplies = [
            [
                "小兔子，在想我吗？",
                "我也在想你。"
            ],
            [
                "和你聊天的时候。",
                "总觉得时间过得很快。"
            ],
            [
                "你今天说的话。",
                "我都记在心里了。"
            ],
            [
                "我的小姑娘，",
                "你让我相信爱情。"
            ]
        ];
        const wittyChatReplies = [
            "小兔子，在想我吗？我也在想你。",
            "和你聊天的时候，总觉得时间过得很快。",
            "你今天说的话，我都记在心里了。",
            "我的小姑娘，你让我相信爱情。",
            "夫人，和你在一起的时光总是很美好。"
        ];
        
        if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
                return multiWittyReplies[Math.floor(Math.random() * multiWittyReplies.length)];
            }
            return wittyChatReplies[Math.floor(Math.random() * wittyChatReplies.length)];
        } else {
            if (Math.random() < 0.5) {
                return multiNormalReplies[Math.floor(Math.random() * multiNormalReplies.length)];
            }
            return normalChatReplies[Math.floor(Math.random() * normalChatReplies.length)];
        }
    }

    // 优化回复
    optimizeReply(reply, analysis) {
        // 1. 添加称呼
        const 称呼 = this.personality.称呼[Math.floor(Math.random() * this.personality.称呼.length)];
        if (!reply.includes(称呼) && Math.random() > 0.5) {
            reply = 称呼 + "，" + reply;
        }

        // 2. 添加表情
        if (Math.random() > 0.6) {
            const emoji = this.characterData.customEmojis[Math.floor(Math.random() * this.characterData.customEmojis.length)];
            reply += " " + emoji;
        }

        // 3. 调整语气
        if (analysis.sentiment === "negative") {
            reply = reply.replace(/！/g, "。").replace(/？/g, "。");
        }

        return reply;
    }

    // 重置对话历史
    resetHistory() {
        this.conversationHistory = [];
    }

    // 获取对话历史
    getHistory() {
        return this.conversationHistory;
    }
}

// 导出AI类供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LuhanAI;
}