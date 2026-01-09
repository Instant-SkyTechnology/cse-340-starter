
const navButton = document.getElementById('nav-button');
const nav = document.getElementById('main-nav'); // target navigation partial

navButton.addEventListener('click', () => {
  nav.classList.toggle('active');   // show/hide nav on mobile
  navButton.classList.toggle('show'); // change hamburger to X
});

