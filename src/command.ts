export class Command{

    triggers: string[] = [];
    message: string = '';
    cooldown: boolean = false;
    cooldowntime: number = 0;
    parameters: string[] = []; //eg. <wurst> etc.

    constructor(triggers: string[], message: string = '', cooldowntime: number = 60, 
                parameters: string[] = []){
        this.triggers = triggers;
        this.message = message;
        this.cooldowntime = cooldowntime;
        this.parameters = parameters;

    }

    hasTriggerAlias(triggers: string[]): boolean {
        if(triggers.length = 1){
            return false;
        }else{
            return true;
        }   
    }

    containsTrigger(triggerKeyword: string): boolean {
        for(let trigger of this.triggers){
            if(trigger.toLowerCase() == triggerKeyword.toLocaleLowerCase()){
                return true;
            }
        }
        return false;
    }

    setCooldownState(coolDown: boolean): void{
        this.cooldown = coolDown;
    }

    runCooldownTimer(): void{
        //setTimeout(this.setCooldownState(false), this.cooldowntime);
    }
    
    


}