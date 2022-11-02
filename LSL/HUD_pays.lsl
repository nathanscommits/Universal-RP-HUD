integer CH = 0;
float TIME = 20; //minutes
integer POSTED = FALSE;
integer LISTENED = FALSE;
string RPSIM = "swrp";
key HTTP_REQUEST_ID; 
string URL = "https://rphudtesting1337.loca.lt/pay";

default {
    state_entry()
    {
        llListen(CH, "", "", "");
        llSetTimerEvent(TIME * 60);
    }

    listen( integer c, string n, key id, string m )
    {
        if(llGetOwner() == llGetOwnerKey(id)) {
            POSTED = TRUE;
        } else {
            LISTENED = TRUE;
        }
        
    }

    timer()
    {
        if(POSTED && LISTENED) {
            POSTED = FALSE;
            LISTENED = FALSE;
            // llMessageLinked(LINK_THIS, 1, "pay", "");
            HTTP_REQUEST_ID = llHTTPRequest(URL,  
                [
                    HTTP_METHOD,"POST",
                    HTTP_MIMETYPE,"application/json",
                    HTTP_VERBOSE_THROTTLE,FALSE
                ], 
                llList2Json(JSON_OBJECT, 
                    [
                        "uuid", llGetOwner(),
                        "rpsim", RPSIM
                    ]
                )
            );
        }
    }

    changed( integer change )
    {
        if(change & CHANGED_OWNER) llResetScript();
    }
}