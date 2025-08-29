import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'


export const useIndexStore = defineStore('index', () => {
    // 判斷現行畫面寬度
    const isMobile = ref(false)
    const isTablet = ref(false)
    const isDesktop = ref(false)
    const isAccessDenied = ref(false)
    const screenWidth = ref(0)  
    // 判斷現行畫面寬度
    const checkScreenWidth = () => {
        isMobile.value = window.innerWidth < 768
        isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1024
        isDesktop.value = window.innerWidth >= 1024
        screenWidth.value = window.innerWidth
    }

    // 初始化
    checkScreenWidth()

    // 監聽畫面寬度 當畫面寬度變化時，重新檢查畫面寬度
    window.addEventListener('resize', checkScreenWidth)

    return {
        isMobile,
        isTablet,
        isDesktop,
        screenWidth,
        isAccessDenied
    }
})