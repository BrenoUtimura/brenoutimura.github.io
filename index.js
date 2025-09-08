/* declaração do documento do JavaScript e declaração de duas constantes */
document.addEventListener('DOMContentLoaded', () => {
  const menuBurguer = document.querySelector(".menu-burger");
  const navList = document.querySelector(".nav-list");
  const navListItem = document.querySelector('.nav-list-item');

  /* Função que chama a animação do menuBurger na página  */
  menuBurguer.addEventListener("click", () => {
    navList.classList.toggle("active");
  });

});