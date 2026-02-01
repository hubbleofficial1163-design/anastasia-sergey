document.addEventListener('DOMContentLoaded', function() {
    // Оптимизация для мобильных: предотвращаем быстрые множественные клики
    let isProcessing = false;
    
    // Функция для анимации появления элементов при скролле
    function checkVisibility() {
        const elements = document.querySelectorAll('.fade-in');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    }
    
    // Запускаем проверку видимости при загрузке
    checkVisibility();
    
    // Обработка кнопки карты
    const mapButton = document.getElementById('map-btn');
    const mapContainer = document.getElementById('map-container');
    const closeMapButton = document.getElementById('close-map');
    
    if (mapButton && mapContainer) {
        mapButton.addEventListener('click', function(e) {
            if (isProcessing) return;
            isProcessing = true;
            
            e.preventDefault();
            mapContainer.classList.remove('hidden');
            
            // Плавная прокрутка с учетом мобильных устройств
            setTimeout(() => {
                mapContainer.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                isProcessing = false;
            }, 300);
        });
    }
    
    if (closeMapButton) {
        closeMapButton.addEventListener('click', function(e) {
            if (isProcessing) return;
            isProcessing = true;
            
            e.preventDefault();
            mapContainer.classList.add('hidden');
            
            // Прокрутка обратно к кнопке
            setTimeout(() => {
                if (mapButton) {
                    mapButton.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                isProcessing = false;
            }, 300);
        });
    }
    
    // Обработка формы RSVP
    const rsvpForm = document.getElementById('rsvp-form');
    const formMessage = document.getElementById('form-message');
    
    if (rsvpForm) {
        // Маска для телефона
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value[0] === '7' || value[0] === '8') {
                        value = '+7 ' + value.substring(1);
                    } else if (value[0] === '9') {
                        value = '+7 ' + value;
                    }
                    
                    if (value.length > 6) {
                        value = value.substring(0, 6) + ' ' + value.substring(6);
                    }
                    if (value.length > 10) {
                        value = value.substring(0, 10) + '-' + value.substring(10);
                    }
                    if (value.length > 13) {
                        value = value.substring(0, 13) + '-' + value.substring(13);
                    }
                    if (value.length > 16) {
                        value = value.substring(0, 16);
                    }
                }
                
                e.target.value = value;
            });
        }
        
        rsvpForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (isProcessing) return;
            isProcessing = true;
            
            // Получение данных формы
            const formData = new FormData(rsvpForm);
            const formDataObj = Object.fromEntries(formData.entries());
            
            // Валидация формы
            let isValid = true;
            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phone');
            const guestsSelect = document.getElementById('guests');
            const attendanceSelect = document.getElementById('attendance');
            
            // Сброс предыдущих сообщений об ошибках
            formMessage.className = 'form-message';
            formMessage.style.display = 'none';
            
            // Проверка обязательных полей
            if (!nameInput.value.trim()) {
                formMessage.textContent = 'Пожалуйста, введите ваше имя';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                nameInput.focus();
            } else if (!phoneInput.value.trim()) {
                formMessage.textContent = 'Пожалуйста, введите ваш номер телефона';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                phoneInput.focus();
            } else if (!guestsSelect.value) {
                formMessage.textContent = 'Пожалуйста, выберите количество гостей';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                guestsSelect.focus();
            } else if (!attendanceSelect.value) {
                formMessage.textContent = 'Пожалуйста, выберите вариант присутствия';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                isValid = false;
                attendanceSelect.focus();
            }
            
            if (!isValid) {
                isProcessing = false;
                return;
            }
            
            // URL вашего Google Apps Script веб-приложения
            // ⚠️ ЗАМЕНИТЕ ЭТОТ URL НА ВАШ СОБСТВЕННЫЙ ⚠️
            const scriptURL = 'https://script.google.com/macros/s/AKfycbwYtD3ZpQ9GUV50vtdB_9G-iLqD4o0k6B8IJIB8F0cYlAGF4qXZ2PxDSNwgJ5jMBpJv8w/exec';
            
            // Показать индикатор загрузки
            const submitBtn = rsvpForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
            submitBtn.disabled = true;
            
            // Отправка данных на Google Apps Script
            fetch(scriptURL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formDataObj)
            })
            .then(() => {
                // Успешная отправка
                if (attendanceSelect.value === 'yes') {
                    formMessage.textContent = 'Спасибо! Ваш ответ сохранён. Мы будем ждать вас на нашей свадьбе!';
                } else {
                    formMessage.textContent = 'Спасибо за ответ! Очень жаль, что вы не сможете быть с нами в этот день.';
                }
                formMessage.className = 'form-message success';
                formMessage.style.display = 'block';
                
                // Скрыть клавиатуру на мобильных
                document.activeElement.blur();
                
                // Прокрутка к сообщению
                setTimeout(() => {
                    formMessage.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
                
                // Восстановить кнопку
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Очистка формы
                setTimeout(() => {
                    rsvpForm.reset();
                    isProcessing = false;
                }, 2000);
                
                // Скрыть сообщение через 10 секунд
                setTimeout(() => {
                    formMessage.className = 'form-message';
                    formMessage.style.display = 'none';
                }, 10000);
                
            })
            .catch(error => {
                console.error('Ошибка отправки:', error);
                
                // Показать сообщение об ошибке
                formMessage.textContent = 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
                
                // Восстановить кнопку
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                isProcessing = false;
                
                // Прокрутка к сообщению об ошибке
                setTimeout(() => {
                    formMessage.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
                
                // Скрыть сообщение об ошибке через 5 секунд
                setTimeout(() => {
                    formMessage.className = 'form-message';
                    formMessage.style.display = 'none';
                }, 5000);
            });
        });
    }
    
    // Оптимизация плавной прокрутки для мобильных
    const smoothScroll = function(targetId) {
        if (isProcessing) return;
        isProcessing = true;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) {
            isProcessing = false;
            return;
        }
        
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(800, Math.abs(distance) / 2);
        let startTime = null;
        
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                isProcessing = false;
            }
        }
        
        // Функция плавности
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    };
    
    // Обработка кликов по навигационным ссылкам
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            smoothScroll(targetId);
        });
    });
    
    // Оптимизация загрузки изображений для мобильных
    const lazyLoadImages = function() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Устанавливаем атрибут loading="lazy" для отложенной загрузки
            if (!img.getAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Добавляем fallback для ошибок загрузки
            img.addEventListener('error', function() {
                this.style.backgroundColor = '#f5f5f5';
                this.style.minHeight = '200px';
                console.warn('Не удалось загрузить изображение:', this.src);
            });
        });
    };
    
    // Запускаем ленивую загрузку после полной загрузки страницы
    window.addEventListener('load', function() {
        lazyLoadImages();
        
        // Добавляем класс loaded для плавного появления контента
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
        
        // Проверяем видимость элементов после загрузки
        checkVisibility();
        
        // Скрываем индикатор загрузки карты через секунду
        const mapLoading = document.querySelector('.map-loading');
        if (mapLoading) {
            setTimeout(() => {
                mapLoading.style.display = 'none';
            }, 1000);
        }
    });
    
    // Оптимизация для медленных сетей
    if ('connection' in navigator) {
        const connection = navigator.connection;
        if (connection) {
            // Если медленное соединение, отключаем некоторые эффекты
            if (connection.effectiveType === 'slow-2g' || 
                connection.effectiveType === '2g' ||
                connection.saveData === true) {
                console.log('Медленное соединение, оптимизируем загрузку...');
                
                // Отключаем плавные анимации
                document.documentElement.style.setProperty('--animation-duration', '0s');
                
                // Предотвращаем загрузку ненужных ресурсов
                const allImages = document.querySelectorAll('img');
                allImages.forEach((img, index) => {
                    if (index > 2) { // Оставляем только первые 3 изображения
                        img.setAttribute('loading', 'lazy');
                        img.setAttribute('decoding', 'async');
                    }
                });
            }
        }
    }
    
    // Фикс для iOS Safari 100vh - ПРОСТОЙ И ЭФФЕКТИВНЫЙ
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Устанавливаем фиксированную высоту для всех fullscreen секций
        const fullscreenSections = document.querySelectorAll('.hero-image, .story-image, .location-image');
        fullscreenSections.forEach(section => {
            section.style.height = `${window.innerHeight}px`;
        });
        
        // Футер делаем чуть меньше
        const footerImage = document.querySelector('.footer-image');
        if (footerImage) {
            footerImage.style.height = `${window.innerHeight * 0.8}px`;
        }
    }
    
    // Устанавливаем высоту при загрузке и изменении размера окна
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    // Проверка видимости элементов при скролле
    window.addEventListener('scroll', checkVisibility);
    
    // Счетчик обратного отсчета
    function updateCountdown() {
        const weddingDate = new Date('2026-04-24T13:45:00').getTime();
        const now = new Date().getTime();
        const timeLeft = weddingDate - now;
        
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
            return;
        }
        
        if (timeLeft > 0) {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            daysElement.textContent = days.toString().padStart(2, '0');
            hoursElement.textContent = hours.toString().padStart(2, '0');
            minutesElement.textContent = minutes.toString().padStart(2, '0');
            secondsElement.textContent = seconds.toString().padStart(2, '0');
            
            // Добавляем анимацию при изменении секунд
            secondsElement.classList.add('changing');
            setTimeout(() => {
                secondsElement.classList.remove('changing');
            }, 300);
            
            // Анимация при изменении минут (каждую минуту)
            if (seconds === 0) {
                minutesElement.classList.add('changing');
                setTimeout(() => {
                    minutesElement.classList.remove('changing');
                }, 300);
            }
            
            // Анимация при изменении часов (каждый час)
            if (minutes === 0 && seconds === 0) {
                hoursElement.classList.add('changing');
                setTimeout(() => {
                    hoursElement.classList.remove('changing');
                }, 300);
            }
            
            // Анимация при изменении дней (каждый день)
            if (hours === 0 && minutes === 0 && seconds === 0) {
                daysElement.classList.add('changing');
                setTimeout(() => {
                    daysElement.classList.remove('changing');
                }, 300);
            }
        } else {
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            
            const countdownMessage = document.querySelector('.countdown-message');
            if (countdownMessage) {
                countdownMessage.textContent = 'Этот день настал! Спасибо, что разделили его с нами!';
                countdownMessage.style.color = '#d4a762';
                countdownMessage.style.fontWeight = 'bold';
            }
        }
    }
    
    // Обновляем счетчик каждую секунду
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Обновляем счетчик при загрузке страницы
    window.addEventListener('load', updateCountdown);
    
    // Простой музыкальный плеер
    const musicBtn = document.getElementById('musicBtn');
    const audio = document.getElementById('weddingSong');
    
    if (musicBtn && audio) {
        let isPlaying = false;
        
        musicBtn.addEventListener('click', function() {
            if (isPlaying) {
                audio.pause();
                musicBtn.innerHTML = '<i class="fas fa-play"></i><span>Включить музыку</span>';
                isPlaying = false;
            } else {
                audio.play().then(() => {
                    musicBtn.innerHTML = '<i class="fas fa-pause"></i><span>Выключить музыку</span>';
                    isPlaying = true;
                }).catch(error => {
                    console.log('Ошибка воспроизведения:', error);
                    musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i><span>Музыка недоступна</span>';
                });
            }
        });
        
        // Автоматически останавливаем при паузе/окончании
        audio.addEventListener('pause', function() {
            if (isPlaying) {
                musicBtn.innerHTML = '<i class="fas fa-play"></i><span>Включить музыку</span>';
                isPlaying = false;
            }
        });
        
        // Начинаем с выключенной музыки
        audio.volume = 0.7; // 70% громкость
    }
});

// Функция для проверки URL Google Apps Script
function testScriptURL() {
    // Тестовый URL - замените на свой после настройки
    const testURL = 'https://script.google.com/macros/s/AKfycbyXBTRu8ktQ4VsqYYtyayAR3DIm1qHERHYsgN60LyK0VwBYdIeZ2bn-tV0JiU3EDRE5iA/exec';
    
    fetch(testURL)
        .then(response => {
            console.log('Скрипт доступен, статус:', response.status);
            return response.text();
        })
        .then(text => {
            console.log('Ответ от скрипта:', text.substring(0, 200) + '...');
        })
        .catch(error => {
            console.error('Ошибка подключения к скрипту:', error);
        });
}

// Запустить тест после загрузки страницы
window.addEventListener('load', function() {
    // Раскомментируйте следующую строку для тестирования URL
    // testScriptURL();
});