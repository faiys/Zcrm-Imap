async function getUser() {
    const user_resp = await ZOHO.CRM.CONFIG.getCurrentUser();

    if (user_resp) {
        console.log("user_resp - ", user_resp);
    }

    return user_resp;
}
(async () => {
    const user = await getUser();
    console.log("Final user:", user);
})();