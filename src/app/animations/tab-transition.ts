import { AnimationController } from '@ionic/angular';

export const tabTransition = (baseEl: HTMLElement, opts?: any) => {
  const animationCtrl = new AnimationController();

  const entering = animationCtrl.create()
    .addElement(opts.enteringEl)
    .fromTo('opacity', '0', '1')
    .fromTo('transform', 'translateX(12px)', 'translateX(0)')
    .duration(220)
    .easing('cubic-bezier(0.25, 0.8, 0.25, 1)');

  const leaving = animationCtrl.create()
    .addElement(opts.leavingEl)
    .fromTo('opacity', '1', '0')
    .fromTo('transform', 'translateX(0)', 'translateX(-12px)')
    .duration(220)
    .easing('cubic-bezier(0.25, 0.8, 0.25, 1)');

  return animationCtrl.create().addAnimation([entering, leaving]);
};