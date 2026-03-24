document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.mySlides');
  const dots = document.querySelectorAll('.dot');
  
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  
  function showSlide(index) {
    slides.forEach(slide => slide.style.display = 'none');
    dots.forEach(dot => dot.classList.remove('active'));
    slides[index].style.display = 'block';
    dots[index]?.classList.add('active');
  }
  
  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }
  
  showSlide(0);
  
  setInterval(nextSlide, 800);
  
  document.getElementById('navigateButton')?.addEventListener('click', () => {
    window.location.href = '/selection';
  });
});