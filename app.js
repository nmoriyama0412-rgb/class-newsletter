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
    const previewBody = document.getElementById('preview-body');
    const previewPhotos = document.getElementById('preview-photos');
    const seasonIcon = document.getElementById('season-icon');
    
    const checklistModal = document.getElementById('checklist-modal');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const confirmPrintBtn = document.getElementById('confirm-print-btn');
    const checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');

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
        const filler = document.getElementById('filler-illustration');
        if (filler) filler.style.display = 'none';

        // Reset to default sizes
        previewBody.style.fontSize = '11pt';
        previewBody.style.lineHeight = '2';
        
        // Wait for DOM to render to accurately calculate scrollHeight
        requestAnimationFrame(() => {
            const a4Page = document.getElementById('a4-preview');
            let currentSize = 11;
            let currentLineHeight = 2.0;

            while (a4Page.scrollHeight > a4Page.clientHeight && currentSize > 7) {
                currentSize -= 0.5;
                if(currentSize <= 10) currentLineHeight = 1.8;
                previewBody.style.fontSize = `${currentSize}pt`;
                previewBody.style.lineHeight = `${currentLineHeight}`;
            }

            // Check for empty space and add filler illustration
            requestAnimationFrame(() => {
                const bodyRect = previewBody.getBoundingClientRect();
                const photosRect = previewPhotos.getBoundingClientRect();
                const pageRect = a4Page.getBoundingClientRect();
                
                let emptySpace = 0;
                // 写真がある場合は写真枠の上から本文下までの距離。写真がない場合はページ下部マージンとの距離
                if (photoUpload.files.length > 0) {
                    emptySpace = photosRect.top - bodyRect.bottom;
                } else {
                    const pagePaddingBottom = 20 * 3.78; // approx 20mm
                    emptySpace = pageRect.bottom - bodyRect.bottom - pagePaddingBottom;
                }

                if (emptySpace > 120 && filler) {
                    filler.style.display = 'flex';
                    // 空白スペースの大きさに応じてフォントサイズを調整
                    filler.style.fontSize = emptySpace > 300 ? '8rem' : '4rem';
                    
                    const d = dateInput.value ? new Date(dateInput.value) : new Date();
                    const month = d.getMonth() + 1;
                    const fillerIcons = {
                        1: '🎍🎌', 2: '⛄❄️', 3: '🌸🎓', 4: '🌷🎒', 5: '🎏🌿', 6: '☔🐌',
                        7: '🎋🍉', 8: '🌻☀️', 9: '🎑🍂', 10: '🎃👻', 11: '🍁🐿️', 12: '🎄🎅'
                    };
                    filler.textContent = fillerIcons[month] || '🏫✨';
                }
            });
        });
    };

    // Sync Basic Info to Preview
    const syncHeader = () => {
        previewTitle.textContent = titleInput.value || '学級通信';
        previewIssue.textContent = issueInput.value || '';
        previewDate.textContent = formatDateJP(dateInput.value);
        if (publisherInput.value) {
            previewPublisher.textContent = '発行：' + publisherInput.value;
        } else {
            previewPublisher.textContent = '';
        }
        
        if (dateInput.value) {
            seasonIcon.textContent = getDailyIcon(dateInput.value);
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
あなたは中学校の優秀な教師です。以下のメモから学級通信用の文章を作成してください。

【前提事項（厳守）】
1. 箇条書きから400〜800字程度に整える
2. 生徒の個人名は出さない
3. トラブルがあった場合でも、角の立たない表現（成長の機会など）に変える
4. 保護者が不安にならない、前向きで温かい書き方にする
5. 最後に短いまとめ・一言を入れる
6. 中学生にも保護者にも伝わりやすい文体にする（です・ます調）

【入力メモ】
・今日の出来事：${events}
・生徒のよかった姿：${good}
・伝えたいこと：${message}

【連絡事項（そのまま末尾に記載）】
${notes}
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

    // Sync AI Text to Preview Body
    aiResultText.addEventListener('input', () => {
        const text = aiResultText.value.trim();
        if (text) {
            previewBody.textContent = text;
        } else {
            previewBody.textContent = 'ここに文章が表示されます。左側の「AI生成文章の貼り付け」にテキストを入力してください。';
        }
        autoFitContent();
    });

    // Handle Photo Uploads
    photoUpload.addEventListener('change', (e) => {
        // Limit to 5 files maximum
        const files = Array.from(e.target.files).slice(0, 5); 
        previewPhotos.innerHTML = '';
        previewPhotos.className = 'a4-photos'; // Reset class
        
        if (files.length === 0) {
            previewPhotos.classList.add('layout-0');
            return;
        }

        previewPhotos.classList.add(`layout-${files.length}`);

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
        autoFitContent();
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
