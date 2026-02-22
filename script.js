console.log("Oak Books website loaded successfully!");

var RECENT_BOOKS_KEY = "oak_recent_books_v1";
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyBmzVXf93FModJ-QTmRLdNBScyWFhUCWhw",
  authDomain: "oak-book.firebaseapp.com",
  projectId: "oak-book",
  storageBucket: "oak-book.firebasestorage.app",
  messagingSenderId: "880401261810",
  appId: "1:880401261810:web:1ccb66c1864a094dd41c6b",
  measurementId: "G-WBYC6HFPS1"
};
var ALLOWED_ADMIN_EMAILS = [
  "glitchkai039@gmail.com"
];
var THEME_STORAGE_KEY = "oak_theme_mode";

function getDefaultRecentBooks() {
  return [
    {
      id: "green-maze-1",
      title: "The Green Maze",
      image: "book-image.jpg",
      description: "This is a recent addition to our library. A mix of Maze Runner and backrooms mystery.",
      tag: "Mystery",
      link: "error.html?type=not-ready"
    }
  ];
}

function normalizeBook(book, index) {
  var fallback = getDefaultRecentBooks()[0];
  var safe = book || {};
  return {
    id: safe.id || "book-" + index + "-" + Date.now(),
    title: (safe.title || fallback.title).toString().trim(),
    image: (safe.image || fallback.image).toString().trim(),
    description: (safe.description || "").toString().trim(),
    tag: (safe.tag || "General").toString().trim(),
    link: (safe.link || "error.html?type=not-ready").toString().trim()
  };
}

function loadRecentBooks() {
  var raw = localStorage.getItem(RECENT_BOOKS_KEY);
  if (!raw) {
    return getDefaultRecentBooks();
  }

  try {
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return getDefaultRecentBooks();
    }
    return parsed.map(normalizeBook);
  } catch (error) {
    return getDefaultRecentBooks();
  }
}

function saveRecentBooks(books) {
  localStorage.setItem(RECENT_BOOKS_KEY, JSON.stringify(books.map(normalizeBook)));
}

function normalizeEmail(email) {
  return (email || "").toString().trim().toLowerCase();
}

function isAllowedAdminEmail(email) {
  var normalized = normalizeEmail(email);
  return ALLOWED_ADMIN_EMAILS.some(function (allowedEmail) {
    return normalized === normalizeEmail(allowedEmail);
  });
}

function applyTheme(mode) {
  var body = document.body;
  if (!body) {
    return;
  }

  if (mode === "dark") {
    body.classList.add("theme-dark");
  } else {
    body.classList.remove("theme-dark");
  }
}

function getSavedTheme() {
  var saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return "light";
}

function updateThemeToggleLabel(button, mode) {
  if (!button) {
    return;
  }
  button.textContent = mode === "dark" ? "Light Mode" : "Dark Mode";
}

function initThemeToggle() {
  var nav = document.querySelector("header nav");
  if (!nav) {
    return;
  }

  var mode = getSavedTheme();
  applyTheme(mode);

  var toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "theme-toggle";
  updateThemeToggleLabel(toggle, mode);

  toggle.addEventListener("click", function () {
    var next = document.body.classList.contains("theme-dark") ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    updateThemeToggleLabel(toggle, next);
  });

  nav.appendChild(toggle);
}

function initCreditsTab() {
  var nav = document.querySelector("header nav");
  if (!nav || nav.querySelector('a[href="credits.html"]')) {
    return;
  }

  var credits = document.createElement("a");
  credits.href = "credits.html";
  credits.textContent = "Credits";

  var currentPath = window.location.pathname.split("/").pop() || "index.html";
  if (currentPath === "credits.html") {
    credits.classList.add("active");
  }

  nav.appendChild(credits);
}

function initScrollReveal() {
  var revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) {
    return;
  }

  revealElements.forEach(function (element, index) {
    var delay = Math.min(index * 32, 220);
    element.style.setProperty("--reveal-delay", delay + "ms");
  });

  if ("IntersectionObserver" in window) {
    var lastScrollY = window.scrollY || 0;
    var scrollingDown = true;

    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      scrollingDown = y >= lastScrollY;
      lastScrollY = y;
    }, { passive: true });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          if (!scrollingDown) {
            entry.target.classList.remove("is-visible");
          }
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: "0px 0px -8% 0px"
    });

    revealElements.forEach(function (element) {
      observer.observe(element);
    });
    return;
  }

  revealElements.forEach(function (element) {
    element.classList.add("is-visible");
  });
}

