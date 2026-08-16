/**
 * DISCORDIAS ESPECIALES — textos únicos por combinación de elecciones.
 * Cuando dos almas eligen opciones concretas y opuestas, la discordia
 * no es genérica: el narrador (o el mundo) comenta ESA tensión exacta.
 * La pareja de choiceIds no tiene orden: (a,b) === (b,a).
 * Marcadores disponibles: {name}, {partner}, {a|o}.
 */

export interface SpecialDiscord {
  nodeId: string;
  pair: [string, string];
  text: Record<string, string>;
}

export const SPECIAL_DISCORDS: SpecialDiscord[] = [
  // ── PRÓLOGO ──
  {
    nodeId: 'pro_04',
    pair: ['pro_04_who', 'pro_04_dead'],
    text: {
      es: 'Un alma pregunta «¿quién eres?»; la otra, «¿estoy muerta?». La Diosa os mira alternativamente, divertida. «Interesante... Una quiere entender el mundo; la otra, entenderse a sí misma. Ambas preguntas son la misma pregunta, ¿sabéis? Pero solo puedo empezar por una.»',
      en: 'One soul asks "who are you?"; the other, "am I dead?". The Goddess looks between you, amused. "Interesting... One wants to understand the world; the other, to understand herself. Both questions are the same question, you know? But I can only begin with one."'
    }
  },
  {
    nodeId: 'pro_06',
    pair: ['pro_06_accept', 'pro_06_doubt'],
    text: {
      es: 'Una mano se alza decidida; la otra tiembla con una pregunta. La Diosa asiente despacio. «Valor y duda... el matrimonio más antiguo del mundo. Los dos tenéis razón, y por eso mismo no podéis tenerla a la vez. Decidid: ¿saltamos, o preguntamos primero cuán honda es el agua?»',
      en: 'One hand rises resolute; the other trembles with a question. The Goddess nods slowly. "Courage and doubt... the oldest marriage in the world. You are both right, and that is exactly why you cannot both be right at once. Decide: do we leap, or do we first ask how deep the water is?"'
    }
  },
  // ── CAPÍTULO 1 ──
  {
    nodeId: 'c1_02',
    pair: ['c1_02_honest', 'c1_02_vague'],
    text: {
      es: 'La verdad y la prudencia tiran de la misma cuerda. Marta, que ha visto miles de viajeros mentir peor de lo que cocinan, arquea una ceja mientras seca un vaso: «Cuando os pongáis de acuerdo sobre quiénes sois, el estofado seguirá caliente. Probablemente.»',
      en: 'Truth and caution pull the same rope. Marta, who has watched thousands of travelers lie worse than they cook, raises an eyebrow while drying a glass: "When you two agree on who you are, the stew will still be warm. Probably."'
    }
  },
  {
    nodeId: 'c1_05',
    pair: ['c1_05_attack', 'c1_05_talk'],
    text: {
      es: 'Un alma desenvaina; la otra extiende la mano abierta. La criatura de ojos de luna os observa a ambos... y no huye. Es como si también ella esperara el veredicto: ¿acero o palabra? El bosque entero contiene la respiración.',
      en: 'One soul draws steel; the other extends an open hand. The moon-eyed creature watches you both... and does not flee. As if it too awaited the verdict: steel or word? The whole forest holds its breath.'
    }
  },
  {
    nodeId: 'c1_05',
    pair: ['c1_05_attack', 'c1_05_analyze'],
    text: {
      es: 'Golpear primero o mirar primero. La vieja disputa de todos los cazadores. La criatura ladea la cabeza: parece saber que su destino se decide en la distancia entre un impulso y una pregunta.',
      en: 'Strike first or look first. The oldest quarrel of every hunter. The creature tilts its head: it seems to know its fate is being decided in the distance between an impulse and a question.'
    }
  },
  {
    nodeId: 'c1_05',
    pair: ['c1_05_talk', 'c1_05_flee'],
    text: {
      es: 'Acercarse o retroceder: dos formas de respeto que no caben en el mismo paso. La criatura espera, quieta como la niebla que la viste. Quien decida esto decidirá qué clase de historia estáis contando.',
      en: 'To approach or to withdraw: two kinds of respect that cannot share one step. The creature waits, still as the mist that clothes it. Whoever decides this will decide what kind of story you are telling.'
    }
  },
  {
    nodeId: 'c1_pip_offer',
    pair: ['c1_pip_offer_yes', 'c1_pip_offer_no'],
    text: {
      es: 'Pip mira a un alma, luego a la otra, con la honda apretada en el puño. «O sea... ¿que sí pero que no?» Su voz intenta sonar valiente y le sale de once años. «Decidid rápido, porfa. Odio quedarme a medias entre valiente y a salvo.»',
      en: 'Pip looks at one soul, then the other, sling clenched in his fist. "So... yes but also no?" His voice tries to sound brave and comes out eleven years old. "Decide quickly, please. I hate being stuck halfway between brave and safe."'
    }
  },
  // ── CAPÍTULO 2 ──
  {
    nodeId: 'c2_guardpost',
    pair: ['c2_vela_give_admit', 'c2_vela_give_hide'],
    text: {
      es: 'Confesar el sello roto... o dejar que la cera calle. La sargento Vela aún no lo sabe, pero su confianza —esa que no se regala, se presta con interés— pende de esta discordia. Un alma quiere pagar la verdad por adelantado; la otra, ahorrársela. Los ojos que revisan manifiestos doce horas al día lo notarán TODO.',
      en: 'Confess the broken seal... or let the wax stay silent. Sergeant Vela does not know it yet, but her trust — the kind that is never given, only lent with interest — hangs on this discord. One soul wants to pay the truth up front; the other, to save it. Eyes that review manifests twelve hours a day will notice EVERYTHING.'
    }
  },
  {
    nodeId: 'c2_06',
    pair: ['c2_06_free_cubs', 'c2_06_follow_leader'],
    text: {
      es: 'El cuerno del barco ahoga vuestros susurros furiosos. Cuatro vidas pequeñas contra la cabeza de la Sierpe: no existe la elección buena, solo la vuestra. Y por primera vez desde que la Diosa anudó vuestros hilos... cada hilo tira hacia un lado distinto del muelle.',
      en: 'The ship\'s horn drowns your furious whispers. Four small lives against the Serpent\'s head: there is no right choice, only yours. And for the first time since the Goddess knotted your threads... each thread pulls toward a different side of the pier.'
    }
  },
  // ── CAPÍTULO 3 ──
  {
    nodeId: 'c3_03',
    pair: ['c3_03_roofs', 'c3_03_cellar'],
    text: {
      es: 'Por arriba como sombras o por abajo como hormigas. Lu os mira discutir sobre su plano y suspira: «Los tejados no aguantan a dos si uno duda, y la bodega no esconde a dos si uno mira hacia arriba. Elegid UNA altura, almas mías.»',
      en: 'Above like shadows or below like ants. Lu watches you argue over her plan and sighs: "Rooftops won\'t hold two if one hesitates, and the cellar won\'t hide two if one keeps looking up. Pick ONE altitude, my souls."'
    }
  },
  {
    nodeId: 'c3_03',
    pair: ['c3_03_roofs', 'c3_03_door'],
    text: {
      es: 'Una quiere entrar por el cielo; la otra, por la alfombra roja. Lu tamborilea sobre el plano: «Curioso. El disfraz más elegante y el camino más frío. Cualquiera funciona... pero no a la vez: si te ven en la puerta, mirarán también los tejados.»',
      en: 'One wants in through the sky; the other, down the red carpet. Lu drums on the plan: "Curious. The finest disguise and the coldest path. Either works... but not both: if they see you at the door, they will watch the rooftops too."'
    }
  },
  {
    nodeId: 'c3_03',
    pair: ['c3_03_cellar', 'c3_03_door'],
    text: {
      es: 'Barricas al hombro o invitación en mano. Lu se frota las sienes: «Un{a} porteador{a|} y un{a} noble que llegan juntos... eso sí que haría preguntas. El gremio es ciego, pero no tanto. Una sola puerta, almas mías. Decidid.»',
      en: 'Barrels on the shoulder or invitation in hand. Lu rubs her temples: "A porter and a noble arriving together... now THAT would raise questions. The guild is blind, but not that blind. One door only, my souls. Decide."'
    }
  },
  {
    nodeId: 'c3_05',
    pair: ['c3_05_contract', 'c3_05_cub'],
    text: {
      es: 'El papel que hunde a un lord contra el latido de niebla que tiembla en la jaula. Cruzáis una mirada a través del salón y os entendéis sin palabras: no hay tiempo para las dos cosas, y cada un{a|o} de vosotros ya eligió con qué no puede vivir. Esta discordia no la resuelve la razón. Que hablen los dioses.',
      en: 'The paper that sinks a lord against the misty heartbeat trembling in the cage. You catch each other\'s eyes across the hall and understand without words: there is no time for both, and each of you has already chosen what you cannot live with. Reason will not settle this discord. Let the gods speak.'
    }
  }
];

/** Busca la discordia especial para un nodo y una pareja de elecciones (sin orden). */
export function findSpecialDiscord(
  nodeId: string,
  choiceA: string,
  choiceB: string
): SpecialDiscord | null {
  return (
    SPECIAL_DISCORDS.find(
      (d) =>
        d.nodeId === nodeId &&
        ((d.pair[0] === choiceA && d.pair[1] === choiceB) ||
          (d.pair[0] === choiceB && d.pair[1] === choiceA))
    ) ?? null
  );
}
