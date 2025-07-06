document.addEventListener("DOMContentLoaded", function () {
  const faqsQuestions = document.querySelectorAll(".faqs-question");

  faqsQuestions.forEach((question) => {
    const header = question.querySelector(".faqs-question-header");
    const icon = question.querySelector(".faqs-question-icon");

    header.addEventListener("click", function () {
      const isActive = question.classList.contains("active");

      // Close all other questions (simplified)
      faqsQuestions.forEach((q) => {
        if (q !== question) {
          q.classList.remove("active");
          q.querySelector(".faqs-question-icon").textContent = "+";
        }
      });

      // Toggle current question (simplified)
      if (isActive) {
        question.classList.remove("active");
        icon.textContent = "+";
      } else {
        question.classList.add("active");
        icon.textContent = "×";
      }
    });
  });
});
