"use strict";
const PAYS = [
  "Afrique du Sud",
  "Algérie",
  "Angola",
  "Bénin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroun",
  "Centrafrique",
  "Comores",
  "Congo",
  "Côte d’Ivoire",
  "Djibouti",
  "Égypte",
  "Érythrée",
  "Eswatini",
  "Éthiopie",
  "Gabon",
  "Gambie",
  "Ghana",
  "Guinée",
  "Guinée-Bissau",
  "Guinée équatoriale",
  "Kenya",
  "Lesotho",
  "Libéria",
  "Libye",
  "Madagascar",
  "Malawi",
  "Mali",
  "Maroc",
  "Maurice",
  "Mauritanie",
  "Mozambique",
  "Namibie",
  "Niger",
  "Nigeria",
  "Ouganda",
  "RD Congo",
  "Rwanda",
  "Sao Tomé-et-Principe",
  "Sénégal",
  "Seychelles",
  "Sierra Leone",
  "Somalie",
  "Soudan",
  "Soudan du Sud",
  "Tanzanie",
  "Tchad",
  "Togo",
  "Tunisie",
  "Zambie",
  "Zimbabwe",
];
const $ = (s) => document.querySelector(s);
const mem = {};
const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : k in mem ? mem[k] : d;
    } catch (e) {
      return k in mem ? mem[k] : d;
    }
  },
  set(k, v) {
    mem[k] = v;
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  },
};
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs || {}) {
    if (k === "class") e.className = attrs[k];
    else if (k.startsWith("on")) e[k] = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  kids.flat().forEach((c) => {
    if (c != null)
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
  });
  return e;
}
const day = (t) => new Date(t).toLocaleDateString("fr-FR");
const ago = (n) => Date.now() - n * 864e5;
function seed() {
  return [
    {
      id: 1,
      type: "bug",
      titre: "Flutter : l’image réseau ne s’affiche pas sur Android 14",
      desc: "Image.network renvoie une erreur de certificat alors que l’URL fonctionne dans le navigateur. Quelqu’un a déjà rencontré le problème ?",
      code: "Image.network(\n  'https://exemple.sn/photo.jpg',\n  errorBuilder: (c, e, s) => Text('$e'),\n)",
      lang: "Flutter",
      pays: "Sénégal",
      auteur: "Awa_Ndiaye",
      date: ago(2),
      votes: ["a", "b", "c"],
      resolu: false,
      comms: [
        {
          auteur: "Ibrahima_Diop",
          pays: "Sénégal",
          texte:
            "Vérifie la chaîne de certificats du serveur, il manque peut-être le certificat intermédiaire.",
          date: ago(1),
        },
      ],
    },
    {
      id: 2,
      type: "bug",
      titre: "Spring Boot : erreur 403 sur /api/login avec JWT",
      desc: "Après l’ajout de Spring Security, toutes les routes renvoient 403, même celles déclarées en permitAll().",
      code: 'http.csrf(c -> c.disable())\n    .authorizeHttpRequests(a -> a\n      .requestMatchers("/api/login").permitAll()\n      .anyRequest().authenticated());',
      lang: "Spring Boot",
      pays: "Sénégal",
      auteur: "Cheikh_Fall",
      date: ago(4),
      votes: ["a", "b"],
      resolu: true,
      comms: [
        {
          auteur: "Fatou_Sarr",
          pays: "Sénégal",
          texte:
            "Ajoute le filtre JWT avant UsernamePasswordAuthenticationFilter et vérifie l’ordre des règles.",
          date: ago(3),
        },
      ],
    },
    {
      id: 3,
      type: "disc",
      titre: "Quels outils gratuits pour héberger un projet PHP/MySQL ?",
      desc: "Je cherche un hébergement fiable et peu coûteux pour des projets d’étudiants. Quelles sont vos expériences en Afrique ?",
      code: "",
      lang: "PHP",
      pays: "Sénégal",
      auteur: "Moussa_Sow",
      date: ago(6),
      votes: ["a"],
      resolu: false,
      comms: [],
    },
  ];
}
let users = store.get("da_users", {}),
  posts = store.get("da_posts", null) || seed(),
  me = null,
  type = "all";
try {
  me = sessionStorage.getItem("da_me");
} catch (e) {}
if (me && !users[me]) me = null;
const save = () => store.set("da_posts", posts);

// Remplissage des listes de pays
[
  ["#fPays", true],
  ["#aPays", false],
].forEach(([s, all]) => {
  const sel = $(s);
  if (all) sel.append(h("option", { value: "" }, "Tous les pays africains"));
  PAYS.forEach((p) => sel.append(h("option", { value: p }, p)));
});
$("#aPays").value = "Sénégal";

