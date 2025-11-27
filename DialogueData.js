/**
 * DialogueData.js
 * Contains all dialogue interactions for NPCs across all zones
 */

export const DIALOGUE_DATA = {
  // ZONE 1 - Modern District NPCs
  'cafe_gossip': {
    npcName: 'Citizen',
    lines: [
      "Have you heard the rumors? Strange things happening at night...",
      "The city isn't what it used to be. Time itself seems... broken.",
      "Be careful out there. The shadows are watching."
    ]
  },
  
  'police_warning': {
    npcName: 'Officer Martinez',
    lines: [
      "Citizen, I need you to stay calm. We're investigating anomalies.",
      "Don't wander into restricted zones. It's for your own safety.",
      "If you see anything unusual, report it immediately."
    ]
  },
  
  'vendor_shop': {
    npcName: 'Vendor Max',
    lines: [
      "Welcome! Got some rare items if you're interested.",
      "This keycard? Found it near the old metro. Yours for 50 credits.",
      "Be safe out there. The night brings strange visitors."
    ],
    items: ['health_pack', 'energy_cell', 'zone2_keycard']
  },

  // ZONE 2 - Neon Cyberpunk NPCs
  'hacker_intro': {
    npcName: 'Ghost',
    lines: [
      "You made it through? Impressive. Not many survive the glitch.",
      "The corp drones are everywhere. Stay low, move fast.",
      "I can decrypt that data drive... for a price."
    ]
  },

  // ZONE 3 - Ancient Corruption NPCs
  'explorer_warning': {
    npcName: 'Dr. Chen',
    lines: [
      "Turn back! This place... it corrupts everything.",
      "The ritual stones... they're not from our time.",
      "I came for artifacts. Now I just want to leave alive."
    ]
  },
  
  'scholar_riddles': {
    npcName: 'Corrupted Scholar',
    lines: [
      "Time flows backwards here... or does it flow at all?",
      "The fragments... they whisper secrets of eternity.",
      "Solve my riddle, and I shall grant passage: What exists in all times yet belongs to none?"
    ],
    quest: 'riddle_of_time'
  },

  // ZONE 4 - Ethereal Void NPCs
  'observer_prophecy': {
    npcName: 'Timeless Observer',
    lines: [
      "You seek the truth beyond reality. Few reach this far.",
      "The fragments you collect are pieces of the Shattered Chronos.",
      "Restore them, and you may mend what was broken... or shatter it forever."
    ],
    reveal: 'final_truth'
  }
};

// Quest Dialogue
export const QUEST_DIALOGUE = {
  'riddle_of_time': {
    question: "What exists in all times yet belongs to none?",
    correctAnswer: "moment",
    reward: 'ancient_key',
    successText: "Clever... You understand. Take this key. It opens doors between moments.",
    failText: "No... You do not comprehend. Return when wisdom finds you."
  },
  
  'final_truth': {
    reveal: "The world you know... it's a loop. The Shattered Chronos keeps us trapped.",
    choice: {
      repair: "Repair the Chronos - Restore the timeline (Good Ending)",
      shatter: "Shatter it completely - Break free from time (Chaos Ending)",
      leave: "Walk away - Accept the loop (Neutral Ending)"
    }
  }
};

// Dynamic NPC responses based on player actions
export const CONDITIONAL_DIALOGUE = {
  'has_all_fragments': {
    'observer_prophecy': [
      "You have them all... The Shattered Chronos awaits reassembly.",
      "Make your choice, traveler. The fate of all timelines rests with you."
    ]
  },
  
  'stealth_detected': {
    'corp_sec_drone': [
      "[ALERT] Unauthorized presence detected. Engaging!",
      "You cannot hide from corporate security."
    ]
  }
};
