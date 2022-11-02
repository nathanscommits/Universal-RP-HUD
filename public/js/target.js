
async function postData(url, data) {
    // Default options are marked with *
    const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}
function pay(target) {console.log(target)}
function trade(target) {console.log(target)}

var TARGET = ""
var PREVIOUS_TARGET_BUTTON_ID = ""
function target(name, id) {
    if(PREVIOUS_TARGET_BUTTON_ID != "")
        document.getElementById(PREVIOUS_TARGET_BUTTON_ID).style.background = '#fff'
    TARGET = name;
    PREVIOUS_TARGET_BUTTON_ID = id;
    document.getElementById(id).style.background = '#dba221'
    update_actions();
}