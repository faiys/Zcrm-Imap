
async function fetchRecord(modul){
    try{
       const resp = await ZOHO.CRM.API.getAllRecords({
            Entity: modul,
            sort_order: "desc",
            per_page: 200,
            page: 1
        });
        // console.log("resp = ",resp)
        return resp.data;
    }
    catch (e){
        return e
    }
}

async function fetchRelatedRecords(modul, recordId, relatedModule){
    try{
       const resp = await ZOHO.CRM.API.getRelatedRecords({
            Entity: modul,
            RecordID: recordId,
	        RelatedList: relatedModule,
            per_page: 200,
            page: 1
        });
        return resp.data;
    }
    catch (e){
        return e
    }
}