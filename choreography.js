export function createChoreography(figure) {
  const kind = figure.dataset.scene;
  const duration = 7600;
  let animations = [];
  let started = false;
  let disabled = false;
  const at = (offset, transform, extras = {}) => ({ offset, transform, ...extras });

  function add(selector, keyframes, origin = "center bottom") {
    figure.querySelectorAll(selector).forEach(element => {
      element.style.transformBox = "fill-box";
      element.style.transformOrigin = origin;
      const animation = element.animate(keyframes, {
        duration, fill: "both", easing: "cubic-bezier(.4,0,.2,1)",
      });
      animation.id = `action-${kind}`;
      animation.pause();
      animations.push(animation);
    });
  }

  function build() {
    animations.forEach(animation => animation.cancel());
    animations = [];
    if (kind === "haldi") {
      add(".groom-track", [at(0,"translateX(0)"),at(.18,"translateX(37px)"),at(.6,"translateX(37px)"),at(.85,"translateX(0)"),at(1,"translateX(0)")]);
      add(".bride-track", [at(0,"translateX(0)"),at(.35,"translateX(-24px)"),at(.6,"translateX(-24px)"),at(.85,"translateX(0)"),at(1,"translateX(0)")]);
      add(".groom-track .miniature-hand", [at(0,"rotate(0deg)"),at(.15,"rotate(15deg)"),at(.42,"rotate(-39deg)"),at(.57,"rotate(-39deg)"),at(.85,"rotate(0deg)"),at(1,"rotate(0deg)")], "0% 0%");
      add(".bride-track .miniature-profile", [at(0,"rotate(0deg)"),at(.35,"rotate(-7deg)"),at(.6,"rotate(-7deg)"),at(.85,"rotate(0deg)"),at(1,"rotate(0deg)")]);
      add(".haldi-mark", [at(0,"translateX(0)",{opacity:0}),at(.4,"translateX(-24px)",{opacity:0}),at(.48,"translateX(-24px)",{opacity:1}),at(.6,"translateX(-24px)",{opacity:1}),at(.85,"translateX(0)",{opacity:1}),at(1,"translateX(0)",{opacity:1})]);
    } else if (kind === "sangeet") {
      add(".groom-track", [at(0,"translate(0,0)"),at(.18,"translate(27px,-2px)"),at(.36,"translate(8px,0)"),at(.65,"translate(20px,-2px)"),at(1,"translate(0,0)")]);
      add(".bride-track", [at(0,"translate(0,0)"),at(.18,"translate(-24px,-3px)"),at(.36,"translate(10px,0)"),at(.65,"translate(-15px,-2px)"),at(1,"translate(0,0)")]);
      add(".miniature-bride .miniature-skirt", [at(0,"skewX(0deg) scaleX(1)"),at(.2,"skewX(-4deg) scaleX(1.08)"),at(.4,"skewX(7deg) scaleX(1.28)"),at(.62,"skewX(-5deg) scaleX(1.08)"),at(.85,"skewX(0deg) scaleX(1)"),at(1,"skewX(0deg) scaleX(1)")],"center top");
      add(".miniature-bride .miniature-hand", [at(0,"rotate(0deg)"),at(.2,"rotate(-23deg)"),at(.55,"rotate(-23deg)"),at(.85,"rotate(0deg)"),at(1,"rotate(0deg)")],"10% 10%");
      add(".miniature-groom .miniature-hand", [at(0,"rotate(0deg)"),at(.2,"rotate(-16deg)"),at(.55,"rotate(-16deg)"),at(.85,"rotate(0deg)"),at(1,"rotate(0deg)")],"10% 10%");
      add(".miniature-veil", [at(0,"skewX(0deg)"),at(.25,"skewX(-6deg)"),at(.43,"skewX(9deg)"),at(.67,"skewX(-4deg)"),at(1,"skewX(0deg)")],"center top");
    } else if (kind === "baraat") {
      add(".miniature-arrival", [at(0,"translateX(-105px)",{opacity:0}),at(.08,"translateX(-100px)",{opacity:1}),at(.75,"translateX(0)",{opacity:1}),at(1,"translateX(0)",{opacity:1})]);
      add(".miniature-arrival .miniature-step", [at(0,"skewX(0deg)"),at(.15,"skewX(8deg)"),at(.3,"skewX(-6deg)"),at(.45,"skewX(8deg)"),at(.6,"skewX(-6deg)"),at(.75,"skewX(0deg)"),at(1,"skewX(0deg)")],"center top");
      add(".miniature-drumbeat", [at(0,"rotate(0deg)"),at(.12,"rotate(-28deg)"),at(.19,"rotate(12deg)"),at(.32,"rotate(-28deg)"),at(.39,"rotate(12deg)"),at(.52,"rotate(-28deg)"),at(.59,"rotate(12deg)"),at(.72,"rotate(0deg)"),at(1,"rotate(0deg)")],"center top");
    } else if (kind === "varmala") {
      add(".groom-track", [at(0,"translateX(0)"),at(.2,"translateX(25px)"),at(.82,"translateX(25px)"),at(1,"translateX(0)")]);
      add(".bride-track", [at(0,"translateX(0)"),at(.2,"translateX(-18px)"),at(.82,"translateX(-18px)"),at(1,"translateX(0)")]);
      add(".miniature-exchange", [at(0,"translate(0,0)"),at(.2,"translate(-5px,-20px)"),at(.44,"translate(-69px,-89px)"),at(.62,"translate(-69px,-30px)"),at(.82,"translate(-69px,-30px)"),at(1,"translate(-94px,-30px)")]);
      add(".bride-track .miniature-hand", [at(0,"rotate(0deg)"),at(.38,"rotate(-34deg)"),at(.55,"rotate(-34deg)"),at(.78,"rotate(15deg)"),at(1,"rotate(15deg)")],"0% 0%");
      add(".groom-track .miniature-profile", [at(0,"rotate(0deg)"),at(.36,"rotate(13deg)"),at(.55,"rotate(13deg)"),at(.78,"rotate(0deg)"),at(1,"rotate(0deg)")]);
    } else if (kind === "phere") {
      add(".miniature-procession", [at(0,"translate(-80px,-9px) scale(.97)"),at(.25,"translate(-10px,-22px) scale(.94)"),at(.5,"translate(72px,0) scale(1)"),at(.75,"translate(15px,20px) scale(1.025)"),at(1,"translate(0,0) scale(1)")]);
      add(".miniature-step", [at(0,"skewX(0deg)"),at(.15,"skewX(6deg)"),at(.3,"skewX(-4deg)"),at(.45,"skewX(6deg)"),at(.6,"skewX(-4deg)"),at(.75,"skewX(6deg)"),at(1,"skewX(0deg)")],"center top");
      add(".miniature-ribbon", [at(0,"skewX(-4deg)"),at(.25,"skewX(5deg)"),at(.5,"skewX(-4deg)"),at(.75,"skewX(4deg)"),at(1,"skewX(0deg)")],"left top");
    }
    const last = animations.at(-1);
    if (last) last.onfinish = () => { figure.dataset.sequenceState = "resting"; };
  }

  const controller = {
    sync(playing, enabled) {
      if (!enabled) {
        animations.forEach(animation => animation.cancel());
        animations = [];
        started = false;
        disabled = true;
        figure.dataset.sequenceState = "still";
        return;
      }
      if (disabled) disabled = false;
      if (playing && !started) {
        started = true;
        build();
      }
      for (const animation of animations) {
        if (playing && animation.playState === "paused") animation.play();
        else if (!playing && animation.playState === "running") animation.pause();
      }
      if (animations.length && animations.some(animation => animation.playState !== "finished")) figure.dataset.sequenceState = playing ? "playing" : "paused";
    },
    replay() {
      if (disabled) return;
      started = true;
      build();
      animations.forEach(animation => animation.play());
      figure.dataset.sequenceState = "playing";
    },
  };
  return controller;
}
