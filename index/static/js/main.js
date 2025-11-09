// Global objects
let tokenId = null;
let endurl = null;

// Get URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    
    return params;
}

// Alpine.js app
function stockApp() {
    return {
        isLoading: true,
        stockCode: "",
        showAnalysisModal: false,
        showAnalysisAnimation: false,
        analysisStep: "AIモデルを初期化中...",
        analysisSubtext: "最新の市場データを読み込んでいます",
        analysisProgress: 0,
        analysisSteps: [
            { step: "AIモデルを初期化中...", subtext: "最新の市場データを読み込んでいます" },
            { step: "テクニカル分析実行中...", subtext: "50種類以上の指標を計算しています" },
            { step: "ニュース感情分析中...", subtext: "企業関連の最新ニュースを分析しています" },
            { step: "市場トレンド分析中...", subtext: "セクター全体の動向と比較しています" },
            { step: "予測モデル適用中...", subtext: "複数のAIモデルで将来予測を生成しています" },
            { step: "レポート生成中...", subtext: "分析結果をまとめています" }
        ],
        
        init() {
            this.showLoading();
            this.fetchTokenId();
            
            // Add event listeners for the loading text animation
            const loadingTexts = document.querySelectorAll('.loading-text');
            loadingTexts.forEach((text, index) => {
                text.style.animationDelay = `${index * 0.1}s`;
            });
        },
        
        showLoading() {
            this.isLoading = true;
        },
        
        hideLoading() {
            this.isLoading = false;
        },
        
        fetchTokenId() {
            const params = getUrlParams();
            
            fetch(`/api/tokenId?${new URLSearchParams(params)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.code === 200) {
                        tokenId = data.clickId;
                        this.hideLoading();
                    }
                })
                .catch(error => {
                    console.error("Error fetching token ID:", error);
                    // For development purposes, hide loading after a timeout
                    setTimeout(() => this.hideLoading(), 1500);
                });
        },
        
        analyzeStock() {
            if (!this.stockCode) {
                alert("株式コードを入力してください");
                return;
            }
            
            // Send GTM event
            if (typeof gtag === 'function') {
                gtag('event', 'Bdd');
            }
            
            // Show analysis animation
            this.showAnalysisAnimation = true;
            this.runAnalysisAnimation();
        },
        
        runAnalysisAnimation() {
            let currentStep = 0;
            const totalSteps = this.analysisSteps.length;
            const animationDuration = 2000; // 2 seconds total
            const stepDuration = animationDuration / totalSteps;
            
            const updateStep = () => {
                if (currentStep >= totalSteps) {
                    // Animation complete, show modal
                    this.showAnalysisAnimation = false;
                    this.showAnalysisModal = true;
                    return;
                }
                
                const stepInfo = this.analysisSteps[currentStep];
                this.analysisStep = stepInfo.step;
                this.analysisSubtext = stepInfo.subtext;
                this.analysisProgress = Math.round((currentStep + 1) / totalSteps * 100);
                
                currentStep++;
                setTimeout(updateStep, stepDuration);
            };
            
            // Start the animation
            updateStep();
        },
        
        redirectToLine() {
            // Fetch the redirect URL
            fetch(`/api/endurl?tokenId=${tokenId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.code === 200) {
                        endurl = data.data.redirectUrl;
                        
                        // Send conversion event and redirect
                        if (typeof gtag_report_conversion === 'function') {
                            gtag_report_conversion(`/contact/open.html?endurl=${endurl}`);
                        } else {
                            window.location.href = `/contact/open.html?endurl=${endurl}`;
                        }
                    }
                })
                .catch(error => {
                    console.error("Error fetching redirect URL:", error);
                    // For development purposes
                    window.location.href = "https://line.me";
                });
        }
    };
}