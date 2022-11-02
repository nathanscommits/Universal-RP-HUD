key HTTP_REQUEST_ID; 
string URL = "https://rphudtesting1337.loca.lt/update-positions";
default
{
    state_entry()
    {
        llSetTimerEvent(1);

    }
    timer()
    {
        llSetTimerEvent(0);
        list avatarsInRegion = llGetAgentList(AGENT_LIST_REGION, []);
        integer numOfAvatars = llGetListLength(avatarsInRegion);

        // if no avatars, abort avatar listing process and give a short notice
        if (!numOfAvatars)
        {
            llWhisper(0, "No avatars found within this region!");
            return;
        }

        list avatar_details;
        integer index;
        while (index < numOfAvatars)
        {
            key id = llList2Key(avatarsInRegion, index);
            list details = llGetObjectDetails(id, [OBJECT_POS]);
            vector pos = llList2Vector(details, 0);
            string name = llKey2Name(id);

            avatar_details += llList2Json(JSON_OBJECT, [
                "name", name,
                "pos", pos,
                "uuid", id
            ]);
            ++index;
        }
        
        HTTP_REQUEST_ID = llHTTPRequest(URL,  [HTTP_METHOD,"POST",
        HTTP_MIMETYPE,"application/json",
        HTTP_VERBOSE_THROTTLE,FALSE], llList2Json(JSON_OBJECT, 
        [
            "positions", llList2Json(JSON_ARRAY, avatar_details),
            "region", llGetRegionName()
        ]
        ));

        // llOwnerSay(llDumpList2String(avatar_details, ",\n"));
    }

    http_response( key request_id, integer status, list metadata, string body )
    {
        if(request_id == HTTP_REQUEST_ID) 
            llWhisper(0, "res: (" + (string)status + ") " + body);
        else 
            llWhisper(0, "Unknown response: " + body);
    }

}