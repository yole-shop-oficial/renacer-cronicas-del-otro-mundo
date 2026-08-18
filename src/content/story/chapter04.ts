import type { Chapter } from '@/engine/schema';

/**
 * CAPÍTULO 4 — La caza de Servan Vell.
 * Convergencia total (§24, §65): el contrato del C3, el cuchillo del
 * furtivo, la alianza de Vela, las crías, la promesa a Tomás... TODO
 * vuelve aquí. Dos rutas (Justicia vs Rescate) con decisión dual coop,
 * jefe con fases (El Desollador) y derrota que crea historia (§21).
 */
export const CHAPTER_04: Chapter = {
  id: 'chapter_04',
  title: { es: 'Capítulo 4 — La caza de Servan Vell', en: 'Chapter 4 — The Hunt for Servan Vell' },
  startNodeId: 'c4_01',
  nodes: [
    {
      id: 'c4_01',
      chapterId: 'chapter_04',
      kind: 'narration',
      text: {
        es: 'Tres días después de la Feria de Invierno, Petra amanece distinta. Los pregoneros ya no cantan alabanzas a Lord Servan Vell: susurran. Y los susurros, en Petra, son la artillería de los pobres.\n\nEn la trastienda de Lu, alguien ha clavado un plano de la ciudad en la pared con un cuchillo de cocina. Es un consejo de guerra... con té de especias. Es TU consejo de guerra.',
        en: 'Three days after the Winter Fair, Petra wakes changed. The criers no longer sing praises to Lord Servan Vell: they whisper. And whispers, in Petra, are the artillery of the poor.\n\nIn Lu\'s back room, someone has pinned a city map to the wall with a kitchen knife. It is a war council... with spiced tea. It is YOUR war council.'
      },
      duoText: {
        es: 'Tres días después de la Feria de Invierno, Petra amanece distinta. Los pregoneros ya no cantan alabanzas a Lord Servan Vell: susurran.\n\nEn la trastienda de Lu, un plano de la ciudad clavado a la pared con un cuchillo de cocina. Un consejo de guerra con té de especias. {partner} y tú os sentáis en el centro: dos almas que los dioses anudaron... y que un lord del sur aprenderá a temer.',
        en: 'Three days after the Winter Fair, Petra wakes changed. The criers no longer sing praises to Lord Servan Vell: they whisper.\n\nIn Lu\'s back room, a city map pinned to the wall with a kitchen knife. A war council with spiced tea. You and {partner} sit at its center: two souls the gods knotted together... and a southern lord will learn to fear.'
      },
      onEnter: [{ kind: 'startQuest', key: 'quest_vell_hunt' }],
      choices: [
        {
          id: 'c4_01_go',
          text: { es: 'Escuchar el plan', en: 'Hear the plan' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c4_02'
        }
      ],
      end: false
    },
    {
      id: 'c4_02',
      chapterId: 'chapter_04',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'Lu recorre la mesa con la mirada — y la mesa está más llena de lo que Vell imaginaría jamás. El viejo Tomás afila un cuchillo que no necesita afilado. Y un cuervo de Brumal trajo al alba dos palabras del capitán Bren: «Voy. Esperadme.»\n\n«Dos caminos, almas mías. UNO: el Tribunal del Gremio se reúne pasado mañana; con pruebas suficientes, Vell cae por ley, delante de toda Petra. DOS: su finca del canal guarda las criaturas del contrato de primavera; una incursión esta noche las libera antes de que zarpen... pero Vell quedará libre para intentarlo otra vez.»\n\nDeja la taza. «La ley o la vida. No suelen caber en la misma noche.»',
        en: 'Lu sweeps the table with her gaze — and the table is fuller than Vell could ever imagine. Old Tomás sharpens a knife that needs no sharpening. And a Brumal crow brought two words from Captain Bren at dawn: "Coming. Wait for me."\n\n"Two roads, my souls. ONE: the Guild Tribunal convenes the day after tomorrow; with enough proof, Vell falls by law, before all Petra. TWO: his canal estate holds the creatures of the spring contract; a raid tonight frees them before they sail... but Vell walks free to try again."\n\nShe sets down her cup. "The law or the lives. They rarely fit in the same night."'
      },
      onEnter: [
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'trust', amount: 5 },
        { kind: 'setFlag', key: 'war_council_met', value: true }
      ],
      choices: [
        {
          id: 'c4_02_decide',
          text: { es: 'Es hora de elegir el camino', en: 'Time to choose the road' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c4_03'
        }
      ],
      end: false
    },
    {
      id: 'c4_03',
      chapterId: 'chapter_04',
      kind: 'encounter',
      coopEventId: 'c4_route_choice',
      text: {
        es: 'El plano de Petra espera bajo la luz de la lámpara: al este, la Casa del Tribunal con sus columnas; al oeste, la finca del canal con sus jaulas. La ley o la vida.\n\nTus manos saben lo que llevan: cada prueba reunida, cada aliado ganado, pesa ahora sobre esta mesa. El destino se bifurca por última vez en esta ciudad.',
        en: 'The map of Petra waits under the lamplight: to the east, the Tribunal House with its columns; to the west, the canal estate with its cages. The law or the lives.\n\nYour hands know what they carry: every proof gathered, every ally won, now weighs upon this table. Fate forks one last time in this city.'
      },
      duoText: {
        es: 'El plano de Petra espera bajo la lámpara: al este, el Tribunal; al oeste, la finca con sus jaulas. La ley o la vida.\n\nMiras a {partner} por encima de la mesa. Dos almas, una elección... y los dados de los dioses escuchando desde algún lugar sobre el techo.',
        en: 'The map of Petra waits under the lamp: east, the Tribunal; west, the estate and its cages. The law or the lives.\n\nYou look at {partner} across the table. Two souls, one choice... and the dice of the gods listening from somewhere above the roof.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c4_03_tribunal_contract',
          text: { es: '⚖ JUSTICIA: presentar el CONTRATO ante el Tribunal', en: '⚖ JUSTICE: present the CONTRACT to the Tribunal' },
          conditions: [{ kind: 'flag', key: 'c3_took_contract', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: {
            es: 'Necesitas la prueba definitiva (el contrato de la feria)',
            en: 'You need the definitive proof (the fair contract)'
          },
          effects: [
            { kind: 'changeTrait', key: 'prudence', amount: 1 },
            { kind: 'setFlag', key: 'route_tribunal', value: true },
            { kind: 'gainXp', amount: 15 }
          ],
          goto: 'c4_trib1'
        },
        {
          id: 'c4_03_tribunal_knife',
          text: { es: '⚖ JUSTICIA: el cuchillo sellado + el testimonio de Vela', en: '⚖ JUSTICE: the sealed knife + Vela\'s testimony' },
          conditions: [
            { kind: 'flag', key: 'has_serpent_knife', op: 'has' },
            { kind: 'flag', key: 'vela_ally', op: 'has' },
            { kind: 'flag', key: 'c3_took_contract', op: 'not' }
          ],
          visibleWhenLocked: true,
          lockedHint: {
            es: 'Requiere el cuchillo del furtivo y la alianza de la sargento Vela',
            en: 'Requires the poacher\'s knife and Sergeant Vela\'s alliance'
          },
          effects: [
            { kind: 'changeTrait', key: 'loyalty', amount: 1 },
            { kind: 'setFlag', key: 'route_tribunal', value: true },
            { kind: 'changeRelationship', target: 'sargento_vela', axis: 'trust', amount: 10 },
            { kind: 'gainXp', amount: 15 }
          ],
          goto: 'c4_trib1'
        },
        {
          id: 'c4_03_estate',
          text: { es: '⚖ RESCATE: asaltar la finca y abrir las jaulas esta noche', en: '⚖ RESCUE: raid the estate and open the cages tonight' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'changeTrait', key: 'compassion', amount: 1 },
            { kind: 'changeTrait', key: 'courage', amount: 1 },
            { kind: 'setFlag', key: 'route_estate', value: true },
            { kind: 'gainXp', amount: 15 }
          ],
          goto: 'c4_est1'
        }
      ],
      end: false
    },
    {
      id: 'c4_trib1',
      chapterId: 'chapter_04',
      kind: 'narration',
      text: {
        es: 'El día del Tribunal, la sala huele a cera, pergamino y miedo bien vestido. Vell ocupa su asiento como quien posa para una estatua, con tres abogados de anillos gordos.\n\nY entonces las pruebas tocan la mesa de mármol. El silencio que sigue es tan denso que se podría cortar con el cuchillo sellado. Los rostros del jurado del gremio cambian... y por primera vez desde que llegaste a Petra, Servan Vell deja de sonreír.\n\nUn escribano corre hacia la puerta con un mensaje. Lu te lo traduce en un susurro: «Está llamando a su perro. Al Desollador. Va a por los testigos... va a por MI puesto.»',
        en: 'On Tribunal day, the hall smells of wax, parchment and well-dressed fear. Vell occupies his seat like a man posing for a statue, flanked by three fat-ringed lawyers.\n\nThen the proof touches the marble table. The silence that follows could be cut with the sealed knife. The guild jury\'s faces change... and for the first time since you came to Petra, Servan Vell stops smiling.\n\nA scribe runs for the door with a message. Lu translates it in a whisper: "He is calling his dog. The Flayer. He is going after the witnesses... he is going after MY stall."'
      },
      onEnter: [{ kind: 'setFlag', key: 'vell_exposed_tribunal', value: true }],
      choices: [
        {
          id: 'c4_trib1_run',
          text: { es: 'Correr al mercado antes que el Desollador', en: 'Race the Flayer to the market' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'changeTrait', key: 'loyalty', amount: 1 }],
          goto: 'c4_boss'
        }
      ],
      end: false
    },
    {
      id: 'c4_est1',
      chapterId: 'chapter_04',
      kind: 'narration',
      text: {
        es: 'La finca del canal duerme tras muros blancos y perros bien pagados. Tomás os guía por la acequia seca — «los ricos nunca vigilan el agua que ya no corre» — hasta el patio de las jaulas.\n\nY ahí están: dos docenas de criaturas del velo esperando el barco de primavera. Fuegos fatuos en frascos. Un grifo joven con las alas vendadas. Y crías de niebla que tiemblan abrazadas, como aquella noche en el muelle.',
        en: 'The canal estate sleeps behind white walls and well-paid dogs. Tomás guides you along the dry irrigation ditch — "the rich never watch water that no longer runs" — to the cage yard.\n\nAnd there they are: two dozen veil creatures awaiting the spring ship. Wisps in jars. A young griffin with bandaged wings. And mist cubs trembling in a huddle, just like that night at the pier.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c4_est1_mist',
          text: { es: '[La niebla responde] Llamar a la criatura del bosque', en: '[The mist answers] Call the forest creature' },
          conditions: [{ kind: 'flag', key: 'freed_mist_creature', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: {
            es: 'Solo quien liberó a la guardiana de niebla puede llamarla',
            en: 'Only the one who freed the mist guardian may call her'
          },
          effects: [
            { kind: 'setFlag', key: 'mist_answered_call', value: true },
            { kind: 'gainXp', amount: 20 },
            { kind: 'heal', amount: 40 }
          ],
          goto: 'c4_est2'
        },
        {
          id: 'c4_est1_open',
          text: { es: 'Abrir las jaulas, deprisa y en silencio', en: 'Open the cages, fast and silent' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c4_est3'
        }
      ],
      end: false
    },
    {
      id: 'c4_est2',
      chapterId: 'chapter_04',
      kind: 'narration',
      text: {
        es: 'Silbas bajo, como Pip te enseñó, y el sonido se pierde hacia el norte...\n\nLa niebla llega ANTES que la respuesta. Trepa los muros blancos como una marea lenta, apaga las antorchas una a una, y de ella emergen unos ojos de luna que conoces bien — y detrás, CUATRO pares más pequeños. La guardiana del bosque ha venido con las crías que salvaste. La deuda de colmillos se paga esta noche: los perros de la finca huelen la niebla... y deciden, muy sabiamente, quedarse callados.',
        en: 'You whistle low, as Pip taught you, and the sound fades northward...\n\nThe mist arrives BEFORE the answer. It climbs the white walls like a slow tide, snuffing the torches one by one, and from it emerge moon eyes you know well — and behind them, FOUR smaller pairs. The forest guardian has come with the cubs you saved. The debt of fangs is paid tonight: the estate dogs smell the mist... and very wisely decide to stay silent.'
      },
      onEnter: [],
      choices: [
        {
          id: 'c4_est2_open',
          text: { es: 'Abrir las jaulas bajo el manto de niebla', en: 'Open the cages under the mantle of mist' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c4_est3'
        }
      ],
      end: false
    },
    {
      id: 'c4_est3',
      chapterId: 'chapter_04',
      kind: 'narration',
      text: {
        es: 'Pasador a pasador, frasco a frasco, el patio se vacía hacia la noche. El grifo joven es el último: te mira un instante con un ojo dorado, graba tu cara en algún lugar antiguo de su memoria, y salta al cielo.\n\nY entonces, un aplauso lento cruza el patio.\n\n«Bonito. Carísimo, pero bonito.» De las sombras de la casa sale un hombre flaco con delantal de cuero y una máscara pálida sin boca. El Desollador de Vell. «El señor me paga por pieles. Las vuestras tendrán que valer por todas las que soltasteis.»',
        en: 'Pin by pin, jar by jar, the yard empties into the night. The young griffin is last: it studies you for an instant with one golden eye, files your face somewhere ancient in its memory, and leaps into the sky.\n\nThen slow applause crosses the yard.\n\n"Pretty. Ruinously expensive, but pretty." From the house shadows steps a thin man in a leather apron and a pale, mouthless mask. Vell\'s Flayer. "The lord pays me for hides. Yours will have to be worth all the ones you set loose."'
      },
      onEnter: [{ kind: 'setFlag', key: 'estate_creatures_freed', value: true }],
      choices: [
        {
          id: 'c4_est3_fight',
          text: { es: 'Plantarle cara', en: 'Stand your ground' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c4_boss'
        }
      ],
      end: false
    },
    {
      id: 'c4_boss',
      chapterId: 'chapter_04',
      kind: 'encounter',
      combatId: 'desollador',
      victoryGoto: 'c4_win',
      defeatGoto: 'c4_lost',
      text: {
        es: 'El Desollador no se apresura. Los verdugos nunca lo hacen.\n\nSe quita el delantal, lo dobla con cuidado sobre una jaula vacía, y despliega un látigo con espinas de acero que silba al probar el aire. Tras la máscara pálida no hay ojos que puedas leer: solo dos ranuras oscuras y una paciencia infinita.\n\n«Empecemos», dice. Y la noche se cierra alrededor.',
        en: 'The Flayer does not hurry. Executioners never do.\n\nHe removes his apron, folds it carefully over an empty cage, and unfurls a whip with steel thorns that whistles as it tastes the air. Behind the pale mask there are no eyes to read: only two dark slits and an infinite patience.\n\n"Let us begin," he says. And the night closes in.'
      },
      duoText: {
        es: 'El Desollador no se apresura. Los verdugos nunca lo hacen.\n\nSe quita el delantal, lo dobla sobre una jaula vacía, y despliega un látigo de espinas de acero. Os mira a los dos a través de la máscara pálida, y por primera vez habla con algo parecido a interés:\n\n«Dos a la vez. El señor pagará el doble... y yo, por fin, sudaré.»',
        en: 'The Flayer does not hurry. Executioners never do.\n\nHe removes his apron, folds it over an empty cage, and unfurls a whip of steel thorns. He looks at you both through the pale mask, and for the first time speaks with something like interest:\n\n"Two at once. The lord will pay double... and I, at last, will sweat."'
      },
      onEnter: [],
      choices: [],
      end: false
    },
    {
      id: 'c4_win',
      chapterId: 'chapter_04',
      kind: 'narration',
      text: {
        es: 'El látigo cae al suelo antes que su dueño. El Desollador se arrodilla despacio, se lleva la mano a la máscara rota... y ríe, bajito, sin alegría.\n\n«Veinte años cobrando por miedo. Y el miedo, al final, cambió de bando.» Mira hacia el canal, donde las luces de la casa de Vell se están apagando una a una — los criados abandonan el barco que se hunde. «Consejo gratis: el señor tiene un camarote pagado en el "Estrella del Sur". Zarpa al alba. Los lores nunca se hunden con su ciudad.»\n\nY así, la cuerda que sube quedó al fin a la vista de toda Petra.',
        en: 'The whip hits the ground before its owner. The Flayer kneels slowly, touches his broken mask... and laughs, quietly, without joy.\n\n"Twenty years paid in fear. And in the end, fear switched sides." He looks toward the canal, where the lights of Vell\'s house die one by one — servants abandoning the sinking ship. "Free advice: the lord has a cabin paid on the \'Southern Star\'. She sails at dawn. Lords never sink with their city."\n\nAnd so, the climbing rope was at last laid bare before all Petra.'
      },
      onEnter: [
        { kind: 'setFlag', key: 'defeated_desollador', value: true },
        { kind: 'grantTitle', key: 'vell_hunter' },
        { kind: 'setFlag', key: 'vell_fleeing_south', value: true }
      ],
      choices: [
        {
          id: 'c4_win_end',
          text: { es: 'Reunirse con los aliados', en: 'Rejoin your allies' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c4_end'
        }
      ],
      end: false
    },
    {
      id: 'c4_lost',
      chapterId: 'chapter_04',
      kind: 'narration',
      text: {
        es: 'El látigo de espinas es más rápido que tu mejor noche. El mundo se vuelve cuero, sal... y la bodega oscura de un barco.\n\nDespiertas encadenad{a|o} entre cajas marcadas con la sierpe, rumbo al sur. Pero el Desollador cometió un error: dejó tu nombre fuera del manifiesto... y en Petra hay una sargento que lee TODOS los manifiestos.\n\nLa madera estalla al tercer día. Luz de antorchas. El estandarte azul. Y detrás de Vela, un capitán de Brumal con cara de haber remado él mismo. «Te dije que esperaras», gruñe Bren, rompiendo tus cadenas. «Nunca esperas.»\n\nHas perdido esta batalla — y el barco de Vell ganó tres días de mar. Pero estás viv{a|o}, y la caza continúa.',
        en: 'The thorned whip is faster than your best night. The world becomes leather, salt... and the dark hold of a ship.\n\nYou wake chained among serpent-marked crates, bound south. But the Flayer made one mistake: he left your name off the manifest... and in Petra there is a sergeant who reads ALL the manifests.\n\nThe wood bursts on the third day. Torchlight. The blue banner. And behind Vela, a Brumal captain who looks like he rowed here himself. "I told you to wait," Bren growls, breaking your chains. "You never wait."\n\nYou lost this battle — and Vell\'s ship gained three days of sea. But you are alive, and the hunt goes on.'
      },
      onEnter: [
        { kind: 'heal', amount: 999 },
        { kind: 'gainGold', amount: -15 },
        { kind: 'setFlag', key: 'captured_by_vell', value: true },
        { kind: 'setFlag', key: 'vell_fleeing_south', value: true },
        { kind: 'changeRelationship', target: 'sargento_vela', axis: 'friendship', amount: 10 },
        { kind: 'changeRelationship', target: 'capitan_bren', axis: 'affection', amount: 10 },
        { kind: 'gainXp', amount: 25 }
      ],
      choices: [
        {
          id: 'c4_lost_end',
          text: { es: 'Volver a Petra con los tuyos', en: 'Return to Petra with your own' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c4_end'
        }
      ],
      end: false
    },
    {
      id: 'c4_end',
      chapterId: 'chapter_04',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'Esa noche, la trastienda de Lu no cabe de gente ni de vapor de té. Tomás cuenta la historia por tercera vez, cada vez con más criaturas y menos miedo. Bren y Vela discuten sobre jurisdicciones con el cariño áspero de dos soldados de la misma guerra.\n\nLu alza su taza y el cuarto calla.\n\n«Por las almas que la niebla trajo.» Te mira — os mira — con esos ojos que lo escuchan todo. «Vell huye al sur, hacia cortes más oscuras y bolsillos más hondos. Esta historia aún no termina... pero desde hoy, Petra recuerda quién le enseñó a no tener miedo.»\n\n✦ Fin del Capítulo 4. El arco del sur está por escribirse. ✦',
        en: 'That night, Lu\'s back room overflows with people and tea steam. Tomás tells the story for the third time, each time with more creatures and less fear. Bren and Vela argue over jurisdictions with the rough affection of two soldiers from the same war.\n\nLu raises her cup and the room falls silent.\n\n"To the souls the mist brought." She looks at you — at you both — with those eyes that hear everything. "Vell flees south, toward darker courts and deeper pockets. This story is not over... but from today, Petra remembers who taught her not to be afraid."\n\n✦ End of Chapter 4. The southern arc is yet to be written. ✦'
      },
      onEnter: [
        { kind: 'completeQuest', key: 'quest_vell_hunt' },
        { kind: 'gainGold', amount: 40 },
        { kind: 'gainXp', amount: 50 },
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 15 },
        { kind: 'changeRelationship', target: 'cazador_tomas', axis: 'trust', amount: 10 },
        { kind: 'changeReputation', key: 'ciudad_petra', amount: 15 },
        { kind: 'setFlag', key: 'southern_arc_open', value: true }
      ],
      choices: [
        {
          id: 'c4_end_continue',
          text: { es: 'Capítulo 5 — El puerto de Zafir', en: 'Chapter 5 — The Port of Zafir' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'chapter:chapter_05'
        }
      ],
      end: true
    }
  ]
};
