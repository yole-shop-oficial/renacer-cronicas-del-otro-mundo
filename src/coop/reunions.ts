/**
 * EVENTOS DE REENCUENTRO — cuando las almas separadas se cruzan en el mapa.
 *
 * Tras un "desafío al destino" el grupo se separa. Si ambas almas entran
 * en la MISMA región del mapa, el mundo lo nota y ofrece un reencuentro
 * narrativo. El texto depende del LUGAR y de cómo fue la separación:
 * quién desafió al destino lleva la Marca — y el reencuentro lo recuerda.
 *
 * El reencuentro nunca es obligatorio: se puede pasar de largo (y el
 * mundo también lo recordará).
 */

export interface ReunionScene {
  id: string;
  regionId: string;
  /** Texto si YO llevo la Marca del Destino (yo desafié). */
  textDefiant: Record<string, string>;
  /** Texto si el COMPAÑERO lleva la Marca (él/ella desafió). */
  textWinner: Record<string, string>;
  /** Efectos al reunirse aquí (para quien acepta el reencuentro). */
  onReunite: import('@/engine/schema').Effect[];
}

export const REUNION_SCENES: ReunionScene[] = [
  {
    id: 'reunion_aldea_brumal',
    regionId: 'aldea_brumal',
    textDefiant: {
      es: 'La campana de madera de Aldea Brumal calla cuando entras en la plaza... y ahí está {partner}, junto al pozo donde una vez pediste un deseo. La Marca del Destino te pesa en el pecho como una piedra fría. Fuiste tú quien desafió a los dioses; te tocará a ti dar el primer paso. {partner} te ve llegar y no se mueve: te espera. Eso, en el idioma de los orgullosos, ya es media disculpa.',
      en: 'The wooden bell of Brumal Village falls silent as you enter the square... and there stands {partner}, by the well where you once made a wish. The Mark of Fate weighs on your chest like cold stone. It was you who defied the gods; the first step falls to you. {partner} watches you come and does not move: they wait. In the language of the proud, that is already half an apology.'
    },
    textWinner: {
      es: 'Marta te avisa con un gesto de barbilla desde la posada: «Ha vuelto». Y ahí está {partner}, junto al pozo, con la Marca del Destino asomándole en la mirada como una noche mal dormida. Desafió a los dioses por no seguir tu decisión... y aun así sus pies l{a|o} trajeron exactamente adonde sabía que estarías. Los caminos separados de Brumal siempre acaban en la misma plaza.',
      en: 'Marta warns you with a tilt of her chin from the inn: "They\'re back." And there is {partner}, by the well, the Mark of Fate showing in their eyes like a badly slept night. They defied the gods rather than follow your decision... and still their feet carried them exactly where they knew you would be. Brumal\'s separate roads always end in the same square.'
    },
    onReunite: [
      { kind: 'setFlag', key: 'reunited_aldea_brumal', value: true },
      { kind: 'gainXp', amount: 20 },
      { kind: 'changeRelationship', target: 'marta', axis: 'affection', amount: 5 }
    ]
  },
  {
    id: 'reunion_bosque_susurros',
    regionId: 'bosque_susurros',
    textDefiant: {
      es: 'El Bosque de los Susurros murmura tu nombre... y luego otro. Sigues el sonido hasta la curva del arroyo, y ahí está {partner}, sentad{a|o} sobre las piedras grandes donde bebía la criatura. Las hojas repiten vuestra vieja discordia en susurros, como niños chismosos. Llevas la Marca del Destino, y aquí, donde el mundo escucha todo, no hay forma de fingir que no pasó nada.',
      en: 'The Whispering Forest murmurs your name... and then another. You follow the sound to the stream bend, and there sits {partner} on the big stones where the creature drank. The leaves repeat your old discord in whispers, like gossiping children. You bear the Mark of Fate, and here, where the world hears everything, there is no pretending nothing happened.'
    },
    textWinner: {
      es: 'Las hojas cambian de tema a mitad de susurro: alguien más camina el bosque. En el claro de luz verde encuentras a {partner}, con la Marca del Destino en los hombros y raminas en el pelo, como si el bosque llevara días peinándol{a|o} a su manera. El arroyo, que lo vio todo aquella primera vez, corre entre los dos como diciendo: aquí empezasteis, aquí podéis empezar de nuevo.',
      en: 'The leaves change subject mid-whisper: someone else walks the forest. In the green light clearing you find {partner}, the Mark of Fate on their shoulders and twigs in their hair, as if the forest had spent days combing them its own way. The stream, which saw everything that first time, runs between you as if to say: here you began, here you may begin again.'
    },
    onReunite: [
      { kind: 'setFlag', key: 'reunited_bosque_susurros', value: true },
      { kind: 'gainXp', amount: 20 },
      { kind: 'heal', amount: 20 }
    ]
  },
  {
    id: 'reunion_ciudad_petra',
    regionId: 'ciudad_petra',
    textDefiant: {
      es: 'Petra es grande para quien no busca a nadie, y minúscula para quien sí. Doblas el puente del mercado y casi chocáis: {partner}, con una taza del té de Lu en la mano y cara de haber ensayado mil frases que ahora no llegan. Detrás del puesto, Lu finge ordenar frascos con la sonrisa de quien COBRÓ una apuesta: «Azafrán para la reconciliación», canturrea. «Hoy invita la casa.» Llevas la Marca; la primera palabra es tuya.',
      en: 'Petra is vast for those seeking no one, and tiny for those who are. You turn at the market bridge and nearly collide: {partner}, one of Lu\'s teas in hand and the face of someone who rehearsed a thousand lines that now will not come. Behind the stall, Lu pretends to arrange jars with the smile of someone who WON a bet: "Saffron for reconciliation," she sing-songs. "Today it\'s on the house." You bear the Mark; the first word is yours.'
    },
    textWinner: {
      es: 'Lu te intercepta entre dos puestos con esa mirada suya de saberlo todo antes que nadie: «Canal segundo, junto al puente gastado. Lleva dos tazas.» No pregunta si quieres: en Petra, la información buena no espera. Y ahí está {partner}, mirando el agua, con la Marca del Destino y el orgullo empatados a puntos. Los que desafían a los dioses siempre acaban mirando ríos: es donde mejor se piensa en lo caro que salió.',
      en: 'Lu intercepts you between two stalls with that look of hers, of knowing everything first: "Second canal, by the worn bridge. Take two cups." She does not ask if you want to: in Petra, good intelligence does not wait. And there is {partner}, watching the water, the Mark of Fate and their pride tied on points. Those who defy the gods always end up watching rivers: it is where one best contemplates the price.'
    },
    onReunite: [
      { kind: 'setFlag', key: 'reunited_ciudad_petra', value: true },
      { kind: 'gainXp', amount: 20 },
      { kind: 'changeRelationship', target: 'vendedora_lu', axis: 'friendship', amount: 8 }
    ]
  },
  {
    id: 'reunion_templo_alba',
    regionId: 'templo_alba',
    textDefiant: {
      es: 'La primera luz del día cae sobre el Altar del Alba... y sobre {partner}, arrodillad{a|o} ante él. No reza: espera. Las novicias pasan de puntillas, porque hasta ellas saben leer un reencuentro pendiente. Llevas la Marca del Destino, y dicen que este altar es el único lugar del mundo donde el Dios del Destino escucha apelaciones. Quizá por eso tus pies te trajeron aquí.',
      en: 'The first light of day falls upon the Dawn Altar... and upon {partner}, kneeling before it. Not praying: waiting. The novices tiptoe past, for even they can read a pending reunion. You bear the Mark of Fate, and they say this altar is the only place in the world where the God of Fate hears appeals. Perhaps that is why your feet brought you here.'
    },
    textWinner: {
      es: 'Una novicia te guía en silencio hasta el altar. Ahí está {partner}, bañad{a|o} por la primera luz, con la Marca del Destino más tenue que ayer — como si el templo la hubiera estado limpiando poco a poco. Levanta la vista y casi sonríe: «Los dioses y yo hemos estado hablando de ti.»',
      en: 'A novice guides you in silence to the altar. There is {partner}, bathed in first light, the Mark of Fate fainter than yesterday — as if the temple had been washing it away little by little. They look up and almost smile: "The gods and I have been talking about you."'
    },
    onReunite: [
      { kind: 'setFlag', key: 'reunited_templo_alba', value: true },
      { kind: 'gainXp', amount: 30 },
      { kind: 'heal', amount: 999 },
      // El templo perdona la Marca: recupera la suerte ofrendada.
      { kind: 'changeStat', key: 'luck', amount: 3 },
      { kind: 'setFlag', key: 'marca_del_destino_redimida', value: true }
    ]
  },
  {
    id: 'reunion_ruinas_veloran',
    regionId: 'ruinas_veloran',
    textDefiant: {
      es: 'Entre los arcos caídos de Veloran, donde un imperio entero aprendió lo que cuesta el orgullo, distingues una silueta conocida leyendo la inscripción antigua. {partner} habla sin girarse, como si os hubierais visto ayer: «¿Sabes qué dice esta piedra? "También nosotros creímos que podíamos solos".» El eco de las ruinas hace el resto del trabajo.',
      en: 'Among Veloran\'s fallen arches, where an entire empire learned the cost of pride, you spot a familiar silhouette reading the ancient inscription. {partner} speaks without turning, as if you had seen each other yesterday: "Do you know what this stone says? \'We too believed we could do it alone\'." The ruins\' echo does the rest of the work.'
    },
    textWinner: {
      es: 'Las ruinas de Veloran tienen mil escondites y un solo camino de salida: por eso sabías que, tarde o temprano, {partner} pasaría por este arco. Llega al atardecer, con la Marca del Destino y polvo de imperio muerto en las botas. Se detiene al verte. Entre estas piedras que el orgullo derrumbó, sobran las palabras y falta una sola cosa: decidir si camináis la salida juntos.',
      en: 'The ruins of Veloran hold a thousand hiding places and a single way out: that is how you knew {partner} would sooner or later pass beneath this arch. They arrive at dusk, with the Mark of Fate and dead-empire dust on their boots. They stop upon seeing you. Among these stones that pride brought down, words are surplus and one thing is missing: deciding whether you walk the way out together.'
    },
    onReunite: [
      { kind: 'setFlag', key: 'reunited_ruinas_veloran', value: true },
      { kind: 'gainXp', amount: 25 },
      { kind: 'changeStat', key: 'willpower', amount: 1 }
    ]
  }
];

export function reunionForRegion(regionId: string): ReunionScene | null {
  return REUNION_SCENES.find((r) => r.regionId === regionId) ?? null;
}
