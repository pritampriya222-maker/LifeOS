// LifeOS - Core Application Logic

// State Management
const LifeOS = {
    memory: {
        habits: [],
        preferences: [],
        decisions: [],
        goals: [],
        constraints: []
    },
    analysisHistory: [],
    lastAnalysis: null,

    // Initialize from localStorage
    init() {
        const saved = localStorage.getItem('lifeos_memory');
        if (saved) {
            this.memory = JSON.parse(saved);
            this.updateStats();
            this.renderMemory();
        }

        const savedHistory = localStorage.getItem('lifeos_history');
        if (savedHistory) {
            this.analysisHistory = JSON.parse(savedHistory);
        }

        const savedLast = localStorage.getItem('lifeos_last_analysis');
        if (savedLast) {
            this.lastAnalysis = new Date(savedLast);
            this.updateLastAnalysis();
        }
    },

    // Save to localStorage
    save() {
        localStorage.setItem('lifeos_memory', JSON.stringify(this.memory));
        this.updateStats();
        this.renderMemory();
    },

    // Add item to memory
    add(category, data) {
        const item = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            timestamp: new Date().toISOString(),
            ...data
        };

        this.memory[category].push(item);
        this.save();
        return item;
    },

    // Remove item from memory
    remove(category, id) {
        this.memory[category] = this.memory[category].filter(item => item.id !== id);
        this.save();
    },

    // Clear all memory
    clear() {
        this.memory = { habits: [], preferences: [], decisions: [], goals: [], constraints: [] };
        localStorage.removeItem('lifeos_memory');
        localStorage.removeItem('lifeos_history');
        localStorage.removeItem('lifeos_last_analysis');
        this.updateStats();
        this.renderMemory();
    },

    // Update statistics display
    updateStats() {
        // Only run if the stats module exists on the page
        const statsModule = document.getElementById('stat-data-points');
        if (!statsModule) return;

        const total = Object.values(this.memory).flat().length;
        document.getElementById('stat-data-points').textContent = total;

        // Calculate patterns (simplified)
        const patterns = this.detectPatterns().length;
        document.getElementById('stat-patterns').textContent = patterns;

        // Recommendations from last analysis
        const recs = this.analysisHistory.length > 0
            ? this.analysisHistory[this.analysisHistory.length - 1].recommendations.length
            : 0;
        document.getElementById('stat-recommendations').textContent = recs;

        // Memory age
        const timestamps = Object.values(this.memory)
            .flat()
            .map(i => new Date(i.timestamp))
            .sort((a, b) => a - b);

        if (timestamps.length > 0) {
            const age = Math.floor((Date.now() - timestamps[0]) / (1000 * 60 * 60 * 24));
            document.getElementById('stat-memory-age').textContent = age === 0 ? 'Today' : `${age}d`;
        } else {
            document.getElementById('stat-memory-age').textContent = '0d';
        }
    },

    updateLastAnalysis() {
        const el = document.getElementById('last-analysis');
        if (!el) return;

        if (!this.lastAnalysis) {
            el.textContent = 'Never';
        } else {
            const diff = Math.floor((Date.now() - this.lastAnalysis) / (1000 * 60));
            if (diff < 1) el.textContent = 'Just now';
            else if (diff < 60) el.textContent = `${diff}m ago`;
            else {
                const hours = Math.floor(diff / 60);
                if (hours < 24) el.textContent = `${hours}h ago`;
                else el.textContent = `${Math.floor(hours / 24)}d ago`;
            }
        }
    },

    // Render memory cards
    renderMemory() {
        const container = document.getElementById('memory-container');
        if (!container) return;

        const allItems = Object.entries(this.memory)
            .flatMap(([category, items]) => items.map(item => ({ ...item, category })))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (allItems.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-surface-400">
                    <i data-feather="inbox" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                    <p class="text-sm">No data in memory yet.<br>Add your first life data.</p>
                </div>
            `;
            if (window.feather) feather.replace();
            return;
        }

        container.innerHTML = allItems.map(item => this.renderMemoryCard(item)).join('');
        if (window.feather) feather.replace();
    },

    renderMemoryCard(item) {
        const categoryConfig = {
            habits: { icon: 'repeat', color: 'primary', label: 'Routine' },
            preferences: { icon: 'heart', color: 'secondary', label: 'Preference' },
            decisions: { icon: 'git-branch', color: 'amber', label: 'Decision' },
            goals: { icon: 'target', color: 'emerald', label: 'Goal' },
            constraints: { icon: 'shield', color: 'rose', label: 'Constraint' }
        };

        const config = categoryConfig[item.category];
        const title = item.name || item.preference || item.description || item.statement || item.description;
        const subtitle = item.frequency || item.category || item.outcome || item.horizon || item.type;

        return `
            <div class="memory-card memory-${item.category.slice(0, -1)} bg-white rounded-lg p-4 border border-surface-200 border-l-4 shadow-sm">
                <div class="flex items-start justify-between">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-lg bg-${config.color}-100 flex items-center justify-center flex-shrink-0">
                            <i data-feather="${config.icon}" class="w-4 h-4 text-${config.color}-600"></i>
                        </div>
                        <div>
                            <p class="font-medium text-surface-900 text-sm">${this.escapeHtml(title)}</p>
                            <p class="text-xs text-surface-500 mt-0.5">${config.label} • ${this.escapeHtml(subtitle || '')}</p>
                        </div>
                    </div>
                    <button onclick="LifeOS.remove('${item.category}', '${item.id}')" class="text-surface-400 hover:text-rose-500 transition-colors">
                        <i data-feather="x" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Pattern Detection
    detectPatterns() {
        const patterns = [];

        // Check for time-based patterns in habits
        const timeHabits = this.memory.habits.filter(h => h.time);
        if (timeHabits.length >= 2) {
            const eveningHabits = timeHabits.filter(h => {
                const hour = parseInt(h.time.split(':')[0]);
                return hour >= 18 || hour < 6;
            });
            const morningHabits = timeHabits.filter(h => {
                const hour = parseInt(h.time.split(':')[0]);
                return hour >= 6 && hour < 12;
            });

            if (eveningHabits.length > morningHabits.length) {
                patterns.push({
                    type: 'chronotype',
                    description: 'Evening-oriented productivity pattern detected',
                    evidence: eveningHabits.map(h => h.name)
                });
            }
        }

        // Check for goal-habit conflicts
        const fitnessGoals = this.memory.goals.filter(g =>
            g.statement.toLowerCase().includes('fitness') ||
            g.statement.toLowerCase().includes('workout') ||
            g.statement.toLowerCase().includes('exercise')
        );

        const skippedWorkouts = this.memory.habits.filter(h =>
            h.name.toLowerCase().includes('skip') &&
            h.name.toLowerCase().includes('workout')
        );

        if (fitnessGoals.length > 0 && skippedWorkouts.length > 0) {
            patterns.push({
                type: 'conflict',
                description: 'Goal-habit misalignment: Fitness goals vs. skipped workouts',
                evidence: [...fitnessGoals.map(g => g.statement), ...skippedWorkouts.map(h => h.name)]
            });
        }

        // Check for preference-consistency patterns
        const strongPreferences = this.memory.preferences.filter(p => p.strength === 'strong');
        if (strongPreferences.length >= 3) {
            patterns.push({
                type: 'preference_profile',
                description: 'Strong preference profile established with clear likes/dislikes',
                evidence: strongPreferences.map(p => p.preference)
            });
        }

        return patterns;
    },

    // Reasoning Engine
    // Reasoning Engine
    async analyze() {
        const context = document.getElementById('current-context').value.trim();
        const btn = document.querySelector('button[onclick="triggerAnalysis()"]');
        const originalText = btn.innerHTML;

        // Loading State
        btn.innerHTML = `<i class="animate-spin" data-feather="loader"></i> Analysis Running...`;
        btn.disabled = true;
        if (window.feather) feather.replace();

        const reasoningSection = document.getElementById('reasoning-section');
        reasoningSection.classList.remove('hidden');

        try {
            // Prepared structured data
            const memoryDump = JSON.stringify(this.memory, null, 2);

            // Construct Prompt
            const prompt = `
            You are LifeOS, a personal intelligence agent. 
            Analyze the following user data and current context to provide structured decision recommendations.
            
            USER MEMORY:
            ${memoryDump}
            
            CURRENT CONTEXT/PROBLEM:
            "${context}"
            
            Valid Categories: 'habits', 'preferences', 'decisions', 'goals', 'constraints'.
            
            INSTRUCTIONS:
            1. Identify patterns in the user's behavior based on the memory.
            2. Detect conflicts between habits, goals, and constraints.
            3. Generate 1-3 actionable recommendations to solve the context problem or improve life quality.
            4. Each recommendation must have a title, specific action, reasoning (list of strings), trade-offs (list of strings), and priority (high/medium/low).
            5. Provide the category of the recommendation (e.g., 'alignment', 'optimization', 'health', 'productivity').
            
            OUTPUT FORMAT (JSON ONLY):
            {
                "patterns": [
                    {"type": "conflict|correlation|insight", "description": "...", "evidence": ["..."]}
                ],
                "recommendations": [
                    {
                        "title": "...",
                        "action": "...",
                        "category": "...",
                        "priority": "high|medium|low",
                        "reasoning": ["..."],
                        "tradeOffs": ["..."],
                        "evidence": ["..."]
                    }
                ]
            }
            Do not include markdown formatting like \`\`\`json. Just return the raw JSON object.
            `;

            // Call Gemini API (Direct fetch for immediate usage)
            const API_KEY = 'AIzaSyDtgh9EiM-vA9-F9SWNnF6Mgu9YcQNz6gg';
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error.message);

            let resultText = data.candidates[0].content.parts[0].text;

            // Clean markdown if present
            resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(resultText);

            // Update State with Real Data
            const patterns = result.patterns || [];
            const recommendations = result.recommendations || [];

            // Store analysis
            this.analysisHistory.push({
                timestamp: new Date().toISOString(),
                context,
                patterns,
                recommendations
            });

            this.lastAnalysis = new Date();
            localStorage.setItem('lifeos_last_analysis', this.lastAnalysis.toISOString());
            localStorage.setItem('lifeos_history', JSON.stringify(this.analysisHistory));

            // Update UI
            this.updateLastAnalysis();
            this.updateStats();
            this.renderRecommendations(recommendations);

            return { patterns, recommendations };

        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed: ' + error.message);
            // Fallback to local heuristic if API fails
            const patterns = this.detectPatterns();
            const recommendations = this.generateRecommendations(patterns, context);
            this.renderRecommendations(recommendations);
            return { patterns, recommendations };
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
            if (window.feather) feather.replace();
        }
    },

    generateRecommendations(patterns, context) {
        const recommendations = [];

        // Pattern-based recommendations
        patterns.forEach(pattern => {
            if (pattern.type === 'conflict' && pattern.description.includes('fitness')) {
                recommendations.push({
                    priority: 'high',
                    category: 'alignment',
                    title: 'Shift Workouts to Evening',
                    action: 'Move your workouts to 6-8 PM to align with your natural evening productivity pattern.',
                    reasoning: [
                        'Your data shows consistent late-night productivity (coding/studying until 11 PM+)',
                        'You have a stated goal of fitness consistency',
                        'Morning workouts are frequently skipped due to low morning energy',
                        'Evening time blocks show higher consistency in habit execution'
                    ],
                    tradeOffs: [
                        'May interfere with social evening plans',
                        'Gym may be more crowded in evenings'
                    ],
                    evidence: pattern.evidence
                });
            }

            if (pattern.type === 'chronotype') {
                recommendations.push({
                    priority: 'medium',
                    category: 'optimization',
                    title: 'Protect Your Deep Work Hours',
                    action: 'Schedule demanding cognitive tasks between 8-11 PM when your data shows peak focus.',
                    reasoning: [
                        'Multiple habits cluster in evening hours with high consistency',
                        'Your preference data indicates "night productivity"',
                        'Constraint data shows morning obligations (college schedule)'
                    ],
                    tradeOffs: [
                        'Requires disciplined sleep schedule to maintain',
                        'May conflict with early morning requirements'
                    ],
                    evidence: pattern.evidence
                });
            }
        });

        // Context-based recommendations
        if (context.toLowerCase().includes('stress') || context.toLowerCase().includes('overwhelm')) {
            const obligations = this.memory.constraints.filter(c => c.type === 'obligation');
            if (obligations.length > 2) {
                recommendations.push({
                    priority: 'high',
                    category: 'constraint_management',
                    title: 'Audit External Obligations',
                    action: 'Review and potentially renegotiate 1-2 fixed obligations to create buffer time.',
                    reasoning: [
                        'Context indicates high stress/overwhelm',
                        'Constraint analysis shows multiple "fixed" obligations',
                        'Buffer time is essential for cognitive recovery'
                    ],
                    tradeOffs: [
                        'May disappoint external parties',
                        'Requires difficult conversations'
                    ],
                    evidence: ['User context input']
                });
            }
        }

        return recommendations;
    },

    renderRecommendations(recommendations) {
        const container = document.getElementById('recommendations-container');
        if (!container) return;

        if (!recommendations || recommendations.length === 0) {
            container.innerHTML = '<p class="text-surface-500 text-sm">No specific recommendations generated yet. Try adding more data.</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => {
            return `
            <div class="recommendation-card bg-white rounded-xl p-6 shadow-sm border border-surface-200">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                         <div class="text-${rec.category === 'alignment' ? 'primary' : 'secondary'}-600 bg-${rec.category === 'alignment' ? 'primary' : 'secondary'}-100 p-2 rounded-lg">
                            <i data-feather="zap" class="w-5 h-5"></i>
                         </div>
                         <div>
                            <h3 class="font-semibold text-surface-900">${rec.title}</h3>
                            <span class="text-xs uppercase tracking-wider text-surface-500 font-medium">${(rec.category || 'General').replace('_', ' ')}</span>
                         </div>
                    </div>
                     <span class="px-3 py-1 bg-surface-100 text-surface-600 rounded-full text-xs font-medium">${rec.priority || 'Medium'} Priority</span>
                </div>
                <p class="text-surface-700 mb-6 leading-relaxed">${rec.action}</p>

                <div class="space-y-4">
                    <div>
                        <h4 class="text-xs font-semibold text-surface-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                            <i data-feather="git-pull-request" class="w-3 h-3"></i> Reasoning
                        </h4>
                        <ul class="explanation-chain space-y-3">
                            ${(rec.reasoning || []).map(r => `<li class="text-sm text-surface-600 explanation-link">${r}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="pt-4 border-t border-surface-100 flex gap-4">
                         <div class="flex-1">
                             <h4 class="text-xs font-semibold text-surface-900 uppercase tracking-wide mb-2">Trade-offs</h4>
                             <ul class="list-disc list-inside space-y-1">
                                ${(rec.tradeOffs || []).map(t => `<li class="text-xs text-surface-500">${t}</li>`).join('')}
                             </ul>
                         </div>
                    </div>
                </div>
            </div>
           `;
        }).join('');
    }
};

// Auto-restore state on load
const originalInit = LifeOS.init;
LifeOS.init = function () {
    originalInit.call(this);

    // Restore recommendations if on dashboard
    if (document.getElementById('recommendations-container') && this.analysisHistory.length > 0) {
        const lastrec = this.analysisHistory[this.analysisHistory.length - 1];
        if (lastrec && lastrec.recommendations) {
            this.renderRecommendations(lastrec.recommendations);
            // Verify context availability
            const contextInput = document.getElementById('current-context');
            if (contextInput && lastrec.context) {
                contextInput.value = lastrec.context;
            }
        }
    }
};

window.scrollToInput = () => {
    const section = document.getElementById('input-section');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
};
window.switchTab = (tab) => {
    const btns = document.querySelectorAll('.tab-btn');
    if (btns.length === 0) return;

    btns.forEach(b => b.classList.remove('active', 'bg-primary-100', 'text-primary-700'));
    btns.forEach(b => b.classList.add('text-surface-600', 'hover:bg-surface-100'));

    const btn = document.getElementById(`tab-${tab}`);
    if (btn) {
        btn.classList.add('active', 'bg-primary-100', 'text-primary-700');
        btn.classList.remove('text-surface-600', 'hover:bg-surface-100');
    }

    document.querySelectorAll('.input-form').forEach(f => f.classList.add('hidden'));
    const form = document.getElementById(`form-${tab}`);
    if (form) form.classList.remove('hidden');
};

window.triggerAnalysis = () => {
    if (LifeOS && typeof LifeOS.analyze === 'function') LifeOS.analyze();
};
window.clearMemory = () => {
    if (confirm('Are you sure? This will wipe all data.')) LifeOS.clear();
};

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (form.getAttribute('data-submitting') === 'true') return;
        form.setAttribute('data-submitting', 'true');

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="animate-spin" data-feather="loader"></i> Saving...`;
        if (window.feather) feather.replace();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const categoryMap = {
            'routine': 'habits',
            'preference': 'preferences',
            'decision': 'decisions',
            'goal': 'goals',
            'constraint': 'constraints'
        };
        const actualCategory = categoryMap[form.id.replace('form-', '')];

        // Simulate small network delay for UX stability
        setTimeout(() => {
            LifeOS.add(actualCategory, data);
            form.reset();

            btn.innerHTML = `<i data-feather="check" class="w-4 h-4"></i> Saved`;
            btn.classList.add('bg-green-600', 'hover:bg-green-700', 'text-white');
            btn.classList.remove('bg-primary-600', 'hover:bg-primary-700');
            if (window.feather) feather.replace();

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-green-600', 'hover:bg-green-700', 'text-white');
                btn.disabled = false;
                form.removeAttribute('data-submitting');
                if (window.feather) feather.replace();
            }, 2000);
        }, 300);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    LifeOS.init();
});