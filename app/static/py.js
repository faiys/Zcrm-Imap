
const inbox_badge = document.getElementById("inbox-badge")
inbox_badge.innerHTML = 0

ZOHO.embeddedApp.on("PageLoad", async function (data) {
    user_email = await getUser()
    inbox_emailResp = await fetchEmail()
});
ZOHO.embeddedApp.init();

async function fetchEmail(page_no=1) {
    const email_container = document.getElementById("email-container");
    email_container.innerHTML = loader()
    try {
        const response = await fetch("https://django-imap.onrender.com/inbox_view/?t=bulk&p="+page_no+"&s=10", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        // console.log("data - ",data)
        const main_data = data.emails.emails || [];

        email_container.innerHTML = "";
        if (main_data.length === 0) {
            email_container.innerHTML = "<div class='empty-msg'>No emails</div>";
            return;
        }
         
        inbox_badge.innerHTML = main_data.length;

        let title_html = ""
        main_data.forEach(m => {
            let body = m.body || "";
            let previewText = "";

            if (isMimeBody(body)) {
                previewText = "This email contains a template or attachment";
            }
            else if (isHTML(body)) {
                previewText = "HTML email — click to view";
            }
            else {
                previewText = cleanBody(body);
            }

            previewText = truncateText(previewText, 50);
            
            title_html += 
            `<div class="list-email-row" onclick='openEmailModal(${JSON.stringify(m.mail_id)})'>
                <span class="list-email-from">${m.from}</span>
                <span class="list-email-subject">${m.subject}</span>
                <!--<span class="list-email-preview" title="${cleanBody(m.body)}">
                    ${previewText}
                </span>-->
                <span class="list-email-preview">
                    ${previewText}
                </span>
                <span class="list-email-tag client">2022 CLIENT TO ...</span>
                <span class="list-email-time">${m.date  || ""}</span>
            </div>`
        });

        title_html += `<div class="pagination-wrapper">
            <div class="pagination">
                <button class="pagination-btn prev-btn" disabled>‹ Previous</button>
                <div class="page-numbers">
                    <!-- Page buttons will be generated here -->
                </div>
                <button class="pagination-btn next-btn">Next ›</button>
            </div>
        </div>
        `

        email_container.innerHTML = title_html;

        if (!window.pagination) {
            window.pagination = new Pagination(
                data.emails.total_count,
                page_no
            );
        } else {
            window.pagination.setTotalPages(data.emails.total_count);
            window.pagination.currentPage = page_no;
            window.pagination.createPagination();
            window.pagination.updatePageInfo();
        }
       

    } catch (error) {
        email_container.innerHTML = "<div class='error-msg'>Failed to load emails</div>";
        console.log("error - ", error)
    }
}

async function getUser(){
    data = await ZOHO.CRM.CONFIG.getCurrentUser()
    email = data.users[0].email
    return email
}

function cleanBody(text) {
    if (text == null) return "";
    text = String(text);
    text = text
        .replace(/[\u200c\u200b\u200d\uFEFF\u00a0]/g, " ")
        .replace(/\r?\n|\r/g, " ");
    text = text.trim();
    const isHTML =
        text.startsWith("<!DOCTYPE html") ||
        text.startsWith("<html") ||
        /<\/?[a-z][\s\S]*>/i.test(text);
    if (isHTML) {
        return "View the template details..";
    }
    return text.replace(/\s+/g, " ");
}

function truncateText(text, maxLength = 50) {
    const cleaned = cleanBody(text);
    return cleaned.length > maxLength
        ? cleaned.slice(0, maxLength) + "…"
        : cleaned;
}

function getInitials(text, count = 2) {
    if (!text) return "";
    return text.trim().slice(0, count);
}

function isMimeBody(text) {
    if (!text) return false;

    return (
        text.includes("Content-Type:") &&
        text.includes("multipart") ||
        /^--[-_A-Za-z0-9]+/m.test(text)
    );
}

function isHTML(text) {
    if (!text) return false;

    const t = text.trim();

    // Reject MIME
    if (isMimeBody(t)) return false;

    return (
        t.startsWith("<!DOCTYPE html") ||
        t.startsWith("<html") ||
        /<\/?[a-z][\s\S]*>/i.test(t)
    );
}

function loader(){
    return `<div class="loading-center"><div class="dot-loader"></div></div>`
} 

class Pagination {
    constructor(totalPages = 1, currentPage = 1) {
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.eventsBound = false;
        this.init();
    }

    init() {
        this.createPagination();
        this.updatePageInfo();

        if (!this.eventsBound) {
            this.attachEvents();
            this.eventsBound = true;
        }
    }

    createPagination() {
        const pagination = document.querySelector('.pagination .page-numbers');
        if (!pagination) return;

        pagination.innerHTML = '';

        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === this.totalPages;

        let pages = [1];

        if (this.currentPage > 3) pages.push('...');

        let start = Math.max(2, this.currentPage - 1);
        let end = Math.min(this.totalPages - 1, this.currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (this.currentPage < this.totalPages - 2) pages.push('...');

        pages = [...new Set(pages)];

        pages.forEach(page => {
            if (page === '...') {
                pagination.innerHTML += `<span class="page-dots">···</span>`;
            } else {
                pagination.innerHTML += `
                    <button class="page-btn ${page === this.currentPage ? 'active' : ''}"
                            data-page="${page}">
                        ${page}
                    </button>
                `;
            }
        });
    }

    attachEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn')) {
                this.goToPage(parseInt(e.target.dataset.page));
            }

            if (e.target.classList.contains('prev-btn')) {
                this.goToPage(this.currentPage - 1);
            }

            if (e.target.classList.contains('next-btn')) {
                this.goToPage(this.currentPage + 1);
            }
        });
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;

        this.currentPage = page;          // ✅ FIX #1
        this.createPagination();
        this.updatePageInfo();

        fetchEmail(page);                 // ✅ fetch after state update

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updatePageInfo() {
        const current = document.getElementById('currentPage');
        const total = document.getElementById('totalPages');

        if (current) current.textContent = this.currentPage;
        if (total) total.textContent = this.totalPages;
    }

    setTotalPages(totalPages) {
        this.totalPages = totalPages;
        if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
        }
        this.init();
    }
}




