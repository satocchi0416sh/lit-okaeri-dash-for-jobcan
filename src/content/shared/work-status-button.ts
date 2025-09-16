// Work status button management with local storage

export interface WorkStatus {
    isWorking: boolean;
    startTime: string | null;
    lastUpdated: string;
}

export class WorkStatusButton {
    private button: HTMLButtonElement;
    private status: WorkStatus;
    private storageKey = 'jobcan_work_status';
    private originalOnClick: string | null;

    constructor(buttonElement: HTMLButtonElement) {
        this.button = buttonElement;
        this.originalOnClick = this.button.getAttribute('onclick');
        this.status = this.loadStatus();
        this.init();
    }

    private init() {
        // Remove static "未出勤" display
        const workingStatusElement = document.getElementById('working_status');
        if (workingStatusElement) {
            workingStatusElement.style.display = 'none';
        }

        // Check if it's a new day and reset if needed
        this.checkNewDay();

        // Update button appearance
        this.updateButton();

        // Setup event listeners
        this.setupEventListeners();

        // Add reset button
        this.addResetButton();
    }

    private loadStatus(): WorkStatus {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved status', e);
            }
        }
        return {
            isWorking: false,
            startTime: null,
            lastUpdated: new Date().toISOString()
        };
    }

    private saveStatus() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.status));
    }

    private checkNewDay() {
        if (!this.status.lastUpdated) return;

        const lastDate = new Date(this.status.lastUpdated);
        const today = new Date();

        // Reset if it's a new day
        if (lastDate.toDateString() !== today.toDateString()) {
            this.resetStatus();
        }
    }

    private resetStatus() {
        this.status = {
            isWorking: false,
            startTime: null,
            lastUpdated: new Date().toISOString()
        };
        this.saveStatus();
        this.updateButton();
    }

    private toggleStatus() {
        this.status.isWorking = !this.status.isWorking;
        if (this.status.isWorking) {
            this.status.startTime = new Date().toISOString();
        } else {
            this.status.startTime = null;
        }
        this.status.lastUpdated = new Date().toISOString();
        this.saveStatus();
        this.updateButton();
    }

    private updateButton() {
        // Remove original onclick
        this.button.removeAttribute('onclick');
        
        // Clear button content
        this.button.innerHTML = '';
        
        // Create button content based on status
        if (this.status.isWorking) {
            // Red stop button for working status
            this.button.className = 'btn btn-block jbc-btn-danger work-status-btn';
            this.button.innerHTML = this.createStopIcon();
        } else {
            // Green play button for not working status
            this.button.className = 'btn btn-block jbc-btn-success work-status-btn';
            this.button.innerHTML = this.createPlayIcon();
        }
    }

    private createPlayIcon(): string {
        return `
            <div class="work-status-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="work-status-icon">
                    <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
                <span class="work-status-text">出勤する</span>
            </div>
        `;
    }

    private createStopIcon(): string {
        return `
            <div class="work-status-icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="work-status-icon">
                    <rect x="6" y="6" width="12" height="12"></rect>
                </svg>
                <span class="work-status-text">退勤する</span>
            </div>
        `;
    }

    private setupEventListeners() {
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Call original Jobcan function safely
            if (this.originalOnClick) {
                // Extract the function name and parameter
                const match = this.originalOnClick.match(/set_value\(['"](.+)['"]\)/);
                if (match && (window as any).set_value) {
                    (window as any).set_value(match[1]);
                }
            }
            
            // Toggle our status
            this.toggleStatus();
        });
    }

    private addResetButton() {
        const buttonContainer = this.button.parentElement?.parentElement;
        if (!buttonContainer) return;

        const resetDiv = document.createElement('div');
        resetDiv.className = 'col-12 mt-2 text-center';
        resetDiv.innerHTML = `
            <button id="reset-work-status" class="btn btn-sm btn-outline-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1" style="display: inline-block; vertical-align: middle;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                状態をリセット
            </button>
        `;
        
        buttonContainer.appendChild(resetDiv);

        const resetButton = document.getElementById('reset-work-status');
        if (resetButton) {
            resetButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('出勤状態をリセットしますか？')) {
                    this.resetStatus();
                }
            });
        }
    }
}

// Factory function
export function createWorkStatusButton(buttonElement: HTMLButtonElement): WorkStatusButton {
    return new WorkStatusButton(buttonElement);
}