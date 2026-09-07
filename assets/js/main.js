// =========================================================================
//  1. GLOBAL VARIABLES & HELPER FUNCTIONS
// =========================================================================

/**
 * An object mapping section slugs to their "nice names" for display.
 */
const sectionTitles = {
  'guide': 'Clear Thinking Guide',
  'casestudies': 'Case Studies',
  'articles': 'Site Articles'
  // 'posts' is intentionally excluded as it's a direct navigation link.
};

/**
 * Toggles the mobile menu overlay visibility and body scrolling.
 * This is called by the hamburger's onclick and by other functions.
 */
function toggleMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const overlay = document.getElementById('mobileNavOverlay');
  
  if (hamburger && overlay) {
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  }
}

/**
 * The main controller for the mobile menu's tab state.
 * This function is the single source of truth for how the mobile menu looks.
 * @param {string} activeTab - The name of the tab to make active ('main' or 'section').
 * @param {string} [sectionToShow] - The specific section to display (e.g., 'guide', 'casestudies').
 */
function updateMobileNavState(activeTab, sectionToShow) {
  const overlay = document.getElementById('mobileNavOverlay');
  if (!overlay) return;

  const mainTabButton = overlay.querySelector('.tab-button[data-tab-name="main"]');
  const sectionTabButton = document.getElementById('sectionTabButton');
  const mainTabPane = document.getElementById('mainTab');
  const sectionTabPane = document.getElementById('sectionTab');
  
  // 1. Reset everything to a neutral state first.
  mainTabButton.classList.remove('active');
  sectionTabButton.classList.remove('active');
  mainTabPane.style.display = 'none';
  sectionTabPane.style.display = 'none';
  overlay.querySelectorAll('.section-content-wrapper').forEach(wrapper => {
    wrapper.style.display = 'none';
  });

  // 2. Determine which section content to prepare.
  const currentSection = sectionToShow || document.body.dataset.pageSection || 'guide';

  // 3. Update the section tab button's text.
  sectionTabButton.textContent = sectionTitles[currentSection] || 'Section';

  // 4. Show the correct section content wrapper.
  const targetWrapper = overlay.querySelector(`.section-content-wrapper[data-section-content="${currentSection}"]`);
  if (targetWrapper) {
    targetWrapper.style.display = 'block';
  }

  // 5. Activate the correct tab button and pane.
  if (activeTab === 'main') {
    mainTabButton.classList.add('active');
    mainTabPane.style.display = 'block';
  } else { // activeTab is 'section'
    sectionTabButton.classList.add('active');
    sectionTabPane.style.display = 'block';
  }
}

// =========================================================================
//  2. INITIALIZATION FUNCTIONS (called on page load)
// =========================================================================

function initStickyNavigation() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    navbar.classList.toggle('scrolled', currentScrollY > 100);
    navbar.classList.toggle('hidden', currentScrollY > lastScrollY && currentScrollY > 200);
    lastScrollY = currentScrollY;
  });
}

function initNestedAccordionsAndScroll() {
  const sidebars = document.querySelectorAll('.sidebar, .mobile-sidebar-nav');
  sidebars.forEach(sidebar => {
    sidebar.addEventListener('click', function(event) {
      const toggle = event.target.closest('.sidebar-accordion-toggle, .mobile-accordion-toggle');
      if (toggle) {
        const group = toggle.closest('.sidebar-group, .mobile-sidebar-group');
        if (group) {
          // Toggle the group wrapper
          group.classList.toggle('is-open');
          toggle.setAttribute('aria-expanded', group.classList.contains('is-open'));
          
          // --- THIS IS THE NEW LINE ---
          // Directly toggle the minus state on the button itself!
          toggle.classList.toggle('icon-minus'); 
        }
      }
    });

    const activeLink = sidebar.querySelector('a.active');
    if (activeLink) {
      let current = activeLink;
      while (current && current !== sidebar) {
        if (current.matches('.sidebar-group, .mobile-sidebar-group')) {
          current.classList.add('is-open');
          const toggle = current.querySelector('.sidebar-accordion-toggle, .mobile-accordion-toggle');
          if (toggle) {
            toggle.setAttribute('aria-expanded', 'true');
            
            // --- THIS IS THE FIX ---
            // Ensure the minus sign is applied to folders that are opened on page load!
            toggle.classList.add('icon-minus'); 
          }
        }
        current = current.parentElement;
      }
      setTimeout(() => {
        const linkTop = activeLink.offsetTop;
        const sidebarHeight = sidebar.clientHeight;
        const newScrollTop = linkTop - (sidebarHeight / 2);
        sidebar.scrollTop = newScrollTop;
      }, 100);
    }
  });
}

// =========================================================================
//  3. DOMContentLoaded (The main entry point)
// =========================================================================

