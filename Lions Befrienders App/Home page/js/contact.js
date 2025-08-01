document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const data = {
    email: this.email.value,
    subject: this.subject.value,
    description: this.description.value
  };

  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    document.getElementById('confirmation').classList.remove('hidden');
    this.reset();
  } else {
    alert('Something went wrong.');
  }
});
