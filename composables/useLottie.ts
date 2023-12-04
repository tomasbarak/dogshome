import lottie from 'lottie-web';

export default function useLottie(
  element: HTMLElement,
  animationPath: string,
  options: any = {}
) {
  let anim: any = null;
  const init = () => {
    anim = lottie.loadAnimation({
      wrapper: element,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: animationPath,
      ...options,
    });
  };

  const destroy = () => {
    anim.destroy();
  };

  return {
    init,
    destroy,
  };
}