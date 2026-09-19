const b=document.querySelector('.menu'),n=document.querySelector('header nav');b?.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});

const revealTargets=document.querySelectorAll('.project-intro,.projects article,.approach-panel,.available>div,.available .tile,.richmond>div:last-child,footer>div,footer>nav');
revealTargets.forEach(el=>el.classList.add('reveal'));
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -40px'});
revealTargets.forEach(el=>observer.observe(el));

const progress=document.createElement('div');progress.className='scroll-progress';document.body.prepend(progress);
const header=document.querySelector('header');
let ticking=false;
function motionFrame(){const y=window.scrollY,max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max?y/max*100:0)+'%';header?.classList.toggle('scrolled',y>70);if(matchMedia('(prefers-reduced-motion: no-preference)').matches){document.querySelectorAll('.approach-photo').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)el.style.backgroundPosition='center '+(54+(innerHeight/2-r.top-r.height/2)*.018)+'%'});}ticking=false}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(motionFrame);ticking=true}},{passive:true});motionFrame();
