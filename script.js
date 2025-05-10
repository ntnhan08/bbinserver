document.addEventListener('DOMContentLoaded', () => {
    // ========== CẤU HÌNH CHUNG ========== //
    const CONFIG = {
        SERVER_IP: 'bbin.ddns.net',
        API_ENDPOINT: '/api/server-status',
        UPDATE_INTERVAL: 30000,
        COLORS: {
            ONLINE: '#00ff88',
            OFFLINE: '#ff4444'
        }
    };

    // ========== KHỞI TẠO ỨNG DỤNG ========== //
    class MinecraftServer {
        constructor() {
            this.initElements();
            this.initEventListeners();
            this.initClipboard();
            this.initServerStatus();
            this.initLogoInteraction();
        }

        // ========== PHƯƠNG THỨC KHỞI TẠO ========== //
        initElements() {
            this.elements = {
                statusIndicator: document.getElementById('statusIndicator'),
                playerCount: document.getElementById('playerCount'),
                serverLogo: document.querySelector('.server-logo'),
                ipAddress: document.getElementById('ipAddress'),
                copyNotification: document.getElementById('copyNotification')
            };
        }

        initEventListeners() {
            window.addEventListener('resize', this.handleResize.bind(this));
        }

        // ========== CHỨC NĂNG COPY IP ========== //
        initClipboard() {
            this.elements.ipAddress.addEventListener('click', this.copyIP.bind(this));
            this.elements.ipAddress.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.copyIP();
            });
        }

        async copyIP() {
            try {
                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(CONFIG.SERVER_IP);
                } else {
                    this.legacyCopy();
                }
                this.showNotification('Đã copy IP! ✔️');
            } catch (error) {
                this.showNotification('Lỗi copy! ✖️', true);
                console.error('Lỗi copy:', error);
            }
        }

        legacyCopy() {
            const textarea = document.createElement('textarea');
            textarea.value = CONFIG.SERVER_IP;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        showNotification(text, isError = false) {
            const notification = this.elements.copyNotification;
            notification.textContent = text;
            notification.className = `copy-notification ${isError ? 'error' : ''}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }

        // ========== TRẠNG THÁI SERVER ========== //
        async initServerStatus() {
            try {
                const response = await fetch(CONFIG.API_ENDPOINT);
                const data = await response.json();
                this.updateStatus(data);
                setInterval(() => this.updateStatus(data), CONFIG.UPDATE_INTERVAL);
            } catch (error) {
                this.updateStatus({ online: false });
                console.error('Lỗi kết nối server:', error);
            }
        }

        updateStatus({ online, players = 0, playerList = [] }) {
            // Cập nhật trạng thái
            this.elements.statusIndicator.style.backgroundColor = online 
                ? CONFIG.COLORS.ONLINE 
                : CONFIG.COLORS.OFFLINE;
            
            this.elements.statusIndicator.style.boxShadow = `0 0 15px ${online 
                ? CONFIG.COLORS.ONLINE 
                : CONFIG.COLORS.OFFLINE}`;

            // Cập nhật số người chơi
            this.elements.playerCount.innerHTML = online
                ? `${players} người đang online`
                : 'Server đang offline';
        }

        // ========== TƯƠNG TÁC LOGO ========== //
        initLogoInteraction() {
            if (!this.isMobile()) {
                document.addEventListener('mousemove', (e) => {
                    const x = (window.innerWidth/2 - e.clientX)/30;
                    const y = (window.innerHeight/2 - e.clientY)/30;
                    this.elements.serverLogo.style.transform = 
                        `rotateY(${x}deg) rotateX(${y}deg) 
                         scale(1.05)`;
                });
            }
        }

        // ========== UTILITIES ========== //
        handleResize() {
            if (this.isMobile()) {
                this.elements.serverLogo.style.transform = 'none';
            }
        }

        isMobile() {
            return window.matchMedia('(max-width: 768px)').matches;
        }
    }

    // Khởi chạy ứng dụng
    new MinecraftServer();
});