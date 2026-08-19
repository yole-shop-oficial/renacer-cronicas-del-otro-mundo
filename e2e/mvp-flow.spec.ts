import { test, expect, type Page } from '@playwright/test';

/**
 * E2E del criterio de éxito del MVP (§49, §83):
 * sesión → crear personaje (personaje/nombre/clase/Diosa) → jugar prólogo →
 * desconectar red → seguir jugando offline → recargar app → progreso intacto.
 *
 * Nota: sin credenciales de Supabase el juego ofrece modo local (§88);
 * el flujo cubierto aquí es idéntico salvo el intercambio con la nube.
 */

async function createCharacterAndStart(page: Page, goddess: RegExp = /Aurelia/) {
  // Esperar la pantalla de carga (~6s) hasta que aparezca el creador.
  await page.getByText(/Elige tu encarnación|Choose your incarnation/).waitFor({ timeout: 20_000 });

  // Paso 1: elegir personaje (Liria).
  await page.getByText('Liria').first().click();
  await page.getByRole('button', { name: /Continuar|Continue/ }).click();

  // Paso 2: nombre personalizado (§11-12).
  await page.getByLabel(/nombre|name/i).fill('Alba');
  await page.getByRole('button', { name: /Continuar|Continue/ }).click();

  // Paso 3: clase Maga.
  await page.getByText(/^Mago$|^Mage$/).first().click();
  await page.getByRole('button', { name: /Continuar|Continue/ }).click();

  // Paso 4: Diosa + confirmar.
  await page.getByText(goddess).first().click();
  await page.getByRole('button', { name: /Renacer|Be reborn/ }).click();

  // El prólogo arranca.
  await expect(page.getByText(/lluvia golpea|Rain taps/)).toBeVisible({ timeout: 10_000 });
}

/** Espera a que el service worker controle la página (para recarga offline). */
async function waitForServiceWorker(page: Page) {
  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return;
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;
    await new Promise<void>((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
      setTimeout(resolve, 5000);
    });
  });
}

test('MVP completo: crear personaje, jugar, offline, recuperar tras recarga', async ({ page, context }) => {
  await page.goto('/');
  await waitForServiceWorker(page);

  // 1-5. Sesión + creación de personaje completa.
  await createCharacterAndStart(page);

  // 6-7. Jugar parte del prólogo tomando decisiones.
  await page.getByRole('button', { name: /Girar la fotografía|Turn the photograph/ }).click();
  await expect(page.getByText(/fotografía están ellos|are in the photograph/)).toBeVisible();

  // 8-10. Desconectar Internet → el juego continúa (§26).
  await context.setOffline(true);
  await page.getByRole('button', { name: /Salir a caminar|Go out and walk/ }).click();
  await expect(page.getByText(/Caminas sin rumbo|You wander/)).toBeVisible();

  // 11. La decisión offline queda almacenada localmente.
  await page.getByRole('button', { name: /Abrir los ojos|Open your eyes/ }).click();
  await expect(page.getByText(/alma cansada|weary soul/)).toBeVisible();

  // 12-13. Cerrar y volver a abrir SIN red (PWA + IndexedDB): progreso intacto (§37, §44).
  await page.reload();
  await expect(page.getByText(/alma cansada|weary soul/)).toBeVisible({ timeout: 15_000 });

  // 14. Vuelve Internet: la app sigue funcionando.
  await context.setOffline(false);
  await page.getByRole('button', { name: /Quién eres|Who are you/ }).click();
  await expect(page.getByText(/cuidan los mundos|tend the worlds/)).toBeVisible();
});

test('navegación: personaje, inventario y mundo reflejan el estado', async ({ page }) => {
  await page.goto('/');
  await createCharacterAndStart(page);

  // Ficha de personaje: nombre elegido como encabezado.
  await page.getByRole('button', { name: /Personaje|Character/ }).last().click();
  await expect(page.getByRole('heading', { name: 'Alba' })).toBeVisible();

  // Inventario: subtab dentro de Personaje.
  await page.getByRole('button', { name: /Inventario|Inventory/ }).click();
  await expect(page.getByText(/Bastón de aprendiz|Apprentice Staff/)).toBeVisible();

  // Mundo: la aldea inicial está descubierta, otras regiones no.
  await page.getByRole('button', { name: /Mundo|World/ }).click();
  await expect(page.getByText(/Aldea Brumal|Brumal Village/)).toBeVisible();
  await expect(page.getByText(/Territorio sin descubrir|Undiscovered territory/).first()).toBeVisible();
});

