window.HELP_IMPROVE_VIDEOJS = false;

document.addEventListener("DOMContentLoaded", function () {
  if (window.bulmaCarousel) {
    window.bulmaCarousel.attach(".carousel", {
      slidesToScroll: 1,
      slidesToShow: 3,
      loop: true,
      infinite: true,
      autoplay: false,
      autoplaySpeed: 3000
    });
  }

  if (window.bulmaSlider) {
    window.bulmaSlider.attach();
  }
});