// Sécurité : hachage PBKDF2 avec sel aléatoire, blocage après 5 échecs
const enc = (s) => new TextEncoder().encode(s);
const hex = (b) =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
async function hash(pw, salt) {
  const k = await crypto.subtle.importKey("raw", enc(pw), "PBKDF2", false, [
    "deriveBits",
  ]);
  return hex(
    await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: enc(salt), iterations: 150000, hash: "SHA-256" },
      k,
      256,
    ),
  );
}
let fails = 0,
  lockUntil = 0;

function setMe(p) {
  me = p;
  try {
    p ? sessionStorage.setItem("da_me", p) : sessionStorage.removeItem("da_me");
  } catch (e) {}
  head();
  render();
}
function head() {
  $("#who").textContent = me ? me + " · " + users[me].pays : "";
  $("#bAuth").textContent = me ? "Déconnexion" : "Connexion";
}

let mode = "login";
function authMode(m) {
  mode = m;
  const reg = m === "reg";
  $("#aTitle").textContent = reg ? "Créer un compte" : "Connexion";
  $("#aGo").textContent = reg ? "S’inscrire" : "Se connecter";
  $("#aSw").textContent = reg ? "J’ai un compte" : "Créer un compte";
  $("#aPaysBox").hidden = !reg;
  $("#aHint").hidden = !reg;
  $("#aPass").autocomplete = reg ? "new-password" : "current-password";
  $("#aErr").textContent = "";
}
$("#bAuth").onclick = () => {
  if (me) {
    setMe(null);
  } else {
    authMode("login");
    $("#dAuth").showModal();
  }
};
$("#aSw").onclick = () => authMode(mode === "login" ? "reg" : "login");
$("#aX").onclick = () => $("#dAuth").close();
$("#aGo").onclick = async () => {
  const u = $("#aUser").value.trim(),
    p = $("#aPass").value,
    err = $("#aErr");
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(u)) {
    err.textContent =
      "Pseudo invalide (3 à 20 caractères : lettres, chiffres, _ ou -).";
    return;
  }
  if (p.length < 8) {
    err.textContent = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }
  if (Date.now() < lockUntil) {
    err.textContent = "Trop d’essais. Réessaie dans quelques secondes.";
    return;
  }
  try {
    if (mode === "reg") {
      if (Object.keys(users).some((k) => k.toLowerCase() === u.toLowerCase())) {
        err.textContent = "Ce pseudo existe déjà.";
        return;
      }
      const pays = $("#aPays").value;
      if (!PAYS.includes(pays)) {
        err.textContent = "Choisis un pays.";
        return;
      }
      const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
      users[u] = { salt, hash: await hash(p, salt), pays };
      store.set("da_users", users);
    } else {
      const x = users[u];
      if (!x || (await hash(p, x.salt)) !== x.hash) {
        if (++fails >= 5) {
          lockUntil = Date.now() + 30000;
          fails = 0;
        }
        err.textContent = "Pseudo ou mot de passe incorrect.";
        return;
      }
    }
    fails = 0;
    $("#aPass").value = "";
    $("#dAuth").close();
    setMe(u);
  } catch (e) {
    err.textContent =
      "Erreur de sécurité du navigateur. Utilise une connexion HTTPS.";
  }
};

// Publication
$("#bNew").onclick = () => {
  if (!me) {
    authMode("login");
    $("#dAuth").showModal();
    return;
  }
  $("#nErr").textContent = "";
  $("#dNew").showModal();
};
$("#nX").onclick = () => $("#dNew").close();
$("#nGo").onclick = () => {
  const t = $("#nTitle").value.trim(),
    d = $("#nDesc").value.trim(),
    err = $("#nErr");
  if (t.length < 5 || d.length < 10) {
    err.textContent =
      "Titre (5 caractères min.) et description (10 caractères min.) obligatoires.";
    return;
  }
  posts.unshift({
    id: Date.now(),
    type: $("#nType").value === "bug" ? "bug" : "disc",
    titre: t,
    desc: d,
    code: $("#nCode").value.slice(0, 4000),
    lang: $("#nLang").value.trim(),
    pays: users[me].pays,
    auteur: me,
    date: Date.now(),
    votes: [],
    resolu: false,
    comms: [],
  });
  save();
  ["#nTitle", "#nDesc", "#nLang", "#nCode"].forEach((s) => ($(s).value = ""));
  $("#dNew").close();
  render();
};

