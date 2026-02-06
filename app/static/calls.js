const callsBadge = document.getElementById("calls-badge");
const callId = document.getElementById("calls-id");
callId.innerHTML = "";
async function renderCalls(ReportName){
    const data =  await fetchRecord(ReportName)
    callsBadge.innerHTML = data.length
    for (const cont_ele of data) {
         let callType = "";
         if(cont_ele.Call_Type === "Missed")
         {
            callType = "missed";
         }
         else if(cont_ele.Call_Type === "Inbound")
         {
            callType = "incoming";
         }
         else{
            callType = "outgoing";
         }
         callId.innerHTML += `<div class="call-item data-callId = ${cont_ele.id}">
                <div class="call-icon">
                    <i class="bi bi-telephone-inbound" style="font-size: 20px;"></i>
                </div>
                <div class="call-content">
                    <div class="call-person">${cont_ele.Subject}</div>
                    <div class="call-time"><span>${cont_ele.Created_Time}</span> . Duration - ${cont_ele.Call_Duration}</div>
                </div>
                <div class="call-type ${callType}">${cont_ele.Call_Type}</div>
            </div>`
    }
}
