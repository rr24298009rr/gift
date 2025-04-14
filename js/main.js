document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const carousel = document.querySelector('.carousel');
    const modal = document.getElementById('giftModal');  // 修正 modal ID
    let currentImageIndex = 0;
    let carouselInterval;
    let isPaused = false;
    let giftTexts = [];

    // 禮物券文字內容解析
    function parseGiftText(text) {
        const sections = text.split(/\d+\.\s/).filter(section => section.trim());
        return sections.map(section => {
            const lines = section.trim().split('\n');
            return {
                title: lines[0].replace(/【|】/g, ''),
                imageInfo: lines[1],  // 保留原始格式
                description: lines[2],  // 保留原始格式，包括表情符號
                usage: lines[3],  // 保留原始格式
                extraInfo: lines.slice(4).filter(line => line.trim())  // 保留原始格式
            };
        });
    }

    // 輪播控制功能
    function startCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
        if (!isPaused) {
            carouselInterval = setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % 6;
                updateCarousel();
            }, 4000);
        }
    }

    function pauseCarousel() {
        isPaused = true;
        if (carouselInterval) {
            clearInterval(carouselInterval);
        }
    }

    function resumeCarousel() {
        isPaused = false;
        startCarousel();
    }

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentImageIndex * 100}%)`;
        updateDots();
    }

    // 載入圖片和初始化
    function initialize() {
        // 創建圖片元素
        for (let i = 1; i <= 6; i++) {
            const img = document.createElement('img');
            img.src = `pictures/${i}.jpg`;
            img.dataset.index = i - 1;
            img.addEventListener('click', () => showModal(i - 1));
            carousel.appendChild(img);
        }

        // 創建輪播點
        const dotsContainer = document.querySelector('.carousel-dots');
        for (let i = 0; i < 6; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                if (!isPaused) {
                    currentImageIndex = i;
                    updateCarousel();
                    startCarousel();
                }
            });
            dotsContainer.appendChild(dot);
        }

        // 載入文字內容
        fetch('picture_text.md')
            .then(response => response.text())
            .then(text => {
                giftTexts = parseGiftText(text);
            })
            .catch(error => console.error('無法載入文字內容:', error));
    }

    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentImageIndex);
        });
    }

    // 彈出視窗功能
    function showModal(index) {
        const modalText = modal.querySelector('.modal-text');
        const gift = giftTexts[index];
        
        if (gift) {
            modalText.innerHTML = `
                <h2>${gift.title}</h2>
                <p class="image-info">${gift.imageInfo}</p>
                <p class="description">${gift.description}</p>
                <p class="usage-count">${gift.usage}</p>
                ${gift.extraInfo.map(info => `<p class="extra-info">${info}</p>`).join('')}
            `;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            pauseCarousel();
        }
    }

    function hideModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        resumeCarousel();
    }

    // 初始化
    initialize();
    startCarousel();

    // 事件監聽
    document.querySelector('.prev').addEventListener('click', () => {
        if (!isPaused) {
            currentImageIndex = (currentImageIndex - 1 + 6) % 6;
            updateCarousel();
            startCarousel();
        }
    });

    document.querySelector('.next').addEventListener('click', () => {
        if (!isPaused) {
            currentImageIndex = (currentImageIndex + 1) % 6;
            updateCarousel();
            startCarousel();
        }
    });

    modal.querySelector('.close').addEventListener('click', hideModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) hideModal();
    });

    // 評論功能
    const commentForm = modal.querySelector('.comment-section');
    const commentsList = modal.querySelector('.comments-list');
    
    commentForm.querySelector('.submit-comment').addEventListener('click', () => {
        const textarea = commentForm.querySelector('textarea');
        const commentText = textarea.value.trim();
        
        if (commentText) {
            const comment = document.createElement('div');
            comment.className = 'comment';
            
            const now = new Date();
            const dateStr = now.toLocaleDateString('zh-TW');
            const timeStr = now.toLocaleTimeString('zh-TW');
            
            comment.innerHTML = `
                <div class="comment-text">${commentText}</div>
                <div class="comment-date">${dateStr} ${timeStr}</div>
            `;
            
            commentsList.insertBefore(comment, commentsList.firstChild);
            textarea.value = '';
        }
    });

    // Enter 鍵提交評論
    commentForm.querySelector('textarea').addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            commentForm.querySelector('.submit-comment').click();
        }
    });
});