document.addEventListener("DOMContentLoaded", () => {
  const yearNode = document.querySelector(".footer small");
  if (yearNode) {
    yearNode.textContent = `\u00A9 ${new Date().getFullYear()} Farm To Home`;
  }
});