// class Pagination {
//     constructor(totalPages = 8, currentPage = 1) {
//     this.totalPages = totalPages;
//     this.currentPage = currentPage;
//     this.init();
//     }

//     init() {
//     this.createPagination();
//     this.attachEvents();
//     this.updatePageInfo();
//     }

//     createPagination() {
//     const pagination = document.querySelector('.pagination .page-numbers');
//     if (!pagination) return;

//     pagination.innerHTML = '';

//     // Previous button
//     const prevBtn = document.querySelector('.prev-btn');
//     prevBtn.disabled = this.currentPage === 1;

//     // Generate page buttons without end page
//     let pages = [];

//     // Always show first page
//     pages.push(1);

//     // Show dots if current page is far from start
//     if (this.currentPage > 3) {
//         pages.push('...');
//     }

//     // Show pages around current page
//     let start = Math.max(2, this.currentPage - 1);
//     let end = Math.min(this.totalPages - 1, this.currentPage + 1);

//     // Add middle pages
//     for (let i = start; i <= end; i++) {
//         if (!pages.includes(i)) {
//         pages.push(i);
//         }
//     }

//     // Show dots if current page is far from end (but not showing end page)
//     if (this.currentPage < this.totalPages - 2) {
//         if (!pages.includes('...') || pages[pages.length - 1] !== '...') {
//         pages.push('...');
//         }
//     }

//     // Remove duplicate dots
//     pages = pages.filter((page, index, self) => {
//         if (page === '...' && self[index - 1] === '...') {
//         return false;
//         }
//         return true;
//     });

//     // Create buttons
//     pages.forEach(page => {
//         if (page === '...') {
//         pagination.innerHTML += `<span class="page-dots">···</span>`;
//         } else {
//         const activeClass = page === this.currentPage ? 'active' : '';
//         pagination.innerHTML += `
//             <button class="page-btn ${activeClass}" data-page="${page}">
//             ${page}
//             </button>
//         `;
//         }
//     });

//     // Next button
//     const nextBtn = document.querySelector('.next-btn');
//     nextBtn.disabled = this.currentPage === this.totalPages;
//     }

//     attachEvents() {
//         // Page number clicks (delegation is OK)
//         document.addEventListener('click', (e) => {
//             if (e.target.classList.contains('page-btn')) {
//                 const page = parseInt(e.target.dataset.page);
//                 this.goToPage(page);
//             }
//         });

//         // Previous button
//         const prevBtn = document.querySelector('.prev-btn');
//         if (prevBtn) {
//             prevBtn.addEventListener('click', () => {
//                 if (this.currentPage > 1) {
//                     this.goToPage(this.currentPage - 1);
//                 }
//             });
//         }

//         // Next button
//         const nextBtn = document.querySelector('.next-btn');
//         if (nextBtn) {
//             nextBtn.addEventListener('click', () => {
//                 if (this.currentPage < this.totalPages) {
//                     this.goToPage(this.currentPage + 1);
//                 }
//             });
//         }
//     }


//     goToPage(page) {
//     if (page < 1 || page > this.totalPages || page === this.currentPage) return;

//     // this.currentPage = page;
//     // this.createPagination();
//     // this.updatePageInfo();
//     fetchEmail(page);

//     // Smooth scroll to top
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//     }

//     updatePageInfo() {
//         const current = document.getElementById('currentPage');
//         const total = document.getElementById('totalPages');

//         if (current) current.textContent = this.currentPage;
//         if (total) total.textContent = this.totalPages;
//     }

//     // Method to update total pages dynamically
//     setTotalPages(totalPages) {
//     this.totalPages = totalPages;
//     if (this.currentPage > totalPages) {
//         this.currentPage = totalPages;
//     }
//     this.init();
//     }
// }

