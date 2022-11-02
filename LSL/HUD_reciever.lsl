key urlRequestId;
string url;
key HTTP_REQUEST_ID;
// string URL = "https://afterglow.loca.lt";
string URL = "http://afterglowgame.herokuapp.com";
// string URL = "https://afterglow2.loca.lt";
float VERSION = 0.1;

post(string url, string json){
    HTTP_REQUEST_ID = llHTTPRequest(URL+url, 
        [HTTP_METHOD,"POST",
        HTTP_BODY_MAXLENGTH, 8000,
        HTTP_MIMETYPE,"application/json",
        HTTP_VERBOSE_THROTTLE,FALSE], 
        json
    );
}

integer NEARBY;
key CAST_TARGET;
key CAST_UUID;
integer CAST_SPELL;
cast(key uuid, key target, integer spell){
    animate("AD_Cast_Forward_1");
    llSetTimerEvent(2);
    COOLDOWN_BOOL = TRUE;
    CAST_TARGET = target;
    CAST_UUID = uuid;
    CAST_SPELL = spell;
    // llSensor("", "", AGENT, 20, PI);
    llMessageLinked(LINK_THIS, 11, "", "request_agents");
}

// string LAST_ANIM;
animate(string animation) {
    //animate!
    integer num = llGetInventoryNumber(INVENTORY_ANIMATION);
    while(num--) {
        string name = llGetInventoryName(INVENTORY_ANIMATION, num);
        if(name == animation) {
                llStartAnimation(animation);
            // if(start) {
                // if(LAST_ANIM != "")llStopAnimation(LAST_ANIM);
                // LAST_ANIM = animation;
            // } 
        }
    }
    
    // llOwnerSay("Animating: "+animation);
}
teleport(vector coord, vector lookat) {
    //teleport!
    // llOwnerSay("teleporting: "+(string)coord);
    llTeleportAgent(llGetOwner(), "", coord, lookat);
}
attach_object(string item) {
    //attach!
    // llOwnerSay("attaching: "+item);
    //rez object that auto attaches
}
cam(list params) {
    //cam!
    if(params == ["clear"]) llClearCameraParams();
    else {
        llClearCameraParams();
        llSetCameraParams(params);
    }
    // llOwnerSay("Camming: "+llDumpList2String(params, ",\n"));
}

integer TARGET_CH = -8143425; integer COOLDOWN_BOOL; key TARGET; integer REZ_CHANNEL = -9247974;
list COLLISION_OBJECTS; list SENSOR_OBJECTS; string STATS; 
vector LKL; 
integer HUD_COMS = -235242;
string ECTO;
string ECTO_MAX;
string BONE;

PARSE_HTTP(string body) {
    // llOwnerSay(body);
    if(llJsonGetValue(body, ["display"]) != JSON_INVALID) {
        STATS = llJsonGetValue(body, ["display"]);
        list stats = llJson2List(STATS);
        ECTO = (string)llList2Integer(stats, 0);
        ECTO_MAX = (string)llList2Integer(stats, 1);
        BONE = (string)llList2Integer(stats, 4);
        llMessageLinked(LINK_THIS, 2, llJsonGetValue(body, ["display"]), "display");
        // llRegionSay(HUD_COMS, "/spellbar/"+ECTO+"/"+ECTO_MAX+"/"+PK+"/"+PK_MAX+"/"+llKey2Name(TARGET)+"/"+BONE+"/");
    }
    //cooldown control
    if(llJsonGetValue(body, ["cooldown"]) != JSON_INVALID && llJsonGetValue(body, ["cooldown"]) != JSON_NULL){
        COOLDOWN_BOOL = TRUE;
        llSetTimerEvent(((float)llJsonGetValue(body, ["cooldown"])+1));
        // llRegionSay(HUD_COMS, "COOLDOWN:"+llJsonGetValue(body, ["cooldown"]));
    }
    //animate agent
    if(llJsonGetValue(body, ["animate"]) != JSON_INVALID) animate(llJsonGetValue(body, ["animate"]));
    //play sound
    if(llJsonGetValue(body, ["sound"]) != JSON_INVALID && llJsonGetValue(body, ["sound"]) != "") llTriggerSound(llJsonGetValue(body, ["sound"]), 1);
    //play particle
    if(llJsonGetValue(body, ["particle"]) != JSON_INVALID) llParticleSystem(llParseString2List(llJsonGetValue(body, ["particle"]), [","], [""]));
    //rez object
    if(llJsonGetValue(body, ["rez_object"]) != JSON_INVALID) llRegionSay(REZ_CHANNEL, llJsonGetValue(body, ["rez_object"])); //llRezObject(llJsonGetValue(body, ["rez_object"]), llGetPos(), <0,0,0>, llGetRot(), 0);
    //control movement
    if(llJsonGetValue(body, ["impulse"]) != JSON_INVALID) llMessageLinked(LINK_THIS, 6, llJsonGetValue(body, ["impulse"]), "IMPULSE");
    //teleport
    if(llJsonGetValue(body, ["teleport"]) != JSON_INVALID) teleport((vector)llJsonGetValue(body, ["teleport"]), (vector)llJsonGetValue(body, ["lookat"]));
    //say something
    if(llJsonGetValue(body, ["say"]) != JSON_INVALID) llSay(0, llJsonGetValue(body, ["say"]));
    //owner say something
    if(llJsonGetValue(body, ["owner_say"]) != JSON_INVALID) llOwnerSay(llJsonGetValue(body, ["owner_say"]));
    //attach
    if(llJsonGetValue(body, ["attach"]) != JSON_INVALID) attach_object(llJsonGetValue(body, ["attach"]));
    //camera
    if(llJsonGetValue(body, ["camera"]) != JSON_INVALID) cam(llParseString2List(llJsonGetValue(body, ["camera"]), [","], [""]));
    
    if(llJsonGetValue(body, ["aoe_attack"]) != JSON_INVALID) {
        llMessageLinked(LINK_THIS, 5, llJsonGetValue(body, ["aoe_attack"]), "aoe_attack");
    }
    if(llJsonGetValue(body, ["summon"]) != JSON_INVALID) {
        llMessageLinked(LINK_THIS, 8, llJsonGetValue(body, ["summon"]), "summon");
    }

    
}

