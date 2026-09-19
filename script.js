const b=document.querySelector('.menu'),n=document.querySelector('header nav');b?.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});

const revealTargets=document.querySelectorAll('.project-intro,.projects article,.approach-panel,.available>div,.available .tile,.richmond>div:last-child,footer>div,footer>nav');
revealTargets.forEach(el=>el.classList.add('reveal'));
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -40px'});
revealTargets.forEach(el=>observer.observe(el));