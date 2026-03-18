document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const titleInput = document.getElementById('newsletter-title');
    const issueInput = document.getElementById('newsletter-issue');
    const dateInput = document.getElementById('newsletter-date');
    const publisherInput = document.getElementById('newsletter-publisher');
    const eventsInput = document.getElementById('memo-events');
    const goodInput = document.getElementById('memo-good');
    const messageInput = document.getElementById('memo-message');
    const notesInput = document.getElementById('memo-notes');
    
    const generatePromptBtn = document.getElementById('generate-prompt-btn');
    const aiResultText = document.getElementById('ai-result-text');
    const photoUpload = document.getElementById('photo-upload');
    const previewPdfBtn = document.getElementById('preview-pdf-btn');
    
    const previewTitle = document.getElementById('preview-title');
    const previewDate = document.getElementById('preview-date');
    const previewIssue = document.getElementById('preview-issue');
    const previewPublisher = document.getElementById('preview-publisher');
    
    // New newspaper elements
    const previewMainHeadline = document.getElementById('preview-main-headline');
    const previewSubHeadline = document.getElementById('preview-sub-headline');
    const previewBodyContainer = document.getElementById('preview-body-container');
    const previewBodyText = document.getElementById('preview-body-text');
    const previewNotes = document.getElementById('preview-notes');
    const previewPhotos = document.getElementById('preview-photos');
    const seasonIcon = document.getElementById('season-icon');
    
    const checklistModal = document.getElementById('checklist-modal');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const confirmPrintBtn = document.getElementById('confirm-print-btn');
    const checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');

    // State for generated AI Image URL
    let currentAiImageUrl = null;

    // Initialize Date
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];

    // Format Date for Japanese view
    const formatDateJP = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    };
    previewDate.textContent = formatDateJP(dateInput.value);

    // Get a daily icon based on the exact date
    const getDailyIcon = (dateStr) => {
        if (!dateStr) return '🏫';
        const d = new Date(dateStr);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        
        // 月ごとの季節アイコン候補（複数）
        const iconsByMonth = {
            1: ['🎍', '🌅', '🪁', '⛄', '❄️', '🍊'], // 1月: 冬・お正月
            2: ['👹', '🍫', '⛄', '🏂', '🎿', '🧤'], // 2月: 冬・節分など
            3: ['🌸', '🎎', '🍡', '🎓', '🐾', '🌱'], // 3月: 春・卒業など
            4: ['🌷', '🎒', '🌸', '🐝', '🏫', '🌈'], // 4月: 春・入学など
            5: ['🎏', '🌿', '🍓', '🎾', '🏕️', '🍃'], // 5月: 新緑・こどもの日など
            6: ['☔', '🐌', '🐸', '🌈', '💧', '🌂'], // 6月: 梅雨
            7: ['🎋', '🍉', '🍧', '🎆', '🎣', '🌻'], // 7月: 夏・七夕など
            8: ['🌻', '🎇', '🍧', '🏖️', '🌽', '☀️'], // 8月: 真夏
            9: ['🎑', '🌾', '🐇', '🍠', '🍇', '🍂'], // 9月: 秋・お月見など
            10: ['🎃', '👻', '🍁', '🌰', '🍎', '🍄'], // 10月: 秋・ハロウィンなど
            11: ['🍁', '🍂', '🍄', '🐿️', '🍠', '🦉'], // 11月: 晩秋
            12: ['🎄', '🎅', '🎁', '⛄', '🔔', '❄️']  // 12月: 冬・クリスマスなど
        };
        
        const icons = iconsByMonth[month] || ['🏫', '✨', '🌟', '📝', '📚', '🌈'];
        // 日付を配列長で割って毎日違うインデックスを取得
        return icons[day % icons.length];
    };

    const autoFitContent = () => {
        const isLayout0 = previewPhotos.classList.contains('layout-0');
        previewBodyContainer.style.fontSize = isLayout0 ? '14.5pt' : '11.5pt';
        previewBodyContainer.style.lineHeight = '2';
        
        // Wait for DOM to render to accurately calculate scrollHeight
        requestAnimationFrame(() => {
            const container = previewBodyContainer;
            let fontSize = isLayout0 ? 14.5 : 11.5; // Initial font size in pt for vertical layout
            
            // 縦書きの場合、コンテナの高さを超えたかは scrollWidth や scrollHeight で判定するが、
            // column-countを用いて表示しているため、幅方向(scrollWidth)にはみ出していく特性がある
            // そのため、scrollWidth が clientWidth を超えたらフォントサイズを下げる
            // または scrollHeight が container.clientHeight を超えたら下げる
            
            container.style.fontSize = fontSize + 'pt';

            const checkFit = () => {
                // column-countを使っている縦書きの場合、高さは固定されているが幅がscrollWidthとして伸びていく
                if ((container.scrollWidth > container.clientWidth || container.scrollHeight > container.clientHeight) && fontSize > 6) {
                    fontSize -= 0.5;
                    container.style.fontSize = fontSize + 'pt';
                    // DOMの再計算を待つために細かくリクエスト
                    setTimeout(() => requestAnimationFrame(checkFit), 0);
                }
            };
            
            checkFit();
        });
    };

    // Update media area with files or AI image
    const updateMediaArea = () => {
        previewPhotos.innerHTML = '';
        previewPhotos.className = 'media-area'; // Reset class
        const contentArea = previewPhotos.closest('.newspaper-content-area');
        
        const files = Array.from(photoUpload.files).slice(0, 3); // Max 3 for vertical layout
        
        if (files.length > 0) {
            previewPhotos.classList.add(`layout-${files.length}`);
            if (contentArea) contentArea.classList.remove('no-media');
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    previewPhotos.appendChild(img);
                    img.onload = () => autoFitContent();
                };
                reader.readAsDataURL(file);
            });
        } else if (currentAiImageUrl) {
            // Use AI Image if no files uploaded
            previewPhotos.classList.add('layout-1');
            if (contentArea) contentArea.classList.remove('no-media');
            const img = document.createElement('img');
            img.src = currentAiImageUrl;
            img.crossOrigin = "anonymous"; // For better PDF printing support
            previewPhotos.appendChild(img);
            img.onload = () => autoFitContent();
        } else {
            previewPhotos.classList.add('layout-0');
            if (contentArea) contentArea.classList.add('no-media');
        }
    };

    // Sync Basic Info to Preview
    const syncHeader = () => {
        previewTitle.textContent = titleInput.value || '学級通信';
        previewIssue.textContent = issueInput.value || '';
        previewDate.textContent = formatDateJP(dateInput.value);
        if (publisherInput.value) {
            previewPublisher.textContent = '発行者：' + publisherInput.value;
        } else {
            previewPublisher.textContent = '';
        }
        
        if (dateInput.value) {
            if(seasonIcon) seasonIcon.textContent = getDailyIcon(dateInput.value);
        }
        autoFitContent();
    };

    titleInput.addEventListener('input', syncHeader);
    issueInput.addEventListener('input', syncHeader);
    dateInput.addEventListener('input', syncHeader);
    publisherInput.addEventListener('input', syncHeader);

    // Generate AI Prompt
    generatePromptBtn.addEventListener('click', () => {
        const events = eventsInput.value.trim() || '特になし';
        const good = goodInput.value.trim() || '特になし';
        const message = messageInput.value.trim() || '特になし';
        const notes = notesInput.value.trim() || '特になし';

        const promptText = `
あなたは中学校の愛情深い優秀な教師です。以下のメモから学級通信用の文章と関連情報を作成してください。
出力は必ず以下の指定フォーマットの通りに、各タグ（【】で囲まれた部分）を含めて出力してください。

【前提事項】
1. 本文は600〜800字程度で、読み応えのある分量にしてください
2. 生徒の個人名は出さない
3. トラブルがあった場合でも、成長の機会など前向きな表現にする
4. 中学生にも保護者にも伝わりやすい丁寧で温かい文体（です・ます調）
5. AIが書いたような無機質で形式的な表現（過度な比喩や作られたような完璧すぎる文章）は避け、あなたの素直な感情や生徒への温かい眼差しが伝わる、人間味あふれる自然な言葉で語りかけるように書いてください。
6. 大見出しは一番伝えたい内容を15文字以内でキャッチーに
7. 小見出しは本文の要約とし、必ず意味の区切れで全角スペースを入れて2行構成にしてください（例: みんなで楽しむ中で　広がる思いやり）。各行は長くなりすぎないよう、10文字程度におさめてください。
8. 画像プロンプトは、本文の内容を表す「英語の短い画像生成呪文（プロンプト）」を1行で記載（例: junior high school students studying happily in classroom, anime style, highly detailed）

【入力メモ】
・今日の出来事：${events}
・生徒のよかった姿：${good}
・伝えたいこと：${message}
・連絡事項：${notes}

【出力フォーマット】（この通りに出力してください）
【大見出し】ここに大見出し
【小見出し】ここに小見出し
【本文】ここに本文
【連絡等】ここに連絡事項
【画像プロンプト】ここに英語の画像生成プロンプト
        `.trim();

        navigator.clipboard.writeText(promptText).then(() => {
            const originalText = generatePromptBtn.textContent;
            generatePromptBtn.textContent = '✔ コピーしました！';
            generatePromptBtn.style.backgroundColor = 'var(--success-hover)';
            
            setTimeout(() => {
                generatePromptBtn.textContent = originalText;
                generatePromptBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            alert('クリップボードへのコピーに失敗しました。');
            console.error(err);
        });
    });

    // Parse AI Text and split into parts
    const parseAiText = (text) => {
        const result = {
            mainHeadline: '見出し',
            subHeadline: '見出し<br>見出し',
            body: 'ここに文章が表示されます。左側の「AI生成文章の貼り付け」にテキストを入力してください。',
            notes: '特になし',
            imagePrompt: ''
        };

        if (!text) return result;

        const extractPart = (startTag, endTags) => {
            const startIndex = text.indexOf(startTag);
            if (startIndex === -1) return null;
            
            const contentStart = startIndex + startTag.length;
            let minEndIndex = text.length;
            
            endTags.forEach(tag => {
                const endIndex = text.indexOf(tag, contentStart);
                if (endIndex !== -1 && endIndex < minEndIndex) {
                    minEndIndex = endIndex;
                }
            });
            
            return text.substring(contentStart, minEndIndex).trim();
        };

        const mainH = extractPart('【大見出し】', ['【小見出し】', '【本文】', '【連絡等】', '【画像プロンプト】']);
        if (mainH) result.mainHeadline = mainH;

        let subH = extractPart('【小見出し】', ['【本文】', '【連絡等】', '【画像プロンプト】']);
        if (subH) result.subHeadline = subH;

        const bodyTx = extractPart('【本文】', ['【連絡等】', '【画像プロンプト】']);
        if (bodyTx) result.body = bodyTx;

        const notesTx = extractPart('【連絡等】', ['【画像プロンプト】']);
        if (notesTx) result.notes = notesTx;

        const imgPrompt = extractPart('【画像プロンプト】', []);
        if (imgPrompt) result.imagePrompt = imgPrompt;

        // もしフォーマット通りでなかった場合のフォールバック
        if (!mainH && !bodyTx) {
            result.body = text;
        }

        return result;
    };

    // Sync AI Text to Preview Body
    aiResultText.addEventListener('input', () => {
        const text = aiResultText.value;
        const parsed = parseAiText(text);

        // Update Text Elements
        previewMainHeadline.textContent = parsed.mainHeadline;
        
        // Handle Sub Headline (Allowing line breaks by full-width/half-width space and preventing unnatural wraps)
        const subHText = parsed.subHeadline
            .split(/[ 　]+/)
            .filter(Boolean)
            .map(text => `<span style="display: inline-block; white-space: nowrap;">${text}</span>`)
            .join('');
        previewSubHeadline.innerHTML = subHText;
        
        previewBodyText.textContent = parsed.body;
        
        // Handle Notes Section visibility
        const notesElement = previewNotes.closest('.notes-section');
        const emptyNotes = ['特になし', 'なし', '', '無し'];
        if (emptyNotes.includes(parsed.notes.trim())) {
            notesElement.style.display = 'none';
        } else {
            notesElement.style.display = '';
            previewNotes.textContent = parsed.notes;
        }

        // Generate Image if prompt exists and no photo uploaded
        if (parsed.imagePrompt && photoUpload.files.length === 0) {
            // Use Unsplash Source for stable free images based on keywords
            // Extract a strong keyword from the prompt for the search
            let keyword = 'school';
            const promptLower = parsed.imagePrompt.toLowerCase();
            if (promptLower.includes('student') || promptLower.includes('school')) keyword = 'school,students';
            if (promptLower.includes('sports') || promptLower.includes('jump')) keyword = 'sports,active';
            if (promptLower.includes('study') || promptLower.includes('class')) keyword = 'classroom';
            if (promptLower.includes('trip') || promptLower.includes('event')) keyword = 'event,outdoor';
            
            // Add a random hash to bypass browser cache
            const randomHash = Math.random().toString(36).substring(7);
            
            // Note: Unsplash Source API 'https://source.unsplash.com/featured/' is deprecated but still works in many cases,
            // alternatively using a stable placeholder that looks good for testing if we just need *an* image.
            currentAiImageUrl = `https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop&sig=${randomHash}`;
            
            updateMediaArea();
        } else if (!parsed.imagePrompt) {
            currentAiImageUrl = null;
            updateMediaArea();
        }

        autoFitContent();
    });

    // Handle Photo Uploads
    photoUpload.addEventListener('change', () => {
        updateMediaArea();
    });

    // Modal & Print Logic
    previewPdfBtn.addEventListener('click', () => {
        checklistModal.classList.remove('hidden');
        checkboxes.forEach(cb => cb.checked = false);
        checkFormValidity();
    });

    cancelModalBtn.addEventListener('click', () => {
        checklistModal.classList.add('hidden');
    });

    // Check checklist validity
    const checkFormValidity = () => {
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        confirmPrintBtn.disabled = !allChecked;
    };

    checkboxes.forEach(cb => {
        cb.addEventListener('change', checkFormValidity);
    });

    // Print
    confirmPrintBtn.addEventListener('click', () => {
        checklistModal.classList.add('hidden');
        
        // Dynamically set document title for default PDF filename
        const originalTitle = document.title;
        const printDate = dateInput.value || today.toISOString().split('T')[0];
        document.title = `${printDate}_学級通信`;
        
        // Allow DOM to update before printing
        setTimeout(() => {
            window.print();
            // Restore original title
            document.title = originalTitle;
        }, 100);
    });
});
