// ==UserScript==
// @name         Auto Click ymn-btn3 with Countdown Flow - Fixed
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Klik tombol ymn-btn3 -> tunggu countdown -> klik any link -> klik tombol lagi -> selesai
// @match        https://bet88va.com/*
// @match        https://vn88ux.com/*
// @match        https://v9betql.com/*
// @match        https://fb88lh.com/*
// @match        https://bk8uz.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- Jaga tab selalu aktif ---
    Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false
    });
    Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "visible"
    });
    ["visibilitychange","webkitvisibilitychange","blur","pagehide"].forEach(event => {
        window.addEventListener(event, e => e.stopImmediatePropagation(), true);
        document.addEventListener(event, e => e.stopImmediatePropagation(), true);
    });
    console.log("[TM] Tab selalu aktif ✅");

    // --- Step 1: klik tombol pertama ---
    function clickButton(callback) {
        const btn = document.querySelector('.ymn-btn.ymn-btn3');
        if (btn) {
            console.log("✅ Scroll ke tombol dan klik .ymn-btn.ymn-btn3");
            
            // Scroll ke tombol dengan smooth behavior
            btn.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center', 
                inline: 'center' 
            });
            
            // Tunggu sebentar agar scroll selesai, lalu klik
            setTimeout(() => {
                ['mousedown','mouseup','click'].forEach(type => {
                    btn.dispatchEvent(new MouseEvent(type, { 
                        bubbles: true, 
                        cancelable: true, 
                        view: window 
                    }));
                });
                if (callback) callback();
            }, 500); // delay 500ms untuk scroll
            
            return true;
        }
        return false;
    }

    // --- Step 2: tunggu countdown selesai ---
    function waitCountdown(done) {
        console.log("⏳ Menunggu countdown selesai...");
        const interval = setInterval(() => {
            const countdown = document.querySelector('.ymn-btn-text.ymn-countdown');
            if (countdown) {
                const textNow = countdown.textContent.trim();
                if (textNow.includes("Vui lòng click vào link trang bất kỳ")) {
                    console.log("✅ Countdown selesai, perlu klik link di halaman");
                    clearInterval(interval);
                    if (done) done();
                }
            }
        }, 1000);
    }

    // --- Step 3: klik link di halaman (menu, footer, artikel) ---
    function clickAnyLink(callback) {
        console.log("🔍 Mencari link untuk diklik...");
        
        // Cari berbagai jenis link yang mungkin ada
        const selectors = [
            'nav a',           // Link di navigasi
            'header a',        // Link di header
            'footer a',        // Link di footer
            '.menu a',         // Link di menu
            '.post a',         // Link di artikel
            'article a',       // Link di artikel
            '.content a',      // Link di konten
            'main a',          // Link di main content
            'a[href]'          // Semua link yang memiliki href
        ];

        let linkFound = false;
        
        for (let selector of selectors) {
            const links = document.querySelectorAll(selector);
            if (links.length > 0) {
                // Pilih link yang terlihat dan bisa diklik
                for (let link of links) {
                    const rect = link.getBoundingClientRect();
                    const isVisible = rect.width > 0 && rect.height > 0 && 
                                    getComputedStyle(link).visibility !== 'hidden' &&
                                    getComputedStyle(link).display !== 'none';
                    
                    if (isVisible && link.href && !link.href.includes('javascript:')) {
                        console.log(`✅ Klik link: ${link.href}`);
                        
                        // Simulasi klik link
                        ['mousedown','mouseup','click'].forEach(type => {
                            link.dispatchEvent(new MouseEvent(type, { 
                                bubbles: true, 
                                cancelable: true, 
                                view: window 
                            }));
                        });
                        
                        linkFound = true;
                        if (callback) callback();
                        return true;
                    }
                }
            }
        }

        if (!linkFound) {
            console.warn("⚠️ Tidak menemukan link yang bisa diklik, coba klik body");
            // Fallback: klik di body
            document.body.click();
            if (callback) callback();
        }
        
        return linkFound;
    }

    // --- Flow utama ---
    window.addEventListener('load', () => {
        console.log("🚀 Script mulai");
        
        // Step 1: klik tombol pertama
        const maxWait = 20; // detik
        let elapsed = 0;
        
        const checkBtn = setInterval(() => {
            if (clickButton(() => {
                // Step 2: tunggu countdown selesai
                waitCountdown(() => {
                    // Step 3: klik any link di halaman
                    setTimeout(() => {
                        clickAnyLink(() => {
                            // Step 4: tunggu sebentar lalu klik tombol kedua
                            setTimeout(() => {
                                clickButton(() => {
                                    console.log("🎉 Semua step selesai!");
                                });
                            }, 2000); // delay 2 detik setelah klik link
                        });
                    }, 1000); // delay 1 detik setelah countdown selesai
                });
            })) {
                clearInterval(checkBtn);
            } else {
                elapsed++;
                if (elapsed >= maxWait) {
                    console.warn("⚠️ Timeout mencari tombol pertama");
                    clearInterval(checkBtn);
                }
            }
        }, 1000);
    });
})();
