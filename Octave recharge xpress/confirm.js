function getUrlParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

document.addEventListener('DOMContentLoaded', function() {
  const params = getUrlParams();
  const summary = document.getElementById('summary');
  const message = document.getElementById('message');
  const paidBtn = document.getElementById('paid');

  if (!params.service || !params.phone || !params.montant || !params.operateur) {
    summary.innerHTML = '<p>Informations de paiement manquantes.</p>';
    paidBtn.disabled = true;
    return;
  }

  summary.innerHTML = `
    <p><strong>Operateur :</strong> ${params.operateur}</p>
    <p><strong>Service :</strong> ${params.service}</p>
    <p><strong>Numéro :</strong> ${params.phone}</p>
    <p><strong>Montant :</strong> ${params.montant} FCFA</p>
  `;

  paidBtn.addEventListener('click', function() {
    fetch('/.netlify/functions/confirmPayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: params.service,
        phone: params.phone,
        montant: params.montant,
        operateur: params.operateur
      })
    })
      .then(r => r.json())
      .then(data => {
        message.style.display = 'block';
        if (data.success) {
          message.textContent = 'Merci, la confirmation a été envoyée.';
        } else {
          message.textContent = 'Erreur : ' + (data.error || 'échec de l’envoi.');
        }
      })
      .catch(() => {
        message.style.display = 'block';
        message.textContent = 'Erreur réseau lors de la confirmation.';
      });
  });
});
