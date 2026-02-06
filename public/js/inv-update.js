// const form = document.querySelector("#updateForm")
//     form.addEventListener("change", function () {
//       const updateBtn = document.querySelector("button")
//       updateBtn.removeAttribute("disabled")
//     })

document.addEventListener('DOMContentLoaded', () => {
  const updateBtn = document.getElementById('updateBtn');
  const form = document.getElementById('updateForm');

  if (!updateBtn || !form) return;

  // Force button disabled initially
  updateBtn.disabled = true;

  // Enable button only when all required fields are filled
  function checkFormValidity() {
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    const allFilled = Array.from(requiredFields).every(field => field.value.trim() !== '');
    updateBtn.disabled = !allFilled;
  }

  // Check form validity on input
  form.addEventListener('input', checkFormValidity);

  // Run once on load in case fields are pre-filled
  checkFormValidity();
});
