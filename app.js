const questions = [
  "Bugün genel olarak kendimi iyi hissettim.",
  "Enerji seviyem yeterliydi.",
  "Gün içinde keyif aldığım anlar oldu.",
  "Kendimi duygusal olarak dengede hissettim.",
  "Yaptığım şeylerde anlam veya tatmin duydum.",
  "Zihinsel olarak net ve odaklıydım.",
  "Kendime karşı anlayışlı davrandım.",
  "Günlük stresimi yönetebildim.",
  "Bedensel olarak (yorgunluk, uyku, ağrı) dengedeydim.",
  "Genel olarak bugüne olumlu bakıyorum.",
];

const statuses = {
  dikkat: {
    label: "DİKKAT",
    range: [10, 24],
    text: `Genel iyilik hali düşük görünüyor. Enerji, motivasyon veya duygusal denge alanında zorlanmalar yaşıyor olabilirsin. Bu durum bir yetersizlik göstergesi değil; sisteminin dinlenme ve yeniden düzenlenme ihtiyacına işaret edebilir.

Şu anda öncelik performans değil, toparlanma olabilir.

Öneriler:
- Beklentilerini bilinçli olarak azalt.
- Uyku ve fiziksel ihtiyaçlarını gözden geçir.
- Yapılacaklar listesini sadeleştir.
- Kendine karşı daha şefkatli bir iç dil kullan.
- Küçük ve güvenli alanlar yarat (kısa yürüyüş, sessiz zaman, destek mesajı).

Bu dönem ilerlemekten çok dengeyi yeniden kurma alanı olabilir.`,
  },
  normal: {
    label: "🟡 NORMAL",
    range: [25, 37],
    text: `Genel iyilik hali dengeli görünüyor. Zaman zaman iniş çıkışlar olsa da sistem regüle durumda. İşlevsellik korunuyor ancak potansiyel olarak daha yukarı taşınabilecek bir alan var.

Bu aralık sürdürülebilir denge alanıdır.

Öneriler:
- Küçük keyif aktiviteleri planla.
- Mini ve tamamlanabilir hedefler belirle.
- İyi giden şeyleri bilinçli olarak fark et.
- Enerji artıran rutinleri sabitle.

Küçük dokunuşlar genel dengeyi güçlendirebilir.`,
  },
  iyi: {
    label: "🟢 İYİ",
    range: [38, 50],
    text: `Genel iyilik hali yüksek görünüyor. Enerji, farkındalık ve duygusal denge güçlü. İçsel kaynakların aktif ve erişilebilir durumda.

Bu dönem gelişim ve üretkenlik için uygun bir zemin sunar.

Değerlendirebileceklerin:
- Zor veya ertelenmiş bir işe başlamak
- Yaratıcı bir fikir üretmek
- Sosyal bağları güçlendirmek
- Uzun vadeli planlama yapmak
- Başkasına destek olmak

Bu seviyede yalnızca iyi hissetmek değil, aynı zamanda ilerlemek de mümkün.`,
  },
};

const STORAGE_KEY = "feelup-entries";
const THEME_KEY = "feelup-theme";

const entryList = document.getElementById("entryList");
const emptyState = document.getElementById("emptyState");
const overallStatus = document.getElementById("overallStatus");
const openFormBtn = document.getElementById("openFormBtn");
const entryDialog = document.getElementById("entryDialog");
const cancelBtn = document.getElementById("cancelBtn");
const entryForm = document.getElementById("entryForm");
const questionContainer = document.getElementById("questionContainer");
const titleInput = document.getElementById("entryTitle");
const themeToggle = document.getElementById("themeToggle");

