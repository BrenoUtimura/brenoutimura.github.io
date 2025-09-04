document.addEventListener('DOMContentLoaded', () => {
  const menuBurguer = document.querySelector('.menu-burguer');
  const navLinks = document.querySelector('.nav-links');


  menuBurguer.addEventListener('click', () => {
      navLinks.classList.toggle('active');
  });
});