document.addEventListener('DOMContentLoaded', function() {
  
  initStickyNavigation();
  initNestedAccordionsAndScroll();

  // =========================================================================
  //  HIGHLIGHT TOGGLES (Settings Page)
  // =========================================================================
  const toggleButtons = document.querySelectorAll('.highlight-toggle-btn');
  
  toggleButtons.forEach(button => {
    const type = button.dataset.highlightType; // e.g., 'warn', 'neon'
    const storageKey = `disable-${type}`;
    const cssClass = `disable-${type}`;
    
    // 1. Check current state and set the initial button text
    let isDisabled = localStorage.getItem(storageKey) === 'true';
    updateButtonText(button, type, isDisabled);
    
    // 2. Listen for clicks
    button.addEventListener('click', function() {
      isDisabled = !isDisabled; // Flip the state
      
      if (isDisabled) {
        localStorage.setItem(storageKey, 'true');
        document.documentElement.classList.add(cssClass);
      } else {
        localStorage.setItem(storageKey, 'false');
        document.documentElement.classList.remove(cssClass);
      }
      
      updateButtonText(button, type, isDisabled);
    });
  });
  
  // Helper function to update the button text
  // Helper function to update the button text AND styling
  function updateButtonText(button, type, isDisabled) {
    // Map the system names to readable names for the buttons
    const readableNames = {
      'cool': 'Cool Cyan',
      'bullet': 'Bullet',
      'bold': 'Bold Outline',
      'mark': 'Yellow Marker',
      'subtle': 'Subtle Academic',
      'terminal': 'Hacker Terminal',
      'neon': 'Neon Cyberpunk',
      'retro': 'Retro Brutalist',
      'warn': 'Warning Tags'
    };
    
    const displayName = readableNames[type] || type;
    
    if (isDisabled) {
      // Highlight is turned off: Show grey button, prompt to "Turn On"
      button.textContent = `Turn On ${displayName}`;
      button.classList.add('is-off');
    } else {
      // Highlight is turned on: Show bright button, prompt to "Turn Off"
      button.textContent = `Turn Off ${displayName}`;
      button.classList.remove('is-off');
    }
  }


  


  // =========================================================================
  //  MOBILE NAVIGATION OVERLAY
  // =========================================================================
  const overlay = document.getElementById('mobileNavOverlay');
  if (!overlay) return; // Exits the function here ONLY if there is no overlay

  // Set initial state of the mobile menu on page load
  const currentPageSection = document.body.dataset.pageSection;
  if (currentPageSection && sectionTitles.hasOwnProperty(currentPageSection)) {
    updateMobileNavState('section', currentPageSection);
  } else {
    updateMobileNavState('main', 'guide');
  }

  // Unified click handler for the entire overlay
  overlay.addEventListener('click', function(event) {
    const target = event.target;
    
    // Case 1: Click on a tab button
    const tabButton = target.closest('.tab-button');
    if (tabButton) {
      if (tabButton.classList.contains('active')) return; // Do nothing if tab is already active
      const tabName = tabButton.dataset.tabName;
      updateMobileNavState(tabName);
      return;
    }

    // Case 2: Click on a link
    const link = target.closest('a');
    if (link) {
      const tabSwitcherName = link.dataset.tabSwitcher;
      if (tabSwitcherName) {
        event.preventDefault();
        updateMobileNavState('section', tabSwitcherName);
      } else {
        toggleMobileMenu();
      }
      return;
    }

    // Case 3: Click on the overlay background to close
    if (target === overlay) {
      toggleMobileMenu();
    }
  });

  // Handle Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      toggleMobileMenu();
    }
  });
}); // <--- Notice there is only ONE of these now!

// Dynamically add the scroll-lock style to the page
const style = document.createElement('style');
style.textContent = `
  body.menu-open {
    overflow: hidden;
    position: fixed;
    width: 100%;
  }
`;
document.head.appendChild(style);


// Function to apply and save the text size
function setTextSize(sizePercentage) {
  // Apply the size to the root HTML element
  document.documentElement.style.fontSize = sizePercentage;
  
  // Save the user's choice to their browser
  localStorage.setItem('preferredTextSize', sizePercentage);

  // Update the button visuals to reflect the new choice
  updateTextSizeButtons(sizePercentage);
}

// Function to handle the visual toggling of the buttons
function updateTextSizeButtons(activeSize) {
  // Grab all the text size buttons
  const buttons = document.querySelectorAll('.text-size-controls .text-btn');
  
  buttons.forEach(button => {
    // If this button's data-size matches the active size, it is the selected one
    if (button.getAttribute('data-size') === activeSize) {
      button.classList.remove('is-off'); // Make it look active (Bold/Yellow/Blue)
    } else {
      button.classList.add('is-off'); // Make it look inactive (Transparent/Grey)
    }
  });
}

// 1. APPLY SIZE IMMEDIATELY
const savedSize = localStorage.getItem('preferredTextSize') || '100%';
document.documentElement.style.fontSize = savedSize;

// 2. UPDATE BUTTONS WHEN HTML IS READY
document.addEventListener("DOMContentLoaded", function() {
  // We check if the function exists just as a safety measure
  if (typeof updateTextSizeButtons === "function") {
    updateTextSizeButtons(savedSize);
  }
});

// 3. THE "LOCK-ON" ANCHOR SCROLL
window.addEventListener("load", function() {
  if (window.location.hash) {
    const targetElement = document.querySelector(window.location.hash);
    
    if (targetElement) {
      let scrollAttempts = 0;
      
      // Fire the scroll command every 250 milliseconds
      const scrollLock = setInterval(function() {
        targetElement.scrollIntoView(true);
        scrollAttempts++;
        
        // Stop locking on after 4 attempts (1 full second)
        if (scrollAttempts >= 4) {
          clearInterval(scrollLock);
        }
      }, 250); 
    }
  }
});