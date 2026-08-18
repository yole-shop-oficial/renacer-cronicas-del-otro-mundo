import { create } from 'zustand';
import { coopLink, type CoopMessage, type LinkState } from '@/coop/coopLink';
import {
  createNegotiation,
  reduceNegotiation,
  rollDivineDice,
  DEFY_FATE_PRICE,
  defyFateGoldPrice,
  type NegotiationState
} from '@/coop/negotiation';
import { useGameStore } from './gameStore';
import { applyEffects } from '@/engine/effects';
import { combatPower } from '@/domain/power';
import { NPCS } from '@/data/world';
import { saveGameLocally } from './persistence';

/**
 * ESTADO COOPERATIVO EN TIEMPO REAL.
 * Orquesta: enlace WiFi (WebRTC) ⇄ negociación de decisiones ⇄ historia.
 * El juego DETECTA solo si hay compañero: los textos cambian a dúo,
 * las decisiones se negocian y los dados del destino resuelven discordias.
 */

export interface PartnerLive {
  name: string;
  gender: 'f' | 'm';
  templateId: string;
  classId: string;
  goddessId: string;
  level: number;
  power: number;
  regionId: string;
  nodeId?: string;
}

interface CoopState {
  linkState: LinkState;
  partner: PartnerLive | null;
  /** En grupo: viajan y deciden juntos. */
  inGroup: boolean;
  /** Separados tras desafiar al destino (pueden reencontrarse). */
  separated: boolean;
  negotiation: NegotiationState | null;
  /** Última acción de combate del compañero (para combos §67). */
  lastCombatAction: { actionId: string; element: string; at: number } | null;
  /** Estado vital del compañero en combate (§66). */
  partnerVitals: { hp: number; maxHp: number; status: string[] } | null;
  /** VÍNCULO ENTRE JUGADORES (§48): acumulado local de la relación. */
  playerBond: { trust: number; cooperation: number; rivalry: number; complicity: number };
  /** Animación de dados activa. */
  showDice: boolean;
  anchorCode: string | null;
  joinAnswer: string | null;

  startHosting: () => Promise<void>;
  joinWithAnchor: (code: string) => Promise<void>;
  completeWithAnswer: (code: string) => Promise<void>;
  disconnect: () => void;

  pickChoice: (nodeId: string, choiceId: string) => void;
  yieldToPartner: () => void;
  invokeDice: () => void;
  rollMyDice: () => void;
  defyFate: () => Promise<void>;
  acceptFate: () => Promise<void>;
  applyResolved: () => Promise<void>;
  sendCombatAction: (actionId: string, element: string) => void;
  sendCombatVitals: (hp: number, maxHp: number, status: string[]) => void;
  /** Registra un pulso de vínculo (acuerdos, discordias, combos...). */
  pulseBond: (kind: 'agreement' | 'discord' | 'yield' | 'combo' | 'reunion') => void;
  leaveGroup: () => void;
  reunite: () => void;
  clearNegotiation: () => void;
}

function sendHello(): void {
  const save = useGameStore.getState().save;
  if (!save) return;
  coopLink.send({
    t: 'hello',
    soul: {
      name: save.character.name,
      gender: save.character.gender ?? 'f',
      templateId: save.character.templateId,
      classId: save.character.classId,
      goddessId: save.character.goddessId,
      level: save.character.level,
      power: combatPower(save.character, NPCS, save.world),
      regionId: save.world.currentRegionId
    }
  });
}

function loadBond() {
  try {
    const raw = localStorage.getItem('player_bond');
    if (raw) return JSON.parse(raw) as { trust: number; cooperation: number; rivalry: number; complicity: number };
  } catch { /* corrupto */ }
  return { trust: 0, cooperation: 0, rivalry: 0, complicity: 0 };
}

function saveBond(b: { trust: number; cooperation: number; rivalry: number; complicity: number }) {
  try { localStorage.setItem('player_bond', JSON.stringify(b)); } catch { /* lleno */ }
}