test('la Diosa importa (§14): Sylvane otorga Analizar y desbloquea narrativa (§16)', async ({ page }) => {
  await page.goto('/');
  // Maga + Sylvane → recibe Analizar por bendición divina.
  await createCharacterAndStart(page, /Sylvane/);

  // Avanzar el prólogo completo hasta el capítulo 1.
  const clicks = [
    /Girar la fotografía|Turn the photograph/,
    /Salir a caminar|Go out and walk/,
    /Abrir los ojos|Open your eyes/,
    /Quién eres|Who are you/,
    /cuál será mi historia|what will my story be/,
    /Aceptar la oportunidad|Accept the opportunity/,
    /Aventura|Adventure/,
    /Despertar en el nuevo mundo|Wake in the new world/
  ];
  for (const pattern of clicks) {
    await page.getByRole('button', { name: pattern }).click();
  }

  // Capítulo 1: gracias a Sylvane, [Analizar] está disponible.
  await expect(page.getByText(/hierba húmeda|damp grass/)).toBeVisible();
  const analyzeBtn = page.getByRole('button', { name: /Analizar.*Examinar|Analyze.*Examine/ });
  await expect(analyzeBtn).toBeEnabled();
  await analyzeBtn.click();
  await expect(page.getByText(/huellas recientes|fresh tracks/)).toBeVisible();
});

test('la misma clase con otra Diosa NO tiene Analizar: opción bloqueada visible', async ({ page }) => {
  await page.goto('/');
  // Maga + Ferra → sin Analizar: la opción aparece bloqueada con pista (§16).
  await createCharacterAndStart(page, /Ferra/);

  const clicks = [
    /Girar la fotografía|Turn the photograph/,
    /Salir a caminar|Go out and walk/,
    /Abrir los ojos|Open your eyes/,
    /Quién eres|Who are you/,
    /cuál será mi historia|what will my story be/,
    /Aceptar la oportunidad|Accept the opportunity/,
    /Aventura|Adventure/,
    /Despertar en el nuevo mundo|Wake in the new world/
  ];
  for (const pattern of clicks) {
    await page.getByRole('button', { name: pattern }).click();
  }

  await expect(page.getByText(/hierba húmeda|damp grass/)).toBeVisible();
  const lockedBtn = page.getByRole('button', { name: /Analizar.*Examinar|Analyze.*Examine/ });
  await expect(lockedBtn).toBeDisabled();
  await expect(page.getByText(/Requiere la habilidad Analizar|Requires the Analyze skill/)).toBeVisible();
});

test('COMBATE (§102): el primer encuentro se juega y se gana con comandos', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/');
  await createCharacterAndStart(page, /Ferra/);

  // Avanzar el prólogo (incluye la nueva pregunta de la esperanza §29).
  const clicks = [
    /Girar la fotografía|Turn the photograph/,
    /Salir a caminar|Go out and walk/,
    /Abrir los ojos|Open your eyes/,
    /Quién eres|Who are you/,
    /cuál será mi historia|what will my story be/,
    /Aceptar la oportunidad|Accept the opportunity/,
    /Aventura|Adventure/,
    /Despertar en el nuevo mundo|Wake in the new world/
  ];
  for (const pattern of clicks) {
    await page.getByRole('button', { name: pattern }).click();
  }

  // C1: aldea → Marta → capitán → aceptar misión → camino → LOBO.
  await page.getByRole('button', { name: /Caminar hacia la aldea|Walk toward the village/ }).click();
  await page.getByRole('button', { name: /Contarle la verdad|Tell her the truth/ }).click();
  await page.getByRole('button', { name: /directamente a ver al capitán|straight to see the captain/ }).click();
  await page.getByRole('button', { name: /Aceptar la misión y partir|Accept the quest and set out/ }).click();
  await page.getByRole('button', { name: /Seguir adelante|Press on/ }).click();

  // La interfaz cambia al combate (§4).
  await expect(page.getByText(/Lobo famélico|Starving Wolf/)).toBeVisible({ timeout: 10_000 });

  // Machacar Atacar (y Golpe de poder si está libre) hasta la victoria.
  for (let i = 0; i < 60; i++) {
    if (await page.getByText(/✦ Victoria ✦|✦ Victory ✦/).count()) break;
    const strike = page.getByRole('button', { name: /Golpe de poder|Power Strike/ });
    const attack = page.getByRole('button', { name: /^Atacar$|^Attack$/ });
    if ((await strike.count()) && (await strike.isEnabled())) await strike.click().catch(() => {});
    else if (await attack.isEnabled().catch(() => false)) await attack.click().catch(() => {});
    // reaccionar si hay ventana
    const dodge = page.getByRole('button', { name: /Esquivar|Dodge/ });
    if (await dodge.count()) await dodge.click().catch(() => {});
    await page.waitForTimeout(400);
  }
  await expect(page.getByText(/✦ Victoria ✦|✦ Victory ✦/)).toBeVisible({ timeout: 5_000 });

  // Vuelta a la historia con recompensas (§20).
  await expect(page.getByText(/huye cojeando|flees limping/)).toBeVisible({ timeout: 10_000 });
});
