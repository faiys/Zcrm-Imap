// Add some interactive functionality
document.addEventListener('DOMContentLoaded', function() {
    // Highlight the current tab in the footer
    const tabButtons = document.querySelectorAll('.nav-link');
    const footerText = document.querySelector('.footer p');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.textContent.trim().split(' ')[0];
            footerText.innerHTML = `Currently viewing: <strong>${tabName}</strong> | Tabbed View Interface &copy; 2023`;
            
            // Update badge count for inbox when viewed (simulate reading)
            if (tabName === 'Inbox') {
                const inboxBadge = document.querySelector('#inbox-tab .tab-badge');
                if (inboxBadge && inboxBadge.textContent !== '0') {
                    setTimeout(() => {
                        inboxBadge.textContent = '0';
                        inboxBadge.style.backgroundColor = '#6c757d';
                    }, 500);
                }
            }
        });
    });
    
    // Simulate click on tab with badge for demo purposes
    setTimeout(() => {
        const notificationTab = document.querySelector('#notification-tab');
        if (notificationTab) {
            notificationTab.style.animation = 'pulse 1s 2';
            notificationTab.style.setProperty('--pulse-color', 'rgba(247, 37, 133, 0.3)');
            
            // Add CSS for pulse animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 var(--pulse-color); }
                    70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    }, 1000);
});