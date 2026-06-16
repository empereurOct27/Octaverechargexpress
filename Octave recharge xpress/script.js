(function() {
  "use strict";

  let operateur = "ORANGE";

  const services = {
    orange: ["Crédit direct", "Forfait appels (souscription)", "Forfait Internet (souscription)"],
    moov: ["Crédit d'appels (direct)", "Forfait appels (souscription)", "Forfait Internet (souscription)", "Moov Folie (Appels)", "Moov Folie (Internet)", "Moov Folie Double"],
    mtn: ["Crédit d'appels (direct)", "Forfait Appels (souscription)", "Forfait Internet (souscription)", "Forfait MTN C'chic (Internet)"]
  };

  // Constantes sécurisees
  const MON_NUMERO = "2250584921917";
  const LIEN_WAVE_BASE = "https://pay.wave.com/m/M_ci_7CIg4jpqcsl7/";
  const LIEN_WAVE_FIN = "/c/ci/";

  const msgerr = {
    champs: "Veuillez remplir tous les champs obligatoires.",
    telephone: "Numero de telephone invalide. Utilisez le format 0708091011 (10 chiffres).",
    service: "Veuillez choisir un service dans la liste.",
    montant: "Montant invalide. Minimum 50 FCFA, maximum 500 000 FCFA."
  };

  // Validation stricte d'un numero ivoirien (0708091011 ou +2250708091011)
  function validerTelephone(phone) {
    if (!phone) return false;
    // Nettoie : enleve tout sauf chiffres et +
    var nettoye = phone.replace(/[\s\-\.]/g, "");
    // Format court: 10 chiffres commencant par 0
    if (/^0[0-9]{9}$/.test(nettoye)) return "0" + nettoye.substring(1); // Normalise sans le 0 initial pour stockage
    // Format long avec indicatif
    if (/^\+225[0-9]{10}$/.test(nettoye)) return nettoye.substring(4);
    if (/^225[0-9]{10}$/.test(nettoye)) return nettoye.substring(3);
    return false;
  }

  function validerMontant(m) {
    var val = parseInt(m, 10);
    if (isNaN(val) || val < 50 || val > 500000) return false;
    return val;
  }

  function selectOp(op) {
    if (!op || !services[op]) return;
    var ops = document.querySelectorAll('.op');
    ops.forEach(function(e) { e.classList.remove('selected'); });
    // Trouve l'element correspondant
    ops.forEach(function(e) {
      if (e.getAttribute('data-op') === op) {
        e.classList.add('selected');
      }
    });
    operateur = op.toUpperCase();
    var select = document.getElementById('service');
    select.innerHTML = '<option value="">Choisis le service</option>';
    services[op].forEach(function(s) {
      var opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      select.appendChild(opt);
    });
    document.getElementById('total').classList.remove('visible');
    document.getElementById('montant-error').style.display = 'none';
    document.getElementById('phone-error').style.display = 'none';
  }

  document.getElementById('montant').addEventListener('input', function() {
    var m = validerMontant(this.value);
    var totalEl = document.getElementById('total');
    if (m === false) {
      totalEl.textContent = "Montant invalide";
      totalEl.classList.add('visible');
      totalEl.style.color = "#ff6b6b";
      return;
    }
    totalEl.textContent = "Montant : " + m + " FCFA";
    totalEl.style.color = "#00d2ff";
    totalEl.classList.add('visible');
    document.getElementById('montant-error').style.display = 'none';
  });

  function validerFormulaire() {
    var service = document.getElementById('service').value;
    var phone = document.getElementById('phone').value;
    var montant = document.getElementById('montant').value;
    var erreurs = false;

    // Validation service
    if (!service) {
      document.getElementById('service').style.border = "2px solid #ff6b6b";
      erreurs = true;
    } else {
      document.getElementById('service').style.border = "none";
    }

    // Validation telephone
    var phoneValid = validerTelephone(phone);
    var phoneError = document.getElementById('phone-error');
    if (!phoneValid) {
      phoneError.style.display = 'block';
      document.getElementById('phone').style.border = "2px solid #ff6b6b";
      erreurs = true;
    } else {
      phoneError.style.display = 'none';
      document.getElementById('phone').style.border = "none";
    }

    // Validation montant
    var montantVal = validerMontant(montant);
    var montantError = document.getElementById('montant-error');
    if (montantVal === false) {
      montantError.style.display = 'block';
      document.getElementById('montant').style.border = "2px solid #ff6b6b";
      erreurs = true;
    } else {
      montantError.style.display = 'none';
      document.getElementById('montant').style.border = "none";
    }

    if (erreurs) {
      return false;
    }

    return {
      service: service,
      phone: phone,
      phoneClean: phoneValid,
      montant: montantVal
    };
  }

  function genererMessage(donnees) {
    return encodeURIComponent(
      "*NOUVELLE DEMANDE RECHARGE*\n\n" +
      "Octave Informatique\n" +
      "Operateur : " + operateur + "\n" +
      "Numero : " + donnees.phone + "\n" +
      "Service : " + donnees.service + "\n" +
      "Montant : " + donnees.montant + " FCFA\n\n" +
      "Merci pour votre confiance"
    );
  }

  function bindUi() {
    document.querySelectorAll('.op').forEach(function(element) {
      element.addEventListener('click', function() {
        selectOp(element.getAttribute('data-op'));
      });
    });

    document.getElementById('btn-wave').addEventListener('click', function() {
      var donnees = validerFormulaire();
      if (!donnees) return;
      var m = donnees.montant;
      if (m < 50) {
        alert(msgerr.montant);
        return;
      }
      var params = new URLSearchParams({
        operateur: operateur,
        service: donnees.service,
        phone: donnees.phone,
        montant: m
      }).toString();
      window.open(LIEN_WAVE_BASE + m + LIEN_WAVE_FIN, '_blank');
      window.open('confirm.html?' + params, '_blank');
    });

    document.getElementById('btn-wa').addEventListener('click', function() {
      var donnees = validerFormulaire();
      if (!donnees) return;
      var msg = genererMessage(donnees);
      window.open('https://wa.me/' + MON_NUMERO + '?text=' + msg);
    });

    document.getElementById('btn-sms').addEventListener('click', function() {
      var donnees = validerFormulaire();
      if (!donnees) return;
      var msg = genererMessage(donnees);
      window.open('sms:' + MON_NUMERO + '?body=' + msg);
    });

    document.getElementById('btn-physique').addEventListener('click', function() {
      var donnees = validerFormulaire();
      if (!donnees) return;
      var msg = genererMessage(donnees) + '(Je passe payer en especes)';
      window.open('https://wa.me/' + MON_NUMERO + '?text=' + msg);
    });
  }

  window.selectOp = selectOp;

  // Initialisation
  selectOp('orange');
  bindUi();
})();
