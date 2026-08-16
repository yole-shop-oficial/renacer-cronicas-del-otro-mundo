import type { Chapter } from '@/engine/schema';

/**
 * CAPÍTULO 1 — Aldea Brumal (§59).
 * Incluye: primera región, primeros NPC, primera misión, primer objeto,
 * uso narrativo de habilidades, combate narrativo y consecuencias.
 */
export const CHAPTER_01: Chapter = {
  id: 'chapter_01',
  title: { es: 'Capítulo 1 — La aldea entre la niebla', en: 'Chapter 1 — The Village in the Mist' },
  startNodeId: 'c1_01',
  nodes: [
    {
      id: 'c1_01',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Despiertas sobre hierba húmeda, con el olor a tierra y humo de leña llenándote los pulmones. Un cielo de un azul imposible se abre entre jirones de niebla. A lo lejos, tejados de pizarra y una campana de madera: Aldea Brumal. Tu nuevo cuerpo se siente... vivo. Más vivo de lo que recuerdas haber estado jamás.',
        en: 'You wake on damp grass, the smell of soil and woodsmoke filling your lungs. An impossibly blue sky opens between ribbons of mist. In the distance, slate rooftops and a wooden bell: Brumal Village. Your new body feels... alive. More alive than you ever remember being.'
      },
      onEnter: [{ kind: 'startQuest', key: 'quest_first_steps' }],
      choices: [
        {
          id: 'c1_01_village',
          text: { es: 'Caminar hacia la aldea', en: 'Walk toward the village' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_02'
        },
        {
          id: 'c1_01_analyze',
          text: { es: '[Analizar] Examinar el entorno', en: '[Analyze] Examine your surroundings' },
          conditions: [{ kind: 'skill', key: 'analyze', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere la habilidad Analizar', en: 'Requires the Analyze skill' },
          effects: [
            { kind: 'gainXp', amount: 5 },
            { kind: 'setFlag', key: 'noticed_forest_tracks', value: true }
          ],
          goto: 'c1_01b'
        }
      ],
      end: false
    },
    {
      id: 'c1_01b',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Tu mirada entrenada capta detalles que otros pasarían por alto: huellas recientes de un animal grande que se dirigen al bosque cercano, y ramas rotas a la altura del hombro. Algo pesado pasó por aquí hace poco. Guardas el dato: podría ser importante.',
        en: 'Your trained eye catches details others would miss: fresh tracks of a large animal leading into the nearby forest, and branches snapped at shoulder height. Something heavy passed through recently. You file it away: it could matter.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_01b_go',
          text: { es: 'Caminar hacia la aldea', en: 'Walk toward the village' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_02'
        }
      ],
      end: false
    },
    {
      id: 'c1_02',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'marta',
      text: {
        es: 'La posada "El Farol Dorado" huele a pan recién hecho. Tras el mostrador, una mujer de trenzas grises y delantal harinoso te estudia con ojos amables pero atentos.\n\n«Vaya... ropas extrañas, mirada perdida y ni una moneda encima, apuesto. Otra alma que la niebla trae hasta mi puerta. Siéntate, criatura. Soy Marta. ¿Tienes nombre, o también lo perdiste en el camino?»',
        en: 'The inn "The Golden Lantern" smells of fresh bread. Behind the counter, a woman with grey braids and a flour-dusted apron studies you with kind but sharp eyes.\n\n"Well now... strange clothes, a lost gaze, and not a coin on you, I\'d wager. Another soul the mist brings to my door. Sit down, child. I\'m Marta. Do you have a name, or did you lose that on the road too?"'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_02_honest',
          text: { es: 'Contarle la verdad sobre tu llegada', en: 'Tell her the truth about your arrival' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'marta', axis: 'trust', amount: 15 },
            { kind: 'addNpcMemory', target: 'marta', value: 'player_told_truth_about_rebirth' }
          ],
          goto: 'c1_03_honest'
        },
        {
          id: 'c1_02_vague',
          text: { es: 'Decir que eres una viajera con mala suerte', en: 'Say you are a traveler down on your luck' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'marta', axis: 'trust', amount: 5 },
            { kind: 'addNpcMemory', target: 'marta', value: 'player_hid_origin' }
          ],
          goto: 'c1_03_vague'
        },
        {
          id: 'c1_02_persuade',
          text: { es: '[Persuasión] Ganarte su simpatía con palabras justas', en: '[Persuasion] Win her over with the right words' },
          conditions: [{ kind: 'skill', key: 'persuasion', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Persuasión', en: 'Requires Persuasion' },
          effects: [
            { kind: 'changeRelationship', target: 'marta', axis: 'friendship', amount: 15 },
            { kind: 'changeRelationship', target: 'marta', axis: 'trust', amount: 10 },
            { kind: 'gainXp', amount: 5 }
          ],
          goto: 'c1_03_honest'
        }
      ],
      end: false
    },
    {
      id: 'c1_03_honest',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'marta',
      text: {
        es: 'Marta escucha sin interrumpir, y cuando terminas, asiente despacio, como quien confirma una vieja sospecha.\n\n«Los abuelos decían que la niebla trae gente de otros cielos cuando el mundo va a cambiar. Nunca supe si creerlo... hasta hoy.»\n\nEmpuja hacia ti un plato de estofado humeante.\n\n«Come. Nadie escribe su destino con el estómago vacío. Y si buscas ganarte el pan, el capitán Bren anda corto de manos: algo ronda el Bosque de los Susurros y a los cazadores no les gusta nada.»',
        en: 'Marta listens without interrupting, and when you finish she nods slowly, like someone confirming an old suspicion.\n\n"The elders used to say the mist brings people from other skies when the world is about to change. I never knew whether to believe it... until today."\n\nShe slides a steaming bowl of stew toward you.\n\n"Eat. Nobody writes their destiny on an empty stomach. And if you want to earn your bread, Captain Bren is short-handed: something prowls the Whispering Forest and the hunters don\'t like it one bit."'
      },
      onEnter: [
        { kind: 'addItem', key: 'healing_herb', amount: 2 },
        { kind: 'gainGold', amount: 10 }
      ],
      choices: [
        {
          id: 'c1_03h_quest',
          text: { es: 'Preguntar por el trabajo del capitán', en: 'Ask about the captain\'s job' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_04'
        }
      ],
      end: false
    },
    {
      id: 'c1_03_vague',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'marta',
      text: {
        es: 'Marta arquea una ceja, claramente sin creerte del todo, pero no insiste.\n\n«Mala suerte, claro. Por aquí pasa mucha de esa últimamente.»\n\nAun así, te sirve un plato de estofado.\n\n«Come, viajera. Si buscas trabajo, el capitán Bren necesita ayuda: algo ronda el Bosque de los Susurros. Pero en esta aldea, la confianza se gana con hechos. Recuérdalo.»',
        en: 'Marta raises an eyebrow, clearly not quite believing you, but she does not press.\n\n"Bad luck, of course. We get a lot of that around here lately."\n\nStill, she serves you a bowl of stew.\n\n"Eat, traveler. If you\'re looking for work, Captain Bren needs help: something prowls the Whispering Forest. But in this village, trust is earned with deeds. Remember that."'
      },
      onEnter: [{ kind: 'addItem', key: 'healing_herb', amount: 1 }],
      choices: [
        {
          id: 'c1_03v_quest',
          text: { es: 'Preguntar por el trabajo del capitán', en: 'Ask about the captain\'s job' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_04'
        }
      ],
      end: false
    },
    {
      id: 'c1_04',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'capitan_bren',
      text: {
        es: 'El capitán Bren es una muralla de hombre con una cicatriz que le cruza la ceja. Te mide con la mirada de quien ha visto demasiadas promesas rotas.\n\n«¿Tú? ¿Contra lo que sea que aúlla ahí fuera de noche?» Suspira y despliega un mapa gastado. «Escucha. Hace una semana algo espanta a los animales del Bosque de los Susurros. Ayer, el pequeño Pip juró ver "una sombra con ojos de luna". No pago por cuentos: pago por respuestas. Ve, averigua qué es, y vuelve viva. Diez monedas de oro.»',
        en: 'Captain Bren is a wall of a man with a scar across his eyebrow. He measures you with the gaze of someone who has seen too many broken promises.\n\n"You? Against whatever howls out there at night?" He sighs and unrolls a worn map. "Listen. A week ago something started scaring the animals of the Whispering Forest. Yesterday little Pip swore he saw \'a shadow with moon eyes\'. I don\'t pay for tales: I pay for answers. Go, find out what it is, and come back alive. Ten gold coins."'
      },
      onEnter: [{ kind: 'startQuest', key: 'quest_whispering_forest' }],
      choices: [
        {
          id: 'c1_04_accept',
          text: { es: 'Aceptar la misión y partir al bosque', en: 'Accept the quest and head to the forest' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 5 },
            { kind: 'travelTo', key: 'bosque_susurros' }
          ],
          goto: 'c1_05'
        },
        {
          id: 'c1_04_intimidate',
          text: { es: '[Intimidación] «Espero que el oro esté listo cuando vuelva.»', en: '[Intimidation] "Have the gold ready when I return."' },
          conditions: [{ kind: 'skill', key: 'intimidation', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Intimidación', en: 'Requires Intimidation' },
          effects: [
            { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 10 },
            { kind: 'changeRelationship', target: 'capitan_bren', axis: 'fear', amount: 5 },
            { kind: 'travelTo', key: 'bosque_susurros' },
            { kind: 'gainXp', amount: 5 }
          ],
          goto: 'c1_05'
        }
      ],
      end: false
    },
    {
      id: 'c1_05',
      chapterId: 'chapter_01',
      kind: 'encounter',
      text: {
        es: 'El Bosque de los Susurros hace honor a su nombre: las hojas murmuran palabras casi comprensibles. Sigues un rastro de ramas rotas hasta un claro bañado por una luz verdosa... y ahí está. Una criatura del tamaño de un lobo grande, de pelaje como niebla condensada y dos ojos plateados que brillan como lunas gemelas. No gruñe. Te observa. Hay algo extrañamente triste en su mirada.',
        en: 'The Whispering Forest earns its name: the leaves murmur almost-intelligible words. You follow a trail of broken branches to a clearing bathed in greenish light... and there it is. A creature the size of a large wolf, its fur like condensed mist, two silver eyes glowing like twin moons. It does not growl. It watches you. There is something strangely sad in its gaze.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_05_analyze',
          text: { es: '[Analizar] Estudiar a la criatura', en: '[Analyze] Study the creature' },
          conditions: [{ kind: 'skill', key: 'analyze', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Analizar', en: 'Requires Analyze' },
          effects: [
            { kind: 'setFlag', key: 'knows_creature_wounded', value: true },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'c1_06_analyzed'
        },
        {
          id: 'c1_05_attack',
          text: { es: 'Atacar antes de que reaccione', en: 'Attack before it reacts' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'attacked_mist_creature', value: true }],
          goto: 'c1_06_attacked'
        },
        {
          id: 'c1_05_talk',
          text: { es: 'Hablarle con voz suave', en: 'Speak to it softly' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_06_talked'
        },
        {
          id: 'c1_05_flee',
          text: { es: 'Retroceder lentamente', en: 'Back away slowly' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_06_fled'
        }
      ],
      end: false
    },
    {
      id: 'c1_06_analyzed',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Tu percepción se agudiza y el mundo se vuelve más nítido. La criatura cojea de la pata trasera izquierda: tiene una trampa de hierro medio abierta clavada en ella. No es un depredador acechando la aldea. Es un animal herido y asustado, demasiado inteligente para acercarse a los humanos que lo hirieron. Sus ojos de luna siguen cada uno de tus movimientos.',
        en: 'Your perception sharpens and the world comes into focus. The creature favors its left hind leg: a half-open iron trap is embedded in it. This is no predator stalking the village. It is a wounded, frightened animal, too intelligent to approach the humans who hurt it. Its moon eyes track your every movement.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_06a_help',
          text: { es: 'Acercarte despacio y liberar la trampa', en: 'Approach slowly and release the trap' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'freed_mist_creature', value: true },
            { kind: 'gainXp', amount: 25 },
            { kind: 'addItem', key: 'moonlit_mushroom', amount: 1 },
            { kind: 'grantTitle', key: 'friend_of_the_mist' },
            { kind: 'changeReputation', key: 'aldea_brumal', amount: 5 }
          ],
          goto: 'c1_07_freed'
        },
        {
          id: 'c1_06a_report',
          text: { es: 'Volver e informar al capitán sin intervenir', en: 'Return and report to the captain without intervening' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'left_creature_trapped', value: true }],
          goto: 'c1_07_reported'
        }
      ],
      end: false
    },
    {
      id: 'c1_06_talked',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Le hablas como se le habla a un miedo antiguo: sin prisa y sin mentiras. Las orejas de niebla se inclinan hacia ti. Al dar un paso, la criatura retrocede... y entonces lo ves: una trampa de hierro aprisiona su pata trasera. Gime, y el bosque entero parece gemir con ella.',
        en: 'You speak to it the way one speaks to an old fear: unhurried and without lies. Its misty ears tilt toward you. As you step closer the creature retreats... and then you see it: an iron trap grips its hind leg. It whimpers, and the whole forest seems to whimper with it.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_06t_help',
          text: { es: 'Liberar la trampa con cuidado', en: 'Carefully release the trap' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'freed_mist_creature', value: true },
            { kind: 'gainXp', amount: 25 },
            { kind: 'addItem', key: 'moonlit_mushroom', amount: 1 },
            { kind: 'grantTitle', key: 'friend_of_the_mist' },
            { kind: 'changeReputation', key: 'aldea_brumal', amount: 5 }
          ],
          goto: 'c1_07_freed'
        },
        {
          id: 'c1_06t_report',
          text: { es: 'No arriesgarte: volver a informar', en: 'Don\'t risk it: go back and report' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'left_creature_trapped', value: true }],
          goto: 'c1_07_reported'
        }
      ],
      end: false
    },
    {
      id: 'c1_06_attacked',
      chapterId: 'chapter_01',
      kind: 'encounter',
      text: {
        es: 'Te lanzas al ataque. La criatura, pese a su pata herida, es rápida como el humo: esquiva, gira y te golpea con el lomo, arrojándote contra un tronco. El aire escapa de tus pulmones. Cuando levantas la vista, ha desaparecido entre la niebla, dejando tras de sí un rastro de gotas oscuras... y una trampa de hierro rota en el suelo. Estaba herida. Y tú la atacaste.',
        en: 'You lunge to attack. Despite its wounded leg the creature is quick as smoke: it dodges, spins, and slams you with its flank, throwing you against a trunk. The air leaves your lungs. When you look up it has vanished into the mist, leaving a trail of dark droplets... and a broken iron trap on the ground. It was wounded. And you attacked it.'
      },
      onEnter: [{ kind: 'damage', amount: 15 }],
      choices: [
        {
          id: 'c1_06at_return',
          text: { es: 'Volver a la aldea, dolorida y pensativa', en: 'Return to the village, bruised and thoughtful' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'creature_fled_wounded', value: true }],
          goto: 'c1_07_reported'
        }
      ],
      end: false
    },
    {
      id: 'c1_06_fled',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Retrocedes paso a paso, sin darle la espalda. La criatura no te sigue: solo te observa con esos ojos de luna hasta que la niebla la borra. De camino a la aldea encuentras una trampa de hierro rota y manchas oscuras en la hierba. Sea lo que sea, está herida. La pregunta es quién puso la trampa.',
        en: 'You back away step by step, never turning around. The creature does not follow: it just watches you with those moon eyes until the mist erases it. On the way back you find a broken iron trap and dark stains on the grass. Whatever it is, it is wounded. The question is who set the trap.'
      },
      onEnter: [{ kind: 'setFlag', key: 'found_broken_trap', value: true }],
      choices: [
        {
          id: 'c1_06f_return',
          text: { es: 'Volver e informar de lo que viste', en: 'Return and report what you saw' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_07_reported'
        }
      ],
      end: false
    },
    {
      id: 'c1_07_freed',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Abres la trampa con manos firmes. La criatura contiene un gemido... y al liberarse, en lugar de huir, apoya un instante su frente contra la tuya. Ves imágenes que no son tuyas: cazadores furtivos con trampas, un cachorro de niebla escondido en una cueva, miedo. Luego desaparece, dejando a tus pies una seta que brilla como plata líquida. El bosque entero parece respirar aliviado. Sabes dos cosas: la aldea no está en peligro... y alguien está cazando ilegalmente en este bosque.',
        en: 'You open the trap with steady hands. The creature swallows a whimper... and once free, instead of fleeing, it rests its forehead against yours for an instant. You see images that are not your own: poachers with traps, a mist cub hidden in a cave, fear. Then it vanishes, leaving at your feet a mushroom that glows like liquid silver. The whole forest seems to breathe easier. You know two things now: the village is not in danger... and someone is poaching in this forest.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_07f_return',
          text: { es: 'Volver a la aldea con la verdad', en: 'Return to the village with the truth' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'travelTo', key: 'aldea_brumal' }],
          goto: 'c1_08'
        }
      ],
      end: false
    },
    {
      id: 'c1_07_reported',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Regresas a la aldea con más preguntas que respuestas, pero con algo claro: la criatura está herida por una trampa, y las trampas no se ponen solas. El humo de las chimeneas de Aldea Brumal te recibe como una promesa de calor.',
        en: 'You return to the village with more questions than answers, but one thing is clear: the creature is wounded by a trap, and traps do not set themselves. The chimney smoke of Brumal Village greets you like a promise of warmth.'
      },
      onEnter: [{ kind: 'travelTo', key: 'aldea_brumal' }],
      choices: [
        {
          id: 'c1_07r_captain',
          text: { es: 'Informar al capitán Bren', en: 'Report to Captain Bren' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_08'
        }
      ],
      end: false
    },
    {
      id: 'c1_08',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'capitan_bren',
      text: {
        es: 'El capitán Bren escucha tu informe en silencio, con los brazos cruzados. Cuando mencionas la trampa, su mandíbula se tensa.\n\n«Trampas de hierro dentadas... eso es obra de furtivos, y de los caros. Nadie de esta aldea puede pagarlas.» Deja caer una bolsa de monedas en tu mano. «Has hecho más en una tarde que mis hombres en una semana. La misión está cumplida... pero esto no ha terminado. Si hay furtivos en mi bosque, los encontraré. Y algo me dice que tú vas a estar en medio de todo esto, forastera.»\n\nPor primera vez, hay algo parecido al respeto en su mirada.',
        en: 'Captain Bren hears your report in silence, arms crossed. When you mention the trap, his jaw tightens.\n\n"Toothed iron traps... that\'s poacher work, and expensive poacher work. Nobody in this village could afford them." He drops a pouch of coins into your hand. "You\'ve done more in one afternoon than my men in a week. The job is done... but this isn\'t over. If there are poachers in my forest, I will find them. And something tells me you\'ll be in the middle of all of it, outsider."\n\nFor the first time, there is something like respect in his eyes.'
      },
      onEnter: [
        { kind: 'completeQuest', key: 'quest_whispering_forest' },
        { kind: 'gainGold', amount: 10 },
        { kind: 'gainXp', amount: 30 },
        { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 15 },
        { kind: 'setFlag', key: 'poachers_mystery_open', value: true }
      ],
      choices: [
        {
          id: 'c1_08_end',
          text: { es: 'Continuará...', en: 'To be continued...' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'completeQuest', key: 'quest_first_steps' }],
          goto: 'c1_end'
        }
      ],
      end: false
    },
    {
      id: 'c1_end',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Esa noche, en el pequeño cuarto que Marta te ha prestado sobre la posada, miras por la ventana hacia el bosque envuelto en niebla. En tu vieja vida, los días eran páginas en blanco que nadie escribía. Hoy has escrito la primera página de verdad. Y el mundo —puedes sentirlo— la ha leído.\n\n✦ Fin del Capítulo 1. Tus decisiones han quedado grabadas en el mundo. ✦',
        en: 'That night, in the small room Marta lent you above the inn, you look out the window toward the mist-wrapped forest. In your old life, days were blank pages nobody wrote on. Today you wrote the first real page. And the world — you can feel it — has read it.\n\n✦ End of Chapter 1. Your decisions are engraved in the world. ✦'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_end_continue',
          text: { es: 'Capítulo 2 — El sello de la Sierpe', en: 'Chapter 2 — The Seal of the Serpent' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'chapter:chapter_02'
        }
      ],
      end: true
    }
  ]
};
