document.addEventListener("DOMContentLoaded", () => {
  const reportBtn = document.getElementById("reportBtn");
  const reportModal = document.getElementById("reportModal");
  const reportForm = document.getElementById("reportForm");

  reportBtn.addEventListener("click", () => {
    reportModal.style.display = "block";
  });

  reportForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = this.name.value;
    const email = this.email.value;
    const message = this.message.value;

    const telegramMessage = `🚨 *New Issue Reported*\n\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}`;

    const botToken = "8439444928:AAFjCgOcszYsHFBkSZxzT7hRVz1jbNPw8H8";
    const chatId = "@Primarykey_issue_bot";

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: "Markdown"
      }),
    })
      .then(() => {
        alert("Issue reported successfully!");
        reportForm.reset();
        reportModal.style.display = "none";
      })
      .catch(() => alert("Failed to report issue. Try again."));
  });
});
