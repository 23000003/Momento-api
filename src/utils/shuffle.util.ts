import { QUEST } from "src/modules/quest/data/quest";

export function shuffleQuests (
    quests: typeof QUEST, 
    questDone: typeof QUEST | undefined
) : typeof QUEST {
    
    let randomQuest : typeof QUEST;
    
    if(questDone === undefined) {
        randomQuest = quests.filter((quest) => quest);
        randomQuest = randomQuest.sort(() => Math.random() - 0.5).slice(0, 3);
        
    } else {
        randomQuest = quests.filter((quest) => !questDone.includes(quest));
    }
    
    return randomQuest;
        
}