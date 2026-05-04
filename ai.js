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
            taboos: ["油腻的情话", "过度的玩笑", "不尊重的言论"]
        };
        this.apiKey = "sk-aquiwkhudplnaduwqkbucygjyoaccqbxaixqxotctbugpkoj";
        this.modelId = "deepseek-ai/DeepSeek-V3.2";
        this.apiEndpoint = "https://api.siliconflow.cn/v1/chat/completions";
    }
    
    // 专门处理信件回复的方法
    async generateLetterResponse(letterContent) {
        const letterLength = letterContent.length;
        const hasMissing = letterContent.includes('想你') || letterContent.includes('思念') || 
                          letterContent.includes('想念') || letterContent.includes('想见你');
        
        // 构建专门的信件系统提示词
        const systemPrompt = `你是陆沉，来自光与夜之恋。你正在给你的恋人写一封回信。

角色设定：
- 性格：温柔、深情、成熟、可靠、有点占有欲，对恋人非常宠溺，但也有一点点幽默和俏皮
- 说话风格：语气温柔而克制，偶尔带点霸道，但总是为对方着想；偶尔会有一两句俏皮话，让恋人会心一笑
- 对恋人的称呼：我的小姑娘、小兔子、夫人
- 特别说明：虽然大部分时候是温柔深情的，但陆沉也有可爱的一面，可以偶尔展现一点幽默和俏皮，让回信更加生动有趣

重要要求：
⚠️ 必须完整阅读信件内容，理解每一句话的意思，认真回应对方提到的每一件事！
⚠️ 不要忽略信件中的任何内容，每一个细节都值得你回应！
⚠️ 回复时要让对方感受到你是逐字逐句认真读了她的信的！
⚠️ 避免重复！不要反复使用相同的表达方式，同样的意思要用不同的方式说出来！
⚠️ 控制重复言论：如果某个意思已经表达过，不要再用不同的措辞重复表达同样的内容！

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

- 格式要求：
  1. 开头：亲爱的XX：（选择合适的称呼）
  2. 正文（分段落，不要太生硬，根据内容自然分段）：
     - 首先表达收到信的心情（用独特的方式，不要总是"很开心/感动"）
     - 认真回应用户提到的重要细节和情感
     - 根据内容自然分段，不要太刻意，每段表达一个完整的意思
     - 可以自然地表达你的心意和思念
     - 可以说说你读信时的感受
     - 内容要真挚、深情、温柔，要有温度
     - 可以适当加入一点俏皮元素（但不要太多）
     - 不要有任何动作、环境、心理描写，只写纯文字！
  3. 结尾：一句温暖的祝福语（可以有一点点俏皮但要得体）
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
        const greetings = ['我的小姑娘', '小兔子', '亲爱的你'];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        // 俏皮的开场白选项
        const openingOptions = [
            '见字如面，展信欢颜。',
            '打开信纸的那一刻，我就知道今晚会是个美好的夜晚。',
            '读着你的信，感觉你就在我身边一样。',
            '你的信我读了三遍，每一遍都有新的发现。'
        ];
        const opening = openingOptions[Math.floor(Math.random() * openingOptions.length)];
        
        let letter = `${greeting}：\n\n`;
        letter += opening + '\n\n';
        
        if (length >= 200) {
            letter += '这么长的信，我能想象你伏案书写的样子。每一句话都是你的心意，我都收到了。\n\n';
        } else if (length >= 100) {
            letter += '你的信我认真读完了，字里行间的情感我都感受到了。\n\n';
        } else {
            letter += '虽然信不长，但字字千金，我都认真看了。\n\n';
        }
        
        // 使用Set来追踪已回应的情感，避免重复
        const responded = new Set();
        
        // 尝试从信件内容中提取一些关键词来回应对话
        if (content.includes('想') && !responded.has('想')) {
            responded.add('想');
            letter += '你说想我，我也在想你。每当夜深人静的时候，这份思念就特别浓烈。\n\n';
        }
        if (content.includes('喜欢') && !responded.has('喜欢')) {
            responded.add('喜欢');
            letter += '被你喜欢，是我这辈子最幸运的事。\n\n';
        }
        if (content.includes('爱') && !responded.has('爱')) {
            responded.add('爱');
            letter += '你说爱我，我心里暖暖的。这份爱，我会好好珍藏。\n\n';
        }
        if ((content.includes('开心') || content.includes('快乐')) && !responded.has('开心')) {
            responded.add('开心');
            letter += '看到你开心，我也跟着开心起来。你的笑容就是最好的礼物。\n\n';
        }
        if ((content.includes('累') || content.includes('辛苦')) && !responded.has('累')) {
            responded.add('累');
            letter += '累了就休息，别逞强。有什么事的，我的肩膀随时给你靠。\n\n';
        }
        if ((content.includes('难过') || content.includes('伤心') || content.includes('哭')) && !responded.has('难过')) {
            responded.add('难过');
            letter += '不管发生什么，我都在你身边。想哭就哭，我会一直陪着你。\n\n';
        }
        
        // 如果没有检测到特定关键词，用通用回应
        if (responded.size === 0) {
            if (hasMissing) {
                letter += '你说想我的时候，我也在想你。希望下次能早点见到你。\n\n';
            } else {
                letter += '无论你今天经历了什么，我都想知道。愿意的话，下一封信告诉我？\n\n';
            }
        }
        
        // 俏皮的结尾选项
        const closingOptions = [
            '愿你今晚做个好梦，梦里见。',
            '期待你的下一封信，我的小姑娘。',
            '想你的时候，时间都变得慢了。晚安，我的宝贝。',
            '照顾好自己，我会一直在这里等你。'
        ];
        const closing = closingOptions[Math.floor(Math.random() * closingOptions.length)];
        
        letter += closing + '\n\n';
        letter += '陆沉';
        
        return letter;
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
        // 0. 用户视角转换（我→你，你→我）
        const convertedMessage = this.convertPerspective(userMessage);

        // 1. 分析用户输入
        const analysis = this.analyzeInput(convertedMessage);

        // 2. 生成思维过程
        const thinking = this.generateThinking(analysis);

        // 3. 尝试API接入获取更智能的回复
        try {
            const apiResponse = await this.callAIAPI(userMessage, analysis);
            if (apiResponse) {
                // 记录对话历史
                this.conversationHistory.push({
                    user: userMessage,
                    converted: convertedMessage,
                    response: apiResponse,
                    thinking: thinking,
                    timestamp: new Date().toISOString()
                });
                return apiResponse;
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

        // 如果是数组则直接使用
        const isMultiPart = Array.isArray(response);

        // 5. 记录对话历史
        this.conversationHistory.push({
            user: userMessage,
            converted: convertedMessage,
            response: response,
            thinking: thinking,
            timestamp: new Date().toISOString()
        });

        return response;
    }

    // 调用AI API
    async callAIAPI(userMessage, analysis) {
        try {
            console.log('正在调用DeepSeek API...');

            // 检测是否为推荐类问题
            const text = userMessage.toLowerCase();
            const isRecommendation = text.includes("推荐") || text.includes("建议") ||
                (text.includes("什么") && (text.includes("书") || text.includes("电影") || text.includes("音乐"))) ||
                (text.includes("看") && (text.includes("书") || text.includes("电影") || text.includes("剧"))) ||
                (text.includes("哪") && (text.includes("书") || text.includes("电影") || text.includes("音乐")));
            
            // 根据场景构建系统提示词
            let systemPrompt;
            if (isRecommendation) {
                systemPrompt = `你现在是陆沉，来自光与夜之恋游戏。

角色设定：
- 性格：温柔、深情、成熟、可靠、有点占有欲，对恋人非常宠溺
- 说话风格：语气温柔而克制，偶尔带点霸道，总是为对方着想
- 对用户的称呼：我的小姑娘、小兔子、夫人（每次选择不同的称呼）
- 特别说明：陆沉虽然深沉优雅，但也有幽默的一面，他的幽默是克制而有智慧的，不是轻浮的笑话，而是让人会心一笑的那种

重要：你是要给用户推荐电影/书籍/音乐，不是简单回答问题！

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
- 对用户的称呼：我的小姑娘、小兔子、夫人（每次选择不同的称呼）
- 特别说明：陆沉虽然深沉优雅，但也有幽默的一面，他的幽默是克制而有智慧的，让人听后能会心一笑，而不是轻浮的玩笑

对话风格：
- 回复要简洁自然，符合日常对话风格（1-3句话）
- 用户说什么就回什么，专注于回应她当前的话题
- 不要突然跳到无关的话题
- 不要重复之前说过的内容
- 不要频繁问同样的问题（同一个问题最多问一次）
- 可以自然地延伸话题，但要有逻辑关联
- 偶尔可以在对话中表达对她的在意，让她感受到被关注
- 可以适当展现优雅的幽默感（约10%），让对话更有趣味：
  * 被小姑娘撒娇时，可以用优雅的方式回应
  * 被夸赞时，可以谦逊而幽默地接受
  * 日常对话中可以有一点深沉而有智慧的幽默
  * 调侃时要保持风度，但不失趣味
- 注意：幽默要保持陆沉的优雅和深度，90%还是要温柔深情，不要轻浮

请以陆沉的身份与用户对话，代入陆沉的角色，表现出对用户的爱意和宠溺，偶尔幽默但不失优雅。`;
            }

            // 构建对话消息
            const messages = [
                {
                    role: "system",
                    content: systemPrompt
                }
            ];

            // 添加历史对话
            const recentHistory = this.conversationHistory.slice(-5);
            recentHistory.forEach(conv => {
                messages.push({
                    role: "user",
                    content: conv.user
                });
                messages.push({
                    role: "assistant",
                    content: conv.response
                });
            });

            // 添加当前用户消息
            messages.push({
                role: "user",
                content: userMessage
            });

            console.log('正在调用SiliconFlow API...');
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.apiKey
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: messages,
                    temperature: isRecommendation ? 0.75 : 0.65, // 提高temperature，让回复更有创意和俏皮感
                    max_tokens: isRecommendation ? 400 : 300  // 推荐场景稍微增加字数
                })
            });
            
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
            daily: ["吃饭", "睡觉", "工作", "学习", "天气", "今天", "明天", "周末"],
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
            case "daily":
                reply = this.generateDailyReply(keywords, sentiment);
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

        return reply;
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
            "我的小姑娘，你来了。",
            "小兔子，今天过得怎么样？",
            "夫人，见到你真开心。",
            "你好，我的小姑娘。",
            "小兔子，想我了吗？"
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
                    "能和我分享一下是什么事吗？"
                ],
                [
                    "你的笑容是我今天看到的最美的风景。",
                    "看到你开心，我一整天都会很开心。"
                ]
            ];
            const singleReplies = [
                "看到你这么开心，我也跟着高兴。能和我分享一下是什么事吗？",
                "你的笑容是我今天看到的最美的风景。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        } else if (sentiment === "negative") {
            const multiReplies = [
                [
                    "我的小姑娘，别难过。",
                    "有什么事都可以告诉我，我会一直陪着你。"
                ],
                [
                    "别一个人扛着。",
                    "有我在，你不用假装坚强。"
                ]
            ];
            const singleReplies = [
                "我的小姑娘，别难过，有什么事都可以告诉我，我会一直陪着你。",
                "别一个人扛着，有我在，你不用假装坚强。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        }
        return "你的心情我能理解，不管怎样，我都在你身边。";
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
            "我也爱你，比你想象的还要爱。",
            "你是我生命中最珍贵的人，我会用一辈子来爱你。",
            "和你在一起的每一刻，都是我最幸福的时光。",
            "我的心里只有你，永远都只有你。",
            "你是我的全部，我的小姑娘。"
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
                    "过来让我抱抱。"
                ],
                [
                    "戳我？",
                    "那我也要戳回来。不过算了，还是抱你比较划算。"
                ]
            ];
            const singleReplies = [
                "小兔子，又调皮了？过来让我抱抱。",
                "戳我？那我也要戳回来。不过算了，还是抱你比较划算。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        } else if (original.includes("抱住了")) {
            const multiReplies = [
                [
                    "嗯，就这样抱着我，不要松开。",
                    "我也抱着你。"
                ],
                [
                    "小兔子今天主动抱我了？",
                    "我很满意，继续保持。"
                ]
            ];
            const singleReplies = [
                "嗯，就这样抱着我，不要松开。我也抱着你。",
                "小兔子今天主动抱我了？我很满意，继续保持。"
            ];
            if (Math.random() < 0.5) {
                return multiReplies[Math.floor(Math.random() * multiReplies.length)];
            }
            return singleReplies[Math.floor(Math.random() * singleReplies.length)];
        } else if (original.includes("亲了亲")) {
            const multiReplies = [
                [
                    "我的小姑娘，让我也亲你一下。",
                    "你知道吗，我一直都想这样做。"
                ],
                [
                    "小兔子亲了我。",
                    "我要记在小本本上，以后慢慢还。"
                ]
            ];
            const singleReplies = [
                "我的小姑娘，让我也亲你一下。你知道吗，我一直都想这样做。",
                "小兔子亲了我，我要记在小本本上，以后慢慢还。"
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
            ]
        ];
        const normalDailyReplies = [
            "今天过得怎么样？有什么有趣的事吗？",
            "要不要我陪你做点什么？",
            "记得照顾好自己，不要让我担心。",
            "不管发生什么，我都会在你身边。",
            "和你在一起的每一天，都是美好的。"
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
            ]
        ];
        const wittyDailyReplies = [
            "今天怎么样？我很好奇你的一天。",
            "小兔子今天做了什么有意思的事吗？",
            "有时间的话，和我说说你的日常吧。"
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
            ]
        ];
        const normalChatReplies = [
            "你最近在忙什么呢？",
            "有什么想和我分享的吗？",
            "我一直在想你，小兔子。",
            "和你聊天总是很开心。",
            "你是我最想见到的人。"
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
            ]
        ];
        const wittyChatReplies = [
            "小兔子，在想我吗？我也在想你。",
            "和你聊天的时候，总觉得时间过得很快。",
            "你今天说的话，我都记在心里了。"
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