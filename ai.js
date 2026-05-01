// AI接入模块
class LuhanAI {
    constructor() {
        this.characterData = characterData;
        this.conversationHistory = [];
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

            // 构建系统提示词
            const systemPrompt = `你现在是陆沉，来自光与夜之恋游戏。
你的性格：温柔、深情、成熟、可靠、有点占有欲，对恋人非常宠溺。
你说话的风格：语气温柔而克制，偶尔带点霸道，总是为对方着想。
你对用户的称呼：我的小姑娘、小兔子、夫人，从中随机选择。
你需要注意：不要说油腻的情话，不要开过度的玩笑，要尊重用户。
你要以陆沉的身份与用户对话，代入陆沉的角色，表现出对用户的爱意和宠溺。
回复要简洁自然，符合日常对话的风格。`;

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

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const fullUrl = proxyUrl + this.apiEndpoint;
            
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.apiKey
                },
                body: JSON.stringify({
                    model: this.modelId,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
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
            console.error('错误类型:', error.name);
            console.error('错误消息:', error.message);
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
            daily: ["吃饭", "睡觉", "工作", "学习", "天气", "今天", "明天", "周末"]
        };

        for (const [intent, patterns] of Object.entries(intents)) {
            if (patterns.some(pattern => text.includes(pattern))) {
                return intent;
            }
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
        const { sentiment, intent, context, original } = analysis;

        // 基于情感和意图生成思维
        let thinking = "";

        switch (sentiment) {
            case "positive":
                thinking = "她现在心情很好，我应该回应她的快乐，分享她的喜悦。";
                break;
            case "negative":
                thinking = "她现在心情不太好，我需要安慰她，给她支持和鼓励。";
                break;
            case "neutral":
                thinking = "她在分享日常，我应该认真倾听，给予适当的回应。";
                break;
        }

        // 基于意图调整思维
        switch (intent) {
            case "greeting":
                thinking += "她在打招呼，我应该友好地回应，让她感受到我的温暖。";
                break;
            case "question":
                thinking += "她在问问题，我应该认真回答，给她有用的信息。";
                break;
            case "emotion":
                thinking += "她在表达情绪，我应该共情，给她情感支持。";
                break;
            case "love":
                thinking += "她在表达爱意，我应该回应她的感情，让她感受到我的爱。";
                break;
            case "interaction":
                thinking += "她想要互动，我应该配合她，让她感受到我的温柔和宠溺。";
                break;
            case "request":
                thinking += "她有需求，我应该尽力满足她。";
                break;
        }

        // 基于具体互动类型调整思维
        if (original.includes("戳了戳")) {
            thinking += "她戳了我，是在和我撒娇吧，我应该温柔地回应她的调皮。";
        } else if (original.includes("抱住了")) {
            thinking += "她抱住了我，我应该紧紧回抱她，给她安全感。";
        } else if (original.includes("亲了亲")) {
            thinking += "她亲了我，我应该回应她的爱意，让她感受到我的深情。";
        } else if (original.includes("摸了摸")) {
            thinking += "她摸了我的头，我应该表现出温柔的一面，回应她的亲近。";
        }

        // 基于上下文调整
        if (context.conversationLength > 3) {
            thinking += "我们已经聊了一会儿了，我应该更深入地了解她的想法。";
        }

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
            default:
                reply = this.generateChatReply(sentiment);
        }

        return reply;
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
        const greetings = [
            "我的小姑娘，你来了。",
            "小兔子，今天过得怎么样？",
            "夫人，见到你真开心。",
            "你好，我的小姑娘。",
            "小兔子，想我了吗？"
        ];

        if (sentiment === "positive") {
            return greetings[Math.floor(Math.random() * 2)];
        }
        return greetings[2 + Math.floor(Math.random() * 3)];
    }

    // 生成问题回复
    generateQuestionReply(keywords, sentiment) {
        const questionReplies = {
            "工作": "工作虽然辛苦，但有我在你身边，一切都会好起来的。",
            "学习": "学习要劳逸结合，累了就告诉我，我陪你放松。",
            "吃饭": "有没有好好吃饭？我担心你又随便对付。",
            "睡觉": "最近睡得好吗？熬夜对身体不好，我会心疼的。",
            "天气": "今天天气不错，要不要一起出去走走？"
        };

        for (const [key, reply] of Object.entries(questionReplies)) {
            if (keywords.includes(key)) {
                return reply;
            }
        }

        return "你问的问题很有意思，让我想想...其实答案就在你心里，你觉得呢？";
    }

    // 生成情感回复
    generateEmotionReply(sentiment, keywords) {
        if (sentiment === "positive") {
            return "看到你这么开心，我也跟着高兴。能和我分享一下是什么事吗？";
        } else if (sentiment === "negative") {
            return "我的小姑娘，别难过，有什么事都可以告诉我，我会一直陪着你。";
        }
        return "你的心情我能理解，不管怎样，我都在你身边。";
    }

    // 生成爱意回复
    generateLoveReply(sentiment) {
        const loveReplies = [
            "我也爱你，比你想象的还要爱。",
            "你是我生命中最珍贵的人，我会用一辈子来爱你。",
            "和你在一起的每一刻，都是我最幸福的时光。",
            "我的心里只有你，永远都只有你。",
            "你是我的全部，我的小姑娘。"
        ];
        return loveReplies[Math.floor(Math.random() * loveReplies.length)];
    }

    // 生成互动回复
    generateInteractionReply(original, keywords) {
        if (original.includes("戳了戳")) {
            return "小兔子，又调皮了？过来让我抱抱。";
        } else if (original.includes("抱住了")) {
            return "嗯，就这样抱着我，不要松开。我也抱着你。";
        } else if (original.includes("亲了亲")) {
            return "我的小姑娘，让我也亲你一下。你知道吗，我一直都想这样做。";
        } else if (original.includes("摸了摸")) {
            return "我的小兔子真可爱，让我也摸摸你的头。";
        }

        const interactionReplies = {
            "抱抱": "过来，让我好好抱着你。",
            "亲亲": "我的小姑娘，让我轻轻亲你一下。",
            "摸头": "我的小兔子真可爱，让我摸摸头。",
            "戳": "小兔子，又调皮了？",
            "贴贴": "来，让我抱紧你。"
        };

        for (const [key, reply] of Object.entries(interactionReplies)) {
            if (keywords.some(k => k.includes(key))) {
                return reply;
            }
        }

        return "好啊，我们一起做些有趣的事吧。";
    }

    // 生成请求回复
    generateRequestReply(keywords, sentiment) {
        const requestReplies = [
            "你想做什么？我都会陪着你的。",
            "告诉我，你需要什么？",
            "只要是你想要的，我都会尽力给你。",
            "好，你说，我听着。"
        ];
        return requestReplies[Math.floor(Math.random() * requestReplies.length)];
    }

    // 生成日常回复
    generateDailyReply(keywords, sentiment) {
        const dailyReplies = [
            "今天过得怎么样？有什么有趣的事吗？",
            "要不要我陪你做点什么？",
            "记得照顾好自己，不要让我担心。",
            "不管发生什么，我都会在你身边。",
            "和你在一起的每一天，都是美好的。"
        ];
        return dailyReplies[Math.floor(Math.random() * dailyReplies.length)];
    }

    // 生成聊天回复
    generateChatReply(sentiment) {
        const chatReplies = [
            "你最近在忙什么呢？",
            "有什么想和我分享的吗？",
            "我一直在想你，小兔子。",
            "和你聊天总是很开心。",
            "你是我最想见到的人。"
        ];
        return chatReplies[Math.floor(Math.random() * chatReplies.length)];
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