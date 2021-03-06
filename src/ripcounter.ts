export class RipCounter{

    game: string;
    store: any;
    RipCounterMap: Map<string, number[]>;
    ripcounterSettings = {
        active: false,
        rip_command_alias: [""],
        addrip_command_alias: [""],
        addgrip_command_alias: [""],
        setrip_command_alias: [""],
        setgrip_command_alias: [""],
        rip_role_mod: false,
        rip_role_sub: false,
        rip_role_super: false,
        addrip_role_mod: false,
        addrip_role_sub: false,
        addrip_role_super: false,
        addgrip_role_mod: false,
        addgrip_role_sub: false,
        addgrip_role_super: false,
        setrip_role_mod: false,
        setrip_role_sub: false,
        setrip_role_super: false,
        setgrip_role_mod: false,
        setgrip_role_sub: false,
        setgrip_role_super: false,
        rip_message: "",
        addrip_message: "",
        addgrip_message: "",
        setrip_message: "",
        setgrip_message: "",
        rip_cooldown: 30
    }
    ripcounter_map: any[];
    cooldown: boolean = false;


    constructor(localStore: any) {
        console.log('TEST 1');
        this.store = localStore;
        if(this.store.has('ripcounter_map')){
            this.ripcounter_map = JSON.parse(this.store.get('ripcounter_map'));
            this.RipCounterMap = new Map();
            this.ripcounter_map.forEach((item: any, index: any) => {
                this.RipCounterMap.set(item.game, [item.rip,item.grip]);
            });
            //this.RipCounterMap = new Map(JSON.parse(this.store.get('ripcounter_map')));
        }else{
            this.RipCounterMap = new Map();
            //this.RipCounterMap.set('Chicken Police', [5,3]);
            this.ripcounter_map = [];
            let ripEntry = {
                game: "Chicken Police",
                rip: 10,
                grip: 4
            }
            this.ripcounter_map.push(ripEntry);
            this.store.set('ripcounter_map',JSON.stringify(this.ripcounter_map));
        }
        console.log('TEST 2');
        
        if(this.store.has('ripcounter_settings')){
            console.log('ripcounter_SETTINGS found');

            let ripsettings_json = JSON.parse(this.store.get('ripcounter_settings'));
            
            this.ripcounterSettings.active = ripsettings_json.active;

            console.log('ripcounter active?: ' + this.ripcounterSettings.active);
            //roles
            //rip
            this.ripcounterSettings.rip_role_mod = ripsettings_json.rip_role_mod;
            this.ripcounterSettings.rip_role_sub = ripsettings_json.rip_role_sub;
            this.ripcounterSettings.rip_role_super = ripsettings_json.rip_role_super;
            //addrip
            this.ripcounterSettings.addrip_role_mod = ripsettings_json.addrip_role_mod;
            this.ripcounterSettings.addrip_role_sub = ripsettings_json.addrip_role_sub;
            this.ripcounterSettings.addrip_role_super = ripsettings_json.addrip_role_super;
            //addgrip
            this.ripcounterSettings.addgrip_role_mod = ripsettings_json.addgrip_role_mod;
            this.ripcounterSettings.addgrip_role_sub = ripsettings_json.addgrip_role_sub;
            this.ripcounterSettings.addgrip_role_super = ripsettings_json.addgrip_role_super;
            //setgrip
            this.ripcounterSettings.setrip_role_mod = ripsettings_json.setrip_role_mod;
            this.ripcounterSettings.setrip_role_sub = ripsettings_json.setrip_role_sub;
            this.ripcounterSettings.setrip_role_super = ripsettings_json.setrip_role_super;
            //setgrip
            this.ripcounterSettings.setgrip_role_mod = ripsettings_json.setgrip_role_mod;
            this.ripcounterSettings.setgrip_role_sub = ripsettings_json.setgrip_role_sub;
            this.ripcounterSettings.setgrip_role_super = ripsettings_json.setgrip_role_super;
            //aliases
            this.ripcounterSettings.rip_command_alias = ripsettings_json.rip_command_alias;
            this.ripcounterSettings.addrip_command_alias = ripsettings_json.addrip_command_alias;
            this.ripcounterSettings.addgrip_command_alias = ripsettings_json.addgrip_command_alias;
            this.ripcounterSettings.setrip_command_alias = ripsettings_json.setrip_command_alias;
            this.ripcounterSettings.setgrip_command_alias = ripsettings_json.setgrip_command_alias;
            //messages
            this.ripcounterSettings.rip_message = ripsettings_json.rip_message;
            this.ripcounterSettings.addrip_message = ripsettings_json.addrip_message;
            this.ripcounterSettings.addgrip_message = ripsettings_json.addgrip_message;
            this.ripcounterSettings.setrip_message = ripsettings_json.setrip_message;
            this.ripcounterSettings.setgrip_message = ripsettings_json.setgrip_message;
            //cooldown
            this.ripcounterSettings.rip_cooldown = ripsettings_json.rip_cooldown;

        }else{
            //init ripcounter settings
            this.store.set('ripcounter_settings', JSON.stringify(this.ripcounterSettings));
        }
        
      }

    updateRipcounterSettingsSimple(){
        this.store.set('ripcounter_settings', JSON.stringify(this.ripcounterSettings));
    }

    getRipcounterMap(){
        return this.RipCounterMap;
    }

    getAllRips(type: string): number{
        let all_rips:number = 0; 
        this.RipCounterMap.forEach((value: any, key: any) => {
            if(type == 'grip'){
                all_rips += value[1];
            }else{
                all_rips += value[0];
            }
        });

        return all_rips;
    }

    updateRipcounterMapByGame(game: string, rip: number, grip: number){
        //console.log('game: ' + game + ' rip: ' + rip + ' grip: ' + grip);
        if(this.RipCounterMap.has(game)){
            this.RipCounterMap.set(game, [rip,grip]);
            this.saveRipMap();
        }
    }

    deleteEntryFromRipcounterMapByGame(game: string){
        if(this.RipCounterMap.has(game)){
            this.RipCounterMap.delete(game);
            this.saveRipMap();
        }
    }

    activateCooldown(){
        if(this.ripcounterSettings.rip_cooldown > 0){
            this.cooldown = true;
            setTimeout(() => {
                this.cooldown = false;
            }, this.ripcounterSettings.rip_cooldown * 1000);
        }
    }

    canUse(userstate: any, mod_only: boolean, sub_only: boolean, isrip: boolean, isWhisper: boolean){
        console.log(userstate);
        let badges = userstate.badges;
        console.log('can _USE: mod:' + mod_only + ' sub:' + sub_only + ' isrip:' + isrip + ' sooldown:' + this.cooldown);
        if(userstate['mod']){//check if mod
            console.log('canUse: mod');
            return true;
        }else if(sub_only && userstate['subscriber'] && !this.cooldown && isrip){//subonly = true, cooldown = false
            console.log('canUse: subonly = true, cooldown = false');
            return true;
        }else if(sub_only && userstate['subscriber'] && !isrip){//subonly = true
            console.log('canUse: subscriber');
            return true;
        }else if(!mod_only && !sub_only && !this.cooldown){
            console.log('canUse: subscriber');
            return true;
        }else if(!mod_only && !sub_only && this.cooldown && isWhisper){
            console.log('canUse: whut');
            return true;
        }else if(!mod_only && !sub_only && !isrip){
            console.log('canUse: egal');
            return true;
        }else if(badges != null){//check if broadaster
            console.log('canUse: badges null');
            if(badges.hasOwnProperty('broadcaster')){
                return true;
            }
        }else{
            console.log('canUse: false');
            return false;
        }
    }

    addRip(currentGame: string, type: string){
        console.log('ADD RIP');
        //game already on list
        if(this.RipCounterMap.has(currentGame)){
           let rip = this.RipCounterMap.get(currentGame)[0];
           let grip = this.RipCounterMap.get(currentGame)[1];
           rip++;
           if(type == 'grip'){
               grip++;
           }
           this.RipCounterMap.get(currentGame)[0] = rip;
           this.RipCounterMap.get(currentGame)[1] = grip;
           this.saveRipMap();
        }else{//game not on list
            if(type == 'grip'){
                this.RipCounterMap.set(currentGame, [1,1]);
            }else{
                this.RipCounterMap.set(currentGame, [1,0]);
            }
            this.saveRipMap();
        }
    }

    setRip(currentGame: string, type: string, ripcount: number){
        if(this.RipCounterMap.has(currentGame)){
            if(type == 'grip'){
                this.RipCounterMap.get(currentGame)[1] = ripcount;
            }else{
                this.RipCounterMap.get(currentGame)[0] = ripcount;
            }
            this.saveRipMap();
         }else{//game not on list
             if(type == 'grip'){
                 this.RipCounterMap.set(currentGame, [0,ripcount]);
             }else{
                 this.RipCounterMap.set(currentGame, [ripcount,0]);
             }
             this.saveRipMap();
         }
    }

    getRip(currentGame: string): number[]{
        //for testing
        this.RipCounterMap.forEach((value: any, key: any) => {
            console.log('key: ' + key);
        });
        if(this.RipCounterMap.has(currentGame)){
            console.log('game known');
            return this.RipCounterMap.get(currentGame);
        }else{
            console.log('new game');
            let newgame:number[] = [0,0];
            return newgame;
        }
    }

    getRipsByGameSearch(searchName: string){
        let resultList: string[] = [];
        this.RipCounterMap.forEach((value: any, key: any) => {
            //console.log('key: ' + key);
            if(key.toLowerCase().includes(searchName.toLocaleLowerCase()) && resultList.length < 10){
                let retStr = key + ' - Deaths: ' + value[0] + ' Gravity-Deaths: ' + value[1];
                resultList.push(retStr);
               
            } 
        });
        return resultList.toString();
    }

    saveRipMap(){
        let rip_map_save:any = [];
        this.RipCounterMap.forEach((value: any, key: any) => {
            let ripEntry = {
                game: key,
                rip: value[0],
                grip: value[1]
            }
            rip_map_save.push(ripEntry);
        });
        this.store.set('ripcounter_map',JSON.stringify(rip_map_save));
    }

    checkRipCommand(message: string, userstate: any, currentGame: string, isWhisper: boolean){
        let rip_info_map: Map<string, string> = new Map();
        rip_info_map.set('game', currentGame);
        rip_info_map.set('sender', userstate['display-name']);
        if(this.ripcounterSettings.active){
            console.log('checkcommandSTart');
            this.ripcounterSettings.rip_command_alias.push('!rip');
            this.ripcounterSettings.addrip_command_alias.push('!addrip');
            this.ripcounterSettings.addgrip_command_alias.push('!addgrip');
            this.ripcounterSettings.setrip_command_alias.push('!setrip');
            this.ripcounterSettings.setgrip_command_alias.push('!setgrip');
            if(this.ripcounterSettings.rip_command_alias.includes(message.toLowerCase())){//RIP
                console.log('checkcommand rip IF');
                if(this.canUse(userstate, this.ripcounterSettings.rip_role_mod, this.ripcounterSettings.rip_role_sub, true, isWhisper)){//check if roles match & cooldown is false
                    let rips = this.getRip(currentGame);
                    console.log('lets test that ' + rips[0]);
                    rip_info_map.set('rip_count', '' + rips[0]);
                    rip_info_map.set('grip_count', '' + rips[1]);
                    if(!userstate['mod'] && !isWhisper){ this.activateCooldown()}
                    let command_reply = {
                        message:  this.generateMessage(this.ripcounterSettings.rip_message, rip_info_map),
                        updateui: false
                    }
                    return command_reply;
                } 
            }else if(this.ripcounterSettings.addrip_command_alias.includes(message.toLowerCase())){//ADD RIP
                console.log('checkcommand addrip IF');
                if(this.canUse(userstate, this.ripcounterSettings.addrip_role_mod, this.ripcounterSettings.addrip_role_sub, false, isWhisper)){//check if roles match
                    this.addRip(currentGame, 'rip');
                    let rips = this.getRip(currentGame);
                    rip_info_map.set('rip_count', '' + rips[0]);
                    rip_info_map.set('grip_count', '' + rips[1]);
                    let command_reply = {
                        message:  this.generateMessage(this.ripcounterSettings.addrip_message, rip_info_map),
                        updateui: true
                    }
                    return command_reply;
                }  
            }else if(this.ripcounterSettings.addgrip_command_alias.includes(message.toLowerCase())){//ADD GRAVITY RIP
                console.log('checkcommand addgrip IF');
                if(this.canUse(userstate, this.ripcounterSettings.addgrip_role_mod, this.ripcounterSettings.addgrip_role_sub, false, isWhisper)){//check if roles match
                    this.addRip(currentGame, 'grip');
                    let rips = this.getRip(currentGame);
                    rip_info_map.set('rip_count', '' + rips[0]);
                    rip_info_map.set('grip_count', '' + rips[1]);
                    let command_reply = {
                        message:  this.generateMessage(this.ripcounterSettings.addgrip_message, rip_info_map),
                        updateui: true
                    }
                    return command_reply;
                }
            }else if(this.ripcounterSettings.setrip_command_alias.includes(message.toLowerCase().split(' ')[0])){//ADD RIP
                if(message.toLowerCase().split(' ')[1] != 'undefined' && !isNaN(parseInt(message.toLowerCase().split(' ')[1]))){//check if !setrip has parameter & parameter is number
                    if(this.canUse(userstate, this.ripcounterSettings.setrip_role_mod, this.ripcounterSettings.setrip_role_sub, false, isWhisper)){//check if roles match
                        let new_rip_count = parseInt(message.toLowerCase().split(' ')[1]);
                        this.setRip(currentGame, 'rip', new_rip_count);

                        let rips = this.getRip(currentGame);
                        rip_info_map.set('rip_count', '' + rips[0]);
                        rip_info_map.set('grip_count', '' + rips[1]);
                        let command_reply = {
                            message:  this.generateMessage(this.ripcounterSettings.setrip_message, rip_info_map),
                            updateui: true
                        }
                        return command_reply;
                    }
                }   
            }else if(this.ripcounterSettings.setgrip_command_alias.includes(message.toLowerCase().split(' ')[0])){//ADD RIP
                if(message.toLowerCase().split(' ')[1] != 'undefined' && !isNaN(parseInt(message.toLowerCase().split(' ')[1]))){//check if !setrip has parameter & parameter is number
                    if(this.canUse(userstate, this.ripcounterSettings.setgrip_role_mod, this.ripcounterSettings.setgrip_role_sub, false, isWhisper)){//check if roles match
                        let new_rip_count = parseInt(message.toLowerCase().split(' ')[1]);
                        this.setRip(currentGame, 'grip', new_rip_count);
    
                        let rips = this.getRip(currentGame);
                        rip_info_map.set('rip_count', '' + rips[0]);
                        rip_info_map.set('grip_count', '' + rips[1]);
                        let command_reply = {
                            message:  this.generateMessage(this.ripcounterSettings.setgrip_message, rip_info_map),
                            updateui: true
                        }
                        return command_reply;
                    }
                }   
            }else if(message.toLowerCase().split(' ')[0].includes('!ripsearch')){
                if(message.toLowerCase().split(' ').length > 1){
                    let ripserach_message = this.getRipsByGameSearch(message.toLowerCase().split(' ')[1]);
                    if(ripserach_message != ''){
                        let command_reply = {
                            message:  ripserach_message,
                            updateui: false
                        }
                        return command_reply;
                    }
                }
            }else{
                console.log('checkcommand ELSE');
                /*
                let command_reply = {
                    message:  "Error",
                    updateui: false
                }
                return command_reply;
                */
            }
        }
    }

    generateMessage(message: string, replaceList: Map<string, string>){
        //var message = "bla bla ${test zwo} kawwabunga ${boi} whatever ${_hola}";
        //var replaceList = new Map<string, string>();
        //replaceList.set("test zwo", "hola");
        //var repMessage = "";
        var regex = /\${([^}]+)}/g; //regex for ${}
        var matchList: string[]  = message.match(regex);
        console.log(matchList);
        for(var i = 0; i < matchList.length; i++){
            var replacementWord = replaceList.get(matchList[i].replace('${', '').replace('}',''));
            console.log(replacementWord);
            if(replacementWord != 'undefined'){
                message = message.replace(matchList[i], replacementWord);
            }

        }
        console.log(message);
        return message;
    }

}