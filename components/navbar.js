class LifeOSNavbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <nav class="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 z-50 px-4">
            <div class="h-full flex items-center justify-between max-w-7xl mx-auto">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20">
                        L
                    </div>
                    <span class="font-bold text-xl tracking-tight text-surface-900">Life<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">OS</span></span>
                </div>
                
                <div class="flex items-center gap-4">
                    <button class="p-2 text-surface-500 hover:text-surface-900 transition-colors">
                        <i data-feather="bell" class="w-5 h-5"></i>
                    </button>
                    <div class="w-8 h-8 rounded-full bg-surface-200 overflow-hidden border border-surface-300">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=LifeOS" alt="User" class="w-full h-full">
                    </div>
                </div>
            </div>
        </nav>
        `;
        if (window.feather) feather.replace();
    }
}

customElements.define('lifeos-navbar', LifeOSNavbar);