function initBackToTop() {
  if (document.querySelector(".back-to-top")) {
    return;
  }

  var button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.textContent = "Top";
  button.setAttribute("aria-label", "Back to top");

  function updateVisibility() {
    if (window.scrollY > 260) {
      button.classList.add("show");
    } else {
      button.classList.remove("show");
    }
  }

  button.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateVisibility, { passive: true });
  updateVisibility();
  document.body.appendChild(button);
}

function initSidebar() {
  var nav = document.querySelector("header nav");
  if (!nav) {
    return;
  }

  var toggle = document.createElement("a");
  toggle.href = "#";
  toggle.className = "sidebar-toggle";
  toggle.textContent = "Menu";
  nav.appendChild(toggle);

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  function openSidebar() {
    document.body.classList.add("sidebar-open");
  }

  var sidebarLoaded = false;
  var sidebarLoadPromise = null;

  function markActiveSidebarLink(sidebar) {
    var currentPath = window.location.pathname.split("/").pop() || "index.html";
    var links = sidebar.querySelectorAll(".sidebar-links a[href]");
    links.forEach(function (link) {
      var hrefPath = (link.getAttribute("href") || "").split("/").pop();
      if (hrefPath === currentPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  function wireSidebarEvents(overlay, sidebar) {
    var closeButton = sidebar.querySelector(".sidebar-close");
    var list = sidebar.querySelector(".sidebar-links");

    if (closeButton) {
      closeButton.addEventListener("click", closeSidebar);
    }
    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }
    if (list) {
      list.addEventListener("click", function (event) {
        if (event.target && event.target.tagName === "A") {
          closeSidebar();
        }
      });
    }
  }

  function loadSidebarFromFile() {
    if (sidebarLoaded) {
      return Promise.resolve(true);
    }
    if (sidebarLoadPromise) {
      return sidebarLoadPromise;
    }

    sidebarLoadPromise = fetch("sidebar.html")
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load sidebar.html");
        }
        return response.text();
      })
      .then(function (markup) {
        var container = document.createElement("div");
        container.innerHTML = markup;
        var overlay = container.querySelector(".sidebar-overlay");
        var sidebar = container.querySelector(".site-sidebar");

        if (!overlay || !sidebar) {
          throw new Error("sidebar.html markup missing required elements");
        }

        document.body.appendChild(overlay);
        document.body.appendChild(sidebar);
        markActiveSidebarLink(sidebar);
        wireSidebarEvents(overlay, sidebar);
        sidebarLoaded = true;
        return true;
      })
      .catch(function () {
        toggle.setAttribute("aria-disabled", "true");
        toggle.textContent = "Menu Unavailable";
        return false;
      });

    return sidebarLoadPromise;
  }

  toggle.addEventListener("click", function (event) {
    event.preventDefault();
    if (toggle.getAttribute("aria-disabled") === "true") {
      return;
    }
    loadSidebarFromFile().then(function (ok) {
      if (!ok) {
        return;
      }
      if (document.body.classList.contains("sidebar-open")) {
        closeSidebar();
        return;
      }
      openSidebar();
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSidebar();
    }
  });
}

function renderRecentBooksPage() {
  var grid = document.getElementById("recent-books-grid");
  if (!grid) {
    return;
  }

  var books = loadRecentBooks();
  grid.innerHTML = "";

  if (!books.length) {
    var empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "No recent books yet. Add one from the Admin page.";
    grid.appendChild(empty);
    return;
  }

  books.forEach(function (book) {
    var card = document.createElement("div");
    card.className = "book";

    var tag = document.createElement("span");
    tag.className = "book-tag";
    tag.textContent = book.tag || "General";

    var title = document.createElement("h3");
    title.textContent = book.title;

    var image = document.createElement("img");
    image.src = book.image || "book-image.jpg";
    image.alt = book.title + " cover";

    var description = document.createElement("p");
    description.textContent = book.description || "New recent title.";

    var action = document.createElement("a");
    action.href = book.link || "error.html?type=not-ready";
    action.textContent = "Read More";

    card.appendChild(tag);
    card.appendChild(title);
    card.appendChild(image);
    card.appendChild(description);
    card.appendChild(action);
    grid.appendChild(card);
  });
}

function initAdminPage() {
  var accessSection = document.getElementById("admin-access");
  if (!accessSection) {
    return;
  }

  var panel = document.getElementById("admin-panel");
  var accessForm = document.getElementById("admin-access-form");
  var accessInput = document.getElementById("admin-email");
  var passwordInput = document.getElementById("admin-password");
  var googleButton = document.getElementById("admin-google-signin");
  var accessFeedback = document.getElementById("admin-access-feedback");
  var sessionEmailLabel = document.getElementById("admin-session-email");
  var logoutButton = document.getElementById("admin-logout");
  var form = document.getElementById("admin-book-form");
  if (!form) {
    return;
  }

  var titleInput = document.getElementById("book-title");
  var imageInput = document.getElementById("book-image");
  var descriptionInput = document.getElementById("book-description");
  var tagInput = document.getElementById("book-tag");
  var linkInput = document.getElementById("book-link");
  var idInput = document.getElementById("book-id");
  var list = document.getElementById("admin-book-list");
  var cancelButton = document.getElementById("admin-cancel");
  var initialized = false;
  var auth = null;

  function showAccess(message) {
    panel.hidden = true;
    accessSection.hidden = false;
    accessFeedback.textContent = message || "";
    accessForm.reset();
    accessInput.focus();
  }

  function showPanel(email) {
    accessSection.hidden = true;
    panel.hidden = false;
    sessionEmailLabel.textContent = "Signed in as: " + email;
    accessFeedback.textContent = "";
  }

  function hasFirebaseConfig() {
    return Boolean(
      FIREBASE_CONFIG &&
      FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.authDomain &&
      FIREBASE_CONFIG.projectId &&
      FIREBASE_CONFIG.appId
    );
  }

  function mapAuthError(errorCode) {
    if (errorCode === "auth/user-not-found") {
      return "That email does not exist in auth records.";
    }
    if (errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
      return "Incorrect email or password.";
    }
    if (errorCode === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (errorCode === "auth/popup-closed-by-user") {
      return "Google sign-in was closed before completing.";
    }
    if (errorCode === "auth/network-request-failed") {
      return "Network error. Check your connection and try again.";
    }
    return "Sign-in failed. Please try again.";
  }

  function initFirebaseAuth() {
    if (!window.firebase) {
      showAccess("Firebase SDK not loaded on this page.");
      return null;
    }
    if (!hasFirebaseConfig()) {
      showAccess("Set your Firebase config in script.js to enable sign-in.");
      return null;
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    return firebase.auth();
  }

  function ensureAuth() {
    if (!auth) {
      auth = initFirebaseAuth();
    }
    return auth;
  }

  function initAdminEditor() {
    if (initialized) {
      return;
    }
    initialized = true;

    function resetForm() {
      idInput.value = "";
      form.reset();
      linkInput.value = "error.html?type=not-ready";
      cancelButton.disabled = true;
    }

    function renderList() {
      var books = loadRecentBooks();
      list.innerHTML = "";

      if (!books.length) {
        var empty = document.createElement("p");
        empty.className = "admin-empty";
        empty.textContent = "No books found. Use the form above to add one.";
        list.appendChild(empty);
        return;
      }

      books.forEach(function (book) {
        var item = document.createElement("div");
        item.className = "admin-book-item";

        var heading = document.createElement("h4");
        heading.textContent = book.title;

        var meta = document.createElement("p");
        meta.textContent = "Tag: " + (book.tag || "General") + " | Link: " + (book.link || "error.html?type=not-ready");

        var actions = document.createElement("div");
        actions.className = "admin-item-actions";

        var edit = document.createElement("button");
        edit.type = "button";
        edit.className = "admin-btn";
        edit.textContent = "Edit";
        edit.setAttribute("data-action", "edit");
        edit.setAttribute("data-id", book.id);

        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "admin-btn ghost";
        remove.textContent = "Delete";
        remove.setAttribute("data-action", "delete");
        remove.setAttribute("data-id", book.id);

        actions.appendChild(edit);
        actions.appendChild(remove);

        item.appendChild(heading);
        item.appendChild(meta);
        item.appendChild(actions);
        list.appendChild(item);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var title = titleInput.value.trim();
      if (!title) {
        return;
      }

      var books = loadRecentBooks();
      var payload = {
        id: idInput.value || "book-" + Date.now(),
        title: title,
        image: imageInput.value.trim() || "book-image.jpg",
        description: descriptionInput.value.trim(),
        tag: (tagInput.value || "General").trim(),
        link: linkInput.value.trim() || "error.html?type=not-ready"
      };

      var existingIndex = books.findIndex(function (book) {
        return book.id === payload.id;
      });

      if (existingIndex >= 0) {
        books[existingIndex] = payload;
      } else {
        books.unshift(payload);
      }

      saveRecentBooks(books);
      renderList();
      resetForm();
    });

    list.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.getAttribute) {
        return;
      }

      var action = target.getAttribute("data-action");
      var id = target.getAttribute("data-id");
      if (!action || !id) {
        return;
      }

      var books = loadRecentBooks();
      var match = books.find(function (book) {
        return book.id === id;
      });

      if (!match) {
        return;
      }

      if (action === "edit") {
        idInput.value = match.id;
        titleInput.value = match.title;
        imageInput.value = match.image;
        descriptionInput.value = match.description;
        tagInput.value = match.tag || "General";
        linkInput.value = match.link;
        cancelButton.disabled = false;
        titleInput.focus();
        return;
      }

      if (action === "delete") {
        var nextBooks = books.filter(function (book) {
          return book.id !== id;
        });
        saveRecentBooks(nextBooks);
        renderList();
        if (idInput.value === id) {
          resetForm();
        }
      }
    });

    cancelButton.addEventListener("click", function () {
      resetForm();
    });

    if (!localStorage.getItem(RECENT_BOOKS_KEY)) {
      saveRecentBooks(getDefaultRecentBooks());
    }

    resetForm();
    renderList();
  }

  accessForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var email = normalizeEmail(accessInput.value);
    var password = (passwordInput.value || "").trim();
    var currentAuth = ensureAuth();
    if (!currentAuth) {
      return;
    }

    currentAuth.signInWithEmailAndPassword(email, password)
      .catch(function (error) {
        showAccess(mapAuthError(error.code));
      });
  });

  googleButton.addEventListener("click", function (event) {
    event.preventDefault();
    var currentAuth = ensureAuth();
    if (!currentAuth) {
      return;
    }
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });
    currentAuth.signInWithPopup(provider)
      .catch(function (error) {
        showAccess(mapAuthError(error.code));
      });
  });

  logoutButton.addEventListener("click", function () {
    var currentAuth = ensureAuth();
    if (!currentAuth) {
      showAccess("Auth is not configured yet.");
      return;
    }
    currentAuth.signOut().then(function () {
      showAccess("Logged out.");
    });
  });

  auth = ensureAuth();
  if (!auth) {
    showAccess("Configure Firebase in script.js to enable Email/Google sign-in.");
    return;
  }

  auth.onAuthStateChanged(function (user) {
    if (!user || !user.email) {
      showAccess("");
      return;
    }

    var email = normalizeEmail(user.email);
    if (!isAllowedAdminEmail(email)) {
      auth.signOut().then(function () {
        showAccess("This signed-in email is not approved for admin.");
      });
      return;
    }

    showPanel(email);
    initAdminEditor();
  });
}

