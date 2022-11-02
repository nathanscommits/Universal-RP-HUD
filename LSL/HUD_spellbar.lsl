
string URL = "https://rphudtesting1337.loca.lt";
key urlRequestId;
integer HOVER_CH = -8573628;
key loadRequestId;
key genRequestId;
string SimURL;
string playerName;
string rpsim = "Tatooine or bust";
// string URL = "http://afterglowgame.herokuapp.com";
refresh_url(string url) {
    llOwnerSay("Setting media");
    llSetLinkMedia(LINK_THIS, 4, [
        PRIM_MEDIA_CURRENT_URL, url,     
        PRIM_MEDIA_HOME_URL, url,    
        PRIM_MEDIA_AUTO_SCALE, FALSE,      
        PRIM_MEDIA_AUTO_LOOP, TRUE,
        PRIM_MEDIA_AUTO_ZOOM, TRUE,          
        PRIM_MEDIA_AUTO_PLAY, TRUE,        
        PRIM_MEDIA_PERMS_CONTROL, PRIM_MEDIA_PERM_ANYONE,        
        PRIM_MEDIA_WIDTH_PIXELS, 1024,         
        PRIM_MEDIA_HEIGHT_PIXELS, 1024 
    ]);
}
default {
    state_entry()  {
        //URL = URL + "/?uuid=" + (string)llGetOwner();
        urlRequestId = llRequestURL();
    }
    
    on_rez( integer start_param) {
       urlRequestId = llRequestURL();
    }

    // touch_end( integer num_detected ) {
    //     refresh_url(URL + "&time=" + (string)llGetTime());
    // }

    changed(integer change) {
        if (change & (CHANGED_OWNER | CHANGED_INVENTORY))
            llResetScript();

        if (change & (CHANGED_REGION | CHANGED_REGION_START | CHANGED_TELEPORT))
            urlRequestId = llRequestURL();
    }

    http_request(key id, string method, string body) {
        if (id == urlRequestId) {
            if (method == URL_REQUEST_DENIED)
                llOwnerSay("Error: Please contact Sharky Piggins with the following message: This error occurred while attempting to get a free URL for this device:\n \n" + body);

            else if (method == URL_REQUEST_GRANTED) {
                SimURL = body;
                llOwnerSay("URL Response: " + body);
                //llLoadURL(llGetOwner(), "Click to visit my URL!", url);
                key ownerId = llGetOwner();
                loadRequestId = llHTTPRequest(URL + "/load", 
                    [HTTP_METHOD,"POST",
                    HTTP_MIMETYPE,"application/json",
                    HTTP_VERBOSE_THROTTLE,FALSE], 
                    llList2Json(JSON_OBJECT, [
                        "url", body,
                        "uuid", ownerId,
                        "slName", llGetUsername(ownerId),
                        "playerName", playerName,
                        "onsim", llGetRegionName(),
                        "rpsim", rpsim
                    ])
                );
                
            }
        } 
    }
    http_response( key id, integer status, list metadata, string body )
    {
         if(id == loadRequestId) {
            llOwnerSay("Load Response: " + body);
            playerName = llJsonGetValue(body, ["playerName"]);
            // string data = llList2Json(JSON_ARRAY, [
            //     llGetOwner(), playerName, rpsim
            // ]);
            string data = "/" + (string)llGetOwner() + "/" + playerName + "/" + rpsim + "/?time=" + (string)llGetTime();
            // string pass = "password";
            // string crypt = llXorBase64(llStringToBase64(data), llStringToBase64(pass));
            // llOwnerSay("Crypt: " + crypt);
            refresh_url(URL + "/dashboard" + data);
        } else {
            llOwnerSay(body);
            llRegionSay(HOVER_CH, body);
        }
    }
    link_message( integer s, integer n, string m, key id )
    {
        if(n == 1 && m == "pay") {
            genRequestId = llHTTPRequest(URL + "/pay", 
            [HTTP_METHOD,"POST",
            HTTP_MIMETYPE,"application/json",
            HTTP_VERBOSE_THROTTLE,FALSE], 
            llList2Json(JSON_OBJECT, [
                "url", body,
                "uuid", ownerId,
                "slName", llGetUsername(ownerId),
                "playerName", playerName,
                "onsim", llGetRegionName(),
                "rpsim", rpsim
            ])
        );
        }
    }
}