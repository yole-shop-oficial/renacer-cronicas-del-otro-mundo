import type { Chapter } from '@/engine/schema';

/**
 * CAPÍTULO 5 — El puerto de Zafir (arco del sur).
 * Cierra §45: DIVISIÓN DE TAREAS SIMULTÁNEAS en el clímax:
 * detener el barco de Vell exige DOS cosas a la vez — vencer al
 * Corsario del cabrestante Y romper la barrera del puerto.
 * Cuatro resoluciones según la combinación de resultados.
 */
export const CHAPTER_05: Chapter = {
  id: 'chapter_05',
  title: { es: 'Capítulo 5 — El puerto de Zafir', en: 'Chapter 5 — The Port of Zafir' },
  startNodeId: 'c5_01',
  nodes: [
    {
      id: 'c5_01',
      chapterId: 'chapter_05',
      kind: 'narration',
      text: {
        es: 'Dos semanas de camino al sur, y el aire cambia: sal, pimienta y calor viejo. Zafir aparece al doblar el acantilado — un anfiteatro de casas encaladas cayendo hacia un puerto erizado de mástiles.\n\nLa ciudad natal de Lu. Donde los barcos traen especias y se llevan gente. Y en algún amarre de ese bosque de madera, la "Estrella del Sur" carga agua y provisiones: Servan Vell zarpa con la marea del alba hacia cortes donde ninguna ley de Petra lo alcanzará jamás.\n\nEsta noche o nunca.',
        en: 'Two weeks south, and the air changes: salt, pepper and old heat. Zafir appears past the cliff — an amphitheater of whitewashed houses tumbling toward a harbor bristling with masts.\n\nLu\'s hometown. Where ships bring spices and take people away. And somewhere in that forest of wood, the "Southern Star" loads water and provisions: Servan Vell sails with the dawn tide toward courts where no law of Petra will ever reach him.\n\nTonight or never.'
      },
      duoText: {
        es: 'Dos semanas de camino al sur, y el aire cambia: sal, pimienta y calor viejo. Zafir aparece al doblar el acantilado, y {partner} silba bajito a tu lado: un anfiteatro de casas encaladas cayendo hacia un puerto erizado de mástiles.\n\nLa ciudad natal de Lu. Y en algún amarre, la "Estrella del Sur" carga provisiones: Vell zarpa con la marea del alba.\n\nEsta noche o nunca. Y esta noche... sois dos.',
        en: 'Two weeks south, and the air changes: salt, pepper and old heat. Zafir appears past the cliff, and {partner} whistles softly at your side: an amphitheater of whitewashed houses tumbling toward a harbor bristling with masts.\n\nLu\'s hometown. And at some mooring, the "Southern Star" loads provisions: Vell sails with the dawn tide.\n\nTonight or never. And tonight... you are two.'
      },
      onEnter: [
        { kind: 'startQuest', key: 'quest_southern_star' },
        { kind: 'travelTo', key: 'puerto_zafir' }
      ],
      choices: [
        {
          id: 'c5_01_go',
          text: { es: 'Bajar al puerto al anochecer', en: 'Descend to the harbor at dusk' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c5_02'
        }
      ],
      end: false
    },
    {
      id: 'c5_02',
      chapterId: 'chapter_05',
      kind: 'narration',
      text: {
        es: 'El plan nace solo, mirando el puerto desde una azotea: Zafir cierra su bocana cada noche con una BARRERA de cadenas y troncos, movida por un cabrestante en el muelle mayor. Si la barrera no se abre... ningún barco sale con la marea.\n\nPero hay dos problemas, y son simultáneos: el cabrestante lo custodia un CORSARIO a sueldo de Vell que no se moverá de ahí... y el mecanismo de la barrera exige un ritmo exacto de palancas que no perdona errores. Dos tareas. Una sola marea.',
        en: 'The plan writes itself, watching the harbor from a rooftop: Zafir closes its mouth each night with a BOOM of chains and logs, driven by a capstan on the great pier. If the boom does not open... no ship leaves with the tide.\n\nBut there are two problems, and they are simultaneous: the capstan is guarded by a CORSAIR in Vell\'s pay who will not move... and the boom mechanism demands an exact rhythm of levers that forgives no mistakes. Two tasks. One tide.'
      },
      duoText: {
        es: 'El plan nace solo, mirando el puerto desde una azotea: Zafir cierra su bocana cada noche con una BARRERA de cadenas, movida por un cabrestante en el muelle mayor. Si la barrera no se abre, ningún barco sale con la marea.\n\nDos problemas, simultáneos: el CORSARIO que custodia el cabrestante... y el mecanismo de palancas que exige un ritmo perfecto. Miras a {partner}. Dos tareas. Dos almas. Una sola marea.\n\nPor primera vez desde que la Diosa anudó vuestros hilos, no hará falta elegir el mismo camino: hará falta elegir CAMINOS DISTINTOS.',
        en: 'The plan writes itself, watching the harbor from a rooftop: Zafir closes its mouth each night with a BOOM of chains, driven by a capstan on the great pier. If the boom does not open, no ship leaves with the tide.\n\nTwo problems, simultaneous: the CORSAIR guarding the capstan... and the lever mechanism demanding a perfect rhythm. You look at {partner}. Two tasks. Two souls. One tide.\n\nFor the first time since the Goddess knotted your threads, you will not need to choose the same path: you will need to choose DIFFERENT ones.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c5_02_split',
          text: { es: 'Dividirse: es la única forma', en: 'Split up: it is the only way' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'zafir_split_started', value: true }],
          goto: 'c5_split'
        }
      ],
      end: false
    },
    {
      id: 'c5_split',
      chapterId: 'chapter_05',
      kind: 'encounter',
      splitTaskId: 'zafir_harbor_split',
      text: {
        es: 'La campana del puerto da la medianoche. La marea empieza a subir.\n\nEl Corsario afila su sable junto al cabrestante, y las cinco palancas de la barrera esperan su ritmo exacto en la caseta del mecanismo. Dos tareas. Ahora.',
        en: 'The harbor bell strikes midnight. The tide begins to rise.\n\nThe Corsair whets his saber beside the capstan, and the boom\'s five levers await their exact rhythm in the mechanism house. Two tasks. Now.'
      },
      onEnter: [],
      choices: [],
      end: false
    },
    {
      id: 'c5_both_win',
      chapterId: 'chapter_05',
      kind: 'narration',
      text: {
        es: 'Perfecto. No hay otra palabra.\n\nEl Corsario cae de rodillas EXACTAMENTE cuando la quinta palanca encaja, y la barrera de cadenas emerge del agua negra como la mandíbula de un dios marino, sellando la bocana con un estruendo que despierta a media Zafir.\n\nEn la "Estrella del Sur" estallan los gritos. Demasiado tarde: la marea sube, la bocana está cerrada, y las luces de la guardia portuaria — avisada por una vendedora de especias que conoce esta ciudad como su nombre — ya bajan por los callejones.\n\nServan Vell, lord del sur, amigo de tres cortes, es arrestado en pijama de seda intentando subir a un bote de remos.',
        en: 'Perfect. There is no other word.\n\nThe Corsair drops to his knees EXACTLY as the fifth lever locks, and the chain boom rises from the black water like the jaw of a sea god, sealing the mouth with a boom that wakes half of Zafir.\n\nAboard the "Southern Star", shouting erupts. Too late: the tide is rising, the mouth is sealed, and the harbor guard\'s lights — tipped off by a spice seller who knows this city like her own name — already pour down the alleys.\n\nServan Vell, lord of the south, friend of three courts, is arrested in silk pajamas trying to board a rowing boat.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'vell_arrested', value: true },
        { kind: 'gainXp', amount: 30 },
        { kind: 'changeReputation', key: 'puerto_zafir', amount: 15 }
      ],
      choices: [
        {
          id: 'c5_bw_end',
          text: { es: 'Ver el amanecer sobre el puerto', en: 'Watch the dawn over the harbor' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c5_end'
        }
      ],
      end: false
    },
    {
      id: 'c5_combat_only',
      chapterId: 'chapter_05',
      kind: 'narration',
      text: {
        es: 'El Corsario cae... pero la tercera palanca se atasca a destiempo y la barrera se alza a MEDIAS: un colmillo de cadenas asomando del agua.\n\nLa "Estrella del Sur" lo intenta igual. El casco raspa las cadenas con un aullido de madera herida, cruza la bocana cojeando... y encalla en el banco de arena exterior, a tiro de piedra del faro. Vell escapa en un bote hacia un pesquero cómplice — otra vez el mar se lo traga — pero su barco, su carga y su libro de rutas quedan varados para la guardia.\n\nMedia victoria. Las medias victorias también empujan la historia.',
        en: 'The Corsair falls... but the third lever jams off-beat and the boom rises HALFWAY: a fang of chains breaking the water.\n\nThe "Southern Star" tries anyway. Her hull rakes the chains with a howl of wounded wood, limps through the mouth... and runs aground on the outer sandbar, a stone\'s throw from the lighthouse. Vell escapes by boat to an accomplice fishing vessel — the sea swallows him again — but his ship, cargo and route ledger are stranded for the guard.\n\nHalf a victory. Half victories also push the story.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'star_grounded', value: true },
        { kind: 'setFlag', key: 'vell_escaped_sea', value: true },
        { kind: 'gainXp', amount: 20 }
      ],
      choices: [
        {
          id: 'c5_co_end',
          text: { es: 'Reunirse en el muelle', en: 'Regroup on the pier' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c5_end'
        }
      ],
      end: false
    },
    {
      id: 'c5_ritual_only',
      chapterId: 'chapter_05',
      kind: 'narration',
      text: {
        es: 'La barrera emerge completa, majestuosa, sellando la bocana... pero el Corsario sigue en pie, y con un rugido corta las amarras del cabrestante. El tambor gira libre, las cadenas ceden un palmo, dos, tres...\n\nLa "Estrella del Sur" embiste el hueco con las velas desgarrándose contra las cadenas. Pasa — por el ancho de una moneda — dejando media borda en el intento. Vell escapa al sur en un barco herido que necesitará semanas de reparaciones en el primer puerto.\n\nSemanas. Exactamente lo que necesita una carta rápida de Lu a ciertas amistades del sur.',
        en: 'The boom rises whole, majestic, sealing the mouth... but the Corsair still stands, and with a roar he cuts the capstan\'s lashings. The drum spins free, the chains give a hand\'s width, two, three...\n\nThe "Southern Star" rams the gap, sails shredding against the chains. She makes it — by a coin\'s width — leaving half her gunwale behind. Vell escapes south in a wounded ship that will need weeks of repairs at the first port.\n\nWeeks. Exactly what a fast letter from Lu to certain southern friendships needs.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'star_crippled', value: true },
        { kind: 'setFlag', key: 'vell_escaped_sea', value: true },
        { kind: 'gainXp', amount: 20 }
      ],
      choices: [
        {
          id: 'c5_ro_end',
          text: { es: 'Reunirse en el muelle', en: 'Regroup on the pier' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c5_end'
        }
      ],
      end: false
    },
    {
      id: 'c5_both_fail',
      chapterId: 'chapter_05',
      kind: 'narration',
      text: {
        es: 'Hay noches que no son tuyas.\n\nEl Corsario te barre del muelle, las palancas se traban, y la "Estrella del Sur" sale de Zafir con la marea, entera y arrogante, con las luces de fiesta encendidas — Vell celebrando en cubierta su propia astucia.\n\nAmaneces magullad{a|o} en el muelle de las especias, con el orgullo más herido que el cuerpo. Y entonces una gaviota suelta ALGO a tus pies: un jirón de pañuelo de seda con el escudo bordado de Vell... y manchas de sangre que no son tuyas.\n\nEl sur guarda sus propios depredadores. Y ahora, uno le debe una gaviota a alguien.',
        en: 'Some nights are not yours.\n\nThe Corsair sweeps you off the pier, the levers jam, and the "Southern Star" leaves Zafir with the tide, whole and arrogant, festival lights burning — Vell toasting his own cunning on deck.\n\nYou wake bruised on the spice pier, pride hurt worse than body. Then a seagull drops SOMETHING at your feet: a torn strip of silk scarf embroidered with Vell\'s crest... and bloodstains that are not yours.\n\nThe south keeps its own predators. And now, someone owes a seagull a debt.'
      },
      onEnter: [
        { kind: 'heal', amount: 999 },
        { kind: 'setFlag', key: 'vell_escaped_clean', value: true },
        { kind: 'setFlag', key: 'southern_mystery_scarf', value: true },
        { kind: 'gainXp', amount: 15 }
      ],
      choices: [
        {
          id: 'c5_bf_end',
          text: { es: 'Guardar el jirón y reunirse con los demás', en: 'Pocket the scrap and rejoin the others' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c5_end'
        }
      ],
      end: false
    },
    {
      id: 'c5_end',
      chapterId: 'chapter_05',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'El amanecer encuentra a Lu descalza en el muelle de las especias, exactamente donde su madre vendía pimienta. No dice nada durante un largo rato. Zafir despierta a su alrededor con olor a pan de higos y a mar.\n\n«Me fui de aquí con tres monedas y un carro», dice al fin. «Y vuelvo con un ejército pequeñito de almas tercas.» Se ríe, y se seca los ojos con el pañuelo azafrán. «Mi madre habría dicho que sois mala mercancía: imposibles de tasar.»\n\nMira el horizonte del sur, donde el mundo continúa.\n\n«Sea donde sea que esté Vell — en un calabozo, en un barco roto o en una corte oscura — sabe una cosa nueva: hay gente pequeña que no se rinde. Y eso, almas mías, no se cura nunca.»\n\n✦ Fin del Capítulo 5. El mundo es más grande hacia el sur. ✦',
        en: 'Dawn finds Lu barefoot on the spice pier, exactly where her mother sold pepper. She says nothing for a long while. Zafir wakes around her, smelling of fig bread and sea.\n\n"I left here with three coins and a cart," she says at last. "And I return with a tiny army of stubborn souls." She laughs, drying her eyes with the saffron scarf. "My mother would have called you bad merchandise: impossible to price."\n\nShe looks at the southern horizon, where the world goes on.\n\n"Wherever Vell is — in a cell, on a broken ship or in some dark court — he knows one new thing: there are small people who do not give up. And that, my souls, never heals."\n\n✦ End of Chapter 5. The world is larger to the south. ✦'
      },
      onEnter: [
        { kind: 'completeQuest', key: 'quest_southern_star' },
        { kind: 'gainGold', amount: 50 },
        { kind: 'gainXp', amount: 45 },
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'affection', amount: 15 },
        { kind: 'changeReputation', key: 'puerto_zafir', amount: 10 },
        { kind: 'setFlag', key: 'zafir_arc_complete', value: true }
      ],
      choices: [],
      end: true
    }
  ]
};
