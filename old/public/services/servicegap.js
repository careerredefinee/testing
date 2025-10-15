function applyServiceGaps() {
  // Determine items per row based on Bootstrap breakpoints
  const width = window.innerWidth;
  const perRow = width >= 992 ? 3 : width >= 768 ? 2 : 1;

  // Find all rows that contain our service/course cards
  const rows = Array.from(document.querySelectorAll('.row')).filter((row) =>
    row.querySelector('.card.course-card, .card.service-card, .workshop-card, #highlights .card3d, .card3d')
  );

  // Inject a CSS rule once to ensure spacing even if inline styles are overridden
  if (!document.getElementById('service-gap-style')) {
    const style = document.createElement('style');
    style.id = 'service-gap-style';
    style.textContent = `
      /* Generic row gap when marker class is present */
      .gap-rows-service > [class*="col-"]:nth-child(n+4) .card { margin-top: 30px !important; }
      .gap-rows-service > [class*="col-"]:nth-child(n+4) { margin-top: 30px !important; }
      /* Fallback for common service sections across pages */
      #services .row > [class*="col-"]:nth-child(n+4) .card { margin-top: 30px !important; }
      #courses .row > [class*="col-"]:nth-child(n+4) .card { margin-top: 30px !important; }
      #programs .row > [class*="col-"]:nth-child(n+4) .card { margin-top: 30px !important; }
      #featured-workshops .row > [class*="col-"]:nth-child(n+4) .workshop-card { margin-top: 30px !important; }
      #featured-workshops .row > [class*="col-"]:nth-child(n+4) { margin-top: 30px !important; }
      #workshops .row > [class*="col-"]:nth-child(n+4) .card { margin-top: 30px !important; }
      #workshops .row > [class*="col-"]:nth-child(n+4) { margin-top: 30px !important; }
    `;
    document.head.appendChild(style);
  }

  rows.forEach((row) => {
    // Collect cards inside this row
    const cards = Array.from(row.querySelectorAll('.card.course-card, .card.service-card, .workshop-card, .card3d'));
    if (!cards.length) return;

    // Map to column wrappers
    const blocks = cards
      .map((card) => card.closest('[class*="col-"]') || card)
      .filter(Boolean);

    const uniqueBlocks = Array.from(new Set(blocks));

    // Add marker class to row so CSS rule applies universally
    row.classList.add('gap-rows-service');

    uniqueBlocks.forEach((el, index) => {
      // Add gap to all items beyond the first full row
      if (index >= perRow) {
        el.style.setProperty('margin-top', '30px', 'important');
      } else {
        el.style.setProperty('margin-top', '0', 'important');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', applyServiceGaps);
window.addEventListener('load', applyServiceGaps);
window.addEventListener('resize', () => {
  // Debounce a bit
  clearTimeout(window.__serviceGapTimer);
  window.__serviceGapTimer = setTimeout(applyServiceGaps, 100);
});

window.addEventListener("load", function () {
  const navMenu = document.getElementById("nav-menu");

  // Create hamburger button if not present
  let menuToggle = document.getElementById("menu-toggle");
  if (!menuToggle) {
    menuToggle = document.createElement("div");
    menuToggle.id = "menu-toggle";
    menuToggle.innerHTML = "&#9776;";
    menuToggle.style.fontSize = "28px";
    menuToggle.style.cursor = "pointer";
    menuToggle.style.marginLeft = "auto";
    menuToggle.style.padding = "5px 12px";
    menuToggle.style.display = "none"; // hidden by default
    document.querySelector("nav > div").appendChild(menuToggle);
  }

  function handleResize() {
    if (window.innerWidth <= 768) {
      menuToggle.style.display = "block"; // show hamburger

      navMenu.style.position = "fixed";
      navMenu.style.top = "0";
      navMenu.style.left = "-50%";
      navMenu.style.height = "100vh";
      navMenu.style.width = "50%";
      navMenu.style.background = "linear-gradient(145deg, #e3f2fd, #c3e0ff)";
      navMenu.style.flexDirection = "column";
      navMenu.style.alignItems = "flex-start";
      navMenu.style.padding = "60px 20px";
      navMenu.style.gap = "20px";
      navMenu.style.transition = "left 0.3s ease";
      navMenu.style.boxShadow = "2px 0 15px rgba(0,0,0,0.3)";
      navMenu.style.borderRadius = "0 8px 8px 0";
      navMenu.style.zIndex = "999";

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
      navMenu.style.left = "-50%";
      isOpen = false;
    }
  });

  window.addEventListener("resize", handleResize);
  handleResize();
});
