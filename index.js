/* declaração do documento do JavaScript e declaração de duas constantes */
document.addEventListener('DOMContentLoaded', () => {
  const menuBurguer = document.querySelector(".menu-burger");
  const navList = document.querySelector(".nav-list");
  const navListItem = document.querySelectorAll('.nav-list a');

  /* Função que chama a animação do menuBurger na página  */
  menuBurguer.addEventListener("click", () => {
    navList.classList.toggle("active");
  });

  /* Função que fecha o menu Burger quando selecionar algum item dentro dele */
  navListItem.forEach(link => {
    link.addEventListener("click", () => {
      navList.classList.remove("active");
    })
  });
});