integer CH = -2872362;
string NAME;
string HEALTH;
string SHIELD;
vector COLOR;
default {
    state_entry()
    {
        llListen(CH, "", "", "");
    }

    listen( integer c, string n, key id, string m )
    {
        if(llGetOwner() != llGetOwnerKey(id)) return;

        if(~llSubStringIndex(m, "name") && ~llSubStringIndex(m, "health") && ~llSubStringIndex(m, "shield")) {
            NAME = llJsonGetValue(m, ["name"]);
            HEALTH = llJsonGetValue(m, ["health"]);
            SHIELD = llJsonGetValue(m, ["shield"]);
            llSetText(SHIELD + "\n" + HEALTH + "\n" + NAME, COLOR, 1);
        } else {
            llSetText(m, COLOR, 1);
            llSetTimerEvent(60);
        }
    }

    timer()
    {
        llSetTimerEvent(0);
        llSetText(SHIELD + "\n" + HEALTH + "\n" + NAME, COLOR, 1);
    }
}