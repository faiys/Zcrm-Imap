
const message_count_id = document.getElementById("message-count-id");
const whatsapp_id = document.getElementById("whatsapp-id");
const insta_id = document.getElementById("insta-id");

async function renderContact(ReportName, type){
    let data = null
    if(type === "contact"){
        data = await fetchRecord(ReportName);
    }
    let whatsCount = 0;
    let instaCount = 0;
    for (const cont_ele of data) {
        // console.log("Social - ",await fetchRelatedRecords("Contacts", cont_ele.id, "Social"))

        // Whatsapp
        const whatsappresp = await fetchRelatedRecords("Contacts", cont_ele.id, "messages__s")
        if(whatsappresp){
            whatsappresp.forEach(mes => {
                whatsCount = whatsappmessageHTML(mes, "whatsapp", whatsCount)
            });
        }
        // Instagram
        const instaResp = await fetchRelatedRecords("Contacts", cont_ele.id, "Zoho_Support")
        if(instaResp){
            instaResp.forEach(inst => {
                instaCount = whatsappmessageHTML(inst, "insta", instaCount)
            });
        }
        const messagecnt = whatsCount + instaCount;
        message_count_id.textContent = messagecnt
    }
    if(whatsCount === 0){
        whatsapp_id.innerHTML = `<div class="text-center m3">No message</div>`
    }
    if(instaCount === 0){
        insta_id.innerHTML = `<div class="text-center m3">No message</div>`
    }
}

function whatsappmessageHTML(data, type, count){
    
    if(type === "whatsapp"){
        if(data.message_service__s === "WHATSAPP"){
            count+=1
            const avatar_text =data?.sender__s?.name? data.sender__s.name.slice(0, 2).toUpperCase(): "NA";
            whatsapp_id.innerHTML +=`<div class="message-item" data-messageId = ${data.id}>
                <div class="message-avatar">${avatar_text}</div>
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-sender">${data.sender__s.name}</div>
                        <div class="message-time">${data.message_time__s}</div>
                    </div>
                    <div class="message-text">${data.last_message__s}</div>
                </div>
            </div>`;
        }
    }
    if(type === "insta"){
        if (data.channel === "KL" || data.channel === "Instagram"){
            count+=1
            const avatar_text =data?.contact?.lastName? data.contact.lastName.slice(0, 2).toUpperCase(): "NA";
            insta_id.innerHTML +=`<div class="message-item" data-messageId = ${data.id}>
                <div class="message-avatar">${avatar_text}</div>
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-sender">${data.contact.lastName}</div>
                        <div class="message-time">${data.createdTime}</div>
                    </div>
                    <div class="message-text">${data.subject}</div>
                </div>
            </div>`;
        }
    }
    return count
}
