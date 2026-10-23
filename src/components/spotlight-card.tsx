// Adapted from Hirael Feature 08, MIT, Copyright (c) 2026 Mohammad Shehadeh.
// https://hirael.com/r/feature-08.json — attribution in THIRD_PARTY_NOTICES.md.
import type {ReactNode,PointerEvent} from 'react';

export function SpotlightCard({children,className=''}:{children:ReactNode;className?:string}){
  const move=(event:PointerEvent<HTMLElement>)=>{
    if(event.pointerType!=='mouse'||document.body.classList.contains('tv-mode'))return;
    const rect=event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mx',`${event.clientX-rect.left}px`);
    event.currentTarget.style.setProperty('--my',`${event.clientY-rect.top}px`);
  };
  return <article className={`spotlight-surface ${className}`} onPointerMove={move}>{children}</article>;
}
