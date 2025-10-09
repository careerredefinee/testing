window.addEventListener("load", function () {
  const navMenu = document.getElementById("nav-menu");

  // Skip if menu not found
  if (!navMenu) return;

  // Create hamburger button if not already added
  let menuToggle = document.getElementById("menu-toggle");
  if (!menuToggle) {
    menuToggle = document.createElement("div");
    menuToggle.id = "menu-toggle";
    menuToggle.innerHTML = "&#9776;";
    menuToggle.style.fontSize = "28px";
    menuToggle.style.cursor = "pointer";
    menuToggle.style.marginLeft = "auto";
    menuToggle.style.padding = "5px 12px";
    menuToggle.style.display = "none";
    document.querySelector("nav > div").appendChild(menuToggle);
  }

  function handleResize() {
    if (window.innerWidth <= 768) {
      menuToggle.style.display = "block";

      navMenu.style.position = "fixed";
      navMenu.style.top = "0";
      navMenu.style.left = "-60%";
      navMenu.style.height = "100vh";
      navMenu.style.width = "60%";
      navMenu.style.background = "linear-gradient(145deg, #e3f2fd, #c3e0ff)";
      navMenu.style.flexDirection = "column";
      navMenu.style.alignItems = "flex-start";
      navMenu.style.padding = "60px 20px";
      navMenu.style.gap = "20px";
      navMenu.style.transition = "left 0.3s ease";
      navMenu.style.boxShadow = "2px 0 15px rgba(0,0,0,0.3)";
      navMenu.style.borderRadius = "0 8px 8px 0";
      navMenu.style.zIndex = "9999";

      Array.from(navMenu.getElementsByTagName("a")).forEach(a => {
        a.style.display = "block";
        a.style.fontSize = "18px";
        a.style.width = "100%";
        a.style.padding = "8px 0";
        a.style.color = "#0d47a1";
      });

    } else {
      menuToggle.style.display = "none";

      navMenu.style.position = "static";
      navMenu.style.flexDirection = "row";
      navMenu.style.height = "auto";
      navMenu.style.width = "auto";
      navMenu.style.padding = "0";
      navMenu.style.background = "transparent";
      navMenu.style.left = "0";
      navMenu.style.boxShadow = "none";

      Array.from(navMenu.getElementsByTagName("a")).forEach(a => {
        a.style.fontSize = "16px";
        a.style.padding = "0";
        a.style.color = "#1f2937";
      });
    }
  }

  let isOpen = false;
  menuToggle.addEventListener("click", () => {
    if (!isOpen) {
      navMenu.style.left = "0";
      isOpen = true;
    } else {
      navMenu.style.left = "-60%";
      isOpen = false;
    }
  });

  window.addEventListener("resize", handleResize);
  handleResize();
});
