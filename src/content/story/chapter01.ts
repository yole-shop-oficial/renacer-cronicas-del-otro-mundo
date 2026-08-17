import type { Chapter } from '@/engine/schema';

/**
 * CAPÍTULO 1 — Aldea Brumal (§59) — VERSIÓN AMPLIADA.
 * Más contexto y vida (§61, §65): puedes preguntar quién es Bren antes de
 * conocerlo, pasear por la aldea, visitar la forja de Joren, conocer a Pip,
 * y decidir si Pip te acompaña al bosque o vas sol{a|o}.
 * Los textos usan {name} y {femenino|masculino} (ver engine/text.ts).
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
          text: { es: 'Decir que eres un{a viajera|viajero} con mala suerte', en: 'Say you are a traveler down on your luck' },
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
        es: 'Marta escucha sin interrumpir, y cuando terminas, asiente despacio, como quien confirma una vieja sospecha.\n\n«Los abuelos decían que la niebla trae gente de otros cielos cuando el mundo va a cambiar. Nunca supe si creerlo... hasta hoy.»\n\nEmpuja hacia ti un plato de estofado humeante.\n\n«Come, {name}. Nadie escribe su destino con el estómago vacío. Y si buscas ganarte el pan, el capitán Bren anda corto de manos: algo ronda el Bosque de los Susurros y a los cazadores no les gusta nada.»',
        en: 'Marta listens without interrupting, and when you finish she nods slowly, like someone confirming an old suspicion.\n\n"The elders used to say the mist brings people from other skies when the world is about to change. I never knew whether to believe it... until today."\n\nShe slides a steaming bowl of stew toward you.\n\n"Eat, {name}. Nobody writes their destiny on an empty stomach. And if you want to earn your bread, Captain Bren is short-handed: something prowls the Whispering Forest and the hunters don\'t like it one bit."'
      },
      onEnter: [
        { kind: 'addItem', key: 'healing_herb', amount: 2 },
        { kind: 'gainGold', amount: 10 }
      ],
      choices: [
        {
          id: 'c1_03h_who_bren',
          text: { es: '«¿Quién es ese capitán Bren?»', en: '"Who is this Captain Bren?"' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'asked_about_bren', value: true }, { kind: 'gainXp', amount: 5 }],
          goto: 'c1_03b_bren'
        },
        {
          id: 'c1_03h_walk',
          text: { es: 'Dar un paseo por la aldea antes de nada', en: 'Take a stroll through the village first' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_walk'
        },
        {
          id: 'c1_03h_quest',
          text: { es: 'Ir directamente a ver al capitán', en: 'Go straight to see the captain' },
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
        es: 'Marta arquea una ceja, claramente sin creerte del todo, pero no insiste.\n\n«Mala suerte, claro. Por aquí pasa mucha de esa últimamente.»\n\nAun así, te sirve un plato de estofado.\n\n«Come, viajer{a|o}. Si buscas trabajo, el capitán Bren necesita ayuda: algo ronda el Bosque de los Susurros. Pero en esta aldea, la confianza se gana con hechos. Recuérdalo.»',
        en: 'Marta raises an eyebrow, clearly not quite believing you, but she does not press.\n\n"Bad luck, of course. We get a lot of that around here lately."\n\nStill, she serves you a bowl of stew.\n\n"Eat, traveler. If you\'re looking for work, Captain Bren needs help: something prowls the Whispering Forest. But in this village, trust is earned with deeds. Remember that."'
      },
      onEnter: [{ kind: 'addItem', key: 'healing_herb', amount: 1 }],
      choices: [
        {
          id: 'c1_03v_who_bren',
          text: { es: '«¿Quién es ese capitán Bren?»', en: '"Who is this Captain Bren?"' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'asked_about_bren', value: true }, { kind: 'gainXp', amount: 5 }],
          goto: 'c1_03b_bren'
        },
        {
          id: 'c1_03v_walk',
          text: { es: 'Dar un paseo por la aldea antes de nada', en: 'Take a stroll through the village first' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_walk'
        },
        {
          id: 'c1_03v_quest',
          text: { es: 'Ir directamente a ver al capitán', en: 'Go straight to see the captain' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_04'
        }
      ],
      end: false
    },
    {
      id: 'c1_03b_bren',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'marta',
      text: {
        es: 'Marta baja la voz y limpia el mostrador con movimientos lentos, como si ordenara también los recuerdos.\n\n«Bren llegó hace veinte años, con el uniforme de la Guerra de las Dos Coronas todavía puesto y una mirada que no le cabía en la cara. Dicen que fue héroe en el paso de Vharen: sostuvo un puente él solo hasta que cruzaron los últimos refugiados. Lo que no dicen es que entre esos refugiados iba su hija... y que el puente cayó antes de que cruzara su mujer.»\n\nSuspira.\n\n«La niña, Nara, creció aquí y ahora estudia en el Templo del Alba. Él se quedó. Protege esta aldea como si fuera aquel puente, ¿entiendes? Por eso, cuando algo asusta a sus cazadores, no duerme. Sé paciente con sus gruñidos: debajo hay un hombre que no soporta volver a perder a nadie.»',
        en: 'Marta lowers her voice and wipes the counter with slow strokes, as if tidying her memories too.\n\n"Bren arrived twenty years ago, still wearing his uniform from the War of the Two Crowns and a stare too big for his face. They say he was a hero at Vharen Pass: held a bridge alone until the last refugees crossed. What they don\'t say is that among those refugees was his daughter... and that the bridge fell before his wife could cross."\n\nShe sighs.\n\n"The girl, Nara, grew up here and now studies at the Temple of Dawn. He stayed. He guards this village like it was that bridge, you understand? That\'s why he doesn\'t sleep when something scares his hunters. Be patient with his growling: underneath is a man who cannot bear to lose anyone again."'
      },
      onEnter: [
        { kind: 'setFlag', key: 'knows_bren_story', value: true },
        { kind: 'changeRelationship', target: 'marta', axis: 'friendship', amount: 5 }
      ],
      choices: [
        {
          id: 'c1_03b_walk',
          text: { es: 'Dar un paseo por la aldea antes de verlo', en: 'Stroll through the village before meeting him' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_walk'
        },
        {
          id: 'c1_03b_go',
          text: { es: 'Ir a ver al capitán Bren', en: 'Go see Captain Bren' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_04'
        }
      ],
      end: false
    },
    {
      id: 'c1_walk',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Sales al aire fresco de la tarde. Aldea Brumal es pequeña pero está viva: una plaza empedrada con un pozo en el centro, casas de piedra gris con flores en las ventanas, y la campana de madera que, según un cartel tallado, solo suena por bodas, incendios o niebla cerrada. Una anciana teje junto a su puerta y te saluda con la cabeza, sin sorpresa, como si la niebla trajera forasteros cada semana.\n\nDesde una calle lateral llega el golpeteo rítmico de un martillo sobre metal. Desde la plaza, risas de niños persiguiéndose entre los puestos vacíos del mercado.',
        en: 'You step out into the cool afternoon air. Brumal Village is small but alive: a cobbled square with a well at its center, grey stone houses with flowers in the windows, and the wooden bell that, according to a carved sign, only rings for weddings, fires or closed mist. An old woman knits by her door and nods at you without surprise, as if the mist delivered strangers every week.\n\nFrom a side street comes the rhythmic beat of a hammer on metal. From the square, the laughter of children chasing each other between the empty market stalls.'
      },
      onEnter: [{ kind: 'setFlag', key: 'walked_village', value: true }, { kind: 'gainXp', amount: 5 }],
      choices: [
        {
          id: 'c1_walk_forge',
          text: { es: 'Seguir el sonido del martillo hasta la forja', en: 'Follow the hammering to the forge' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_forge'
        },
        {
          id: 'c1_walk_kids',
          text: { es: 'Acercarte a las risas de la plaza', en: 'Head toward the laughter in the square' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_pip'
        },
        {
          id: 'c1_walk_captain',
          text: { es: 'Dejar el paseo e ir con el capitán', en: 'End the stroll and go to the captain' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_04'
        }
      ],
      end: false
    },
    {
      id: 'c1_forge',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'joren',
      text: {
        es: 'La forja huele a carbón y hierro caliente. Un hombre de brazos gruesos y barba rojiza levanta la vista del yunque sin dejar de trabajar una herradura al rojo.\n\n«Tú debes de ser lo que la niebla dejó esta mañana. Las noticias vuelan cuando el pueblo es del tamaño de un pañuelo.» Sonríe de medio lado. «Joren. Herrero, hijo de herrero, nieto de una herrera que hacía espadas mejores que las mías. Mi familia lleva cinco generaciones alimentando este fuego. Antes forjábamos hojas para la guerra; ahora herraduras, azadas y algún cuchillo de cocina. Prefiero esto, si te soy sincero.»\n\nSeñala tu equipo con el mentón.\n\n«Si vas a meterte en el Bosque de los Susurros —y por tu cara, vas—, pásame luego ese filo. A los que la niebla trae, no les cobro la primera vez.»',
        en: 'The forge smells of coal and hot iron. A thick-armed man with a reddish beard looks up from the anvil without pausing his work on a glowing horseshoe.\n\n"You must be what the mist dropped off this morning. News travels fast when the town is the size of a handkerchief." He half-smiles. "Joren. Smith, son of a smith, grandson of a smith-woman who made better swords than mine. Five generations of my family have fed this fire. We used to forge blades for war; now it\'s horseshoes, hoes and the odd kitchen knife. I prefer it this way, if I\'m honest."\n\nHe gestures at your gear with his chin.\n\n"If you\'re heading into the Whispering Forest — and by your face, you are — bring me that edge later. For those the mist brings, the first sharpening is free."'
      },
      onEnter: [
        { kind: 'setFlag', key: 'met_joren', value: true },
        { kind: 'changeRelationship', target: 'joren', axis: 'friendship', amount: 10 }
      ],
      choices: [
        {
          id: 'c1_forge_sharpen',
          text: { es: 'Aceptar: dejar que afile tu equipo', en: 'Accept: let him sharpen your gear' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'gear_sharpened', value: true },
            { kind: 'addItem', key: 'sharpening_stone', amount: 1 },
            { kind: 'changeRelationship', target: 'joren', axis: 'trust', amount: 10 },
            { kind: 'gainXp', amount: 5 }
          ],
          goto: 'c1_forge2'
        },
        {
          id: 'c1_forge_traps',
          text: { es: 'Preguntarle por las trampas de hierro', en: 'Ask him about iron traps' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'asked_joren_traps', value: true }],
          goto: 'c1_forge_traps_info'
        },
        {
          id: 'c1_forge_leave',
          text: { es: 'Agradecerle y seguir tu camino', en: 'Thank him and move on' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_walk2'
        }
      ],
      end: false
    },
    {
      id: 'c1_forge2',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'joren',
      text: {
        es: 'Joren trabaja tu equipo con la concentración de un relojero gigante. Mientras pasa la piedra por el filo, habla sin mirarte.\n\n«¿Ves esta muesca? Acero barato del sur. Y aun así, con buen cuidado, cortará durante años. Las cosas no necesitan ser perfectas, solo estar bien cuidadas. La gente también.»\n\nTe devuelve el equipo, que ahora silba al cortar el aire, y te regala una piedra de afilar pequeña y gastada.\n\n«Era de mi abuela. Tengo tres más y ningún hijo, así que úsala. Y vuelve enter{a|o} del bosque, ¿me oyes? Odio hacer palas para tumbas.»',
        en: 'Joren works on your gear with the focus of a giant watchmaker. As he draws the stone along the edge, he speaks without looking at you.\n\n"See this notch? Cheap southern steel. And yet, with proper care, it will cut for years. Things don\'t need to be perfect, only well cared for. Same goes for people."\n\nHe hands your gear back — it whistles through the air now — and gifts you a small, worn sharpening stone.\n\n"It was my grandmother\'s. I have three more and no children, so use it. And come back from that forest in one piece, you hear? I hate making shovels for graves."'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_forge2_continue',
          text: { es: 'Volver a la plaza', en: 'Return to the square' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_walk2'
        }
      ],
      end: false
    },
    {
      id: 'c1_forge_traps_info',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'joren',
      text: {
        es: 'La pregunta le borra la sonrisa. Deja el martillo con cuidado, y eso, en un herrero, es como un grito.\n\n«¿Trampas de hierro? ¿Dentadas?» Niega con la cabeza. «Yo no las hago. Nadie de por aquí las hace. Eso es trabajo de fundición grande, de ciudad, con sello de gremio. Una sola de esas cuesta lo que yo gano en un mes.» Se inclina hacia ti. «Si alguien está sembrando el bosque con acero de ese precio, no busca conejos. Busca algo que se venda muy caro... y le da igual a quién muerda por el camino. Ten los ojos abiertos ahí dentro.»',
        en: 'The question wipes his smile away. He sets the hammer down carefully — and from a blacksmith, that is like a shout.\n\n"Iron traps? Toothed ones?" He shakes his head. "I don\'t make them. Nobody around here does. That is big foundry work, city work, guild-stamped. A single one costs what I earn in a month." He leans toward you. "If someone is seeding the forest with steel at that price, they are not after rabbits. They are after something that sells very dear... and they don\'t care what it bites along the way. Keep your eyes open in there."'
      },
      onEnter: [{ kind: 'gainXp', amount: 10 }],
      choices: [
        {
          id: 'c1_forge_traps_back',
          text: { es: 'Volver a la plaza', en: 'Return to the square' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_walk2'
        }
      ],
      end: false
    },
    {
      id: 'c1_walk2',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'De vuelta en la plaza, la tarde empieza a dorar los tejados. El pozo, la campana, las flores en las ventanas... Aldea Brumal tiene esa belleza tranquila de los lugares que no saben que son hermosos.\n\nLas risas de los niños siguen sonando cerca del mercado.',
        en: 'Back in the square, the afternoon begins to gild the rooftops. The well, the bell, the flowers in the windows... Brumal Village has that quiet beauty of places that don\'t know they are beautiful.\n\nThe children\'s laughter still rings near the market.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_walk2_kids',
          text: { es: 'Acercarte a los niños del mercado', en: 'Approach the children by the market' },
          conditions: [{ kind: 'flag', key: 'met_pip', op: 'not' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_pip'
        },
        {
          id: 'c1_walk2_captain',
          text: { es: 'Ir a ver al capitán Bren', en: 'Go see Captain Bren' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_04'
        }
      ],
      end: false
    },
    {
      id: 'c1_pip',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'pip',
      text: {
        es: 'Los niños se dispersan al verte, todos menos uno: un chiquillo de unos once años, flaco como una caña, con el pelo del color de la paja mojada y una honda colgando del cinturón. Te mira de arriba abajo con la seriedad de un general inspeccionando tropas.\n\n«Tú eres del otro lado de la niebla. Lo sé porque caminas raro, como si el suelo fuera nuevo.» Se encoge de hombros. «Soy Pip. Duermo en el granero de Marta desde que la fiebre gris se llevó a mis padres, hace dos inviernos. No me des pena, ¿eh? Marta me da pan y el capitán me deja dar de comer a los perros de la guardia. Me va bien.»\n\nBaja la voz de golpe y mira hacia el bosque.\n\n«Oye... ¿tú vas a ir a por la sombra? Yo la vi. De verdad. Cerca del arroyo, hace tres noches. Grande como un ternero, con dos ojos de luna llena. Todos dicen que lo soñé, pero no lo soñé. No parecía mala. Parecía... asustada. Como los perros cuando truena.»',
        en: 'The children scatter when they see you — all but one: a boy of about eleven, thin as a reed, hair the color of wet straw, a sling hanging from his belt. He looks you up and down with the gravity of a general inspecting troops.\n\n"You\'re from the other side of the mist. I know because you walk funny, like the ground is new." He shrugs. "I\'m Pip. I sleep in Marta\'s barn since the grey fever took my parents, two winters ago. Don\'t pity me, alright? Marta gives me bread and the captain lets me feed the guard dogs. I do fine."\n\nHe drops his voice suddenly and glances toward the forest.\n\n"Hey... are you going after the shadow? I saw it. Really. Near the stream, three nights ago. Big as a calf, with two full-moon eyes. Everyone says I dreamed it, but I didn\'t. It didn\'t look evil. It looked... scared. Like the dogs when it thunders."'
      },
      onEnter: [
        { kind: 'setFlag', key: 'met_pip', value: true },
        { kind: 'changeRelationship', target: 'pip', axis: 'friendship', amount: 10 },
        { kind: 'setFlag', key: 'pip_told_creature_scared', value: true }
      ],
      choices: [
        {
          id: 'c1_pip_believe',
          text: { es: '«Te creo, Pip. Cuéntamelo todo.»', en: '"I believe you, Pip. Tell me everything."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'pip', axis: 'trust', amount: 15 },
            { kind: 'addNpcMemory', target: 'pip', value: 'player_believed_pip' },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'c1_pip2'
        },
        {
          id: 'c1_pip_doubt',
          text: { es: '«Los ojos engañan de noche, chico.»', en: '"Eyes play tricks at night, kid."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'pip', axis: 'trust', amount: -5 },
            { kind: 'addNpcMemory', target: 'pip', value: 'player_doubted_pip' }
          ],
          goto: 'c1_pip2_doubt'
        }
      ],
      end: false
    },
    {
      id: 'c1_pip2',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'pip',
      text: {
        es: 'A Pip se le ilumina la cara como si le hubieras regalado la campana de la aldea.\n\n«¿En serio? ¡Eres la primera persona que no me revuelve el pelo y me manda a dormir!» Se acuclilla y dibuja en el polvo con un dedo. «Mira: el arroyo hace una curva aquí, junto a las piedras grandes. La sombra estaba bebiendo. Cojeaba de una pata de atrás, lo juro por la honda de mi padre. Y cuando me vio... no gruñó ni nada. Solo se escondió. ¿Qué clase de monstruo se esconde de un niño?»\n\nSe levanta y se sacude las rodillas.\n\n«El capitán está en el cuartel, junto a la puerta norte. Dile que Pip dice que la sombra bebe en la curva del arroyo. Y si el viejo oso te gruñe, tú aguanta la mirada: lo hace con todos.»',
        en: 'Pip\'s face lights up as if you had gifted him the village bell.\n\n"Really? You\'re the first person who doesn\'t ruffle my hair and send me to bed!" He crouches and draws in the dust with one finger. "Look: the stream bends here, by the big stones. The shadow was drinking. It limped on a back leg, I swear on my father\'s sling. And when it saw me... it didn\'t growl or anything. It just hid. What kind of monster hides from a kid?"\n\nHe stands and dusts off his knees.\n\n"The captain is at the guardhouse by the north gate. Tell him Pip says the shadow drinks at the bend of the stream. And if the old bear growls at you, hold his stare: he does it to everyone."'
      },
      onEnter: [{ kind: 'setFlag', key: 'knows_creature_limps', value: true }],
      choices: [
        {
          id: 'c1_pip2_captain',
          text: { es: 'Ir al cuartel de la puerta norte', en: 'Head to the north gate guardhouse' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_04'
        }
      ],
      end: false
    },
    {
      id: 'c1_pip2_doubt',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'pip',
      text: {
        es: 'Pip aprieta los labios y se guarda las manos en los bolsillos. Por un momento parece mucho mayor de lo que es.\n\n«Ya. Como todos.» Patea una piedrecita. «Pues cuando la veas, acuérdate de mí. Cojeaba de una pata de atrás. Los sueños no cojean.»\n\nDa media vuelta, pero antes de irse señala hacia la puerta norte con la barbilla.\n\n«El cuartel está por ahí. El capitán gruñe, pero no muerde. Casi nunca.»',
        en: 'Pip presses his lips together and shoves his hands in his pockets. For a moment he looks far older than he is.\n\n"Right. Like everyone else." He kicks a pebble. "Well, when you see it, remember me. It limped on a back leg. Dreams don\'t limp."\n\nHe turns away, but before leaving he juts his chin toward the north gate.\n\n"The guardhouse is that way. The captain growls, but he doesn\'t bite. Almost never."'
      },
      onEnter: [{ kind: 'setFlag', key: 'knows_creature_limps', value: true }],
      choices: [
        {
          id: 'c1_pip2d_captain',
          text: { es: 'Ir al cuartel de la puerta norte', en: 'Head to the north gate guardhouse' },
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
        es: 'El cuartel es poco más que una casa de piedra con un escudo desconchado sobre la puerta. Dentro, el capitán Bren es una muralla de hombre con una cicatriz que le cruza la ceja. Te mide con la mirada de quien ha visto demasiadas promesas rotas.\n\n«¿Tú? ¿Contra lo que sea que aúlla ahí fuera de noche?» Suspira y despliega un mapa gastado sobre la mesa. «Escucha. Hace una semana algo espanta a los animales del Bosque de los Susurros. Mis cazadores encontraron rastros que no reconocen, y el pequeño Pip jura que vio "una sombra con ojos de luna". No pago por cuentos: pago por respuestas. Ve, averigua qué es, y vuelve viv{a|o}. Diez monedas de oro.»',
        en: 'The guardhouse is little more than a stone house with a flaking shield above the door. Inside, Captain Bren is a wall of a man with a scar across his eyebrow. He measures you with the gaze of someone who has seen too many broken promises.\n\n"You? Against whatever howls out there at night?" He sighs and unrolls a worn map across the table. "Listen. A week ago something started scaring the animals of the Whispering Forest. My hunters found tracks they don\'t recognize, and little Pip swears he saw \'a shadow with moon eyes\'. I don\'t pay for tales: I pay for answers. Go, find out what it is, and come back alive. Ten gold coins."'
      },
      onEnter: [{ kind: 'startQuest', key: 'quest_whispering_forest' }],
      choices: [
        {
          id: 'c1_04_whoareyou',
          text: { es: '«¿Y quién eres tú, capitán, para mandarme al bosque?»', en: '"And who are you, captain, to send me into that forest?"' },
          conditions: [{ kind: 'flag', key: 'knows_bren_story', op: 'not' }],
          visibleWhenLocked: false,
          effects: [{ kind: 'gainXp', amount: 5 }],
          goto: 'c1_04_who'
        },
        {
          id: 'c1_04_mention_nara',
          text: { es: '«Marta me habló del puente de Vharen... y de Nara.»', en: '"Marta told me about Vharen bridge... and about Nara."' },
          conditions: [{ kind: 'flag', key: 'knows_bren_story', op: 'has' }],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'capitan_bren', axis: 'trust', amount: 10 },
            { kind: 'addNpcMemory', target: 'capitan_bren', value: 'player_knows_about_nara' },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'c1_04_nara'
        },
        {
          id: 'c1_04_pip_info',
          text: { es: 'Contarle lo que Pip te dijo del arroyo', en: 'Tell him what Pip said about the stream' },
          conditions: [{ kind: 'flag', key: 'knows_creature_limps', op: 'has' }],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 5 },
            { kind: 'gainXp', amount: 5 }
          ],
          goto: 'c1_04_pipinfo'
        },
        {
          id: 'c1_04_accept',
          text: { es: 'Aceptar la misión y partir', en: 'Accept the quest and set out' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 5 }],
          goto: 'c1_road'
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
            { kind: 'gainXp', amount: 5 }
          ],
          goto: 'c1_road'
        }
      ],
      end: false
    },
    {
      id: 'c1_04_who',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'capitan_bren',
      text: {
        es: 'Bren se queda muy quieto. Luego, para tu sorpresa, algo parecido a una sonrisa le agrieta la cara.\n\n«Veinte años llevo aquí y eres la primera persona que me lo pregunta a la cara.» Se sienta en el borde de la mesa. «Fui soldado en la Guerra de las Dos Coronas. Sostuve un puente en Vharen cuando nadie más quiso quedarse. Perdí más de lo que gané, como en todas las guerras. Después caminé hasta que encontré un pueblo tan pequeño que ninguna corona lo quisiera... y me quedé a cuidarlo.»\n\nSe encoge de hombros, como quitándole peso.\n\n«Eso soy. Un viejo soldado con un pueblo en vez de un puente. Por eso no mando a mis cazadores ahí fuera a ciegas, y por eso te lo pido a ti, que la niebla te ha traído con ojos nuevos. ¿Aceptas o no?»',
        en: 'Bren goes very still. Then, to your surprise, something like a smile cracks his face.\n\n"Twenty years I\'ve been here, and you\'re the first person to ask me that to my face." He sits on the edge of the table. "I was a soldier in the War of the Two Crowns. I held a bridge at Vharen when nobody else would stay. I lost more than I won, as one does in every war. Afterwards I walked until I found a town so small no crown would want it... and I stayed to keep it."\n\nHe shrugs, as if shedding the weight of it.\n\n"That\'s what I am. An old soldier with a town instead of a bridge. That\'s why I don\'t send my hunters out there blind, and why I\'m asking you, whom the mist brought with new eyes. Do you accept or not?"'
      },
      onEnter: [
        { kind: 'setFlag', key: 'knows_bren_story', value: true },
        { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 5 }
      ],
      choices: [
        {
          id: 'c1_04w_accept',
          text: { es: '«Acepto, capitán.»', en: '"I accept, captain."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 5 }],
          goto: 'c1_road'
        }
      ],
      end: false
    },
    {
      id: 'c1_04_nara',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'capitan_bren',
      text: {
        es: 'El nombre cae en la habitación como una piedra en un estanque. Bren no se enfada; solo envejece cinco años en un segundo.\n\n«Marta habla demasiado.» Pero no hay filo en su voz. Se acerca a la ventana y mira hacia el norte, donde los caminos se pierden en la niebla. «Nara me escribe cada luna nueva desde el Templo del Alba. Dice que está aprendiendo a curar con la luz. Su madre habría estado... » No termina la frase. No hace falta.\n\nCuando se gira, vuelve a ser el capitán.\n\n«Si sabes eso de mí, ya sabes por qué no dejo que nada ronde mi bosque sin nombre y apellido. Tráeme respuestas, y te deberé algo más que diez monedas.»',
        en: 'The name drops into the room like a stone into a pond. Bren doesn\'t get angry; he just ages five years in a second.\n\n"Marta talks too much." But there is no edge in his voice. He moves to the window and looks north, where the roads vanish into the mist. "Nara writes to me every new moon from the Temple of Dawn. She says she\'s learning to heal with light. Her mother would have been..." He doesn\'t finish the sentence. He doesn\'t need to.\n\nWhen he turns around, he is the captain again.\n\n"If you know that about me, then you know why I let nothing prowl my forest without a name. Bring me answers, and I\'ll owe you more than ten coins."'
      },
      onEnter: [{ kind: 'changeRelationship', target: 'capitan_bren', axis: 'trust', amount: 10 }],
      choices: [
        {
          id: 'c1_04n_accept',
          text: { es: '«Tendrás tus respuestas.»', en: '"You\'ll have your answers."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_road'
        }
      ],
      end: false
    },
    {
      id: 'c1_04_pipinfo',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'capitan_bren',
      text: {
        es: 'Bren escucha el informe del arroyo con el ceño cada vez más fruncido, pero no de enfado: de atención.\n\n«¿La curva del arroyo, junto a las piedras grandes? ¿Y cojeando?» Se rasca la cicatriz de la ceja. «Maldita sea. El chico tenía razón y yo mandándolo a dormir.» Marca un punto en el mapa con carboncillo. «Un animal herido cerca del agua es un animal que no puede alejarse. Eso reduce el bosque entero a media legua. Acabas de ahorrarme tres días de batidas, y Pip acaba de ganarse un puesto en la guardia cuando le crezca la barba.»\n\nTe tiende el mapa marcado.\n\n«Empieza por el arroyo. Y dile a ese mocoso... dile que buen trabajo.»',
        en: 'Bren listens to the report about the stream with a deepening frown — not of anger, but of attention.\n\n"The bend of the stream, by the big stones? And limping?" He scratches the scar on his eyebrow. "Damn it. The boy was right and I kept sending him to bed." He marks a point on the map with charcoal. "A wounded animal near water is an animal that cannot move far. That narrows the whole forest down to half a league. You just saved me three days of sweeps, and Pip just earned himself a place in the guard whenever his beard grows in."\n\nHe hands you the marked map.\n\n"Start at the stream. And tell that brat... tell him good work."'
      },
      onEnter: [
        { kind: 'setFlag', key: 'has_marked_map', value: true },
        { kind: 'changeRelationship', target: 'capitan_bren', axis: 'respect', amount: 10 }
      ],
      choices: [
        {
          id: 'c1_04p_accept',
          text: { es: 'Tomar el mapa y partir', en: 'Take the map and set out' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_road'
        }
      ],
      end: false
    },
    {
      id: 'c1_road',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Cruzas la puerta norte con el encargo pesándote agradablemente en los hombros: por primera vez en dos vidas, alguien cuenta contigo. El camino baja entre huertos y cercas de piedra hasta donde los árboles del Bosque de los Susurros se cierran como una cortina verde.',
        en: 'You pass through the north gate with the task resting pleasantly on your shoulders: for the first time in two lifetimes, someone is counting on you. The road descends between orchards and stone fences to where the trees of the Whispering Forest close like a green curtain.'
      },
      onEnter: [{ kind: 'travelTo', key: 'bosque_susurros' }],
      choices: [
        {
          id: 'c1_road_go',
          text: { es: 'Seguir adelante', en: 'Press on' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_wolf'
        }
      ],
      end: false
    },
    {
      // PRIMER COMBATE (§102): la historia enseña a combatir sin tutorial.
      id: 'c1_wolf',
      chapterId: 'chapter_01',
      kind: 'encounter',
      combatId: 'lobo_famelico',
      victoryGoto: 'c1_wolf_after',
      defeatGoto: 'c1_wolf_defeat',
      text: {
        es: 'El sendero queda completamente en silencio. Ni pájaros, ni viento. Solo tu respiración.\n\nAlgo se mueve entre los helechos: un lobo de costillas marcadas y ojos amarillos te corta el paso. No es la sombra que buscas — es solo un animal hambriento que ha decidido que hoy comes tú o come él.',
        en: 'The path falls completely silent. No birds, no wind. Only your breathing.\n\nSomething moves among the ferns: a wolf with visible ribs and yellow eyes blocks your way. It is not the shadow you seek — just a starving animal that has decided today either it eats, or you do.'
      },
      duoText: {
        es: 'El sendero queda completamente en silencio. Miras a {partner}: también lo ha notado.\n\nUn lobo de costillas marcadas y ojos amarillos os corta el paso. No es la sombra que buscáis — solo un animal hambriento. Dos contra uno... pero el hambre no sabe contar.',
        en: 'The path falls completely silent. You glance at {partner}: they have noticed too.\n\nA wolf with visible ribs and yellow eyes blocks your way. It is not the shadow you seek — just a starving animal. Two against one... but hunger cannot count.'
      },
      onEnter: [],
      choices: [],
      end: false
    },
    {
      id: 'c1_wolf_after',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'El lobo huye cojeando hacia la espesura, más asustado que herido. Te quedas un momento recuperando el aliento. Tu primera pelea en este mundo... y sigues respirando. La experiencia del combate se asienta en tus músculos como un idioma nuevo.',
        en: 'The wolf flees limping into the thicket, more frightened than hurt. You take a moment to catch your breath. Your first fight in this world... and you are still breathing. The experience settles into your muscles like a new language.'
      },
      onEnter: [{ kind: 'setFlag', key: 'won_first_combat', value: true }],
      choices: [
        {
          id: 'c1_wolfafter_pip',
          text: { es: 'Continuar hacia el bosque', en: 'Continue toward the forest' },
          conditions: [{ kind: 'flag', key: 'met_pip', op: 'has' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_pip_offer'
        },
        {
          id: 'c1_wolfafter_alone',
          text: { es: 'Continuar hacia el bosque', en: 'Continue toward the forest' },
          conditions: [{ kind: 'flag', key: 'met_pip', op: 'not' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_05'
        }
      ],
      end: false
    },
    {
      // DERROTA ≠ Game Over (§21): crea historia.
      id: 'c1_wolf_defeat',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'El mundo se vuelve borroso... y despiertas en la posada, con vendas que huelen a hierbas amargas. Marta te vela con cara de haber pasado miedo. «Un carbonero te encontró en el sendero. El lobo se llevó tu bolsa de monedas, pero dejó lo importante.» Te duele todo... pero las derrotas también enseñan.',
        en: 'The world blurs... and you wake at the inn, in bandages smelling of bitter herbs. Marta watches over you with a face that has known fear. "A charcoal burner found you on the path. The wolf took your coin pouch, but left what matters." Everything hurts... but defeats teach too.'
      },
      onEnter: [
        { kind: 'gainGold', amount: -10 },
        { kind: 'heal', amount: 999 },
        { kind: 'setFlag', key: 'lost_to_wolf', value: true },
        { kind: 'changeRelationship', target: 'marta', axis: 'affection', amount: 10 },
        { kind: 'gainXp', amount: 10 }
      ],
      choices: [
        {
          id: 'c1_wolfdefeat_retry',
          text: { es: 'Volver al sendero, más sabi{a|o}', en: 'Return to the path, wiser' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: '_combat_done_c1_wolf', value: false }],
          goto: 'c1_road'
        }
      ],
      end: false
    },
    {
      id: 'c1_pip_offer',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'pip',
      text: {
        es: 'Un crujido de ramas a tu espalda. Pip sale de detrás de una cerca con la honda en la mano y la cara de quien ya ha preparado todos sus argumentos.\n\n«Antes de que digas nada: conozco el bosque mejor que nadie. Sé dónde está la curva del arroyo, sé qué setas no se comen y sé silbar como un mirlo para avisarte si viene alguien.» Traga saliva, y por debajo de toda esa valentía asoma el niño que es. «Y... la sombra me vio a mí primero y no me hizo nada. A lo mejor se acuerda. Si quieres, te acompaño. Pero si me dices que no, volveré a la aldea. De verdad. Bueno, probablemente.»',
        en: 'A crackle of branches behind you. Pip emerges from behind a fence, sling in hand, wearing the face of someone who has already rehearsed all his arguments.\n\n"Before you say anything: I know the forest better than anyone. I know where the stream bends, I know which mushrooms not to eat, and I can whistle like a blackbird to warn you if anyone comes." He swallows, and beneath all that bravery the child he is peeks through. "And... the shadow saw me first and did nothing to me. Maybe it remembers. If you want, I\'ll come with you. But if you say no, I\'ll go back to the village. Really. Well, probably."'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_pip_offer_yes',
          text: { es: '«Ven conmigo. Pero a la primera señal de peligro, corres a la aldea.»', en: '"Come with me. But at the first sign of danger, you run home."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'pip_companion', value: true },
            { kind: 'changeRelationship', target: 'pip', axis: 'friendship', amount: 15 },
            { kind: 'changeRelationship', target: 'pip', axis: 'trust', amount: 10 },
            { kind: 'addNpcMemory', target: 'pip', value: 'player_took_pip_to_forest' },
            { kind: 'gainXp', amount: 5 }
          ],
          goto: 'c1_05_withpip'
        },
        {
          id: 'c1_pip_offer_no',
          text: { es: '«No, Pip. Voy sol{a|o}. Esto podría ser peligroso.»', en: '"No, Pip. I go alone. This could be dangerous."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'went_alone', value: true },
            { kind: 'changeRelationship', target: 'pip', axis: 'respect', amount: 10 },
            { kind: 'addNpcMemory', target: 'pip', value: 'player_protected_pip' }
          ],
          goto: 'c1_05_alone'
        }
      ],
      end: false
    },
    {
      id: 'c1_05_alone',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Pip infla los carrillos, pero asiente. «Está bien. Pero silba fuerte si me necesitas. Silbo mejor que nadie.» Se queda en la linde del bosque, con la honda apretada en el puño, viéndote partir como un faro pequeño y terco.\n\nTe adentras sol{a|o} entre los árboles. El silencio del bosque no es vacío: está lleno de hojas que murmuran palabras casi comprensibles.',
        en: 'Pip puffs his cheeks but nods. "Fine. But whistle loud if you need me. I whistle better than anyone." He stays at the forest\'s edge, sling clenched in his fist, watching you go like a small, stubborn lighthouse.\n\nYou walk in alone among the trees. The forest\'s silence is not empty: it is full of leaves murmuring almost-intelligible words.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_05a_continue',
          text: { es: 'Seguir el rastro hacia el arroyo', en: 'Follow the trail toward the stream' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c1_05'
        }
      ],
      end: false
    },
    {
      id: 'c1_05_withpip',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Pip sonríe tan fuerte que casi se le oye. Camina a tu lado con pasos exagerados de explorador, señalando cosas en voz baja: «Ese hongo naranja, ni tocarlo. Ahí anidan abejorros. Por ese claro pasan los ciervos al amanecer...»\n\nEl bosque parece menos amenazante visto a través de sus ojos: no un lugar oscuro, sino una casa grande cuyas costumbres él conoce. Aun así, cuando os acercáis al arroyo, el chico se calla y su mano busca la honda.\n\n«Es ahí delante. La curva del agua. Ahora silencio, ¿vale?»',
        en: 'Pip grins so hard you can almost hear it. He walks beside you with exaggerated explorer\'s steps, pointing things out in a low voice: "That orange fungus — don\'t touch it. Bumblebees nest there. Deer cross that clearing at dawn..."\n\nThe forest seems less threatening seen through his eyes: not a dark place but a big house whose habits he knows. Still, as you near the stream, the boy falls silent and his hand finds the sling.\n\n"It\'s just ahead. The bend of the water. Quiet now, alright?"'
      },
      onEnter: [{ kind: 'gainXp', amount: 5 }],
      choices: [
        {
          id: 'c1_05w_continue',
          text: { es: 'Avanzar en silencio hacia la curva del arroyo', en: 'Advance quietly toward the bend of the stream' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
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
        es: 'El Bosque de los Susurros hace honor a su nombre: las hojas murmuran palabras casi comprensibles. Sigues un rastro de ramas rotas hasta un claro bañado por una luz verdosa, junto a la curva del arroyo... y ahí está. Una criatura del tamaño de un lobo grande, de pelaje como niebla condensada y dos ojos plateados que brillan como lunas gemelas. No gruñe. Te observa. Hay algo extrañamente triste en su mirada.',
        en: 'The Whispering Forest earns its name: the leaves murmur almost-intelligible words. You follow a trail of broken branches to a clearing bathed in greenish light, by the bend of the stream... and there it is. A creature the size of a large wolf, its fur like condensed mist, two silver eyes glowing like twin moons. It does not growl. It watches you. There is something strangely sad in its gaze.'
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
          id: 'c1_05_pip_whisper',
          text: { es: '[Pip] Dejar que Pip se acerque primero', en: '[Pip] Let Pip approach first' },
          conditions: [{ kind: 'flag', key: 'pip_companion', op: 'has' }],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'knows_creature_wounded', value: true },
            { kind: 'changeRelationship', target: 'pip', axis: 'trust', amount: 10 },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'c1_06_pip_approach'
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
      id: 'c1_06_pip_approach',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'Pip te mira, y tú asientes. El chico avanza despacio, con las palmas abiertas, hablando en ese tono que se usa con los perros asustados: «Eh... soy yo. El del arroyo. Te acuerdas, ¿verdad?»\n\nLa criatura levanta las orejas de niebla. No huye. Deja que Pip se acerque dos pasos más de lo que jamás te habría permitido a ti, y entonces lo ves con claridad: la trampa de hierro medio abierta clavada en su pata trasera, la carne inflamada alrededor del metal.\n\nPip se vuelve hacia ti con los ojos muy abiertos. «Está atrapada. Te lo dije. Te dije que no era mala.»',
        en: 'Pip looks at you, and you nod. The boy inches forward, palms open, speaking in that tone reserved for frightened dogs: "Hey... it\'s me. From the stream. You remember, right?"\n\nThe creature lifts its misty ears. It does not flee. It lets Pip come two steps closer than it would ever have allowed you, and then you see it clearly: the half-open iron trap embedded in its hind leg, the flesh swollen around the metal.\n\nPip turns to you with wide eyes. "It\'s trapped. I told you. I told you it wasn\'t evil."'
      },
      onEnter: [],
      choices: [
        {
          id: 'c1_06pa_help',
          text: { es: 'Acercarte despacio y liberar la trampa', en: 'Approach slowly and release the trap' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'freed_mist_creature', value: true },
            { kind: 'gainXp', amount: 25 },
            { kind: 'addItem', key: 'moonlit_mushroom', amount: 1 },
            { kind: 'grantTitle', key: 'friend_of_the_mist' },
            { kind: 'changeReputation', key: 'aldea_brumal', amount: 5 },
            { kind: 'changeRelationship', target: 'pip', axis: 'friendship', amount: 10 }
          ],
          goto: 'c1_07_freed'
        },
        {
          id: 'c1_06pa_report',
          text: { es: 'No arriesgar a Pip: volver e informar', en: 'Don\'t risk Pip: go back and report' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'left_creature_trapped', value: true }],
          goto: 'c1_07_reported'
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
          text: { es: 'Perseguir el rastro de gotas oscuras', en: 'Follow the trail of dark droplets' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'creature_fled_wounded', value: true }],
          goto: 'c1_wraith'
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
      // PRIMER JEFE (§103): el dolor de la criatura herida atrae a un espectro.
      id: 'c1_wraith',
      chapterId: 'chapter_01',
      kind: 'encounter',
      combatId: 'espectro_velo',
      victoryGoto: 'c1_wraith_after',
      defeatGoto: 'c1_wraith_defeat',
      text: {
        es: 'El rastro te lleva a una hondonada donde la niebla es tan espesa que se puede masticar. Y entonces la temperatura cae de golpe.\n\nDel suelo se alza una figura de bruma y lamento: un ESPECTRO DEL VELO, atraído por el dolor que tú causaste. Su rostro cambia como el humo, y en él reconoces, por un instante... tu propia cara.',
        en: 'The trail leads you to a hollow where the mist is thick enough to chew. Then the temperature plummets.\n\nFrom the ground rises a figure of haze and lament: a VEIL WRAITH, drawn by the pain you caused. Its face shifts like smoke, and in it you recognize, for an instant... your own face.'
      },
      onEnter: [],
      choices: [],
      end: false
    },
    {
      id: 'c1_wraith_after',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'El espectro se deshace en jirones de niebla que se disuelven al sol. Donde estuvo, queda solo silencio... y una certeza incómoda: este bosque guarda heridas más viejas que las trampas de la Sierpe. Regresas a la aldea con la victoria pesándote extrañamente en los hombros.',
        en: 'The wraith unravels into ribbons of mist that dissolve in the sun. Where it stood, only silence remains... and an uncomfortable certainty: this forest keeps wounds older than the Serpent\'s traps. You return to the village, victory weighing strangely on your shoulders.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'defeated_wraith', value: true },
        { kind: 'grantTitle', key: 'veil_walker' }
      ],
      choices: [
        {
          id: 'c1_wraithafter_return',
          text: { es: 'Volver a informar al capitán', en: 'Return and report to the captain' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'travelTo', key: 'aldea_brumal' }],
          goto: 'c1_08'
        }
      ],
      end: false
    },
    {
      id: 'c1_wraith_defeat',
      chapterId: 'chapter_01',
      kind: 'narration',
      text: {
        es: 'El frío te vence. Lo último que ves es la niebla cerrándose... y unos ojos de luna abriéndose paso a través de ella. Despiertas al borde del bosque, cubiert{a|o} de escarcha, con marcas de dientes ENORMES en la manga — no de herida: de arrastre. La criatura a la que atacaste... te sacó del velo. El mundo recuerda incluso lo que no vemos.',
        en: 'The cold overcomes you. The last thing you see is the mist closing in... and two moon eyes cutting through it. You wake at the forest edge, covered in frost, with ENORMOUS teeth marks on your sleeve — not from a wound: from dragging. The creature you attacked... pulled you out of the veil. The world remembers even what we do not see.'
      },
      onEnter: [
        { kind: 'heal', amount: 999 },
        { kind: 'setFlag', key: 'saved_by_creature', value: true },
        { kind: 'gainXp', amount: 20 }
      ],
      choices: [
        {
          id: 'c1_wraithdefeat_return',
          text: { es: 'Volver a la aldea con más preguntas que nunca', en: 'Return to the village with more questions than ever' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'travelTo', key: 'aldea_brumal' }],
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
        es: 'El capitán Bren escucha tu informe en silencio, con los brazos cruzados. Cuando mencionas la trampa, su mandíbula se tensa.\n\n«Trampas de hierro dentadas... eso es obra de furtivos, y de los caros. Nadie de esta aldea puede pagarlas.» Deja caer una bolsa de monedas en tu mano. «Has hecho más en una tarde que mis hombres en una semana. La misión está cumplida... pero esto no ha terminado. Si hay furtivos en mi bosque, los encontraré. Y algo me dice que tú vas a estar en medio de todo esto, foraster{a|o}.»\n\nPor primera vez, hay algo parecido al respeto en su mirada.',
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
          id: 'c1_08_tell_pip',
          text: { es: 'Ir a contarle a Pip cómo acabó todo', en: 'Go tell Pip how it all ended' },
          conditions: [{ kind: 'flag', key: 'met_pip', op: 'has' }],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeRelationship', target: 'pip', axis: 'friendship', amount: 10 },
            { kind: 'addNpcMemory', target: 'pip', value: 'player_came_back_to_tell' }
          ],
          goto: 'c1_pip_end'
        },
        {
          id: 'c1_08_end',
          text: { es: 'Retirarte a descansar', en: 'Retire for the night' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'completeQuest', key: 'quest_first_steps' }],
          goto: 'c1_end'
        }
      ],
      end: false
    },
    {
      id: 'c1_pip_end',
      chapterId: 'chapter_01',
      kind: 'dialogue',
      speaker: 'pip',
      text: {
        es: 'Encuentras a Pip sentado en el borde del pozo, columpiando las piernas, fingiendo con muy poco éxito que no llevaba horas esperándote. Escucha tu relato con la boca abierta, interrumpiendo solo para pedir detalles importantes: qué tan grandes eran los ojos, si la niebla del pelaje era fría o caliente.\n\nCuando terminas, se queda un momento en silencio, mirando hacia el bosque oscurecido.\n\n«Yo lo sabía. Que no era mala.» Sonríe con toda la cara. «Oye... cuando la vuelvas a ver, dile que Pip pregunta por ella. Los amigos se saludan.»\n\nY por primera vez desde que llegaste a este mundo, sientes que ya no eres una desconocida en él.',
        en: 'You find Pip sitting on the rim of the well, swinging his legs, pretending very unsuccessfully that he hasn\'t been waiting for hours. He listens to your tale open-mouthed, interrupting only to demand important details: how big the eyes were, whether the mist of its fur was cold or warm.\n\nWhen you finish, he is quiet for a moment, looking toward the darkened forest.\n\n"I knew it. That it wasn\'t evil." He smiles with his whole face. "Hey... when you see it again, tell it Pip says hello. Friends greet each other."\n\nAnd for the first time since you arrived in this world, you feel you are no longer a stranger in it.'
      },
      onEnter: [{ kind: 'gainXp', amount: 10 }],
      choices: [
        {
          id: 'c1_pipend_rest',
          text: { es: 'Retirarte a descansar', en: 'Retire for the night' },
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
