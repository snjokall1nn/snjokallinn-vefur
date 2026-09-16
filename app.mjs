import { packages, money, recommendation, inquiryText } from "./pricing.mjs";

const form = document.querySelector("#pricing-form");
const resultName = document.querySelector("#result-name");
const resultNote = document.querySelector("#result-note");
const resultPrice = document.querySelector("#result-price");
const resultBreakdown = document.querySelector("#result-breakdown");
const resultFineprint = document.querySelector("#result-fineprint");
const energyStep = document.querySelector("#energy-step");
const copyButton = document.querySelector("#copy-inquiry");
const copyStatus = document.querySelector("#copy-status");
let latestResult;

const labels = {
  goal: {
    confidence: "góðum myndum af mér",
    reinvention: "myndaseríu með ákveðinni hugmynd",
    business: "myndum fyrir vinnu eða vörumerki"
  },
  timing: {
    day: "virkur dagur fyrir kl. 17",
    evening: "kvöld eða helgi"
  }
};

function readAnswers() {
  const data = new FormData(form);
  return {
    goal: data.get("goal"),
    energy: data.get("energy"),
    timing: data.get("timing"),
    extraImages: data.get("extraImages") || "0",
    bts: data.get("bts") === "on"
  };
}

function render() {
  const answers = readAnswers();
  latestResult = recommendation(answers);
  const chosen = packages[latestResult.packageId];
  const isCustom = latestResult.total === null;

  energyStep.hidden = answers.goal === "business";
  resultName.textContent = chosen.name;
  resultNote.textContent = latestResult.note;
  resultPrice.textContent = isCustom ? "Frá 65.000 kr. + VSK" : money(latestResult.total);
  resultFineprint.textContent = isCustom
    ? "Verðið fer eftir umfangi, fjölda fólks, staðsetningu, vinnslu og notkun myndanna."
    : "Öll verð eru með VSK. Ef það þarf að leigja rými læt ég þig alltaf vita áður en þú bókar.";

  resultBreakdown.replaceChildren();
  if (!isCustom) {
    const base = document.createElement("div");
    base.innerHTML = `<span>${chosen.name}</span><strong>${money(chosen.price)}</strong>`;
    resultBreakdown.append(base);
    latestResult.additions.forEach(item => {
      const row = document.createElement("div");
      row.innerHTML = `<span>${item.label}</span><strong>+ ${money(item.value)}</strong>`;
      resultBreakdown.append(row);
    });
  }

  copyStatus.textContent = "";
}

form.addEventListener("change", render);

document.querySelectorAll("[data-pick]").forEach(button => {
  button.addEventListener("click", () => {
    const pick = button.dataset.pick;
    const goal = pick === "custom" ? "business" : pick === "iconic" ? "reinvention" : "confidence";
    const energy = pick === "quick" ? "quick" : pick === "iconic" ? "production" : "full";
    form.elements.goal.value = goal;
    form.elements.energy.value = energy;
    render();
    document.querySelector("#leidari").scrollIntoView({ behavior: "smooth" });
  });
});

copyButton.addEventListener("click", async () => {
  const answers = readAnswers();
  const text = inquiryText(latestResult, {
    ...answers,
    goalLabel: labels.goal[answers.goal],
    timingLabel: labels.timing[answers.timing]
  });

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = "Klárt — tillagan er komin á klemmuspjaldið.";
    copyButton.textContent = "Afritað";
    window.setTimeout(() => { copyButton.textContent = "Afrita tillögu"; }, 1800);
  } catch {
    copyStatus.textContent = "Ekki tókst að afrita. Þú getur sent pakkanafnið beint í DM.";
  }
});

render();

const quizForm = document.querySelector("#style-quiz-form");
const quizSteps = [...document.querySelectorAll("[data-quiz-step]")];
const quizBack = document.querySelector("#quiz-back");
const quizNext = document.querySelector("#quiz-next");
const quizResult = document.querySelector("#quiz-result");
let quizIndex = 0;

