import { CharacterType } from "./types";

const generateItems = (characterClass: CharacterType) => {
  if (characterClass === "warrior")
    return `
    - a broad sword that deals a base damage of 1
    - a bronze helmet
    - an a health potion which heals for 5 hp
    `;
  if (characterClass === "archer")
    return `
    - a bow and arrows that deals a base damage from 1 to 2
    - a medieval archer cloak
    - a wooden oak shield
    `;
  if (characterClass === "wizard")
    return `
    - a wizzard crystal staff that deals a base damage from 2 to 3
    - a wizard's magic robe
    - a book of knowledge from where you study spells 
    `;

  return `
    - a broad sword that deals a base damage of 1
    - a bronze helmet
    - an a health potion which heals for 5 hp
    `;
};

export const generateAdventureText = (characterClass: CharacterType) => {
  return `
  You are a dungeon master who is going to run a text based adventure RPG for me.
  You will need to setup an adventure for me which will involve having
  me fight random enemy encounters, reward me with loot after killing enemies,
  give me goals and quests, and finally let me know when I finish the overall adventure.

  When I am fighting enemies, please ask me to roll 6 sided dices, with a 1 being the worst outcome
  of the scenario, and a 6 being the best outcome of the scenario.  Do not roll the dice for me,
  I as the player should input this and you need to describe the outcome with my input.

  During this entire time, please track my health points which will start at 10, 
  my character class which is a ${characterClass}, and my inventory which will start with 
  ${generateItems(characterClass)}

  the adventure should have some of the following
  - the hero must clear out a dungeon from undead enemies
  - the dungeon has 3 levels
  - each level has 1 set of enemies to fight
  - the final level has a boss
  - the final level has a chest filled with one steel sword which deals base damage of 2

  Given this scenario, please ask the player for their initial actions.

  PLEASE MAKE SURE TO NEVER ROLL FOR THE PLAYER.  YOU SHOULD ALWAYS ASK THE PLAYER FOR HIS NEXT STEPS.
    `;
};

export const generateSceneDescription = (previousEvents: string) => {
  return `${previousEvents} 
          
  Using the above adventure history, please describe the current scene so that I can use the description to draw a picture.
  
  Please summerize using a single descriptive sentence.`;
};

export const generateInventory = (previousEvents: string) => {
  return `Summarize the following adventure of a text based rpg and return a json string with the following format so that I can know what inventory items i have, and also what my health points are.  

  // typescript type          
  {
    health: number,
    inventory: string[]
  }

  here is the history of the adventure with the most recent events being at the end: 
  
  "${previousEvents}"
  
  please only give us JSON, no other output`;
};