// Filtres
document.querySelectorAll(".chip").forEach(
  (c) =>
    (c.onclick = () => {
      type = c.dataset.t;
      document
        .querySelectorAll(".chip")
        .forEach((x) => x.setAttribute("aria-pressed", x === c));
      render();
    }),
);
["#q", "#fPays", "#fLang"].forEach((s) => ($(s).oninput = render));
$("#bTheme").onclick = () => {
  const r = document.documentElement,
    dark = r.dataset.theme
      ? r.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme:dark)").matches;
  r.dataset.theme = dark ? "light" : "dark";
};

function need() {
  if (!me) {
    authMode("login");
    $("#dAuth").showModal();
    return false;
  }
  return true;
}
const open = new Set();

function card(p) {
  const mine = me && p.auteur === me,
    voted = me && p.votes.includes(me);
  const kids = [
    h(
      "div",
      {},
      h(
        "span",
        { class: "tag" + (p.type === "bug" ? " bug" : "") },
        p.type === "bug" ? "Bug" : "Discussion",
      ),
      p.type === "bug" && p.resolu
        ? h("span", { class: "tag ok" }, "Résolu")
        : null,
      p.lang ? h("span", { class: "tag" }, p.lang) : null,
    ),
    h("h3", {}, p.titre),
    h(
      "div",
      { class: "meta" },
      p.auteur + " · " + p.pays + " · " + day(p.date),
    ),
    h("p", { class: "txt" }, p.desc),
    p.code ? h("pre", {}, h("code", {}, p.code)) : null,
  ];
  const row = h(
    "div",
    { class: "row" },
    h(
      "button",
      {
        class: voted ? "" : "alt",
        onclick: () => {
          if (!need()) return;
          p.votes = voted ? p.votes.filter((v) => v !== me) : [...p.votes, me];
          save();
          render();
        },
      },
      "▲ " + p.votes.length,
    ),
    h(
      "button",
      {
        class: "alt",
        onclick: () => {
          open.has(p.id) ? open.delete(p.id) : open.add(p.id);
          render();
        },
      },
      "Réponses (" + p.comms.length + ")",
    ),
    mine && p.type === "bug"
      ? h(
          "button",
          {
            class: "alt",
            onclick: () => {
              p.resolu = !p.resolu;
              save();
              render();
            },
          },
          p.resolu ? "Rouvrir" : "Marquer résolu",
        )
      : null,
    mine
      ? h(
          "button",
          {
            class: "alt",
            onclick: () => {
              if (confirm("Supprimer cette publication ?")) {
                posts = posts.filter((x) => x !== p);
                save();
                render();
              }
            },
          },
          "Supprimer",
        )
      : null,
  );
  kids.push(row);
  if (open.has(p.id)) {
    p.comms.forEach((c) =>
      kids.push(
        h(
          "div",
          { class: "com" },
          h(
            "div",
            { class: "meta" },
            c.auteur + " · " + c.pays + " · " + day(c.date),
          ),
          h("p", { class: "txt" }, c.texte),
        ),
      ),
    );
    const inp = h("textarea", {
      maxlength: "1000",
      placeholder: me ? "Écris ta réponse…" : "Connecte-toi pour répondre",
      "aria-label": "Ta réponse",
    });
    kids.push(
      inp,
      h(
        "div",
        { class: "row" },
        h(
          "button",
          {
            onclick: () => {
              if (!need()) return;
              const t = inp.value.trim();
              if (t.length < 2) return;
              p.comms.push({
                auteur: me,
                pays: users[me].pays,
                texte: t.slice(0, 1000),
                date: Date.now(),
              });
              save();
              render();
            },
          },
          "Répondre",
        ),
      ),
    );
  }
  return h("article", { class: "card" }, kids);
}

function render() {
  const q = $("#q").value.trim().toLowerCase(),
    pay = $("#fPays").value,
    top = $("#fLang").value === "top";
  let l = posts.filter(
    (p) =>
      (type === "all" || p.type === type) &&
      (!pay || p.pays === pay) &&
      (!q || (p.titre + " " + p.desc + " " + p.lang).toLowerCase().includes(q)),
  );
  l = l
    .slice()
    .sort((a, b) => (top ? b.votes.length - a.votes.length : b.date - a.date));
  const box = $("#list");
  box.replaceChildren(
    ...(l.length
      ? l.map(card)
      : [
          h(
            "div",
            { class: "empty" },
            "Aucune publication. Publie le premier bug ou la première discussion.",
          ),
        ]),
  );
}
head();
render();