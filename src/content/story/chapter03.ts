import type { Chapter } from '@/engine/schema';

/**
 * CAPÍTULO 3 — La cuerda que sube.
 * Convergencia (§65): las ramas del C2 se retoman aquí.
 * - Liberaste a las crías → la Sierpe te busca; la criatura madre te debe una.
 * - Seguiste al líder → conoces a Servan Vell; las crías siguen perdidas.
 * - Vela aliada / desconfiada cambia el acceso a la redada.
 * Usa TODOS los sistemas: puertas de poder, vínculos, dúo con duoText
 * y decisión dual cooperativa en el clímax.
 */
export const CHAPTER_03: Chapter = {
  id: 'chapter_03',
  title: { es: 'Capítulo 3 — La cuerda que sube', en: 'Chapter 3 — The Climbing Rope' },
  startNodeId: 'c3_01',
  nodes: [
    {
      id: 'c3_01',
      chapterId: 'chapter_03',
      kind: 'narration',
      text: {
        es: 'Una semana después de la noche del muelle, Petra amanece con escarcha y rumores. Los pregoneros hablan de un noble del sur que llegará para la Feria de Invierno: Lord Servan Vell, «benefactor de gremios y amigo de la ciudad». Sabes lo que eso significa: la cuerda de la Sierpe sube hasta él... y la feria es la ocasión perfecta para tirar de ella. En tu bolsillo, la nota de Lu: «Reunión en mi puesto al alba. Trae todo lo que tengas. — L.»',
        en: 'A week after the night at the pier, Petra wakes to frost and rumors. Criers speak of a southern noble arriving for the Winter Fair: Lord Servan Vell, "benefactor of guilds and friend of the city". You know what that means: the Serpent\'s rope climbs all the way to him... and the fair is the perfect chance to pull it. In your pocket, Lu\'s note: "Meeting at my stall at dawn. Bring everything you have. — L."',
      },
      duoText: {
        es: 'Una semana después de la noche del muelle, Petra amanece con escarcha y rumores. Caminas junto a {partner} entre los puestos a medio montar de la Feria de Invierno mientras los pregoneros anuncian al invitado de honor: Lord Servan Vell, «benefactor de gremios y amigo de la ciudad». Os miráis sin necesidad de palabras: la cuerda de la Sierpe sube hasta él. En tu bolsillo, la nota de Lu: «Reunión en mi puesto al alba. Traed todo lo que tengáis. Los dos. — L.»',
        en: 'A week after the night at the pier, Petra wakes to frost and rumors. You walk beside {partner} among the half-built stalls of the Winter Fair while criers announce the guest of honor: Lord Servan Vell, "benefactor of guilds and friend of the city". You look at each other, no words needed: the Serpent\'s rope climbs to him. In your pocket, Lu\'s note: "Meeting at my stall at dawn. Bring everything you have. Both of you. — L."',
      },
      onEnter: [{ kind: 'startQuest', key: 'quest_winter_fair' }],
      choices: [
        {
          id: 'c3_01_go',
          text: { es: 'Acudir al puesto de Lu al alba', en: 'Go to Lu\'s stall at dawn' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c3_02'
        }
      ],
      end: false
    },
    {
      id: 'c3_02',
      chapterId: 'chapter_03',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'El puesto de Lu huele a canela y conspiración. Sobre una manta, entre frascos, hay un plano de la Casa del Gremio de Pieles dibujado con carboncillo.\n\n«Servan Vell cenará ahí la noche de la feria, con el líder de la Sierpe a su derecha. Un brindis entre amigos... y la firma del contrato de primavera: cuarenta criaturas del velo, vivas.» Lu te clava la mirada. «Una sola noche, todas las serpientes en el mismo nido. No habrá otra ocasión como esta. Pero escúchame: ahí dentro no entra nadie débil. La Sierpe contrató espadas nuevas después de lo del muelle. Por tu culpa, dicho sea con cariño.»',
        en: 'Lu\'s stall smells of cinnamon and conspiracy. On a blanket, among jars, lies a charcoal-drawn plan of the Hide Guild House.\n\n"Servan Vell dines there on fair night, the Serpent\'s leader at his right hand. A toast between friends... and the signing of the spring contract: forty veil creatures, alive." Lu fixes her eyes on you. "One night, every serpent in the same nest. There will be no chance like it. But hear me: nobody weak walks in there. The Serpent hired new blades after the pier. Thanks to you, said with love."',
      },
      duoText: {
        es: 'El puesto de Lu huele a canela y conspiración. Sobre una manta hay un plano de la Casa del Gremio de Pieles dibujado con carboncillo.\n\n«Servan Vell cenará ahí la noche de la feria, con el líder de la Sierpe a su derecha. La firma del contrato de primavera: cuarenta criaturas del velo, vivas.» Lu os mira a los dos, a ti y a {partner}, y por primera vez sonríe de verdad. «Dos almas anudadas por el destino... Los dioses no hacen esas cosas por accidente. Bien. Porque ahí dentro no entra nadie débil, y menos aún nadie solo.»',
        en: 'Lu\'s stall smells of cinnamon and conspiracy. On a blanket lies a charcoal plan of the Hide Guild House.\n\n"Servan Vell dines there on fair night, the Serpent\'s leader at his right hand. The signing of the spring contract: forty veil creatures, alive." Lu looks at you both, you and {partner}, and for the first time smiles truly. "Two souls knotted by fate... The gods do not do such things by accident. Good. Because nobody weak walks in there, and nobody alone even less."',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_02_ready',
          text: { es: '«Estoy list{a|o}. Dime cómo entramos.»', en: '"I\'m ready. Tell me how we get in."' },
          conditions: [{ kind: 'power', key: 'combat', op: '>=', value: 240 }],
          visibleWhenLocked: true,
          lockedHint: {
            es: 'Requiere 240 de poder de combate: entrena, equipa y cultiva tus vínculos',
            en: 'Requires 240 combat power: train, gear up and grow your bonds'
          },
          effects: [{ kind: 'gainXp', amount: 10 }],
          goto: 'c3_03'
        },
        {
          id: 'c3_02_prepare',
          text: { es: 'Pedir unos días para prepararte mejor', en: 'Ask for a few days to prepare' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'asked_time_to_prepare', value: true }],
          goto: 'c3_02b'
        }
      ],
      end: false
    },
    {
      id: 'c3_02b',
      chapterId: 'chapter_03',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'Lu asiente sin sorpresa.\n\n«Sabia decisión. Los héroes muertos no testifican.» Enrolla el plano y te lo entrega. «Tienes hasta la noche de la feria. Entrena con quien confíe en ti: la fuerza de una persona se mide en quiénes la sostienen. Ve con Joren, con Bren, con el viejo Tomás... Cada mano amiga te hará más fuerte. Y vuelve cuando puedas tumbar a un matón de gremio sin despeinarte.»\n\n(Consejo del mundo: completa misiones de vínculo, asigna tus puntos de atributo, equipa mejor arma y aprende nodos del árbol. Cuando tu poder alcance 240, vuelve a hablar con Lu.)',
        en: 'Lu nods, unsurprised.\n\n"Wise choice. Dead heroes don\'t testify." She rolls up the plan and hands it to you. "You have until fair night. Train with those who trust you: a person\'s strength is measured by who holds them up. Go to Joren, to Bren, to old Tomás... Every friendly hand will make you stronger. Come back when you can drop a guild bruiser without breaking a sweat."\n\n(World hint: complete bond quests, assign your attribute points, equip better gear and learn tree nodes. When your power reaches 240, speak to Lu again.)',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_02b_return',
          text: { es: '«Estoy list{a|o}.» (volver con Lu)', en: '"I\'m ready." (return to Lu)' },
          conditions: [{ kind: 'power', key: 'combat', op: '>=', value: 240 }],
          visibleWhenLocked: true,
          lockedHint: {
            es: 'Requiere 240 de poder de combate',
            en: 'Requires 240 combat power'
          },
          effects: [{ kind: 'gainXp', amount: 10 }],
          goto: 'c3_03'
        }
      ],
      end: false
    },
    {
      id: 'c3_03',
      chapterId: 'chapter_03',
      kind: 'narration',
      text: {
        es: 'Lu despliega el plano y marca tres puntos con el dedo.\n\n«Escucha bien. La cena es en el salón alto. Hay tres formas de acercarse: por los tejados —los viejos pasos de los deshollinadores—, por la bodega —el gremio recibe barricas toda la noche—, o por la puerta grande, con invitación falsa y la frente en alto. Cada camino pide algo distinto de ti.»',
        en: 'Lu unrolls the plan and marks three points with her finger.\n\n"Listen well. The dinner is in the high hall. There are three ways in: over the rooftops — the old chimney-sweep paths —, through the cellar — the guild receives barrels all night —, or through the front door, with a forged invitation and your head held high. Each path asks something different of you."',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_03_roofs',
          text: { es: '[Agilidad 12] Por los tejados', en: '[Agility 12] Over the rooftops' },
          conditions: [{ kind: 'stat', key: 'agility', op: '>=', value: 12 }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Agilidad 12', en: 'Requires Agility 12' },
          effects: [{ kind: 'setFlag', key: 'entered_by_roofs', value: true }, { kind: 'gainXp', amount: 15 }],
          goto: 'c3_04_roofs'
        },
        {
          id: 'c3_03_cellar',
          text: { es: '[Fuerza 12] Por la bodega, cargando barricas', en: '[Strength 12] Through the cellar, hauling barrels' },
          conditions: [{ kind: 'stat', key: 'strength', op: '>=', value: 12 }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Fuerza 12', en: 'Requires Strength 12' },
          effects: [{ kind: 'setFlag', key: 'entered_by_cellar', value: true }, { kind: 'gainXp', amount: 15 }],
          goto: 'c3_04_cellar'
        },
        {
          id: 'c3_03_door',
          text: { es: '[Carisma 12] Por la puerta grande, con invitación falsa', en: '[Charisma 12] Through the front door, forged invitation' },
          conditions: [{ kind: 'stat', key: 'charisma', op: '>=', value: 12 }],
          visibleWhenLocked: true,
          lockedHint: { es: 'Requiere Carisma 12', en: 'Requires Charisma 12' },
          effects: [{ kind: 'setFlag', key: 'entered_by_door', value: true }, { kind: 'gainXp', amount: 15 }],
          goto: 'c3_04_door'
        },
        {
          id: 'c3_03_vela',
          text: { es: '[Vela aliada] Entrar con la redada de la guardia del canal', en: '[Vela allied] Enter with the canal guard raid' },
          conditions: [{ kind: 'flag', key: 'vela_ally', op: 'has' }],
          visibleWhenLocked: true,
          lockedHint: {
            es: 'Necesitas la confianza de la sargento Vela',
            en: 'You need Sergeant Vela\'s trust'
          },
          effects: [
            { kind: 'setFlag', key: 'entered_with_vela', value: true },
            { kind: 'changeRelationship', target: 'sargento_vela', axis: 'trust', amount: 10 },
            { kind: 'gainXp', amount: 20 }
          ],
          goto: 'c3_04_vela'
        }
      ],
      end: false
    },
    {
      id: 'c3_04_roofs',
      chapterId: 'chapter_03',
      kind: 'narration',
      text: {
        es: 'La noche de la feria, Petra es un mar de faroles. Trepas por la escalera de un deshollinador y el mundo se vuelve tejados: pizarra helada, gatos ofendidos, cuerdas de banderines. Desde el alero de la Casa del Gremio ves el salón alto por la claraboya: copas de plata, risas gordas... y en la cabecera, un hombre de anillo pesado que reconocerías entre mil. Servan Vell brinda con el líder de la Sierpe mientras un escribano prepara el contrato.',
        en: 'On fair night, Petra is a sea of lanterns. You climb a chimney-sweep ladder and the world becomes rooftops: icy slate, offended cats, bunting ropes. From the Guild House eaves you see the high hall through the skylight: silver cups, fat laughter... and at the head, a heavy-ringed man you would know among thousands. Servan Vell toasts with the Serpent\'s leader while a scribe prepares the contract.',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_04r_go',
          text: { es: 'Esperar el momento y actuar', en: 'Wait for the moment and act' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c3_05'
        }
      ],
      end: false
    },
    {
      id: 'c3_04_cellar',
      chapterId: 'chapter_03',
      kind: 'narration',
      text: {
        es: 'Con un delantal prestado y una barrica al hombro, cruzas la bodega del gremio como una gota más del río de porteadores. Nadie mira dos veces a quien carga sesenta kilos sin quejarse. Escaleras arriba, dejas la barrica, tomas una bandeja... y entras al salón alto por la puerta de servicio. Copas de plata, risas gordas, y en la cabecera, Servan Vell brindando con el líder de la Sierpe mientras un escribano prepara el contrato.',
        en: 'With a borrowed apron and a barrel on your shoulder, you cross the guild cellar like one more drop in the porters\' river. Nobody looks twice at someone hauling sixty kilos without complaint. Upstairs, you set the barrel down, pick up a tray... and enter the high hall through the service door. Silver cups, fat laughter, and at the head, Servan Vell toasting with the Serpent\'s leader while a scribe prepares the contract.',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_04c_go',
          text: { es: 'Esperar el momento y actuar', en: 'Wait for the moment and act' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c3_05'
        }
      ],
      end: false
    },
    {
      id: 'c3_04_door',
      chapterId: 'chapter_03',
      kind: 'narration',
      text: {
        es: 'Vestid{a|o} con las mejores galas que el oro de Lu pudo alquilar, presentas la invitación falsa con el aburrimiento perfecto de quien ha ido a cien cenas mejores. El portero duda medio segundo; tu ceja alzada le cuesta el puesto si se equivoca, y lo sabe. «Bienvenid{a|o}, excelencia.» Dentro: copas de plata, risas gordas, y en la cabecera, Servan Vell brindando con el líder de la Sierpe mientras un escribano prepara el contrato.',
        en: 'Dressed in the finest garb Lu\'s gold could rent, you present the forged invitation with the perfect boredom of someone who has attended a hundred better dinners. The doorman hesitates half a second; your raised eyebrow could cost him his job if he\'s wrong, and he knows it. "Welcome, excellency." Inside: silver cups, fat laughter, and at the head, Servan Vell toasting with the Serpent\'s leader while a scribe prepares the contract.',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_04d_go',
          text: { es: 'Esperar el momento y actuar', en: 'Wait for the moment and act' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c3_05'
        }
      ],
      end: false
    },
    {
      id: 'c3_04_vela',
      chapterId: 'chapter_03',
      kind: 'dialogue',
      speaker: 'sargento_vela',
      text: {
        es: 'En el callejón tras la Casa del Gremio, veinte capas azules esperan en silencio. Vela ajusta su espada y te mira.\n\n«Un año esperé esto. Testigos que no olviden sus nombres, pruebas que no se quemen, y una puerta que nadie pueda cerrar desde arriba.» Señala tu pecho con dos dedos. «Tú viste el muelle. Tú eres mi testigo que no olvida. Cuando yo entre por la puerta grande, tú entras conmigo. Y esta vez, llegamos hasta el final.»',
        en: 'In the alley behind the Guild House, twenty blue cloaks wait in silence. Vela adjusts her sword and looks at you.\n\n"A year I waited for this. Witnesses who won\'t forget their names, evidence that won\'t burn, and a door nobody can shut from above." She points two fingers at your chest. "You saw the pier. You are my witness who does not forget. When I go through the front door, you go with me. And this time, we go all the way."',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_04v_go',
          text: { es: 'Entrar con la redada', en: 'Enter with the raid' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c3_05'
        }
      ],
      end: false
    },
    {
      id: 'c3_05',
      chapterId: 'chapter_03',
      kind: 'encounter',
      text: {
        es: 'El escribano moja la pluma. El líder de la Sierpe extiende la mano hacia el contrato. Es AHORA o nunca: cuarenta criaturas del velo viajarán en primavera si esa tinta toca el papel.\n\nY entonces lo ves: junto a la mesa, una jaula pequeña con un bulto de niebla temblorosa. Una cría — la quinta, la que faltó aquella noche en el muelle. Servan Vell la ha traído como «muestra de calidad».\n\nEl salón entero está entre tú y esa mesa. El destino se bifurca una vez más.',
        en: 'The scribe dips the quill. The Serpent\'s leader reaches for the contract. It is NOW or never: forty veil creatures will travel in spring if that ink touches paper.\n\nAnd then you see it: beside the table, a small cage with a trembling bundle of mist. A cub — the fifth one, the one missing that night at the pier. Servan Vell brought it as a "quality sample".\n\nThe whole hall stands between you and that table. Fate forks once more.',
      },
      duoText: {
        es: 'El escribano moja la pluma. El líder de la Sierpe extiende la mano hacia el contrato. Es AHORA o nunca. Cruzas una mirada con {partner} al otro lado del salón: dos almas, dos posiciones, una sola oportunidad.\n\nY entonces lo veis: junto a la mesa, una jaula pequeña con un bulto de niebla temblorosa. Una cría — la quinta, la que faltó aquella noche en el muelle. Servan Vell la ha traído como «muestra de calidad».\n\nEl salón entero está entre vosotros y esa mesa. El destino se bifurca una vez más... y esta vez sois dos manos sobre la misma página.',
        en: 'The scribe dips the quill. The Serpent\'s leader reaches for the contract. It is NOW or never. You catch {partner}\'s eye across the hall: two souls, two positions, one chance.\n\nAnd then you both see it: beside the table, a small cage with a trembling bundle of mist. A cub — the fifth one, missing since the night at the pier. Servan Vell brought it as a "quality sample".\n\nThe whole hall stands between you and that table. Fate forks once more... and this time you are two hands upon the same page.',
      },
      onEnter: [],
      choices: [
        {
          id: 'c3_05_contract',
          text: { es: '⚖ Ir a por el CONTRATO: la prueba que hunde a Vell', en: '⚖ Go for the CONTRACT: the proof that sinks Vell' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'c3_took_contract', value: true },
            { kind: 'gainXp', amount: 35 },
            { kind: 'changeReputation', key: 'ciudad_petra', amount: 10 }
          ],
          goto: 'c3_06_contract'
        },
        {
          id: 'c3_05_cub',
          text: { es: '⚖ Ir a por la CRÍA: una vida antes que mil papeles', en: '⚖ Go for the CUB: one life before a thousand papers' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'c3_saved_cub', value: true },
            { kind: 'gainXp', amount: 35 },
            { kind: 'changeReputation', key: 'aldea_brumal', amount: 10 }
          ],
          goto: 'c3_06_cub'
        }
      ],
      end: false
    },
    {
      id: 'c3_06_contract',
      chapterId: 'chapter_03',
      kind: 'narration',
      text: {
        es: 'Te mueves como una cuchilla entre los invitados. Un camarero tropieza «solo», una bandeja vuela, y en el caos de vino y gritos tu mano cae sobre el contrato medio firmado — nombres, sellos, cifras, TODO. El líder de la Sierpe ruge; Servan Vell, en cambio, sonríe con frialdad de pozo: «Sea quien sea usted... acaba de convertirse en mi problema favorito.»\n\nEscapas por donde viniste con la prueba ardiendo en el pecho. A tu espalda, la jaula pequeña desaparece escalera arriba en manos de un sirviente. La salvaste... de papel. A la cría, no.',
        en: 'You move like a blade through the guests. A waiter trips "on his own", a tray flies, and in the chaos of wine and shouts your hand lands on the half-signed contract — names, seals, figures, EVERYTHING. The Serpent\'s leader roars; Servan Vell, instead, smiles with well-deep coldness: "Whoever you are... you have just become my favorite problem."\n\nYou escape the way you came, the proof burning against your chest. Behind you, the small cage disappears upstairs in a servant\'s hands. You saved... paper. Not the cub.',
      },
      onEnter: [{ kind: 'setFlag', key: 'cub_still_captive', value: true }],
      choices: [
        {
          id: 'c3_06c_end',
          text: { es: 'Reunirte con los tuyos al amanecer', en: 'Rejoin your own at dawn' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c3_07'
        }
      ],
      end: false
    },
    {
      id: 'c3_06_cub',
      chapterId: 'chapter_03',
      kind: 'narration',
      text: {
        es: 'Hay decisiones que se toman con la cabeza. Esta la tomas con todo lo demás. Cruzas el salón en línea recta, vuelcas la mesa del escribano —tinta sobre seda carísima—, y arrancas la jaula del pedestal. El pasador salta; la cría de niebla se derrama en tus brazos como humo tibio que tiembla.\n\n«¡DETENEDL{A|O}!» Corres. Copas, gritos, un matón que cae por una zancadilla que jurarías que puso un camarero viejo con cara de Tomás. La noche te traga con la cría al pecho... mientras arriba, con calma de hielo, Servan Vell firma el contrato y brinda: «Cuarenta menos una. Que la busquen.»',
        en: 'Some decisions are made with the head. This one you make with everything else. You cross the hall in a straight line, flip the scribe\'s table — ink over priceless silk —, and tear the cage from its pedestal. The pin snaps; the mist cub spills into your arms like warm, trembling smoke.\n\n"STOP THEM!" You run. Cups, screams, a bruiser felled by a trip you would swear an old waiter with Tomás\'s face set. The night swallows you, cub against your chest... while upstairs, ice-calm, Servan Vell signs the contract and toasts: "Forty minus one. Have them found."',
      },
      onEnter: [
        { kind: 'grantTitle', key: 'cub_guardian' },
        { kind: 'setFlag', key: 'contract_signed', value: true },
        { kind: 'changeRelationship', target: 'cazador_tomas', axis: 'respect', amount: 15 }
      ],
      choices: [
        {
          id: 'c3_06b_end',
          text: { es: 'Reunirte con los tuyos al amanecer', en: 'Rejoin your own at dawn' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'c3_07'
        }
      ],
      end: false
    },
    {
      id: 'c3_07',
      chapterId: 'chapter_03',
      kind: 'dialogue',
      speaker: 'vendedora_lu',
      text: {
        es: 'El alba encuentra al grupo en la trastienda de Lu: té hirviendo, vendas, silencio del bueno. Lu escucha el relato completo y al final apoya las manos en la mesa.\n\n«Escuchadme bien todos, porque esto solo se dirá una vez. Lo de anoche no fue el final: fue la primera campanada. Servan Vell tiene amigos en tres cortes y barcos en dos mares. Pero desde anoche...» — sonríe, y su sonrisa es una navaja pequeña — «...desde anoche sabe que existimos. Y no hay nada, NADA, que los poderosos teman más que descubrir que alguien pequeño ya no les tiene miedo.»\n\nFuera, la feria despierta. La cuerda sigue subiendo. Y vosotros ya sabéis escalar.\n\n✦ Fin del Capítulo 3. El arco de Servan Vell continuará. ✦',
        en: 'Dawn finds the group in Lu\'s back room: boiling tea, bandages, the good kind of silence. Lu hears the whole tale and finally rests her hands on the table.\n\n"Listen well, all of you, because this will be said only once. Last night was not the end: it was the first bell. Servan Vell has friends in three courts and ships on two seas. But since last night..." — she smiles, and her smile is a small knife — "...since last night he knows we exist. And there is nothing, NOTHING, the powerful fear more than discovering that someone small is no longer afraid of them."\n\nOutside, the fair wakes. The rope keeps climbing. And now you know how to climb.\n\n✦ End of Chapter 3. The Servan Vell arc will continue. ✦',
      },
      onEnter: [
        { kind: 'completeQuest', key: 'quest_winter_fair' },
        { kind: 'gainGold', amount: 25 },
        { kind: 'gainXp', amount: 40 },
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'trust', amount: 15 },
        { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 10 },
        { kind: 'setFlag', key: 'vell_knows_you_exist', value: true }
      ],
      choices: [],
      end: true
    }
  ]
};