let entries = loadEntries();

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function createQuestionFields() {
  questionContainer.innerHTML = "";

  questions.forEach((question, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "question-item";

    const label = document.createElement("label");
    const id = `question-${index}`;
    label.setAttribute("for", id);
    label.textContent = question;

    const select = document.createElement("select");
    select.id = id;
    select.required = true;
    select.name = id;

    const placeholder = new Option("Seç", "", true, true);
    placeholder.disabled = true;
    select.add(placeholder);

    for (let score = 1; score <= 5; score += 1) {
      select.add(new Option(String(score), String(score)));
    }

    wrapper.append(label, select);
    questionContainer.appendChild(wrapper);
  });

  const noteWrapper = document.createElement("div");
  noteWrapper.className = "note-field";
  noteWrapper.innerHTML = `
    <label for="journalNote">Bugün neler yaşadın? (Opsiyonel)</label>
    <textarea id="journalNote" rows="4" placeholder="Kısa bir not bırakabilirsin..."></textarea>
  `;
  questionContainer.appendChild(noteWrapper);
}

function getStatusByScore(score) {
  if (score >= statuses.dikkat.range[0] && score <= statuses.dikkat.range[1])
    return statuses.dikkat;
  if (score >= statuses.normal.range[0] && score <= statuses.normal.range[1])
    return statuses.normal;
  return statuses.iyi;
}

function renderOverallStatus() {
  if (!entries.length) {
    overallStatus.textContent = "Lütfen günlük hissiyatınızı belirtin!";
    return;
  }

  const lastSevenEntries = entries.slice(-7);
  const sum = lastSevenEntries.reduce((total, item) => total + item.score, 0);
  const average = sum / lastSevenEntries.length;
  const roundedAverage = Math.round(average);
  const status = getStatusByScore(roundedAverage);

  overallStatus.textContent = `Son ${lastSevenEntries.length} entry ortalaması: ${average.toFixed(1)}\n${status.label} (Toplam Puan: ${status.range[0]}-${status.range[1]})\n\n${status.text}`;
}

function renderEntries() {
  entryList.innerHTML = "";
  emptyState.style.display = entries.length ? "none" : "block";

  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.className = "entry-item";

    li.innerHTML = `
      <div class="entry-line">
        <p class="entry-title"><span class="material-symbols-outlined" aria-hidden="true">check_box</span> [Gün ${index + 1}]: Hissiyat Puanı: <span class="entry-score">${entry.score}</span></p>
        <button type="button" class="icon-btn delete-btn" data-delete-id="${entry.id}" aria-label="Entry sil">
          <span class="material-symbols-outlined" aria-hidden="true">delete</span>
        </button>
      </div>
      ${entry.note ? `<p class="optional-note"><strong>Bugün neler yaşadın?</strong>\n${entry.note}</p>` : ""}
    `;

    entryList.appendChild(li);
  });

  renderOverallStatus();
}

function resetForm() {
  entryForm.reset();
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.querySelector(".material-symbols-outlined").textContent =
      "light_mode";
  }
}

openFormBtn.addEventListener("click", () => {
  if (!titleInput.value.trim()) {
    titleInput.value = "Bugünkü hissiyat";
  }
  entryDialog.showModal();
});

cancelBtn.addEventListener("click", () => {
  entryDialog.close();
  resetForm();
});

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selects = [...questionContainer.querySelectorAll("select")];
  const values = selects.map((select) => Number(select.value));

  if (values.some((value) => Number.isNaN(value))) {
    const firstMissing = selects.find((select) => !select.value);
    if (firstMissing) {
      firstMissing.setCustomValidity("Bu soru zorunludur.");
      firstMissing.reportValidity();
      firstMissing.addEventListener(
        "change",
        () => firstMissing.setCustomValidity(""),
        { once: true },
      );
      firstMissing.focus();
    }
    return;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const noteValue =
    questionContainer.querySelector("#journalNote")?.value.trim() || "";

  entries.push({
    id: crypto.randomUUID(),
    title: titleInput.value.trim() || "Bugünkü hissiyat",
    score: total,
    note: noteValue,
  });

  saveEntries();
  renderEntries();
  entryDialog.close();
  resetForm();
  titleInput.value = "";
});

entryList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (!deleteButton) return;

  const { deleteId } = deleteButton.dataset;
  entries = entries.filter((entry) => entry.id !== deleteId);
  saveEntries();
  renderEntries();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const icon = themeToggle.querySelector(".material-symbols-outlined");
  const isDark = document.body.classList.contains("dark");
  icon.textContent = isDark ? "light_mode" : "dark_mode";
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});

createQuestionFields();
applySavedTheme();
renderEntries();