(function setupGlobalErrorRouting() {
  var isErrorPage = window.location.pathname.toLowerCase().endsWith("error.html");
  if (isErrorPage) {
    return;
  }

  var redirected = false;

  function redirectToError(detail) {
    if (redirected) {
      return;
    }
    redirected = true;

    var safeDetail = encodeURIComponent((detail || "Unknown runtime issue").slice(0, 140));
    window.location.href = "error.html?type=error&detail=" + safeDetail;
  }

  window.addEventListener("error", function (event) {
    var source = event && event.filename ? " at " + event.filename : "";
    var message = event && event.message ? event.message : "Script error";
    redirectToError(message + source);
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reasonText = "Unhandled promise rejection";
    if (event && event.reason) {
      reasonText = String(event.reason);
    }
    redirectToError(reasonText);
  });
})();

(function configureErrorPage() {
  if (!window.location.pathname.toLowerCase().endsWith("error.html")) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var type = (params.get("type") || "not-ready").toLowerCase();
  var detail = params.get("detail");

  var tag = document.getElementById("page-type-tag");
  var title = document.getElementById("error-title");
  var message = document.getElementById("error-message");
  var status = document.getElementById("error-status");
  var help = document.getElementById("error-help");
  var detailNode = document.getElementById("error-detail");

  if (!tag || !title || !message || !status || !help || !detailNode) {
    return;
  }

  detailNode.hidden = true;
  detailNode.textContent = "";

  if (type === "error") {
    document.title = "Error - Oak Books";
    tag.textContent = "Error Page";
    tag.classList.remove("type-not-ready");
    tag.classList.add("type-error");
    title.textContent = "Something Went Wrong";
    message.textContent = "This page failed to load correctly. Please try again or use one of the safe links below.";
    status.textContent = "Status: Error detected";
    help.textContent = "Tip: If this keeps happening, contact us so we can fix the broken route.";

    if (detail) {
      detailNode.hidden = false;
      detailNode.textContent = "Details: " + detail;
    }
    return;
  }

  document.title = "Not Ready - Oak Books";
  tag.textContent = "Not Ready Page";
  tag.classList.remove("type-error");
  tag.classList.add("type-not-ready");
  title.textContent = "This Page Is Not Ready Yet";
  message.textContent = "The page you tried to open is still being prepared. Try one of the options below while we finish it.";
  status.textContent = "Status: In progress update";
  help.textContent = "Tip: If you reached this page from a broken link, head to Recent for the newest working content.";
})();

