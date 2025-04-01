// src/components/LanguageFader.tsx
import React from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

interface LanguageFaderProps {
  languageKey: string;   // текущий язык, напр. 'en' или 'ru'
  children: React.ReactNode;
}

export function LanguageFader({ languageKey, children }: LanguageFaderProps) {
  return (
    <SwitchTransition>
      <CSSTransition
        key={languageKey}           // при смене languageKey будет exit→enter
        classNames="langfade"       // префикс классов в CSS
        timeout={300}
        addEndListener={(node, done) => {
          node.addEventListener('transitionend', done, false);
        }}
      >
        <div>{children}</div>
      </CSSTransition>
    </SwitchTransition>
  );
}
