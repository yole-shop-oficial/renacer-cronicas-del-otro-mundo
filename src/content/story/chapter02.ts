import type { Chapter } from '@/engine/schema';

/**
 * CAPÍTULO 2 — El sello de la Sierpe.
 * - Memoria del mundo (§65): el capítulo reacciona a las decisiones del C1
 *   (freed_mist_creature / attacked_mist_creature / left_creature_trapped).
 * - Primer evento de decisión dual cooperativa (§35): en c2_06 cada jugador
 *   decide su camino; en coop, la UI muestra la elección del compañero y la
 *   consecuencia queda registrada en el event log compartido.
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
        es: 'Tres días después, con una carta sellada del capitán Bren en el morral, cruzas el Bosque de los Susurros rumbo a Ciudad Petra. Las trampas de hierro no eran un caso aislado: Bren encontró dos más, todas marcadas con el mismo símbolo grabado a fuego — una sierpe enroscada mordiendo su propia cola. «Ese sello se compra en Petra», te dijo. «Y quien lo usa no caza por hambre.»\n\nLas murallas de la ciudad emergen de la niebla como la proa de un barco de piedra.',
        en: 'Three days later, with a sealed letter from Captain Bren in your satchel, you cross the Whispering Forest toward the City of Petra. The iron traps were no isolated case: Bren found two more, all branded with the same fire-etched symbol — a coiled serpent biting its own tail. "That seal is bought in Petra," he told you. "And whoever uses it does not hunt out of hunger."\n\nThe city walls rise from the mist like the prow of a stone ship.'
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
        es: 'En el mercado de Petra, una vendedora de especias con pañuelo azafrán te detiene con una sonrisa cómplice.\n\n«Tú eres la de Brumal, ¿verdad? La que liberó a la bestia de niebla en vez de matarla.» Baja la voz. «Los cazadores hablan de ti en las tabernas. Unos con respeto... y otros con rabia. Soy Lu. Y si buscas al dueño del sello de la sierpe, cuidado: aquí las paredes tienen bolsillos, y los bolsillos tienen dueños.»',
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
        es: 'En el mercado de Petra, una vendedora de especias con pañuelo azafrán observa la carta sellada que asoma de tu morral.\n\n«Sello de la guardia de Brumal... Llevas asuntos serios encima, forastera.» Te estudia un momento y decide algo. «Soy Lu. Vendo especias y escucho cosas. Si buscas respuestas sobre trampas y sierpes, puede que las tenga. Pero en Petra nada es gratis: ni el azafrán ni la verdad.»',
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
        es: 'Lu finge ordenar sus frascos de especias mientras habla en voz baja.\n\n«El sello de la sierpe pertenece a una compañía de "comerciantes de pieles exóticas". Se hacen llamar la Sierpe. Oficialmente venden cuero y ámbar. Extraoficialmente... capturan criaturas del velo vivas: bestias de niebla, fuegos fatuos, crías de grifo. Hay nobles que pagan fortunas por tener en una jaula lo que no deberían tener ni en sueños.»\n\nDesliza un mapa diminuto entre dos frascos.\n\n«Tienen un almacén junto al canal, muelle tres. Esta noche mueven mercancía. Si vas, no vayas sola... y decide bien a qué vas.»',
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
          text: { es: '[Sigilo] Rodear el almacén sin ser vista', en: '[Stealth] Circle the warehouse unseen' },
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
        es: 'Avanzas agachada entre las cajas. Estás a diez pasos cuando una tabla cruje bajo tu pie. Uno de los guardias gira la cabeza — te aplastas contra una pila de redes que huele a pescado viejo y contienes la respiración hasta que el corazón te golpea las costillas. «Ratas», gruñe el guardia al fin. Desde tu escondite ves lo esencial: cuatro jaulas con crías de niebla, y un cuerno que suena a lo lejos anunciando el barco del comprador.\n\nQueda poco tiempo.',
        en: 'You creep forward between the crates. You are ten paces away when a board creaks underfoot. One guard turns his head — you flatten yourself against a pile of nets smelling of old fish and hold your breath until your heart pounds your ribs. "Rats," the guard finally grunts. From your hiding place you see what matters: four cages of mist cubs, and a horn sounding in the distance announcing the buyer\'s ship.\n\nTime is short.'
      },
      onEnter: [{ kind: 'setFlag', key: 'nearly_spotted', value: true }],
      choices: [
        {
          id: 'c2_05d_go',
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
        es: 'Lu te espera en su puesto cerrado, con dos tazas de té de especias humeando entre las manos. Escucha tu relato en silencio, y al final asiente despacio.\n\n«Sea lo que sea lo que elegiste, elegiste. Eso ya es más de lo que hace la mayoría.» Te tiende una de las tazas. «La Sierpe no olvida, y los que están encima de la Sierpe tampoco. Esto ya no es un asunto de trampas en un bosque, forastera. Es una cuerda que sube muy alto... y tú acabas de tirar de ella.»\n\nEl amanecer tiñe de cobre los tejados de Petra. Tu historia acaba de hacerse más grande.',
        en: 'Lu waits at her shuttered stall with two cups of spiced tea steaming in her hands. She listens to your account in silence, and at the end nods slowly.\n\n"Whatever you chose, you chose. That is already more than most people do." She hands you one of the cups. "The Serpent does not forget, and those above the Serpent forget even less. This is no longer about traps in a forest, outsider. It is a rope that climbs very high... and you just pulled it."\n\nDawn paints Petra\'s rooftops copper. Your story just got bigger.'
      },
      onEnter: [
        { kind: 'completeQuest', key: 'quest_serpent_seal' },
        { kind: 'gainGold', amount: 15 },
        { kind: 'gainXp', amount: 20 },
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'trust', amount: 15 },
        { kind: 'setFlag', key: 'servan_vell_arc_open', value: true }
      ],
      choices: [],
      end: true
    }
  ]
};