INNIT(){
    //will need to reset buffs/stats on server and tp to landing everytime hud is attached
    urlRequestId = llRequestURL();
    llListen(13, "", llGetOwner(), "");
    llListen(TARGET_CH, "", "", "");
    TARGET = llGetOwner();
    llParticleSystem([]);
    llMessageLinked(LINK_THIS, 5, "EXPERIENCE_ACCEPTED", "");
}
default{

    state_entry()
    {
        llRequestExperiencePermissions(llGetOwner(), "");
    }

    experience_permissions(key agent_id)
    {
        llSay(0, "Experience permissions granted for " + (string)agent_id);
        INNIT();
    }

    experience_permissions_denied( key agent_id, integer reason )
    {   // Permissions denied, so go away
        llSay(0, "Denied experience permissions for " + (string)agent_id + " due to reason #" + (string) reason);
        // llDie();
        llSleep(5);
        llResetScript();
    }

    timer()
    {
        //manage cooldowns
        COOLDOWN_BOOL = FALSE;
        llSetTimerEvent(0);
        //manage spell durations
    }

    listen( integer c, string name, key id, string m )
    {
        //recieve new targets
        //recieve spell requests
        if(c == 13){
            if(m == "reset") {
                llMessageLinked(LINK_THIS, -1, "reset", "");
                llResetScript();
            }
            if(COOLDOWN_BOOL) {
                llOwnerSay("Spells are still on cooldown!");
                return;
            }
            cast(llGetOwner(), TARGET, (integer)m);
        } else if(c == TARGET_CH) {
            TARGET = llGetOwnerKey(id);
            llOwnerSay("Targeting " + llKey2Name(llGetOwnerKey(id)));
             post("/target_update", llList2Json(JSON_OBJECT, [
                "target", (string)TARGET,
                "target_name", llKey2Name(TARGET),
                "uuid", llGetOwner()
            ]));
        }
        //if on cooldown, return
    }

    on_rez(integer start_param)
    {
        llResetScript();
    }
 
    changed(integer change)
    {
        if (change & (CHANGED_OWNER | CHANGED_INVENTORY))
            llResetScript();
    
        if (change & (CHANGED_REGION | CHANGED_REGION_START))
            urlRequestId = llRequestURL();
    }

    touch_end( integer num_detected )
    {
        // llSay(0, urlRequestId);
        if(llDetectedKey(0) != llGetOwner()) llRegionSayTo(llDetectedKey(0), TARGET_CH, "TARGET");
        else {
            TARGET = llGetOwner();
            post("/target_update", llList2Json(JSON_OBJECT, [
                "target", (string)TARGET,
                "target_name", llKey2Name(TARGET),
                "uuid", llGetOwner()
            ]));
            llOwnerSay("Targeting yourself");
        }
    }


    collision( integer num )
    {
        COLLISION_OBJECTS = [];
        while(num--){
            COLLISION_OBJECTS += llDetectedName(num);
        }
    }
    

    http_request( key id, string method, string body )
    {
        // llOwnerSay("req: (" + (string)method + ") " + body);
        // llHTTPResponse(request_id, 202, "Roger");

        if (id == urlRequestId) {
            if (method == URL_REQUEST_DENIED)
                llOwnerSay("The following error occurred while attempting to get a URL for this HUD, try reattaching it again later:\n \n" + body);

            else if (method == URL_REQUEST_GRANTED) {
                url = body;
                // llLoadURL(llGetOwner(), "Click to visit my URL!", url);
                // llOwnerSay("new URL generated:\n \n" + body);
                post("/update_url", llList2Json(JSON_OBJECT, [
                    "url", body,
                    "uuid", llGetOwner(),
                    "slname", llKey2Name(llGetOwner()),
                    "coord", llGetPos(),
                    "sim", llGetRegionName(),
                    "version", VERSION
                ]));
            }
            return;
        }

        //else if(id == HTTP_REQUEST_ID) {
        //send resource/ecto/level/exp/bones to hud
            PARSE_HTTP(body);
        //}
    }

    http_response( key request_id, integer status, list metadata, string body )
    {
        // llOwnerSay("res: (" + (string)status + ") " + body);
        PARSE_HTTP(body);
    }

    link_message( integer s, integer n, string m, key id )
    {
       if(n == 10 && id == "agents") {
            // llOwnerSay("Agents ready, posting...");
            NEARBY = llGetListLength(llJson2List(m));
            vector pos = llGetPos();
            list target_info = llGetObjectDetails(CAST_TARGET, [OBJECT_POS]);
            vector target_pos = llList2Vector(target_info, 0);
            string json = llList2Json(JSON_OBJECT, [
                "uuid", CAST_UUID,
                "slname", llKey2Name(CAST_UUID),
                "target", CAST_TARGET,
                "target_name", llKey2Name(CAST_TARGET),
                "target_pos", target_pos,
                "target_distance", llVecDist(pos, target_pos),
                "spell", CAST_SPELL,
                "coord", pos,
                "sim", llGetRegionName(),
                "version", VERSION,
                "nearby", m,
                "nearby_num", NEARBY
            ]);
            // llOwnerSay(json);
            post("/castspell", json);
        }
    }


}