const styleResults = {
  glowy: {
    title: "Hlýtt & glowy",
    copy: "Þú dregst að mjúku ljósi, hlýjum tónum og myndum sem eru fallegar án þess að verða stífar. Við myndum blanda rólegri leiðsögn, náttúrulegum svipbrigðum og smá Pro-Mist töfrum.",
    tags: ["Hlýir tónar", "Mjúkt ljós", "Róleg leiðsögn"],
    image: "./assets/glowy-flare.webp",
    packageId: "editorial"
  },
  editorial: {
    title: "Ækonik editorial",
    copy: "Þú vilt að myndirnar hafi hugmynd, lit og sterka nærveru. Við byggjum moodboard, pælum í styling og búum til myndaseríu sem gæti verið herferð eða forsíða.",
    tags: ["Moodboard", "Djarfir litir", "Main character"],
    image: "./assets/editorial-fur.webp",
    packageId: "iconic"
  },
  flash: {
    title: "Dispo-flass & orka",
    copy: "Þú vilt myndir sem líða eins og eitthvað sé að gerast. Beint flass, hreyfing og leikur gera útkomuna hráa, skemmtilega og andskoti flotta.",
    tags: ["Beint flass", "Hreyfing", "Óvænt augnablik"],
    image: "./assets/guitar-floor.webp",
    packageId: "editorial"
  },
  candid: {
    title: "Náttúrulegt & lifandi",
    copy: "Þú vilt þekkja þig í myndunum og finna augnablikið aftur. Við notum létt verkefni, hreyfingu og stað sem hefur merkingu — með leiðsögn sem finnst ekki stíf.",
    tags: ["Alvöru svipbrigði", "Hreyfing", "Persónulegt rými"],
    image: "./assets/gallery-friends.webp",
    packageId: "editorial"
  }
};

function selectedQuizValue(index = quizIndex) {
  return quizForm?.querySelector(`input[name="q${index + 1}"]:checked`)?.value;
}

function showQuizStep(index) {
  quizIndex = index;
  quizSteps.forEach((step, i) => { step.hidden = i !== index; });
  document.querySelector("#quiz-progress-text").textContent = `Spurning ${index + 1} af ${quizSteps.length}`;
  document.querySelector("#quiz-progress-bar").style.width = `${((index + 1) / quizSteps.length) * 100}%`;
  quizBack.disabled = index === 0;
  quizNext.disabled = !selectedQuizValue(index);
  quizNext.textContent = index === quizSteps.length - 1 ? "Sjá niðurstöðu" : "Næsta";
}

function finishQuiz() {
  const answers = new FormData(quizForm);
  const scores = { glowy: 0, editorial: 0, flash: 0, candid: 0 };
  for (let i = 1; i <= quizSteps.length; i += 1) {
    const value = answers.get(`q${i}`);
    if (value) scores[value] += i === 1 || i === 6 ? 2 : 1;
  }
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const result = styleResults[winner];
  quizForm.hidden = true;
  quizResult.hidden = false;
  document.querySelector("#quiz-result-title").textContent = result.title;
  document.querySelector("#quiz-result-copy").textContent = result.copy;
  const resultImage = document.querySelector("#quiz-result-image");
  resultImage.src = result.image;
  resultImage.alt = `Dæmi um ${result.title.toLowerCase()} Snjókallinn-stíl`;
  document.querySelector("#quiz-package-name").textContent = packages[result.packageId].name;
  document.querySelector("#quiz-result-tags").replaceChildren(...result.tags.map(tag => {
    const span = document.createElement("span");
    span.textContent = tag;
    return span;
  }));
  quizResult.dataset.package = result.packageId;
  quizResult.scrollIntoView({ behavior: "smooth", block: "center" });
}

quizForm?.addEventListener("change", () => {
  quizNext.disabled = !selectedQuizValue();
});
quizNext?.addEventListener("click", () => {
  if (!selectedQuizValue()) return;
  if (quizIndex === quizSteps.length - 1) finishQuiz();
  else showQuizStep(quizIndex + 1);
});
quizBack?.addEventListener("click", () => showQuizStep(Math.max(0, quizIndex - 1)));
document.querySelector("#quiz-restart")?.addEventListener("click", () => {
  quizForm.reset();
  quizForm.hidden = false;
  quizResult.hidden = true;
  showQuizStep(0);
});
document.querySelector("#quiz-to-calculator")?.addEventListener("click", () => {
  const packageId = quizResult.dataset.package;
  form.elements.goal.value = packageId === "iconic" ? "reinvention" : "confidence";
  form.elements.energy.value = packageId === "iconic" ? "production" : "full";
  render();
  document.querySelector("#leidari").scrollIntoView({ behavior: "smooth" });
});

showQuizStep(0);
