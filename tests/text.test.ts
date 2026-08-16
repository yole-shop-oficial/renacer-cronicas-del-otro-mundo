import { describe, it, expect } from 'vitest';
import { renderStoryText } from '@/engine/text';

describe('Renderizado de texto narrativo (género + nombre)', () => {
  it('sustituye {name} por el nombre del personaje', () => {
    expect(renderStoryText('Come, {name}.', { name: 'Alba', gender: 'f' })).toBe('Come, Alba.');
  });

  it('elige la forma femenina con personaje femenino', () => {
    expect(renderStoryText('Voy sol{a|o}.', { name: 'Alba', gender: 'f' })).toBe('Voy sola.');
    expect(renderStoryText('viajer{a|o} cansad{a|o}', { name: 'X', gender: 'f' })).toBe('viajera cansada');
  });

  it('elige la forma masculina con personaje masculino', () => {
    expect(renderStoryText('Voy sol{a|o}.', { name: 'Kael', gender: 'm' })).toBe('Voy solo.');
    expect(renderStoryText('foraster{a|o}', { name: 'Kael', gender: 'm' })).toBe('forastero');
  });

  it('soporta palabras completas alternativas', () => {
    expect(renderStoryText('un{a viajera|viajero}', { name: 'X', gender: 'm' })).toBe('unviajero');
    expect(renderStoryText('un{a viajera| viajero}', { name: 'X', gender: 'f' })).toBe('una viajera');
  });

  it('no toca texto sin marcadores', () => {
    const plain = 'La lluvia golpea la ventana.';
    expect(renderStoryText(plain, { name: 'X', gender: 'f' })).toBe(plain);
  });
});
