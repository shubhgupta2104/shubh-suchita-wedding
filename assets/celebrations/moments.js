export const MOMENT_DURATION = 4600;

const effects = {
  haldi: { label: "Scatter marigolds", kind: "petal", colors: ["#e5b34f","#f2d17c"] },
  sangeet: { label: "Let it sparkle", kind: "star", colors: ["#f4dfac","#fff2d6"] },
  baraat: { label: "A little celebration", kind: "confetti", colors: ["#d6ad64","#ba6577","#f0d89e"] },
  varmala: { label: "A few rose petals", kind: "petal", colors: ["#d99caf","#ebc6cd"] },
  phere: { label: "A warmer glow", kind: "glow", colors: [] },
};

export function momentDefinition(id) {
  if (!effects[id]) throw new Error(`Unknown celebration moment: ${id}`);
  return effects[id];
}

export function initMomentInteractions(details,motion) {
  const connection = navigator.connection;
  const controllers = [];
  const visible = new Set();
  const allowed = () => motion.enabled && !connection?.saveData;
  const sync = () => controllers.forEach(controller => controller.sync());
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio >= .2) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    sync();
  }, {threshold:.2});
  for (const event of details.celebrations) {
    const definition = momentDefinition(event.id);
    const figure = document.querySelector(`[data-scene="${event.id}"]`);
    const stage = figure.querySelector(".scene-art");
    let layer;
    let animations = [];
    let played = false;
    function clear() {
      animations.forEach(animation => animation.cancel());
      animations = [];
      layer?.remove();
      layer = null;
      figure.dataset.momentState = "resting";
    }
    function syncController() {
      if (!allowed() && animations.length) clear();
      const playing = allowed() && visible.has(figure) && !document.hidden && !document.querySelector("dialog[open]");
      if (playing && !played && figure.dataset.loaded==="true" && !["appearing","paused"].includes(figure.dataset.appearance)) play();
      for (const animation of animations) {
        if (playing && animation.playState==="paused") animation.play();
        else if (!playing && animation.playState==="running") animation.pause();
      }
      if (animations.length) figure.dataset.momentState = playing ? "playing" : "paused";
    }
    function animate(element,frames,options={}) {
      const animation = element.animate(frames,{duration:MOMENT_DURATION,iterations:1,fill:"both",easing:"ease-in-out",...options});
      animation.id = `moment-${event.id}`;
      animations.push(animation);
      return animation;
    }
    function play() {
      played = true;
      if (definition.kind === "glow") {
        const glow = stage.querySelector(".firelight");
        if (!glow) throw new Error("The Phere glow layer is missing");
        animate(glow,[{opacity:1,filter:"brightness(1)"},{opacity:.55,filter:"brightness(1.35)",offset:.25},{opacity:1,filter:"brightness(1.7)",offset:.55},{opacity:.7,filter:"brightness(1.3)",offset:.8},{opacity:1,filter:"brightness(1)"}]);
      } else {
        layer = document.createElement("div");
        layer.className = "moment-layer";
        layer.setAttribute("aria-hidden","true");
        stage.append(layer);
        for (let i=0;i<20;i++) {
          const particle = document.createElement("span");
          particle.className = `moment-particle moment-${definition.kind}`;
          const x = definition.kind==="star" ? 14+(i*17)%72 : (i%2 ? 78+(i%3)*4 : 10+(i%3)*5);
          particle.style.left = `${x}%`;
          particle.style.top = `${definition.kind==="star" ? 35+(i*7)%25 : 9+(i*7)%30}%`;
          particle.style.background = definition.colors[i%definition.colors.length];
          layer.append(particle);
          if (definition.kind==="star") {
            animate(particle,[
              {opacity:0,transform:"scale(.7)"},{opacity:.95,transform:"scale(1.25)",offset:.28},
              {opacity:.4,transform:"scale(.85)",offset:.5},{opacity:1,transform:"scale(1.4)",offset:.75},
              {opacity:0,transform:"scale(.8)"},
            ],{duration:3700,delay:i*35});
          } else {
            const fall = stage.clientHeight*.38;
            animate(particle,[
              {opacity:0,transform:"translate(0,-8px) rotate(-15deg)"},
              {opacity:1,offset:.18},
              {opacity:0,transform:`translate(${i%2?-18:21}px,${fall}px) rotate(${90+i*12}deg)`},
            ],{duration:3600,delay:i*40});
          }
        }
      }
      const life = animate(stage,[{opacity:1},{opacity:1}]);
      life.onfinish = () => {
        clear();
        syncController();
      };
      figure.dataset.momentPlays = String(Number(figure.dataset.momentPlays || 0)+1);
      figure.dataset.momentState = "playing";
    }
    new MutationObserver(syncController).observe(figure,{attributes:true,attributeFilter:["data-loaded","data-appearance"]});
    observer.observe(figure);
    controllers.push({sync:syncController,clear});
  }
  motion.subscribe(sync);
  document.addEventListener("visibilitychange",sync);
  connection?.addEventListener("change",sync);
  const dialogs = new MutationObserver(sync);
  document.querySelectorAll("dialog").forEach(dialog => dialogs.observe(dialog,{attributes:true,attributeFilter:["open"]}));
  window.addEventListener("pagehide",() => controllers.forEach(controller=>controller.clear()));
  sync();
}

export function initCelebrationNavigation() {
  const links = [...document.querySelectorAll(".day-navigation a")];
  const active = new Set();
  function sync() {
    const sections = [...active].sort((a,b)=>Math.abs(a.getBoundingClientRect().top-window.innerHeight*.3)-Math.abs(b.getBoundingClientRect().top-window.innerHeight*.3));
    const id = sections[0]?.id;
    const day = ["haldi","sangeet"].includes(id) ? "#haldi" : ["baraat","varmala","phere"].includes(id) ? "#baraat" : null;
    links.forEach(link => {
      if (link.hash===day) link.setAttribute("aria-current","location");
      else link.removeAttribute("aria-current");
    });
  }
  const observer = new IntersectionObserver(entries=>{
    for(const entry of entries) entry.isIntersecting ? active.add(entry.target) : active.delete(entry.target);
    sync();
  },{threshold:[0,.15,.5]});
  document.querySelectorAll(".occasion").forEach(section=>observer.observe(section));
}
