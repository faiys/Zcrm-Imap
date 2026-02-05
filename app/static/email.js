document.addEventListener('DOMContentLoaded', function() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            navTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const selectedTab = document.getElementById(`${tabId}-tab`);
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
        });
    });
});

function openEmailModal(mail_id) {
    const modal = document.getElementById("email-modal");
    const backdrop = document.getElementById("modal-backdrop");
    const body = document.getElementById("email-modal-body");

    document.body.style.overflow = "hidden";

    // loader
    body.innerHTML = `
        <div class="loading-center">
            <div class="dot-loader"></div>
        </div>
    `;

    modal.classList.add("show");
    backdrop.classList.add("show");

    fetch("https://django-imap.onrender.com/inbox_view/?t=single&id=" + mail_id)
        .then(resp => resp.json())
        .then(data => renderEmail(data.emails))
        .catch(err => {
            body.innerHTML = `<p style="padding:1rem">Fetch error: ${err}</p>`;
        });
}

function closeEmailModal() {
    document.getElementById("email-modal").classList.remove("show");
    document.getElementById("modal-backdrop").classList.remove("show");

    document.body.style.overflow = "";
}

document.getElementById("modal-backdrop").addEventListener("click", closeEmailModal);
    
document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeEmailModal();
});

function renderEmail(email) {
    const body = document.getElementById("email-modal-body");

    body.innerHTML = `
        <div class="email-header">
            <div class="email-modal-header">
                <h1 class="email-subject">${escapeHTML(email.subject || "")}</h1>
                <button class="close-btn" onclick="closeEmailModal()">×</button>
            </div>

            <div class="email-meta">
                <span><strong>From:</strong> ${escapeHTML(email.from_name || "")}
                &lt;${escapeHTML(email.from_address || "")}&gt;</span>
                <span><strong>Sent:</strong> ${escapeHTML(email.date || "")}</span>
            </div>

            <div class="recipients-section mt-3">
                <div>
                    <span class="recipient-label">To:</span>
                    <span class="recipient-address">${escapeHTML(email.to_address) || ""}</span>
                </div>
                <div class="mt-2">
                    <span class="recipient-label">Cc:</span>
                    <span class="recipient-address">${escapeHTML(email.cc_address) || ""}</span>
                </div>
            </div>
        </div>

        <div class="email-body">
            <div class="sender-info">
                <div class="sender-avatar">${getInitials(email.from_address)}</div>
                <div>
                    <h5 class="email-subject">${escapeHTML(email.from_name || "")}</h5>
                    <p class="recipients-section">${escapeHTML(email.from_address || "")}</p>
                </div>
            </div>

            <div class="email-content" id="email-content"></div>
        </div>
    `;

    renderEmailContent(email);
}

function renderEmailContent(email) {
    const container = document.getElementById("email-content");

    if (email.html_body) {
        container.innerHTML = `
            <iframe id="email-iframe"
                sandbox="allow-same-origin"
                class="email-iframe"></iframe>
        `;

        const iframe = document.getElementById("email-iframe");

        iframe.onload = () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;

                const resize = () => {
                    iframe.style.height = doc.body.scrollHeight + "px";
                };

                resize();

                // Recalculate when images load
                doc.body.querySelectorAll("img").forEach(img => {
                    img.onload = resize;
                });
            } catch (e) {
                console.warn("Iframe resize blocked", e);
            }
        };

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <style>
                        body {
                            margin: 0;
                            padding: 16px;
                            font-family: Arial, sans-serif;
                            overflow: hidden;
                            background-color: #ffffff !important
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    ${email.html_body}
                </body>
            </html>
        `);
        doc.close();

    } else {
        container.innerText = cleanBody(email.text_body || "");
    }
}

function escapeHTML(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function cleanBody(text) {
    return String(text || "")
        .replace(/[\u200c\u200b\u200d\uFEFF\u00a0]/g, " ")
        .replace(/\r?\n|\r/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getInitials(name) {
    return name ? name.trim().slice(0, 2).toUpperCase() : "?";
}
