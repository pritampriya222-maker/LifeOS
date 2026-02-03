class LifeOSSidebar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <aside class="fixed top-16 left-0 bottom-0 w-64 bg-surface-50 border-r border-surface-200 hidden lg:flex flex-col z-40">
            <div class="p-4 space-y-1">
                <a href="index.html" class="flex items-center gap-3 px-4 py-3 bg-white text-primary-700 rounded-xl shadow-sm border border-surface-200 font-medium">
                    <i data-feather="home" class="w-5 h-5"></i>
                    Dashboard
                </a>
                <a href="memory.html" class="flex items-center gap-3 px-4 py-3 text-surface-600 hover:bg-surface-100 hover:text-surface-900 rounded-xl transition-all">
                    <i data-feather="database" class="w-5 h-5"></i>
                    Memory Bank
                </a>
                <a href="analysis.html" class="flex items-center gap-3 px-4 py-3 text-surface-600 hover:bg-surface-100 hover:text-surface-900 rounded-xl transition-all">
                    <i data-feather="activity" class="w-5 h-5"></i>
                    Analysis
                </a>
                <a href="settings.html" class="flex items-center gap-3 px-4 py-3 text-surface-600 hover:bg-surface-100 hover:text-surface-900 rounded-xl transition-all">
                    <i data-feather="settings" class="w-5 h-5"></i>
                    Settings
                </a>
            </div>
            
            <div class="mt-auto p-4 border-t border-surface-200">
                <div class="bg-gradient-to-br from-surface-900 to-surface-800 rounded-xl p-4 text-white relative overflow-hidden">
                    <div class="relative z-10">
                        <h4 class="font-semibold mb-1">Weekly Report</h4>
                        <p class="text-sm text-surface-400 mb-3">Your insights are ready</p>
                        <button class="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">View Report</button>
                    </div>
                    <div class="absolute -bottom-12 -right-12 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl"></div>
                </div>
            </div>
        </aside>
        `;
        if (window.feather) feather.replace();
    }
}
customElements.define('lifeos-sidebar', LifeOSSidebar);
