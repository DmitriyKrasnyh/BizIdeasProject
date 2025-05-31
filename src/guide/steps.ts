// src/guide/steps.ts
import type { Step } from 'react-joyride';

export const TOUR_STEPS: Step[] = [
  {
    target: '#ideas-btn',      // id на кнопке «Идеи»
    content: 'Начните с витрины — здесь собраны 72 тренд-идеи.',
    disableBeacon: true,
  },
  {
    target: '#filter-chip-IT', // пример тэга
    content: 'Фильтруйте по сфере, чтобы сузить список.',
  },
  {
    target: '#idea-card-1',    // первая карточка
    content: 'Нажмите, чтобы раскрыть детали и выбрать её.',
  },
  {
    target: '#ai-fab',
    content: 'Ваш ИИ-консультант готов подсказать конкретные шаги.',
  },
];
