class LifeOSReasoningFlow extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="bg-surface-900 rounded-xl p-6 text-white mb-6 animate-fade-in relative overflow-hidden">
            <div class="flex items-center justify-between mb-6 relative z-10">
                <h3 class="font-semibold text-lg flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Agent Reasoning Stream
                </h3>
            </div>
            
            <div class="space-y-6 relative z-10">
                <div class="reasoning-step flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-xs font-mono text-surface-300">01</div>
                        <div class="w-0.5 h-full bg-surface-800 flex-1 my-2"></div>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-blue-300 mb-1">Analyzing Patterns</h4>
                        <p class="text-sm text-surface-400">Scanning memory for recurring behavioral clusters...</p>
                    </div>
                </div>
                
                 <div class="reasoning-step flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-xs font-mono text-surface-300">02</div>
                        <div class="w-0.5 h-full bg-surface-800 flex-1 my-2"></div>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-purple-300 mb-1">Contextual Alignment</h4>
                        <p class="text-sm text-surface-400">Cross-referencing goals with current state...</p>
                    </div>
                </div>
                
                 <div class="reasoning-step flex gap-4">
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center text-xs font-mono text-surface-300">03</div>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-green-300 mb-1">Synthesizing Recommendation</h4>
                        <p class="text-sm text-surface-400">Formulating optimal decision path...</p>
                    </div>
                </div>
            </div>
            
            <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>
        `;
    }
}
customElements.define('lifeos-reasoning-flow', LifeOSReasoningFlow);
