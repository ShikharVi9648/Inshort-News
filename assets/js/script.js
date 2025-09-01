const apiUrl = "https://newsdata.io/api/1/latest?q=";
const apiKey = "pub_be613c8f57d6470ab2661482ecd0ae97";

// const targetedCities = [
//   "Delhi",
//   "Mumbai",
//   "Kolkata",
//   "Pune",
//   "Chandigarh",
//   "Ahmedabad",
//   "Lucknow",
//   "Chennai",
//   "Hyderabad",
//   "Bangalore",
// ];

// const cityQuery = targetedCities.join(" OR ");

// --- DOM ELEMENTS ---
const sidebar = document.querySelector(".sidebar");
const sidebarMenu = document.querySelector(".sidebar-menu");
const hamburgerMenu = document.querySelector(".hamburger-menu");
const closeMenu = document.querySelector(".close");
const newsCards = document.querySelectorAll(".main-card");
const loadMoreBtn = document.querySelector(".load-more a");
const loadMoreContainer = document.querySelector(".load-more");

const langEnBtn = document.querySelector(".language-selection .english");
const langHiBtn = document.querySelector(".language-selection .hindi");
const langMarathiBtn = document.querySelector(".language-selection .marathi");

// --- STATE MANAGEMENT ---
let currentQuery = "";
let currentLanguage = "en";
let nextPageToken = null;

// --- SIDEBAR FUNCTIONS ---
function showsidebar() {
  if (sidebar) sidebar.style.display = "block";
  if (hamburgerMenu) hamburgerMenu.style.display = "none";
  if (closeMenu) closeMenu.style.display = "block";
}

function closesidebar() {
  if (sidebar) sidebar.style.display = "none";
  if (hamburgerMenu) hamburgerMenu.style.display = "block";
  if (closeMenu) closeMenu.style.display = "none";
}

async function fetchNews(query, language = "en", pageToken = null) {
  try {
    let url = `${apiUrl}${encodeURIComponent(
      query
    )}&language=${language}&apiKey=${apiKey}`;
    if (pageToken) {
      url += `&page=${pageToken}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    currentQuery = query;
    currentLanguage = language;
    nextPageToken = data.nextPage || null;

    bindData(data.results || []);
  } catch (error) {
    console.error("Error fetching the news:", error);
    bindData([]);
  }
}

function bindData(articles) {
  for (let i = 0; i < newsCards.length; i++) {
    const card = newsCards[i];
    const article = articles[i];

    if (article && article.image_url && article.title && article.description) {
      fillCardContent(card, article);
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  }

  // Show or hide the "Load More" button
  if (loadMoreContainer) {
    loadMoreContainer.style.display = nextPageToken ? "flex" : "none";
  }
}

function fillCardContent(cardElement, article) {
  if (!cardElement) return;

  const imageElement = cardElement.querySelector(".content-img");
  const titleLink = cardElement.querySelector(".article-text a");
  const authorSpan = cardElement.querySelector(".author a");
  const timeSpan = cardElement.querySelector(".time");
  const dateSpan = cardElement.querySelector(".date");
  const descriptionParagraph = cardElement.querySelector(".about-article p");

  const imageUrl = article.image_url || "assets/img/default.jpg";
  const title = article.title || "No Title";
  const url = article.link || "#";
  const author = article.creator?.[0] || "Unknown";
  const publishedAt = article.pubDate || new Date().toISOString();
  const description = article.description || "No description available.";

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const formattedTime = new Date(publishedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  if (imageElement) imageElement.src = imageUrl;
  if (titleLink) {
    titleLink.href = url;
    titleLink.textContent = title;
  }
  if (authorSpan) authorSpan.textContent = author;
  if (timeSpan) timeSpan.textContent = formattedTime;
  if (dateSpan) dateSpan.textContent = formattedDate;
  if (descriptionParagraph) descriptionParagraph.textContent = description;
}

// --- INITIALIZATION & EVENT LISTENERS ---

// Function to set up all sidebar links (existing + new cities)
function initializeSidebar() {
  // 1. Add event listeners to existing links (India, Business, etc.)
  const existingLinks = document.querySelectorAll(
    ".sidebar-menu .sidebar-item a"
  );
  existingLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const query = event.target.textContent.trim();
      fetchNews(query, currentLanguage);
      // if (query.toLowerCase() === "india") {
      //   fetchNews(cityQuery);
      // } else {
      //   fetchNews(query);
      // }
      closesidebar();
    });
  });
}

// Main execution starts here
window.addEventListener("load", () => {
  // Set up all sidebar links
  initializeSidebar();

  langEnBtn.classList.add("active");

  // Fetch default news on page load
  fetchNews("India");
});

// Hamburger menu click events
if (hamburgerMenu) {
  hamburgerMenu.addEventListener("click", showsidebar);
}
if (closeMenu) {
  closeMenu.addEventListener("click", closesidebar);
}

// Load more button click event
if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (currentQuery && nextPageToken) {
      fetchNews(currentQuery, currentLanguage, nextPageToken);
    }
  });
}

if (langEnBtn) {
  langEnBtn.addEventListener("click", (e) => {
    e.preventDefault();
    langHiBtn.classList.remove("active");
    langEnBtn.classList.add("active");
    fetchNews(currentQuery, "en");
  });
}

if (langHiBtn) {
  langHiBtn.addEventListener("click", (e) => {
    e.preventDefault();
    langEnBtn.classList.remove("active");
    langMarathiBtn.classList.remove("active");
    langHiBtn.classList.add("active");

    const queryForHindi =
      currentQuery.toLowerCase() === "india" ? "भारत" : currentQuery;

    fetchNews(queryForHindi, "hi");
  });
}
if (langMarathiBtn) {
  langMarathiBtn.addEventListener("click", (e) => {
    e.preventDefault();
    langEnBtn.classList.remove("active");
    langHiBtn.classList.remove("active");
    langMarathiBtn.classList.add("active");

    const queryForMarathi =
      currentQuery.toLowerCase() === "india" ? "भारत" : currentQuery;

    fetchNews(queryForMarathi, "mr");
  });
}

//for voice button

async function readText() {
  const text = document.querySelector(".clamped-text").textContent.trim();

  let lang = "en-US";

  // Detect Hindi or Marathi
  if (/[अ-ह]/.test(text)) {
    if (/माझ्या|आपले|स्वागत/.test(text)) {
      lang = "mr-IN";
    } else {
      lang = "hi-IN";
    }
  }

  const response = await fetch(
    "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyCEW5pL4CQ3bww1KuR7wPTLxw31iIC9TSY",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: text },
        voice: { languageCode: lang, ssmlGender: "FEMALE" },
        audioConfig: { audioEncoding: "MP3" },
      }),
    }
  );

  const data = await response.json();

  if (data.audioContent) {
    // Play the audio
    let audio = new Audio("data:audio/mp3;base64," + data.audioContent);
    audio.play();
  } else {
    console.error("Audio content not returned:", data);
  }
}
