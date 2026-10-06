"use strict";

const scenes = [
  {
    image: "./img.1.jpg",
    title: "Alpine Morning",
    description: "Soft morning light across a quiet range of high peaks."
  },
  {
    image: "./img.2.jpg",
    title: "Into the Valley",
    description: "A winding trail leads into a green valley beneath the mountains."
  },
  {
    image: "./img.3.jpg",
    title: "Last Light",
    description: "The last warm light of day settles over the distant summits."
  }
];

const mainImage = document.getElementById("mainImage");
const galleryImage = document.getElementById("galleryImage");
const heroLabel = document.getElementById("heroLabel");
const galleryCount = document.getElementById("galleryCount");
const sceneNumber = document.getElementById("sceneNumber");
const mountainTitle = document.getElementById("mountainTitle");
const mountainDescription = document.getElementById("mountainDescription");
const thumbnails = document.getElementById("thumbnails");

let currentIndex = 0;
let selectedRating = 0;

function showScene(index) {
  currentIndex = (index + scenes.length) % scenes.length;

  const scene = scenes[currentIndex];
  const number = String(currentIndex + 1).padStart(2, "0");
  const total = String(scenes.length).padStart(2, "0");

  mainImage.src = scene.image;
  mainImage.alt = scene.title + " mountain photograph";

  galleryImage.src = scene.image;
  galleryImage.alt = scene.title + " mountain photograph";

  heroLabel.textContent = scene.title;
  galleryCount.textContent = number + " / " + total;
  sceneNumber.textContent = number;

  mountainTitle.textContent = scene.title;
  mountainDescription.textContent = scene.description;

  thumbnails.querySelectorAll(".thumbnail").forEach((button, buttonIndex) => {
    const active = buttonIndex === currentIndex;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

scenes.forEach((scene, index) => {
  const button = document.createElement("button");

  button.className = "thumbnail";
  button.type = "button";
  button.setAttribute("aria-label", "Show " + scene.title);
  button.setAttribute("aria-pressed", "false");

  const image = document.createElement("img");

  image.src = scene.image;
  image.alt = "";

  button.appendChild(image);

  button.addEventListener("click", () => {
    showScene(index);
  });

  thumbnails.appendChild(button);
});

document.getElementById("previousBtn").addEventListener("click", () => {
  showScene(currentIndex - 1);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  showScene(currentIndex + 1);
});

document.addEventListener("keydown", (event) => {
  const tag = document.activeElement.tagName;

  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") {
    return;
  }

  if (event.key === "ArrowLeft") {
    showScene(currentIndex - 1);
  }

  if (event.key === "ArrowRight") {
    showScene(currentIndex + 1);
  }
});

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";

  menuButton.setAttribute("aria-expanded", String(!open));
  navLinks.classList.toggle("open", !open);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

function readSavedList(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));

    return true;
  } catch {
    return false;
  }
}

const reviewForm = document.getElementById("reviewForm");
const reviewStatus = document.getElementById("reviewStatus");
const reviewList = document.getElementById("reviewList");
const reviewCount = document.getElementById("reviewCount");
const listReviewCount = document.getElementById("listReviewCount");
const averageRating = document.getElementById("averageRating");
const averageStars = document.getElementById("averageStars");
const starPicker = document.getElementById("starPicker");

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function updateStarButtons() {
  starPicker.querySelectorAll("button").forEach((button) => {
    const rating = Number(button.dataset.rating);

    button.classList.toggle("selected", rating <= selectedRating);

    button.setAttribute(
      "aria-pressed",
      String(rating === selectedRating)
    );
  });
}

starPicker.querySelectorAll("button").forEach((button) => {
  button.addEventListener("click", () => {
    selectedRating = Number(button.dataset.rating);

    updateStarButtons();

    setStatus(reviewStatus, "");
  });
});

function renderReviews() {
  const reviews = readSavedList("mountainEscapeReviews");

  reviewList.replaceChildren();

  listReviewCount.textContent = String(reviews.length);

  if (reviews.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-reviews";
    empty.textContent = "No reviews yet. Be the first to leave a note.";

    reviewList.appendChild(empty);

    averageRating.textContent = "—";
    averageStars.textContent = "☆☆☆☆☆";
    reviewCount.textContent = "No reviews yet";

    return;
  }

  const average =
    reviews.reduce(
      (sum, review) => sum + Number(review.rating),
      0
    ) / reviews.length;

  const rounded = Math.round(average);

  averageRating.textContent = average.toFixed(1);

  averageStars.textContent =
    "★".repeat(rounded) +
    "☆".repeat(5 - rounded);

  reviewCount.textContent =
    reviews.length +
    (reviews.length === 1 ? " review" : " reviews");

  reviews
    .slice()
    .reverse()
    .forEach((review) => {
      const article = document.createElement("article");

      article.className = "review-entry";

      const top = document.createElement("div");

      top.className = "review-entry-top";

      const name = document.createElement("span");

      name.className = "reviewer-name";
      name.textContent = review.name;

      const stars = document.createElement("span");

      stars.className = "review-stars";

      stars.textContent =
        "★".repeat(Number(review.rating)) +
        "☆".repeat(5 - Number(review.rating));

      const text = document.createElement("p");

      text.textContent = review.text;

      top.append(name, stars);

      article.append(top, text);

      reviewList.appendChild(article);
    });
}

reviewForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (selectedRating < 1 || selectedRating > 5) {
    setStatus(
      reviewStatus,
      "Please choose a star rating first.",
      true
    );

    return;
  }

  const data = new FormData(reviewForm);

  const reviews = readSavedList("mountainEscapeReviews");

  reviews.push({
    name: String(data.get("name")).trim(),
    rating: selectedRating,
    text: String(data.get("review")).trim()
  });

  const saved = saveList(
    "mountainEscapeReviews",
    reviews
  );

  renderReviews();

  reviewForm.reset();

  selectedRating = 0;

  updateStarButtons();

  setStatus(
    reviewStatus,
    saved
      ? "Thanks! Your review is saved in this browser."
      : "Thanks! It is available for this session, but browser storage is unavailable."
  );
});

const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(contactForm);

  const messages = readSavedList("mountainEscapeMessages");

  messages.push({
    name: String(data.get("name")).trim(),
    email: String(data.get("email")).trim(),
    subject: String(data.get("subject")).trim(),
    message: String(data.get("message")).trim(),
    savedAt: new Date().toISOString()
  });

  const saved = saveList(
    "mountainEscapeMessages",
    messages
  );

  contactForm.reset();

  setStatus(
    contactStatus,
    saved
      ? "Thanks! Your message has been saved."
      : "Your message was submitted, but browser storage is unavailable."
  );
});

showScene(0);
renderReviews();
updateStarButtons();