export const useCoopStore = create<CoopState>((set, get) => {
  // ── Mensajes entrantes del compañero ──
  coopLink.onMessage((msg: CoopMessage) => {
    const s = get();
    switch (msg.t) {
      case 'hello':
        set({ partner: { ...msg.soul }, inGroup: true, separated: false });
        sendHello();
        break;
      case 'pick': {
        const neg = s.negotiation?.nodeId === msg.nodeId ? s.negotiation : createNegotiation(msg.nodeId);
        const next = reduceNegotiation(neg, { type: 'partner_pick', choiceId: msg.choiceId });
        set({ negotiation: next });
        // Si con su elección se cierra el acuerdo, aplicar también aquí.
        if (next.phase === 'agreed') void get().applyResolved();
        break;
      }
      case 'yield':
        if (s.negotiation) {
          set({ negotiation: reduceNegotiation(s.negotiation, { type: 'partner_yields' }) });
          void get().applyResolved();
        }
        break;
      case 'dice_invoke':
        if (s.negotiation) {
          set({
            negotiation: reduceNegotiation(s.negotiation, { type: 'dice_invoked' }),
            showDice: true
          });
        }
        break;
      case 'roll':
        if (s.negotiation) {
          const next = reduceNegotiation(s.negotiation, { type: 'partner_roll', value: msg.value });
          set({ negotiation: next });
          // Si gané yo, mi decisión guía a ambos: aplicar tras la animación.
          if (next.phase === 'resolved' && next.byDice && next.diceWinner === 'me') {
            setTimeout(() => void get().applyResolved(), 2600);
          }
        }
        break;
      case 'defy':
        if (s.negotiation) {
          set({
            negotiation: reduceNegotiation(s.negotiation, { type: 'partner_defies' }),
            separated: true,
            inGroup: false
          });
        }
        break;
      case 'node':
        if (s.partner) set({ partner: { ...s.partner, nodeId: msg.nodeId } });
        break;
      case 'region':
        if (s.partner) set({ partner: { ...s.partner, regionId: msg.regionId } });
        break;
      case 'combat_action':
        set({ lastCombatAction: { actionId: msg.actionId, element: msg.element, at: Date.now() } });
        break;
      case 'combat_vitals':
        set({ partnerVitals: { hp: msg.hp, maxHp: msg.maxHp, status: msg.status } });
        break;
      case 'bond_pulse':
        get().pulseBond(msg.kind);
        break;
      case 'leave_group':
        set({ inGroup: false });
        break;
      case 'reunite':
        set({ inGroup: true, separated: false });
        break;
      case 'ping':
        break;
    }
  });

  coopLink.onStateChange((linkState) => {
    set({ linkState });
    if (linkState === 'connected') sendHello();
    if (linkState === 'lost' || linkState === 'idle') {
      // El juego NUNCA se bloquea: sin enlace, se sigue en solitario (§35).
      set({ partner: null, inGroup: false, negotiation: null, showDice: false });
    }
  });

  return {
    linkState: 'idle',
    partner: null,
    inGroup: false,
    separated: false,
    negotiation: null,
    lastCombatAction: null,
    partnerVitals: null,
    playerBond: loadBond(),
    showDice: false,
    anchorCode: null,
    joinAnswer: null,

    startHosting: async () => {
      const code = await coopLink.createAnchor();
      set({ anchorCode: code });
    },

    joinWithAnchor: async (code) => {
      const answer = await coopLink.acceptAnchor(code);
      set({ joinAnswer: answer });
    },

    completeWithAnswer: async (code) => {
      await coopLink.completeLink(code);
    },

    disconnect: () => {
      coopLink.close();
      set({ partner: null, inGroup: false, negotiation: null, anchorCode: null, joinAnswer: null });
    },

    pickChoice: (nodeId, choiceId) => {
      const s = get();
      const neg = s.negotiation?.nodeId === nodeId ? s.negotiation : createNegotiation(nodeId);
      const next = reduceNegotiation(neg, { type: 'my_pick', choiceId });
      set({ negotiation: next });
      coopLink.send({ t: 'pick', nodeId, choiceId });
      if (next.phase === 'agreed') {
        get().pulseBond('agreement');
        coopLink.send({ t: 'bond_pulse', kind: 'agreement' });
        void get().applyResolved();
      } else if (next.phase === 'discord') {
        get().pulseBond('discord');
      }
    },

    yieldToPartner: () => {
      const s = get();
      if (!s.negotiation) return;
      const next = reduceNegotiation(s.negotiation, { type: 'i_yield' });
      set({ negotiation: next });
      get().pulseBond('yield');
      coopLink.send({ t: 'yield', nodeId: s.negotiation.nodeId });
      coopLink.send({ t: 'bond_pulse', kind: 'yield' });
      void get().applyResolved();
    },

    invokeDice: () => {
      const s = get();
      if (!s.negotiation) return;
      set({
        negotiation: reduceNegotiation(s.negotiation, { type: 'dice_invoked' }),
        showDice: true
      });
      coopLink.send({ t: 'dice_invoke', nodeId: s.negotiation.nodeId });
    },

    rollMyDice: () => {
      const s = get();
      if (!s.negotiation || s.negotiation.phase !== 'rolling') return;
      const value = rollDivineDice();
      const next = reduceNegotiation(s.negotiation, { type: 'my_roll', value });
      set({ negotiation: next });
      coopLink.send({ t: 'roll', nodeId: s.negotiation.nodeId, value });
      if (next.phase === 'resolved' && next.byDice && next.diceWinner === 'me') {
        setTimeout(() => void get().applyResolved(), 2600);
      }
    },

    /** El perdedor acepta el veredicto: se aplica la decisión ganadora. */
    acceptFate: async () => {
      await get().applyResolved();
    },

    /** El perdedor desafía al destino: paga el precio y se separa. */
    defyFate: async () => {
      const s = get();
      const game = useGameStore.getState();
      const save = game.save;
      if (!s.negotiation || !save || s.negotiation.diceWinner !== 'partner') return;

      // Pagar el precio caro al Dios del Destino.
      const goldPrice = defyFateGoldPrice(save.character.gold);
      let result = applyEffects(DEFY_FATE_PRICE, save.character, save.world);
      result = applyEffects(
        [{ kind: 'gainGold', amount: -goldPrice }],
        result.character,
        result.world
      );
      result.world.flags['grupo_separado'] = true;

      const updated = {
        ...save,
        character: result.character,
        world: result.world,
        updatedAt: Date.now()
      };
      await saveGameLocally(updated);
      useGameStore.setState({ save: updated, narrationLog: result.log });

      coopLink.send({ t: 'defy', nodeId: s.negotiation.nodeId });
      set({
        negotiation: reduceNegotiation(s.negotiation, { type: 'i_defy' }),
        separated: true,
        inGroup: false,
        showDice: false
      });

      // Sigue SU decisión (la propia), en solitario.
      const myPick = s.negotiation.myPick;
      if (myPick) {
        const { available } = game.choicesForCurrentNode();
        const choice = available.find((c) => c.id === myPick);
        if (choice) await game.chooseOption(choice);
      }
      set({ negotiation: null });
    },

    /** Aplica la decisión resuelta (acuerdo, cesión o dados) para MÍ. */
    applyResolved: async () => {
      const s = get();
      const game = useGameStore.getState();
      if (!s.negotiation?.resolvedChoiceId) return;
      const { available } = game.choicesForCurrentNode();
      const choice = available.find((c) => c.id === s.negotiation!.resolvedChoiceId);
      if (choice) await game.chooseOption(choice);
      set({ negotiation: null, showDice: false });
      const save = useGameStore.getState().save;
      if (save) coopLink.send({ t: 'node', nodeId: save.currentNodeId });
    },

    sendCombatAction: (actionId, element) => {
      coopLink.send({ t: 'combat_action', actionId, element });
    },

    sendCombatVitals: (hp, maxHp, status) => {
      coopLink.send({ t: 'combat_vitals', hp, maxHp, status });
    },

    pulseBond: (kind) => {
      // §48: el vínculo entre jugadores crece con lo vivido juntos.
      const b = { ...get().playerBond };
      if (kind === 'agreement') { b.trust += 1; b.cooperation += 1; }
      if (kind === 'discord') { b.rivalry += 1; }
      if (kind === 'yield') { b.trust += 2; b.complicity += 1; }
      if (kind === 'combo') { b.cooperation += 2; b.complicity += 1; }
      if (kind === 'reunion') { b.trust += 3; b.complicity += 2; b.rivalry = Math.max(0, b.rivalry - 2); }
      saveBond(b);
      set({ playerBond: b });
    },

    leaveGroup: () => {
      coopLink.send({ t: 'leave_group' });
      set({ inGroup: false });
    },

    reunite: () => {
      get().pulseBond('reunion');
      coopLink.send({ t: 'reunite' });
      set({ inGroup: true, separated: false });
      const save = useGameStore.getState().save;
      if (save) {
        const world = structuredClone(save.world);
        delete world.flags['grupo_separado'];
        world.flags['grupo_reunido'] = true;
        const updated = { ...save, world, updatedAt: Date.now() };
        void saveGameLocally(updated);
        useGameStore.setState({ save: updated });
      }
    },

    clearNegotiation: () => set({ negotiation: null, showDice: false })
  };
});
