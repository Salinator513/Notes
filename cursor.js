// GrindNotes cursor — a warm arrow that dangles from its tip and swings.
// Pendulum sim: gravity always pulls it back to the normal pose; drag is heavy
// near rest so it settles fast, but eases off at speed so a hard flick can
// whip it through full 360° loops before it falls back and hangs.
(function () {
  if (window.matchMedia && matchMedia('(pointer:coarse)').matches) return;

  var GRAVITY   = 1.2;   // restoring torque (deg/frame²) toward the hanging pose
  var DRAG_REST = 0.86;  // velocity kept per frame at low speed — heavy, settles fast
  var DRAG_SPIN = 0.95;  // velocity kept per frame at high speed — lets flicks loop 360
  var SPIN_AT   = 12;    // deg/frame where spin drag takes over from rest drag
  var GAIN      = 0.45;  // how hard mouse motion kicks the swing
  var KICK_MAX  = 30;    // per-event kick clamp (deg/frame)
  var VEL_MAX   = 45;    // absolute angular speed cap (deg/frame)

  var el = document.createElement('div');
  el.id = 'gn-cursor';
  el.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24">' +
    '<path d="M0 0 L0 16.9 L4.4 13.1 L7.4 19.8 L10.1 18.6 L7.1 12.2 L12.6 11.6 Z" ' +
    'fill="#d97757" stroke="#2a1712" stroke-width="1.1" stroke-linejoin="round"/></svg>';
  var css = document.createElement('style');
  css.textContent =
    'html.gn-nocursor,html.gn-nocursor *{cursor:none!important}' +
    '#gn-cursor{position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;' +
    'transform-origin:0 0;will-change:transform;opacity:0;transition:opacity .15s}' +
    '#gn-cursor svg{display:block;overflow:visible;filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))}';
  function boot() {
    document.head.appendChild(css);
    document.body.appendChild(el);
    document.documentElement.classList.add('gn-nocursor');
  }
  if (document.body) boot(); else addEventListener('DOMContentLoaded', boot);

  var x = -99, y = -99, px = 0, py = 0, seen = false, angle = 0, vel = 0;
  addEventListener('pointermove', function (e) {
    if (seen) {
      // torque from dragging the pivot: only motion perpendicular to the arm swings it
      var a = angle * Math.PI / 180;
      var k = ((e.clientX - px) * Math.cos(a) + (e.clientY - py) * Math.sin(a)) * GAIN;
      if (k > KICK_MAX) k = KICK_MAX; else if (k < -KICK_MAX) k = -KICK_MAX;
      vel += k;
    }
    px = x = e.clientX; py = y = e.clientY; seen = true;
    el.style.opacity = 1;
  }, { passive: true });
  document.addEventListener('mouseleave', function () { el.style.opacity = 0; });

  (function step() {
    vel -= Math.sin(angle * Math.PI / 180) * GRAVITY;
    vel *= (Math.abs(vel) > SPIN_AT ? DRAG_SPIN : DRAG_REST);
    if (vel > VEL_MAX) vel = VEL_MAX; else if (vel < -VEL_MAX) vel = -VEL_MAX;
    angle += vel;
    if (angle > 180) angle -= 360; else if (angle < -180) angle += 360; // free 360° wrap
    el.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + angle.toFixed(2) + 'deg)';
    requestAnimationFrame(step);
  })();
})();
