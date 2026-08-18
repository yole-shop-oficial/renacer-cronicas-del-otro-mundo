import type { Chapter } from '@/engine/schema';

/**
 * CAPÍTULO 2 — El sello de la Sierpe — VERSIÓN AMPLIADA.
 * Árbol de decisiones en Ciudad Petra: la vida de Lu, paseo por los canales,
 * la taberna de los cazadores, la carta sellada de Bren (¿la abres?), la
 * sargento Vela... Cada rama siembra flags que germinan en capítulos futuros.
 * Memoria del mundo (§65) + decisión dual cooperativa (§35) en el muelle.
 */
export const CHAPTER_02: Chapter = {
  id: 'chapter_02',
  title: { es: 'Capítulo 2 — El sello de la Sierpe', en: 'Chapter 2 — The Seal of the Serpent' },
  startNodeId: 'c2_01',
  nodes: [
    {
      id: 'c2_01',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Tres días después, con una carta sellada del capitán Bren en el morral, cruzas el Bosque de los Susurros rumbo a Ciudad Petra. Las trampas de hierro no eran un caso aislado: Bren encontró dos más, todas marcadas con el mismo símbolo grabado a fuego — una sierpe enroscada mordiendo su propia cola. «Ese sello se compra en Petra», te dijo. «Y quien lo usa no caza por hambre. Entrega esta carta a la sargento Vela, de la guardia del canal. Solo a ella.»\n\nLas murallas de la ciudad emergen de la niebla como la proa de un barco de piedra.',
        en: 'Three days later, with a sealed letter from Captain Bren in your satchel, you cross the Whispering Forest toward the City of Petra. The iron traps were no isolated case: Bren found two more, all branded with the same fire-etched symbol — a coiled serpent biting its own tail. "That seal is bought in Petra," he told you. "And whoever uses it does not hunt out of hunger. Deliver this letter to Sergeant Vela of the canal guard. Her and no one else."\n\nThe city walls rise from the mist like the prow of a stone ship.'
      },
      onEnter: [
        { kind: 'startQuest', key: 'quest_serpent_seal' },
        { kind: 'travelTo', key: 'ciudad_petra' }
      ],
      choices: [
        {
          id: 'c2_01_enter_famed',
          text: { es: 'Entrar en la ciudad', en: 'Enter the city' },
          conditions: [{ kind: 'flag', key: 'freed_mist_creature', op: 'has' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_02_famed'
        },
        {
          id: 'c2_01_enter_plain',
          text: { es: 'Entrar en la ciudad', en: 'Enter the city' },
          conditions: [{ kind: 'flag', key: 'freed_mist_creature', op: 'not' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_02_plain'
        }
      ],
      end: false
    },
    {
      id: 'c2_02_famed',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'En el mercado de Petra, una vendedora de especias con pañuelo azafrán te detiene con una sonrisa cómplice.\n\n«Tú eres l{a|} de Brumal, ¿verdad? {La|El} que liberó a la bestia de niebla en vez de matarla.» Baja la voz. «Los cazadores hablan de ti en las tabernas. Unos con respeto... y otros con rabia. Soy Lu. Y si buscas al dueño del sello de la sierpe, cuidado: aquí las paredes tienen bolsillos, y los bolsillos tienen dueños.»',
        en: 'In Petra\'s market, a spice seller in a saffron headscarf stops you with a knowing smile.\n\n"You\'re the one from Brumal, aren\'t you? The one who freed the mist beast instead of killing it." She lowers her voice. "The hunters talk about you in the taverns. Some with respect... others with anger. I\'m Lu. And if you\'re looking for the owner of the serpent seal, careful: here the walls have pockets, and the pockets have owners."'
      },
      onEnter: [
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'respect', amount: 10 },
        { kind: 'changeReputation', key: 'ciudad_petra', amount: 5 }
      ],
      choices: [
        {
          id: 'c2_02f_ask',
          text: { es: 'Preguntarle por el sello de la sierpe', en: 'Ask her about the serpent seal' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'addNpcMemory', target: 'vendedora_lu', value: 'player_asked_about_seal' }],
          goto: 'c2_03'
        },
        {
          id: 'c2_02f_lu',
          text: { es: '«¿Y tú quién eres, Lu? Cuéntame de ti.»', en: '"And who are you, Lu? Tell me about yourself."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeTrait', key: 'curiosity', amount: 1 },],
          goto: 'c2_lu_story'
        },
        {
          id: 'c2_02f_stroll',
          text: { es: 'Recorrer Petra antes de hablar de negocios', en: 'Explore Petra before talking business' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_02_plain',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'En el mercado de Petra, una vendedora de especias con pañuelo azafrán observa la carta sellada que asoma de tu morral.\n\n«Sello de la guardia de Brumal... Llevas asuntos serios encima, foraster{a|o}.» Te estudia un momento y decide algo. «Soy Lu. Vendo especias y escucho cosas. Si buscas respuestas sobre trampas y sierpes, puede que las tenga. Pero en Petra nada es gratis: ni el azafrán ni la verdad.»',
        en: 'In Petra\'s market, a spice seller in a saffron headscarf eyes the sealed letter poking out of your satchel.\n\n"Seal of the Brumal guard... You carry serious business, outsider." She studies you a moment and decides something. "I\'m Lu. I sell spices and I hear things. If you\'re after answers about traps and serpents, I may have them. But in Petra nothing is free: not saffron, not truth."'
      },
      onEnter: [],
      choices: [
        {
          id: 'c2_02p_pay',
          text: { es: 'Pagarle 5 monedas por información', en: 'Pay her 5 coins for information' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'gainGold', amount: -5 },
            { kind: 'addNpcMemory', target: 'vendedora_lu', value: 'player_paid_for_info' }
          ],
          goto: 'c2_03'
        },
        {
          id: 'c2_02p_persuade',
          text: { es: '[Persuasión] Convencerla de que esto protege también su mercado', en: '[Persuasion] Convince her this protects her market too' },
          conditions: [{ kind: 'skill', key: 'persuasion', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Persuasión', en: 'Requires Persuasion' },
          effects: [
            { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 10 },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'c2_03'
        },
        {
          id: 'c2_02p_lu',
          text: { es: '«Antes de negociar... ¿quién eres tú, Lu?»', en: '"Before we bargain... who are you, Lu?"' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_lu_story'
        },
        {
          id: 'c2_02p_stroll',
          text: { es: 'Recorrer Petra antes de decidir', en: 'Explore Petra before deciding' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_lu_story',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'Lu parpadea, sinceramente sorprendida. Luego ríe, y por primera vez su sonrisa no es una herramienta de venta.\n\n«Diez años en este mercado y nadie me lo había preguntado.» Sirve dos vasitos de té especiado sin que se lo pidas. «Nací en los puertos del sur, en Zafir, donde los barcos traen especias y se llevan gente. Mi madre vendía pimienta; los aranceles del gremio la arruinaron dos veces. La segunda vez, no se levantó. Yo cargué el carro, crucé media tierra y llegué aquí con tres monedas y este pañuelo.»\n\nSe encoge de hombros.\n\n«¿Por qué escucho tanto? Porque cuando eres pobre y extranjera, saber cosas es la única moneda que nadie puede robarte. Y aprendí algo, foraster{a|o}: en Petra, los que compran criaturas enjauladas y los que arruinaron a mi madre... suelen cenar en la misma mesa.»',
        en: 'Lu blinks, genuinely surprised. Then she laughs, and for the first time her smile is not a sales tool.\n\n"Ten years in this market and nobody ever asked me that." She pours two small cups of spiced tea unbidden. "I was born in the southern ports, in Zafir, where ships bring spices and take people away. My mother sold pepper; the guild tariffs ruined her twice. The second time, she did not get up. I loaded the cart, crossed half the land, and arrived here with three coins and this headscarf."\n\nShe shrugs.\n\n"Why do I listen so much? Because when you are poor and foreign, knowing things is the only coin nobody can steal from you. And I learned something, outsider: in Petra, the people who buy caged creatures and the people who ruined my mother... tend to dine at the same table."'
      },
      onEnter: [
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 15 },
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'trust', amount: 10 },
        { kind: 'addNpcMemory', target: 'vendedora_lu', value: 'player_asked_about_lu_life' },
        { kind: 'gainXp', amount: 10 }
      ],
      choices: [
        {
          id: 'c2_lu_story_seal',
          text: { es: '«Háblame del sello de la sierpe.»', en: '"Tell me about the serpent seal."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'addNpcMemory', target: 'vendedora_lu', value: 'player_asked_about_seal' }],
          goto: 'c2_03'
        },
        {
          id: 'c2_lu_story_stroll',
          text: { es: 'Recorrer la ciudad y volver luego', en: 'Explore the city and come back later' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_stroll',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Petra es una ciudad cosida por el agua. Los canales la cruzan como venas verdes, y sobre ellos se arquean puentes de piedra tan viejos que los escalones están gastados en forma de cuchara. Los barrios cambian de olor: pescado y brea junto al canal, pan y cera en la plaza del reloj, cuero y tinta cerca del barrio de los gremios, donde cada puerta luce un sello de bronce.\n\nDos lugares te llaman la atención: una taberna junto al agua — "El Ancla Rota", de donde salen voces de cazadores — y el puesto de la guardia del canal, donde ondea el estandarte azul. La carta de Bren pesa en tu morral.',
        en: 'Petra is a city stitched together by water. Canals cross it like green veins, and stone bridges arch over them, their steps worn spoon-shaped by centuries. The neighborhoods change smell: fish and tar by the canal, bread and wax in the clock square, leather and ink near the guild quarter, where every door wears a bronze seal.\n\nTwo places catch your eye: a waterside tavern — "The Broken Anchor", spilling hunters\' voices — and the canal guard post flying its blue banner. Bren\'s letter weighs in your satchel.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'walked_petra', value: true },
        { kind: 'gainXp', amount: 5 }
      ],
      choices: [
        {
          id: 'c2_stroll_tavern',
          text: { es: 'Entrar en "El Ancla Rota"', en: 'Enter "The Broken Anchor"' },
          conditions: [{ kind: 'flag', key: 'visited_tavern', op: 'not' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_tavern'
        },
        {
          id: 'c2_stroll_guard',
          text: { es: 'Ir al puesto de la guardia del canal', en: 'Go to the canal guard post' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_guardpost'
        },
        {
          id: 'c2_stroll_letter',
          text: { es: 'Buscar un rincón discreto y leer la carta de Bren', en: 'Find a quiet corner and read Bren\'s letter' },
          conditions: [
            { kind: 'flag', key: 'opened_bren_letter', op: 'not' },
            { kind: 'flag', key: 'letter_delivered', op: 'not' }
          ],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeTrait', key: 'curiosity', amount: 1 },],
          goto: 'c2_letter'
        },
        {
          id: 'c2_stroll_back',
          text: { es: 'Volver al puesto de Lu', en: 'Return to Lu\'s stall' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'addNpcMemory', target: 'vendedora_lu', value: 'player_asked_about_seal' }],
          goto: 'c2_03'
        }
      ],
      end: false
    },
    {
      id: 'c2_letter',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Bajo un puente, con el rumor del agua tapando el mundo, giras la carta entre los dedos. El sello de cera de Brumal te mira como un ojo. Bren dijo: «Solo a ella». Pero Bren no está aquí... y tú sí.\n\nRompes el sello. La letra del capitán es recta y sin adornos, como él:\n\n«Vela: trampas de gremio en mi bosque, sello de la sierpe. Sé lo que significa y tú también. Si "ellos" vuelven a mover mercancía viva por el canal, esta vez llega hasta el final, caiga quien caiga. La persona que te entrega esto tiene mi confianza. Dale la tuya. — B.»\n\nEsta vez. Ellos. Bren y Vela ya se habían enfrentado antes a la Sierpe... y alguien impidió que llegaran hasta el final. Vuelves a doblar la carta. El sello roto ya no puede repararse.',
        en: 'Under a bridge, the murmur of water covering the world, you turn the letter in your fingers. The wax seal of Brumal stares at you like an eye. Bren said: "Her and no one else." But Bren is not here... and you are.\n\nYou break the seal. The captain\'s handwriting is straight and unadorned, like the man:\n\n"Vela: guild traps in my forest, serpent seal. I know what it means and so do you. If \'they\' move live cargo through the canal again, this time it goes all the way, no matter who falls. The bearer of this letter has my trust. Give them yours. — B."\n\nThis time. They. Bren and Vela had faced the Serpent before... and someone stopped them from going all the way. You fold the letter again. The broken seal cannot be repaired.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'opened_bren_letter', value: true },
        { kind: 'gainXp', amount: 10 }
      ],
      choices: [
        {
          id: 'c2_letter_back',
          text: { es: 'Guardar la carta y volver a las calles', en: 'Pocket the letter and return to the streets' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_tavern',
      chapterId: 'chapter_02',
      kind: 'encounter',
      text: {
        es: '"El Ancla Rota" huele a cerveza, sebo y ropa mojada. En la mesa del fondo, cuatro cazadores de manos callosas hablan en voz baja sobre jarras a medio vaciar. Uno lleva al cinto un cuchillo de desollar con mango de hueso; otro, una cicatriz de mordisco reciente en el antebrazo. Sobre la mesa, entre las jarras, hay algo que reconoces al instante: el pasador de una trampa de hierro, con la sierpe grabada.',
        en: '"The Broken Anchor" smells of ale, tallow and wet clothes. At the back table, four hunters with calloused hands talk quietly over half-empty tankards. One carries a bone-handled skinning knife; another, a fresh bite scar on his forearm. On the table, between the tankards, lies something you recognize instantly: the pin of an iron trap, engraved with the serpent.'
      },
      onEnter: [{ kind: 'setFlag', key: 'visited_tavern', value: true }],
      choices: [
        {
          id: 'c2_tavern_sneak',
          text: { es: '[Sigilo] Sentarte cerca y escuchar sin ser vist{a|o}', en: '[Stealth] Sit close and listen unseen' },
          conditions: [{ kind: 'skill', key: 'stealth', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Sigilo', en: 'Requires Stealth' },
          effects: [{ kind: 'gainXp', amount: 15 }],
          goto: 'c2_tavern_listen'
        },
        {
          id: 'c2_tavern_famed_approach',
          text: { es: 'Acercarte a su mesa abiertamente', en: 'Approach their table openly' },
          conditions: [{ kind: 'flag', key: 'freed_mist_creature', op: 'has' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_tavern_famed'
        },
        {
          id: 'c2_tavern_normal_approach',
          text: { es: 'Acercarte a su mesa abiertamente', en: 'Approach their table openly' },
          conditions: [{ kind: 'flag', key: 'freed_mist_creature', op: 'not' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_tavern_normal'
        },
        {
          id: 'c2_tavern_leave',
          text: { es: 'Salir sin llamar la atención', en: 'Leave without drawing attention' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_tavern_listen',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Te deslizas hasta el banco de al lado con una jarra que no piensas beber. Las palabras llegan a retazos, pero los retazos bastan:\n\n«...paga el doble si respira. El triple si es cría.» «¿Y si la guardia pregunta?» «La guardia del canal no pregunta. Ya no. Desde lo del año pasado, la sargento va sola contra el mundo.» «Esta noche, muelle tres. El barco no espera.»\n\nUno de ellos hace girar el pasador de la trampa sobre la mesa, como quien juega con una moneda. Ya tienes lo que necesitas: la Sierpe paga por capturas vivas, tiene comprado el silencio de casi toda la guardia... y esta noche mueve mercancía.',
        en: 'You slide onto the next bench with a tankard you have no intention of drinking. The words come in scraps, but scraps suffice:\n\n"...pays double if it breathes. Triple if it\'s a cub." "And if the guard asks?" "The canal guard doesn\'t ask. Not anymore. Since last year, the sergeant fights the world alone." "Tonight, pier three. The ship won\'t wait."\n\nOne of them spins the trap pin on the table like a coin. You have what you need: the Serpent pays for live captures, has bought the silence of most of the guard... and moves cargo tonight.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'heard_hunters_serpent', value: true },
        { kind: 'setFlag', key: 'knows_guard_corrupt', value: true }
      ],
      choices: [
        {
          id: 'c2_tavern_listen_out',
          text: { es: 'Salir con disimulo', en: 'Slip out quietly' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_tavern_famed',
      chapterId: 'chapter_02',
      kind: 'encounter',
      text: {
        es: 'Las conversaciones mueren una a una, como velas. El cazador de la cicatriz te reconoce primero; se le endurece la cara.\n\n«Vaya, vaya. L{a|El} amig{a|o} de las bestias en persona.» Se levanta despacio. «¿Sabes cuánto pagaban por esa criatura que soltaste? El jornal de un invierno entero. Mis hijos comen de esas capturas.»\n\nPero el cazador más viejo, uno de barba gris y ojos cansados, le pone una mano en el brazo: «Siéntate, Olmo. Si los rumores son ciertos, l{a|el} foraster{a|o} liberó a un animal con cría. Hasta nosotros teníamos códigos, antes de la Sierpe.» Se vuelve hacia ti, y en su voz hay algo parecido a la vergüenza. «Antes cazábamos para comer. Ahora enjaulamos para nobles. No todos estamos orgullosos, ¿sabes?»',
        en: 'The conversations die one by one, like candles. The scarred hunter recognizes you first; his face hardens.\n\n"Well, well. The beast-lover in the flesh." He rises slowly. "Do you know what they paid for that creature you freed? A whole winter\'s wages. My children eat from those captures."\n\nBut the oldest hunter, grey-bearded with tired eyes, lays a hand on his arm: "Sit down, Olmo. If the rumors are true, the outsider freed an animal with a cub. Even we had codes, before the Serpent." He turns to you, and in his voice there is something like shame. "We used to hunt to eat. Now we cage things for nobles. Not all of us are proud of it, you know?"'
      },
      onEnter: [],
      choices: [
        {
          id: 'c2_tavern_famed_stand',
          text: { es: 'Sostener la mirada: «Vuestros códigos tenían razón.»', en: 'Hold their gaze: "Your codes had it right."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'hunters_respect_earned', value: true },
            { kind: 'changeReputation', key: 'ciudad_petra', amount: 5 },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'c2_tavern_famed_info'
        },
        {
          id: 'c2_tavern_famed_round',
          text: { es: 'Pagar una ronda y escuchar su historia (5 monedas)', en: 'Buy a round and hear them out (5 coins)' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'gainGold', amount: -5 },
            { kind: 'setFlag', key: 'hunters_befriended', value: true },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'c2_tavern_famed_info'
        }
      ],
      end: false
    },
    {
      id: 'c2_tavern_famed_info',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'cazador_tomas',
      text: {
        es: 'El viejo cazador — Tomás, lo llaman — baja la voz hasta que solo la mesa puede oírla.\n\n«Escucha bien, porque esto no lo repetiré. La Sierpe no es un gremio: es un contrato. Alguien de arriba pone el oro, los intermediarios ponen el sello, y desgraciados como Olmo ponen las manos. Pagan doble por pieza viva, triple por cría. Esta noche cargan en el muelle tres.» Aprieta la jarra hasta que los nudillos se le ponen blancos. «Mi nieto me preguntó el otro día si de mayor sería cazador, como yo. No supe qué contestarle. Haz que la respuesta sea fácil, foraster{a|o}.»',
        en: 'The old hunter — Tomás, they call him — lowers his voice until only the table can hear it.\n\n"Listen well, because I won\'t repeat this. The Serpent is not a guild: it\'s a contract. Someone above puts up the gold, middlemen put up the seal, and poor devils like Olmo put up their hands. They pay double for a live piece, triple for a cub. Tonight they load at pier three." He grips his tankard until his knuckles whiten. "My grandson asked me the other day if he\'d grow up to be a hunter like me. I didn\'t know what to answer. Make the answer easy, outsider."'
      },
      onEnter: [{ kind: 'setFlag', key: 'heard_hunters_serpent', value: true }],
      choices: [
        {
          id: 'c2_tavern_famed_out',
          text: { es: 'Prometérselo y salir de la taberna', en: 'Promise him and leave the tavern' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'promised_tomas', value: true }],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_tavern_normal',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'cazador_tomas',
      text: {
        es: 'Los cazadores te miran llegar con la desconfianza tranquila de los que trabajan con las manos. El más viejo, de barba gris, te hace un gesto con la jarra.\n\n«¿Buscas mesa o buscas algo más, foraster{a|o}? Porque las dos cosas se pagan.» Cuando mencionas las trampas del bosque de Brumal, se hace un silencio espeso. El viejo lo rompe: «Trampas con sello en bosque ajeno... eso es la Sierpe, y de la Sierpe aquí no se habla. Solo te diré una cosa, porque tienes cara de no rendirte: últimamente vienen tipos de fuera, con acento del sur y bolsas llenas, comprando mapas de bosques. Bosques con criaturas del velo. Y quien compra el mapa, compra el silencio.»',
        en: 'The hunters watch you come with the calm distrust of people who work with their hands. The oldest, grey-bearded, gestures with his tankard.\n\n"Looking for a table or something more, outsider? Both cost." When you mention the traps in Brumal\'s forest, a thick silence falls. The old man breaks it: "Sealed traps in another\'s forest... that\'s the Serpent, and we don\'t speak of the Serpent here. I\'ll tell you one thing only, because you have the face of someone who doesn\'t quit: lately men come from outside, southern accents and full purses, buying maps of forests. Forests with veil creatures. And whoever buys the map, buys the silence."'
      },
      onEnter: [
        { kind: 'setFlag', key: 'visited_tavern', value: true },
        { kind: 'setFlag', key: 'heard_city_buyers', value: true },
        { kind: 'gainXp', amount: 10 }
      ],
      choices: [
        {
          id: 'c2_tavern_normal_out',
          text: { es: 'Agradecer y salir de la taberna', en: 'Thank him and leave the tavern' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_guardpost',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'sargento_vela',
      text: {
        es: 'El puesto de la guardia del canal es una torre baja con el estandarte azul deshilachado por el viento. Dentro, una mujer de uniforme impecable y ojos de no haber dormido bien en meses revisa manifiestos de carga a la luz de una lámpara. Levanta la vista, y su mirada te cataloga en un segundo: botas de camino, polvo de bosque, morral de mensajer{a|o}.\n\n«Sargento Vela, guardia del canal. Si vienes a denunciar un robo, la cola empieza fuera. Si vienes por otra cosa... habla rápido.»',
        en: 'The canal guard post is a squat tower, its blue banner frayed by the wind. Inside, a woman in an impeccable uniform, her eyes those of someone who has not slept well in months, reviews cargo manifests by lamplight. She looks up, and her gaze catalogues you in a second: road boots, forest dust, a messenger\'s satchel.\n\n"Sergeant Vela, canal guard. If you\'re here to report a theft, the queue starts outside. If you\'re here for something else... speak quickly."'
      },
      onEnter: [],
      choices: [
        {
          id: 'c2_vela_give_sealed',
          text: { es: 'Entregarle la carta sellada de Bren', en: 'Hand her Bren\'s sealed letter' },
          conditions: [
            { kind: 'flag', key: 'opened_bren_letter', op: 'not' },
            { kind: 'flag', key: 'letter_delivered', op: 'not' }
          ],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_vela_sealed'
        },
        {
          id: 'c2_vela_give_admit',
          text: { es: 'Entregar la carta abierta y admitir que la leíste', en: 'Hand over the opened letter and admit you read it' },
          conditions: [
            { kind: 'flag', key: 'opened_bren_letter', op: 'has' },
            { kind: 'flag', key: 'letter_delivered', op: 'not' }
          ],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeTrait', key: 'loyalty', amount: 2 },],
          goto: 'c2_vela_admit'
        },
        {
          id: 'c2_vela_give_hide',
          text: { es: 'Entregar la carta abierta como si nada', en: 'Hand over the opened letter as if nothing happened' },
          conditions: [
            { kind: 'flag', key: 'opened_bren_letter', op: 'has' },
            { kind: 'flag', key: 'letter_delivered', op: 'not' }
          ],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeTrait', key: 'distrust', amount: 1 },],
          goto: 'c2_vela_lie'
        },
        {
          id: 'c2_vela_leave',
          text: { es: 'Disculparte y volver a la calle', en: 'Excuse yourself and return to the street' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_vela_sealed',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'sargento_vela',
      text: {
        es: 'Vela examina el sello intacto antes de romperlo — la costumbre de quien ha aprendido a desconfiar hasta de la cera. Lee dos veces. Cuando termina, algo ha cambiado en su cara: el cansancio sigue ahí, pero debajo arde otra cosa.\n\n«Bren...» Dobla la carta con cuidado, casi con ternura. «Ese hombre cruzó el puente de Vharen con mi padre a la espalda. Yo tenía seis años.» Te mira de frente por primera vez. «El año pasado seguí un cargamento de la Sierpe hasta el muelle tres. Tenía testigos, manifiestos, todo. La noche de la redada, mis superiores me reasignaron a contar gaviotas y los testigos olvidaron sus nombres. ¿Entiendes lo que te estoy diciendo? La Sierpe tiene manos dentro de la guardia.»\n\nSe pone en pie y descuelga su capa.\n\n«Pero si Bren dice que llegue hasta el final... esta vez llego. Muelle tres, esta noche. Yo vigilaré desde el agua. Lo que tú hagas allí, foraster{a|o}, hazlo sabiendo que no estás sol{a|o}.»',
        en: 'Vela examines the intact seal before breaking it — the habit of someone who has learned to distrust even wax. She reads it twice. When she finishes, something in her face has changed: the tiredness is still there, but underneath it something else burns.\n\n"Bren..." She folds the letter carefully, almost tenderly. "That man crossed Vharen bridge with my father on his back. I was six." She looks you in the eye for the first time. "Last year I tracked a Serpent shipment to pier three. I had witnesses, manifests, everything. The night of the raid, my superiors reassigned me to counting seagulls and the witnesses forgot their names. Do you understand what I\'m telling you? The Serpent has hands inside the guard."\n\nShe rises and takes down her cloak.\n\n"But if Bren says go all the way... this time I go. Pier three, tonight. I\'ll watch from the water. Whatever you do there, outsider, do it knowing you are not alone."'
      },
      onEnter: [
        { kind: 'setFlag', key: 'letter_delivered', value: true },
        { kind: 'setFlag', key: 'vela_ally', value: true },
        { kind: 'changeRelationship', target: 'sargento_vela', axis: 'trust', amount: 20 },
        { kind: 'changeRelationship', target: 'sargento_vela', axis: 'respect', amount: 10 },
        { kind: 'gainXp', amount: 15 }
      ],
      choices: [
        {
          id: 'c2_vela_sealed_go',
          text: { es: 'Asentir y prepararte para la noche', en: 'Nod and prepare for the night' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_03'
        }
      ],
      end: false
    },
    {
      id: 'c2_vela_admit',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'sargento_vela',
      text: {
        es: 'Dejas la carta abierta sobre la mesa y lo dices sin rodeos: la leíste. Vela se queda muy quieta, con esos ojos cansados clavados en los tuyos, durante tres segundos que duran un invierno.\n\n«Rompiste el sello de un capitán de la guardia. Eso, en Petra, se paga con calabozo.» Recoge la carta y la lee. Al terminar, suspira. «Y sin embargo... me lo has dicho a la cara, sabiendo lo que te costaba. ¿Sabes cuánta gente en esta ciudad me ha dicho una verdad incómoda a la cara, en el último año? Ninguna.»\n\nDobla la carta.\n\n«Bren escribió que te dé mi confianza. La confianza no se da: se presta con interés. Considérala prestada. Muelle tres, esta noche. Yo vigilaré desde el agua... y tú y yo hablaremos de sellos rotos cuando esto acabe.»',
        en: 'You lay the opened letter on the table and say it plainly: you read it. Vela goes very still, those tired eyes fixed on yours for three seconds that last a winter.\n\n"You broke the seal of a guard captain. In Petra, that buys you a cell." She picks up the letter and reads. When she finishes, she sighs. "And yet... you told me to my face, knowing what it might cost you. Do you know how many people in this city have told me an uncomfortable truth to my face this past year? None."\n\nShe folds the letter.\n\n"Bren wrote that I should give you my trust. Trust is not given: it is lent, with interest. Consider it lent. Pier three, tonight. I\'ll watch from the water... and you and I will talk about broken seals when this is over."'
      },
      onEnter: [
        { kind: 'setFlag', key: 'letter_delivered', value: true },
        { kind: 'setFlag', key: 'vela_ally', value: true },
        { kind: 'setFlag', key: 'vela_knows_you_opened', value: true },
        { kind: 'changeRelationship', target: 'sargento_vela', axis: 'respect', amount: 15 },
        { kind: 'changeRelationship', target: 'sargento_vela', axis: 'trust', amount: 5 },
        { kind: 'addNpcMemory', target: 'sargento_vela', value: 'player_admitted_opening_letter' },
        { kind: 'gainXp', amount: 15 }
      ],
      choices: [
        {
          id: 'c2_vela_admit_go',
          text: { es: 'Aceptar el trato y prepararte para la noche', en: 'Accept the deal and prepare for the night' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_03'
        }
      ],
      end: false
    },
    {
      id: 'c2_vela_lie',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'sargento_vela',
      text: {
        es: 'Le tiendes la carta con gesto neutro. Vela la toma... y sus dedos se detienen en el borde del sello un instante de más. Lo sabías: los ojos que revisan manifiestos de carga doce horas al día no pasan por alto una cera recompuesta.\n\nNo dice nada. Lee la carta, la dobla, y cuando vuelve a mirarte hay una puerta cerrada donde antes había una rendija.\n\n«Dile a Bren que recibí su mensaje.» Su voz es correcta, profesional, helada. «El muelle tres se vigilará esta noche. La guardia agradece la colaboración de los mensajeros... incluso de los que leen el correo ajeno y no lo dicen.»\n\nSientes las orejas arder. Sabe. Ha sabido desde el primer segundo, y tu silencio le ha contado más que la carta.',
        en: 'You hand her the letter with a neutral expression. Vela takes it... and her fingers pause on the seal\'s edge one instant too long. You knew it: eyes that review cargo manifests twelve hours a day do not miss reassembled wax.\n\nShe says nothing. She reads the letter, folds it, and when she looks at you again there is a closed door where a crack of light used to be.\n\n"Tell Bren I received his message." Her voice is correct, professional, ice-cold. "Pier three will be watched tonight. The guard appreciates the cooperation of messengers... even those who read other people\'s mail and say nothing."\n\nYou feel your ears burn. She knows. She has known since the first second, and your silence told her more than the letter did.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'letter_delivered', value: true },
        { kind: 'setFlag', key: 'vela_knows_you_opened', value: true },
        { kind: 'setFlag', key: 'vela_distrusts', value: true },
        { kind: 'changeRelationship', target: 'sargento_vela', axis: 'trust', amount: -15 },
        { kind: 'addNpcMemory', target: 'sargento_vela', value: 'player_lied_about_seal' }
      ],
      choices: [
        {
          id: 'c2_vela_lie_go',
          text: { es: 'Salir del puesto con la lección aprendida', en: 'Leave the post, lesson learned' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_03'
        }
      ],
      end: false
    },
    {
      id: 'c2_03',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'Lu finge ordenar sus frascos de especias mientras habla en voz baja.\n\n«El sello de la sierpe pertenece a una compañía de "comerciantes de pieles exóticas". Se hacen llamar la Sierpe. Oficialmente venden cuero y ámbar. Extraoficialmente... capturan criaturas del velo vivas: bestias de niebla, fuegos fatuos, crías de grifo. Hay nobles que pagan fortunas por tener en una jaula lo que no deberían tener ni en sueños.»\n\nDesliza un mapa diminuto entre dos frascos.\n\n«Tienen un almacén junto al canal, muelle tres. Esta noche mueven mercancía. Si vas, no vayas sol{a|o}... y decide bien a qué vas.»',
        en: 'Lu pretends to arrange her spice jars while speaking quietly.\n\n"The serpent seal belongs to a company of \'exotic hide merchants\'. They call themselves the Serpent. Officially they sell leather and amber. Unofficially... they capture veil creatures alive: mist beasts, wisps, griffin cubs. There are nobles who pay fortunes to cage what they shouldn\'t even dream of owning."\n\nShe slides a tiny map between two jars.\n\n"They have a warehouse by the canal, pier three. Tonight they move cargo. If you go, don\'t go alone... and choose well what you go for."'
      },
      onEnter: [{ kind: 'setFlag', key: 'knows_serpent_warehouse', value: true }],
      choices: [
        {
          id: 'c2_03_night',
          text: { es: 'Esperar a la noche e ir al muelle tres', en: 'Wait for nightfall and go to pier three' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_04'
        },
        {
          id: 'c2_03_stroll_more',
          text: { es: 'Aprovechar la tarde para conocer mejor la ciudad', en: 'Use the afternoon to know the city better' },
          conditions: [{ kind: 'flag', key: 'walked_petra', op: 'not' }],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_stroll'
        }
      ],
      end: false
    },
    {
      id: 'c2_04',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'La noche cae sobre Petra como una capa de terciopelo mojado. El muelle tres huele a sal, brea y miedo animal. Tras unas cajas apiladas, observas el almacén: dos guardias con el sello de la sierpe en el pecho, un carro enjaulado cubierto por lonas... y desde dentro, un sonido que reconoces al instante. Un gemido agudo, como el de aquella criatura del bosque, pero más pequeño. Más joven.\n\nHay crías ahí dentro.',
        en: 'Night falls on Petra like a wet velvet cloak. Pier three smells of salt, tar and animal fear. From behind stacked crates you watch the warehouse: two guards with the serpent seal on their chests, a caged cart covered with tarps... and from inside, a sound you recognize instantly. A high-pitched whimper, like that creature in the forest — but smaller. Younger.\n\nThere are cubs in there.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c2_04_stealth',
          text: { es: '[Sigilo] Rodear el almacén sin ser vist{a|o}', en: '[Stealth] Circle the warehouse unseen' },
          conditions: [{ kind: 'skill', key: 'stealth', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Sigilo', en: 'Requires Stealth' },
          effects: [
            { kind: 'setFlag', key: 'found_ledger', value: true },
            { kind: 'gainXp', amount: 15 }
          ],
          goto: 'c2_05_ledger'
        },
        {
          id: 'c2_04_magic',
          text: { es: '[Detectar magia] Leer los sellos del almacén', en: '[Detect Magic] Read the warehouse wards' },
          conditions: [{ kind: 'skill', key: 'detect_magic', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Detectar magia', en: 'Requires Detect Magic' },
          effects: [
            { kind: 'setFlag', key: 'wards_disarmed', value: true },
            { kind: 'gainXp', amount: 15 }
          ],
          goto: 'c2_05_wards'
        },
        {
          id: 'c2_04_direct',
          text: { es: 'Acercarte sin más y evaluar de cerca', en: 'Simply move closer and assess' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_05_direct'
        }
      ],
      end: false
    },
    {
      id: 'c2_05_ledger',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Te deslizas entre las sombras como si hubieras nacido en ellas. Por una ventana entreabierta ves el interior: seis jaulas pequeñas, cuatro ocupadas por crías de niebla que tiemblan abrazadas. Y sobre un escritorio, un libro de cuentas abierto: nombres, cifras, destinos. El comprador de esta noche firma como «S. V.» — y la cifra tiene demasiados ceros.\n\nUn cuerno suena a lo lejos: el barco comprador está entrando al canal. Queda poco tiempo.',
        en: 'You slip through the shadows as if born to them. Through a half-open window you see inside: six small cages, four holding mist cubs trembling in a huddle. And on a desk, an open ledger: names, figures, destinations. Tonight\'s buyer signs as "S. V." — and the figure has too many zeros.\n\nA horn sounds in the distance: the buyer\'s ship is entering the canal. Time is short.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c2_05l_go',
          text: { es: 'Es el momento de decidir', en: 'It is time to decide' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_06'
        }
      ],
      end: false
    },
    {
      id: 'c2_05_wards',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Cierras los ojos y dejas que tu percepción arcana se despliegue. El almacén está protegido por tres sellos de alarma baratos — trabajo de aficionado. Los desactivas uno a uno con la paciencia de quien deshace nudos. Ahora el edificio está ciego a la magia... y por la rendija de la puerta ves cuatro jaulas con crías de niebla y oyes a los guardias hablar de un barco que llega esta noche.\n\nUn cuerno suena a lo lejos. Queda poco tiempo.',
        en: 'You close your eyes and let your arcane perception unfold. The warehouse is protected by three cheap alarm wards — amateur work. You disarm them one by one with the patience of someone untying knots. Now the building is blind to magic... and through the door crack you see four cages of mist cubs and hear the guards talk about a ship arriving tonight.\n\nA horn sounds in the distance. Time is short.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c2_05w_go',
          text: { es: 'Es el momento de decidir', en: 'It is time to decide' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_06'
        }
      ],
      end: false
    },
    {
      id: 'c2_05_direct',
      chapterId: 'chapter_02',
      kind: 'encounter',
      text: {
        es: 'Avanzas agachad{a|o} entre las cajas. Estás a diez pasos cuando una tabla cruje bajo tu pie. Uno de los guardias gira la cabeza — te aplastas contra una pila de redes que huele a pescado viejo y contienes la respiración hasta que el corazón te golpea las costillas. «Ratas», gruñe el guardia al fin. Desde tu escondite ves lo esencial: cuatro jaulas con crías de niebla, y un cuerno que suena a lo lejos anunciando el barco del comprador.\n\nQueda poco tiempo.',
        en: 'You creep forward between the crates. You are ten paces away when a board creaks underfoot. One guard turns his head — you flatten yourself against a pile of nets smelling of old fish and hold your breath until your heart pounds your ribs. "Rats," the guard finally grunts. From your hiding place you see what matters: four cages of mist cubs, and a horn sounding in the distance announcing the buyer\'s ship.\n\nTime is short.'
      },
      onEnter: [{ kind: 'setFlag', key: 'nearly_spotted', value: true }],
      choices: [
        {
          id: 'c2_05d_go',
          text: { es: 'Avanzar hacia las jaulas', en: 'Move toward the cages' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_poacher'
        }
      ],
      end: false
    },
    {
      // COMBATE: la ruta directa tiene precio — un furtivo te corta el paso.
      id: 'c2_poacher',
      chapterId: 'chapter_02',
      kind: 'encounter',
      combatId: 'furtivo_sierpe',
      victoryGoto: 'c2_poacher_after',
      defeatGoto: 'c2_poacher_defeat',
      text: {
        es: 'Dos pasos más... y una tabla cede del todo. El guardia de la cicatriz se gira, y esta vez no hay redes que te escondan.\n\n«Vaya, vaya. La rata del muelle.» Desenvaina un cuchillo de desollar con el sello de la sierpe en el mango. «El jefe paga extra por los curiosos. Enteros... o a trozos.»',
        en: 'Two more steps... and a plank gives way completely. The scarred guard turns, and this time no nets hide you.\n\n"Well, well. The pier rat." He draws a skinning knife with the serpent seal on its handle. "The boss pays extra for the curious. Whole... or in pieces."'
      },
      duoText: {
        es: 'Dos pasos más... y una tabla cede del todo. El guardia de la cicatriz se gira — y os ve a los dos.\n\n«Dos ratas por el precio de una.» Desenvaina un cuchillo de desollar con el sello de la sierpe. «El jefe paga extra por los curiosos.» A tu lado, {partner} ya está en guardia.',
        en: 'Two more steps... and a plank gives way completely. The scarred guard turns — and sees you both.\n\n"Two rats for the price of one." He draws a skinning knife bearing the serpent seal. "The boss pays extra for the curious." At your side, {partner} is already on guard.'
      },
      onEnter: [],
      choices: [],
      end: false
    },
    {
      id: 'c2_poacher_after',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'El furtivo cae de rodillas... y, fiel a su calaña, se arrastra hacia las sombras y huye cojeando. Mercenario al fin: nadie le paga lo suficiente para morir.\n\nSu cuchillo con el sello de la sierpe queda en el suelo: una prueba más. El camino hacia las jaulas está libre... y el cuerno del barco suena ya en el canal.',
        en: 'The poacher drops to his knees... and, true to his kind, crawls into the shadows and flees limping. A mercenary to the end: nobody pays him enough to die.\n\nHis serpent-sealed knife lies on the ground: one more piece of proof. The way to the cages is clear... and the ship horn already sounds in the canal.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'defeated_poacher', value: true },
        { kind: 'setFlag', key: 'has_serpent_knife', value: true }
      ],
      choices: [
        {
          id: 'c2_poacherafter_go',
          text: { es: 'Es el momento de decidir', en: 'It is time to decide' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_06'
        }
      ],
      end: false
    },
    {
      id: 'c2_poacher_defeat',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'El mango del cuchillo te encuentra la sien... y el mundo se apaga.\n\nDespiertas al alba, atad{a|o} entre redes que huelen a pescado, con la cabeza latiendo. El barco ya no está. Las crías tampoco. Alguien te dejó una jarra de agua al alcance: los cazadores de Tomás, que no delatan... pero tampoco pelean contra la Sierpe.\n\nEsta noche perdiste. Pero sigues respirando, y ahora saben tu cara: lo que venga será más difícil... y más personal.',
        en: 'The knife handle finds your temple... and the world goes dark.\n\nYou wake at dawn, tied among nets that smell of fish, head pounding. The ship is gone. So are the cubs. Someone left a jug of water within reach: Tomás hunters, who do not snitch... but do not fight the Serpent either.\n\nTonight you lost. But you still breathe, and now they know your face: what comes next will be harder... and more personal.'
      },
      onEnter: [
        { kind: 'heal', amount: 999 },
        { kind: 'gainGold', amount: -8 },
        { kind: 'setFlag', key: 'lost_to_poacher', value: true },
        { kind: 'setFlag', key: 'cubs_shipped_away', value: true },
        { kind: 'setFlag', key: 'coop_c2_followed_leader', value: false },
        { kind: 'gainXp', amount: 15 }
      ],
      choices: [
        {
          id: 'c2_poacherdefeat_lu',
          text: { es: 'Volver con Lu antes del amanecer', en: 'Return to Lu before dawn' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_08'
        }
      ],
      end: false
    },
    {
      id: 'c2_06',
      chapterId: 'chapter_02',
      kind: 'encounter',
      coopEventId: 'c2_pier_choice',
      text: {
        es: 'El barco atraca. La Sierpe empieza a cargar las jaulas. Solo hay tiempo para una cosa, y lo sabes: si liberas a las crías ahora, el líder de la Sierpe embarcará y desaparecerá con su libro de cuentas y sus compradores. Si sigues al líder hasta su reunión, las crías zarparán hacia una jaula dorada de la que nadie vuelve.\n\nEl destino se bifurca. Si compartes esta aventura con un compañero, esta es una decisión que os define a ambos: el mundo recordará lo que cada uno eligió.',
        en: 'The ship docks. The Serpent begins loading the cages. There is only time for one thing, and you know it: if you free the cubs now, the Serpent\'s leader will board and vanish with his ledger and his buyers. If you follow the leader to his meeting, the cubs will sail toward a gilded cage from which no one returns.\n\nFate forks. If you share this adventure with a partner, this is a decision that defines you both: the world will remember what each of you chose.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c2_06_free_cubs',
          text: { es: '⚖ Liberar a las crías (la Sierpe escapa)', en: '⚖ Free the cubs (the Serpent escapes)' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeTrait', key: 'compassion', amount: 2 },
            { kind: 'setFlag', key: 'coop_c2_freed_cubs', value: true },
            { kind: 'gainXp', amount: 30 },
            { kind: 'grantTitle', key: 'cub_guardian' },
            { kind: 'changeReputation', key: 'ciudad_petra', amount: -5 },
            { kind: 'changeReputation', key: 'aldea_brumal', amount: 10 }
          ],
          goto: 'c2_07_cubs'
        },
        {
          id: 'c2_06_follow_leader',
          text: { es: '⚖ Seguir al líder de la Sierpe (las crías zarpan)', en: '⚖ Follow the Serpent\'s leader (the cubs sail away)' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeTrait', key: 'ambition', amount: 2 },
            { kind: 'setFlag', key: 'coop_c2_followed_leader', value: true },
            { kind: 'gainXp', amount: 30 },
            { kind: 'setFlag', key: 'knows_serpent_buyer', value: true },
            { kind: 'changeReputation', key: 'ciudad_petra', amount: 5 }
          ],
          goto: 'c2_07_leader'
        }
      ],
      end: false
    },
    {
      id: 'c2_07_cubs',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Actúas sin dudar. Un pasador roto, una jaula abierta, luego otra. Las crías de niebla se derraman hacia la noche como humo que huye de un incendio, y la última se detiene un instante para mirarte con ojos de luna — los mismos ojos del bosque. Después, los gritos: la Sierpe descubre las jaulas vacías mientras su líder embarca maldiciendo tu nombre sin conocerlo.\n\nHas ganado enemigos poderosos esta noche. Y cuatro vidas.',
        en: 'You act without hesitation. A broken pin, one cage open, then another. The mist cubs spill into the night like smoke fleeing a fire, and the last one pauses to look at you with moon eyes — the same eyes from the forest. Then the shouting: the Serpent discovers the empty cages while their leader boards, cursing a name he does not yet know.\n\nYou have made powerful enemies tonight. And saved four lives.'
      },
      onEnter: [{ kind: 'setFlag', key: 'serpent_leader_escaped', value: true }],
      choices: [
        {
          id: 'c2_07c_end',
          text: { es: 'Volver con Lu antes del amanecer', en: 'Return to Lu before dawn' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_08'
        }
      ],
      end: false
    },
    {
      id: 'c2_07_leader',
      chapterId: 'chapter_02',
      kind: 'narration',
      text: {
        es: 'Aprietas los puños y eliges la presa grande. Sigues al líder de la Sierpe por callejones que se estrechan como gargantas, hasta una casa de baños abandonada. A través de una celosía lo ves estrechar la mano de un hombre de anillo pesado y acento del sur: «Lord Servan Vell espera el cargamento completo en primavera», dice. Servan Vell. S. V. Un nombre que pesa como una losa.\n\nCuando regresas al muelle, el barco — y las crías — ya no están. Esta noche has ganado la verdad. Y la verdad tiene un precio que otros pagaron por ti.',
        en: 'You clench your fists and choose the bigger prey. You follow the Serpent\'s leader through alleys that narrow like throats, to an abandoned bathhouse. Through a lattice you watch him shake hands with a heavy-ringed man with a southern accent: "Lord Servan Vell expects the full shipment by spring," he says. Servan Vell. S. V. A name that lands like a gravestone.\n\nWhen you return to the pier, the ship — and the cubs — are gone. Tonight you won the truth. And the truth has a price that others paid for you.'
      },
      onEnter: [{ kind: 'setFlag', key: 'cubs_shipped_away', value: true }],
      choices: [
        {
          id: 'c2_07l_end',
          text: { es: 'Volver con Lu antes del amanecer', en: 'Return to Lu before dawn' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c2_08'
        }
      ],
      end: false
    },
    {
      id: 'c2_08',
      chapterId: 'chapter_02',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'Lu te espera en su puesto cerrado, con dos tazas de té de especias humeando entre las manos. Escucha tu relato en silencio, y al final asiente despacio.\n\n«Sea lo que sea lo que elegiste, elegiste. Eso ya es más de lo que hace la mayoría.» Te tiende una de las tazas. «La Sierpe no olvida, y los que están encima de la Sierpe tampoco. Esto ya no es un asunto de trampas en un bosque, foraster{a|o}. Es una cuerda que sube muy alto... y tú acabas de tirar de ella.»\n\nEl amanecer tiñe de cobre los tejados de Petra. Tu historia acaba de hacerse más grande.\n\n✦ Fin del Capítulo 2. Tus decisiones han quedado grabadas en el mundo. ✦',
        en: 'Lu waits at her shuttered stall with two cups of spiced tea steaming in her hands. She listens to your account in silence, and at the end nods slowly.\n\n"Whatever you chose, you chose. That is already more than most people do." She hands you one of the cups. "The Serpent does not forget, and those above the Serpent forget even less. This is no longer about traps in a forest, outsider. It is a rope that climbs very high... and you just pulled it."\n\nDawn paints Petra\'s rooftops copper. Your story just got bigger.\n\n✦ End of Chapter 2. Your decisions are engraved in the world. ✦'
      },
      onEnter: [
        { kind: 'completeQuest', key: 'quest_serpent_seal' },
        { kind: 'gainGold', amount: 15 },
        { kind: 'gainXp', amount: 20 },
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'trust', amount: 15 },
        { kind: 'setFlag', key: 'servan_vell_arc_open', value: true }
      ],
      choices: [
        {
          id: 'c2_08_continue',
          text: { es: 'Capítulo 3 — La cuerda que sube', en: 'Chapter 3 — The Climbing Rope' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'chapter:chapter_03'
        }
      ],
      end: true
    }
  ]
};
