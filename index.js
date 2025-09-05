document.addEventListener('DOMContentLoaded', () => {
  const menuBurguer = document.querySelector(".menu-burger");
  const navList = document.querySelector(".nav-list");

  menuBurguer.addEventListener("click", () => {
    navList.classList.toggle("active");
  });
});