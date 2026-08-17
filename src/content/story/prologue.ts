import type { Chapter } from '@/engine/schema';

/**
 * PRÓLOGO (§60): vida anterior → aislamiento → final de la antigua vida →
 * Diosa → explicación del mundo → renacimiento.
 * El tema de la muerte se trata con sensibilidad y sin romantizarla (§9).
 */
export const PROLOGUE: Chapter = {
  id: 'prologue',
  title: { es: 'Prólogo — La última página', en: 'Prologue — The Last Page' },
  startNodeId: 'pro_01',
  nodes: [
    {
      id: 'pro_01',
      chapterId: 'prologue',
      kind: 'narration',
      text: {
        es: 'La lluvia golpea la ventana de un apartamento pequeño y silencioso. Sobre la mesa hay una taza de té frío, facturas sin abrir y una fotografía boca abajo. Hace dos años que nadie pronuncia tu nombre en voz alta dentro de estas paredes. Desde que tus padres se fueron, los días se parecen tanto entre sí que has dejado de contarlos.',
        en: 'Rain taps against the window of a small, silent apartment. On the table sit a cup of cold tea, unopened bills, and a photograph lying face down. It has been two years since anyone said your name aloud within these walls. Since your parents passed, the days resemble each other so much you have stopped counting them.'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_01_photo',
          text: { es: 'Girar la fotografía', en: 'Turn the photograph over' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'looked_at_photo', value: true }],
          goto: 'pro_02_photo'
        },
        {
          id: 'pro_01_window',
          text: { es: 'Mirar la lluvia', en: 'Watch the rain' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'pro_02_window'
        }
      ],
      end: false
    },
    {
      id: 'pro_02_photo',
      chapterId: 'prologue',
      kind: 'narration',
      text: {
        es: 'En la fotografía están ellos: tu madre riendo con los ojos cerrados, tu padre haciendo una mueca ridícula. Y en el centro, una versión tuya que todavía sabía reír. Aprietas la foto contra el pecho. "Lo siento", susurras, sin saber muy bien a quién.',
        en: 'They are in the photograph: your mother laughing with her eyes closed, your father pulling a ridiculous face. And in the middle, a version of you that still knew how to laugh. You press the photo to your chest. "I\'m sorry," you whisper, not quite knowing to whom.'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_02p_go',
          text: { es: 'Salir a caminar bajo la lluvia', en: 'Go out and walk in the rain' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'pro_03'
        }
      ],
      end: false
    },
    {
      id: 'pro_02_window',
      chapterId: 'prologue',
      kind: 'narration',
      text: {
        es: 'Las gotas dibujan caminos torcidos sobre el cristal. Piensas que cada una elige, sin saberlo, una ruta distinta hacia el mismo final. Te preguntas si a ti te queda alguna ruta por elegir. El apartamento responde con silencio.',
        en: 'The raindrops trace crooked paths down the glass. You think about how each one, unknowingly, chooses a different route to the same ending. You wonder whether you have any routes left to choose. The apartment answers with silence.'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_02w_go',
          text: { es: 'Salir a caminar bajo la lluvia', en: 'Go out and walk in the rain' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'pro_03'
        }
      ],
      end: false
    },
    {
      id: 'pro_03',
      chapterId: 'prologue',
      kind: 'narration',
      duoText: {
        es: 'Caminas sin rumbo por calles vacías. El mundo parece apagado, como una lámpara a la que nadie cambia la bombilla. No ves el coche que dobla la esquina demasiado rápido... y en el mismo instante, en otra calle de la misma ciudad, otra alma cansada tampoco ve el suyo. Dos luces blancas. Un sonido lejano. Y después, nada.\n\nDos historias terminan a la vez. Y a veces, dos finales son también una puerta.',
        en: 'You wander through empty streets. The world seems dimmed, like a lamp whose bulb nobody bothers to change. You never see the car turning the corner too fast... and at that same instant, on another street of the same city, another weary soul never sees theirs. Two white lights. A distant sound. And then, nothing.\n\nTwo stories end at once. And sometimes, two endings are also a door.'
      },
      text: {
        es: 'Caminas sin rumbo por calles vacías. El mundo parece apagado, como una lámpara a la que nadie cambia la bombilla. No ves el coche que dobla la esquina demasiado rápido. Solo hay un instante de luz blanca, un sonido lejano... y después, nada. Tu antigua vida termina aquí. No fue una elección, ni un castigo. Solo un final. Y a veces, un final es también una puerta.',
        en: 'You wander through empty streets. The world seems dimmed, like a lamp whose bulb nobody bothers to change. You never see the car turning the corner too fast. There is only an instant of white light, a distant sound... and then, nothing. Your old life ends here. It was not a choice, nor a punishment. Only an ending. And sometimes, an ending is also a door.'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_03_open',
          text: { es: 'Abrir los ojos', en: 'Open your eyes' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'pro_04'
        }
      ],
      end: false
    },
    {
      id: 'pro_04',
      chapterId: 'prologue',
      kind: 'dialogue',
      speaker: 'goddess',
      duoText: {
        es: 'Flotáis en un espacio sin suelo ni cielo, tejido de luz suave. No estás sol{a|o}: a tu lado, otra alma flota contigo — {partner}, tan desconcertad{a|o} como tú, tan real como tú. Frente a vosotros, una figura imposible de enfocar, como si estuviera hecha de amaneceres.\n\n«Vaya, vaya... Dos almas que llegan juntas. Eso no pasa ni una vez cada mil años. Vuestros hilos se cruzaron en el último instante, y ahora están anudados. Bienvenidas, almas cansadas: vuestra historia anterior terminó... pero yo no colecciono finales. Colecciono comienzos.»',
        en: 'You float in a space with no ground and no sky, woven from soft light. You are not alone: beside you floats another soul — {partner}, as bewildered as you, as real as you. Before you both stands a figure impossible to focus on, as though made of sunrises.\n\n"Well, well... Two souls arriving together. That does not happen once in a thousand years. Your threads crossed at the last instant, and now they are knotted. Welcome, weary souls: your previous story has ended... but I do not collect endings. I collect beginnings."'
      },
      text: {
        es: 'Flotas en un espacio sin suelo ni cielo, tejido de luz suave. Frente a ti hay una figura imposible de enfocar, como si estuviera hecha de amaneceres. Su voz no entra por los oídos: florece directamente dentro de tu pecho.\n\n«Bienvenida, alma cansada. Tu historia anterior ha llegado a su última página... pero yo no colecciono finales. Colecciono comienzos.»',
        en: 'You float in a space with no ground and no sky, woven from soft light. Before you stands a figure impossible to focus on, as though made of sunrises. Her voice does not enter through your ears: it blooms directly inside your chest.\n\n"Welcome, weary soul. Your previous story has reached its final page... but I do not collect endings. I collect beginnings."'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_04_who',
          text: { es: '«¿Quién eres?»', en: '"Who are you?"' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'pro_05'
        },
        {
          id: 'pro_04_dead',
          text: { es: '«¿Estoy... muerta?»', en: '"Am I... dead?"' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'asked_about_death', value: true }],
          goto: 'pro_05'
        }
      ],
      end: false
    },
    {
      id: 'pro_05',
      chapterId: 'prologue',
      kind: 'dialogue',
      speaker: 'goddess',
      duoText: {
        es: '«Soy una de las que cuidan los mundos que aún no terminan de escribirse. Y vosotros traéis algo rarísimo: compañía. Casi todos llegan aquí solos.»\n\nLa figura extiende una mano hecha de luz hacia cada uno.\n\n«Voy a ofreceros algo. No una recompensa, ni un consuelo. Una oportunidad. Hay un mundo cuyo destino no está completamente escrito. Lo que le falta es alguien que escriba con sus propias decisiones... y vosotros sois DOS manos escribiendo el mismo libro. A veces estaréis de acuerdo. A veces no. Para esos momentos, los Dioses del Destino tienen sus dados. Ya los conoceréis.»',
        en: '"I am one of those who tend the worlds still being written. And you two bring something rare beyond measure: company. Almost everyone arrives here alone."\n\nThe figure extends a hand made of light toward each of you.\n\n"I will offer you something. Not a reward, not a consolation. An opportunity. There is a world whose fate is not fully written. What it lacks is someone who writes with their own decisions... and you are TWO hands writing the same book. Sometimes you will agree. Sometimes you will not. For those moments, the Gods of Fate keep their dice. You will meet them soon enough."'
      },
      text: {
        es: '«Soy una de las que cuidan los mundos que aún no terminan de escribirse. Y tú tienes algo que casi nadie conserva al llegar aquí: preguntas. Eso significa que todavía quieres respuestas.»\n\nLa figura extiende una mano hecha de luz.\n\n«Voy a ofrecerte algo. No una recompensa, ni un consuelo. Una oportunidad. Hay un mundo cuyo destino no está completamente escrito. Sus guerras, sus reyes, sus criaturas, incluso sus dioses... todo puede cambiar. Lo que le falta es alguien que escriba con sus propias decisiones.»',
        en: '"I am one of those who tend the worlds still being written. And you carry something almost nobody keeps by the time they arrive here: questions. That means you still want answers."\n\nThe figure extends a hand made of light.\n\n"I will offer you something. Not a reward, not a consolation. An opportunity. There is a world whose fate is not fully written. Its wars, its kings, its creatures, even its gods... all of it can change. What it lacks is someone who writes with their own decisions."'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_05_story',
          text: { es: '«¿Y cuál será mi historia?»', en: '"And what will my story be?"' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [],
          goto: 'pro_06'
        }
      ],
      end: false
    },
    {
      id: 'pro_06',
      chapterId: 'prologue',
      kind: 'dialogue',
      speaker: 'goddess',
      duoText: {
        es: 'La figura ríe, y su risa suena a campanas lejanas.\n\n«No habéis entendido. No voy a daros una historia.»\n\nLa luz se expande, y por un instante veis montañas, ciudades, bosques que respiran, mares que sueñan.\n\n«Voy a daros un mundo. La historia tendréis que escribirla entre los dos. Y cuando vuestras plumas quieran escribir palabras distintas... los dados decidirán qué mano guía la página.»',
        en: 'The figure laughs, and her laughter sounds like distant bells.\n\n"You have not understood. I am not going to give you a story."\n\nThe light expands, and for an instant you both see mountains, cities, breathing forests, dreaming seas.\n\n"I am going to give you a world. The story, you will have to write together. And when your quills wish to write different words... the dice will decide whose hand guides the page."'
      },
      text: {
        es: 'La figura ríe, y su risa suena a campanas lejanas.\n\n«No has entendido. No voy a darte una historia.»\n\nLa luz se expande, y por un instante ves montañas, ciudades, bosques que respiran, mares que sueñan.\n\n«Voy a darte un mundo. La historia tendrás que escribirla tú.»',
        en: 'The figure laughs, and her laughter sounds like distant bells.\n\n"You have not understood. I am not going to give you a story."\n\nThe light expands, and for an instant you see mountains, cities, breathing forests, dreaming seas.\n\n"I am going to give you a world. The story, you will have to write yourself."'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_06_accept',
          text: { es: 'Aceptar la oportunidad', en: 'Accept the opportunity' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'accepted_rebirth', value: true },
            { kind: 'gainXp', amount: 10 }
          ],
          goto: 'pro_hope'
        },
        {
          id: 'pro_06_doubt',
          text: { es: '«¿Y si vuelvo a fallar?»', en: '"What if I fail again?"' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'confessed_doubt', value: true }],
          goto: 'pro_06b'
        }
      ],
      end: false
    },
    {
      id: 'pro_06b',
      chapterId: 'prologue',
      kind: 'dialogue',
      speaker: 'goddess',
      text: {
        es: 'La luz se vuelve más cálida, casi como un abrazo.\n\n«Fallarás. Muchas veces. Elegirás mal, perderás cosas, romperás promesas. Así se escriben las historias reales. Las que no fallan nunca... esas no las escribe nadie: simplemente ocurren. Tú decidirás, y el mundo recordará. Eso es lo único que te prometo.»',
        en: 'The light grows warmer, almost like an embrace.\n\n"You will fail. Many times. You will choose poorly, lose things, break promises. That is how real stories are written. The ones that never fail... nobody writes those: they merely happen. You will decide, and the world will remember. That is the only thing I promise you."'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_06b_accept',
          text: { es: 'Tomar su mano', en: 'Take her hand' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [
            { kind: 'setFlag', key: 'accepted_rebirth', value: true },
            { kind: 'setFlag', key: 'goddess_saw_your_doubt', value: true },
            { kind: 'gainXp', amount: 15 }
          ],
          goto: 'pro_hope'
        }
      ],
      end: false
    },
    {
      // §29: la esperanza de la segunda vida — variable narrativa permanente.
      id: 'pro_hope',
      chapterId: 'prologue',
      kind: 'dialogue',
      speaker: 'goddess',
      text: {
        es: 'La Diosa sostiene tu mano de luz un instante más.\n\n«Una última pregunta, alma mía. La más importante de todas. No la respondas para mí: respóndela para ti.»\n\nSu voz se vuelve un susurro que llena el universo entero:\n\n«¿Qué esperas encontrar en tu segunda vida?»',
        en: 'The Goddess holds your hand of light one instant longer.\n\n"One last question, my soul. The most important of all. Do not answer it for me: answer it for yourself."\n\nHer voice becomes a whisper that fills the entire universe:\n\n"What do you hope to find in your second life?"'
      },
      duoText: {
        es: 'La Diosa os sostiene a ambos un instante más.\n\n«Una última pregunta, almas mías. La más importante. Y cada quien la responde solo, aunque caigáis juntos.»\n\nSu voz se vuelve un susurro que llena el universo entero:\n\n«¿Qué esperas encontrar en tu segunda vida?»',
        en: 'The Goddess holds you both one instant longer.\n\n"One last question, my souls. The most important. And each answers it alone, though you fall together."\n\nHer voice becomes a whisper filling the whole universe:\n\n"What do you hope to find in your second life?"'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_hope_freedom',
          text: { es: '«Libertad.»', en: '"Freedom."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'freedom' }],
          goto: 'pro_07'
        },
        {
          id: 'pro_hope_family',
          text: { es: '«Una familia.»', en: '"A family."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'family' }],
          goto: 'pro_07'
        },
        {
          id: 'pro_hope_power',
          text: { es: '«Poder.»', en: '"Power."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'power' }],
          goto: 'pro_07'
        },
        {
          id: 'pro_hope_answers',
          text: { es: '«Respuestas.»', en: '"Answers."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'answers' }],
          goto: 'pro_07'
        },
        {
          id: 'pro_hope_peace',
          text: { es: '«Paz.»', en: '"Peace."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'peace' }],
          goto: 'pro_07'
        },
        {
          id: 'pro_hope_adventure',
          text: { es: '«Aventura.»', en: '"Adventure."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'adventure' }],
          goto: 'pro_07'
        },
        {
          id: 'pro_hope_redemption',
          text: { es: '«Redención.»', en: '"Redemption."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'redemption' }],
          goto: 'pro_07'
        },
        {
          id: 'pro_hope_second_chance',
          text: { es: '«Solo una segunda oportunidad.»', en: '"Just a second chance."' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'setFlag', key: 'life_hope', value: 'second_chance' }],
          goto: 'pro_07'
        }
      ],
      end: false
    },
    {
      id: 'pro_07',
      chapterId: 'prologue',
      kind: 'narration',
      duoText: {
        es: 'La luz os envuelve como agua tibia. Sientes que algo viejo se desprende de ti... y a la vez sientes el hilo nuevo: fino, dorado, atado a esa otra alma que cae contigo hacia el mismo cielo. Lo último que escucháis antes de renacer es su voz, ya lejana:\n\n«El mundo ya existe. La historia... la escribís vosotros.»',
        en: 'The light wraps around you both like warm water. You feel something old peeling away... and at the same time you feel the new thread: thin, golden, tied to that other soul falling with you toward the same sky. The last thing you hear before being reborn is her voice, already distant:\n\n"The world already exists. The story... is yours to write together."'
      },
      text: {
        es: 'La luz te envuelve como agua tibia. Sientes que algo viejo se desprende de ti: el peso de los días iguales, el silencio del apartamento, la taza de té frío. Lo último que escuchas antes de renacer es su voz, ya lejana:\n\n«El mundo ya existe. La historia... la escribes tú.»',
        en: 'The light wraps around you like warm water. You feel something old peeling away: the weight of identical days, the silence of the apartment, the cup of cold tea. The last thing you hear before being reborn is her voice, already distant:\n\n"The world already exists. The story... is yours to write."'
      },
      onEnter: [],
      choices: [
        {
          id: 'pro_07_wake',
          text: { es: 'Despertar en el nuevo mundo', en: 'Wake in the new world' },
          conditions: [],
          visibleWhenLocked: false,
          effects: [{ kind: 'discoverRegion', key: 'aldea_brumal' }],
          goto: 'chapter:chapter_01'
        }
      ],
      end: true
    }
  ]
};
