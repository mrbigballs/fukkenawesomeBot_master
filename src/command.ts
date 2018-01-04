export class Command{

    triggers: string[] = [];
    message: string = '';
    cooldown: boolean = false;
    cooldowntime: number = 0;
    parameters: string[] = []; //eg. <wurst> etc.

    constructor(triggers: string[]){
        this.triggers = triggers;
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
        setTimeout(this.setCooldownState(false), this.cooldowntime);
    }



}