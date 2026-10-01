export const SCENE_DURATION = 5600;

export function createChoreography(figure) {
  const kind = figure.dataset.scene;
  let animations = [];
  let started = false;
  let enabled = true;
  const frame = (offset, transform) => ({ offset, transform });
  function add(selector, keyframes, pivot = null) {
    figure.querySelectorAll(selector).forEach(element => {
      // Pivots are authored in each drawing's local coordinates, keeping joints attached.
      const anchor = element.dataset.pivot || pivot;
      if (anchor) {
        const [x, y] = anchor.split(" ");
        element.style.transformBox = "view-box";
        element.style.transformOrigin = `${x}px ${y}px`;
      }
      const animation = element.animate(keyframes, {
        duration: SCENE_DURATION, fill: "both", easing: "cubic-bezier(.42,0,.25,1)",
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
      add(".haldi-scarf", [frame(0,"rotate(0deg)"),frame(.38,"rotate(-5deg)"),frame(.7,"rotate(2deg)"),frame(1,"rotate(0deg)")]);
      add(".floral-string", [frame(0,"rotate(0deg)"),frame(.38,"rotate(2deg)"),frame(.7,"rotate(-1deg)"),frame(1,"rotate(0deg)")]);
    } else if (kind === "sangeet") {
      add(".sangeet-hem", [frame(0,"scaleX(1)"),frame(.32,"scaleX(1.028)"),frame(.66,"scaleX(.993)"),frame(1,"scaleX(1)")]);
      add(".sangeet-scarf", [frame(0,"rotate(0deg)"),frame(.32,"rotate(-6deg)"),frame(.66,"rotate(2deg)"),frame(1,"rotate(0deg)")]);
      add(".festoon-light", [{opacity:.65,offset:0},{opacity:1,offset:.4},{opacity:.85,offset:.7},{opacity:.65,offset:1}]);
      add(".candle-glow", [{opacity:.6,offset:0},{opacity:1,offset:.38},{opacity:.75,offset:.7},{opacity:.6,offset:1}]);
    } else if (kind === "baraat") {
      add(".groom-greeting", [frame(0,"rotate(0deg)"),frame(.28,"rotate(-7deg)"),frame(.58,"rotate(4deg)"),frame(.8,"rotate(-3deg)"),frame(1,"rotate(0deg)")]);
      add(".guest-greeting", [frame(0,"rotate(0deg)"),frame(.32,"rotate(-6deg)"),frame(.65,"rotate(3deg)"),frame(1,"rotate(0deg)")]);
      add(".dhol-arm", [frame(0,"rotate(0deg)"),frame(.15,"rotate(-15deg)"),frame(.22,"rotate(6deg)"),frame(.42,"rotate(-15deg)"),frame(.49,"rotate(6deg)"),frame(.7,"rotate(-12deg)"),frame(.77,"rotate(5deg)"),frame(1,"rotate(0deg)")]);
      add(".parasol-fringe", [frame(0,"skewX(0deg)"),frame(.35,"skewX(2deg)"),frame(.68,"skewX(-1deg)"),frame(1,"skewX(0deg)")]);
      add(".saddle-tassels", [frame(0,"rotate(0deg)"),frame(.35,"rotate(2deg)"),frame(.68,"rotate(-1deg)"),frame(1,"rotate(0deg)")]);
      add(".procession-flower", [frame(0,"rotate(0deg)"),frame(.35,"rotate(2deg)"),frame(.68,"rotate(-1deg)"),frame(1,"rotate(0deg)")]);
    } else if (kind === "varmala") {
      add(".varmala-veil-tip", [frame(0,"rotate(0deg)"),frame(.38,"rotate(-4deg)"),frame(.72,"rotate(1deg)"),frame(1,"rotate(0deg)")]);
      add(".rose-flower-string", [frame(0,"rotate(0deg)"),frame(.38,"rotate(2deg)"),frame(.72,"rotate(-.7deg)"),frame(1,"rotate(0deg)")]);
    } else if (kind === "phere") {
      add(".ceremony-flame", [frame(0,"scale(1)"),frame(.25,"scale(.95,1.12)"),frame(.5,"scale(1.08,.93)"),frame(.75,"scale(.96,1.08)"),frame(1,"scale(1)")]);
      add(".ceremony-flame-inner", [frame(0,"scale(1)"),frame(.28,"scale(1.1,.9)"),frame(.55,"scale(.95,1.14)"),frame(.8,"scale(1.06,.94)"),frame(1,"scale(1)")]);
      add(".fire-glow", [{opacity:.48,offset:0},{opacity:.85,offset:.4},{opacity:.7,offset:.65},{opacity:.48,offset:1}]);
      add(".mandap-drape", [frame(0,"skewX(0deg)"),frame(.4,"skewX(.8deg)"),frame(.72,"skewX(-.3deg)"),frame(1,"skewX(0deg)")]);
      add(".festoon-light", [{opacity:.6,offset:0},{opacity:.95,offset:.4},{opacity:.75,offset:.7},{opacity:.6,offset:1}]);
    }
    add(".botanical-spray", [frame(0,"rotate(0deg)"),frame(.36,"rotate(2deg)"),frame(.7,"rotate(-.7deg)"),frame(1,"rotate(0deg)")]);
    add(".scene-petal", [
      {opacity:0,transform:"translate(0,-12px)",offset:0},
      {opacity:.8,transform:"translate(6px,7px)",offset:.15},
      {opacity:.5,transform:"translate(16px,55px)",offset:.65},
      {opacity:0,transform:"translate(24px,95px)",offset:1},
    ]);
    const last = animations.at(-1);
    if (last) last.onfinish = () => { figure.dataset.sequenceState = "resting"; };
  }
  return {
    sync(playing, motionEnabled) {
      enabled = motionEnabled;
      if (!enabled) {
        animations.forEach(animation => animation.cancel());
        animations = [];
        started = false;
        figure.dataset.sequenceState = "still";
        return;
      }
      if (playing && !started) { started = true; build(); }
      for (const animation of animations) {
        if (playing && animation.playState === "paused") animation.play();
        else if (!playing && animation.playState === "running") animation.pause();
      }
      if (animations.some(animation => animation.playState !== "finished")) {
        figure.dataset.sequenceState = playing ? "playing" : "paused";
      }
    },
    replay() {
      if (!enabled || animations.some(animation => animation.playState === "running")) return;
      started = true;
      build();
      animations.forEach(animation => animation.play());
      figure.dataset.sequenceState = "playing";
    },
  };
}