function initFooterLegalLink() {
  var footer = document.querySelector("footer");
  if (!footer || footer.querySelector(".footer-legal")) {
    return;
  }

  var legal = document.createElement("p");
  legal.className = "footer-legal";
  legal.innerHTML = '<a href="copyright.html">Copyright &amp; Use</a>';
  footer.appendChild(legal);
}

function initPageLoader() {
  if (document.querySelector(".page-loader")) {
    return;
  }

  var loader = document.createElement("div");
  loader.className = "page-loader";
  loader.innerHTML = '<div class="page-loader-inner"><span class="page-loader-dot"></span><p>Loading Oak Books...</p></div>';
  document.body.appendChild(loader);
  document.body.classList.add("is-page-loading");

  function hideLoader() {
    loader.classList.add("hide");
    document.body.classList.remove("is-page-loading");
    window.setTimeout(function () {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 420);
  }

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 160);
    return;
  }

  window.addEventListener("load", function () {
    window.setTimeout(hideLoader, 160);
  }, { once: true });
}

function initCustomCursor() {
  if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) {
    return;
  }
  if (document.querySelector(".cursor-dot")) {
    return;
  }

  var dot = document.createElement("div");
  dot.className = "cursor-dot";
  var ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var ringX = mouseX;
  var ringY = mouseY;

  function animate() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    dot.style.transform = "translate(" + mouseX + "px, " + mouseY + "px)";
    ring.style.transform = "translate(" + ringX + "px, " + ringY + "px)";
    window.requestAnimationFrame(animate);
  }

  document.addEventListener("mousemove", function (event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, { passive: true });

  document.addEventListener("mouseenter", function () {
    dot.classList.add("show");
    ring.classList.add("show");
  });

  document.addEventListener("mouseleave", function () {
    dot.classList.remove("show");
    ring.classList.remove("show");
  });

  document.addEventListener("mousedown", function () {
    ring.classList.add("active");
  });

  document.addEventListener("mouseup", function () {
    ring.classList.remove("active");
  });

  document.addEventListener("mouseover", function (event) {
    var target = event.target;
    if (!target) {
      return;
    }

    if (target.closest("a, button, summary, .book, .feature-card, .explore-card")) {
      ring.classList.add("hover");
    } else {
      ring.classList.remove("hover");
    }
  });

  animate();
}

initPageLoader();
renderRecentBooksPage();
initAdminPage();
initSidebar();
initCreditsTab();
initThemeToggle();
initScrollReveal();
initBackToTop();
initFooterLegalLink();
initCustomCursor();

