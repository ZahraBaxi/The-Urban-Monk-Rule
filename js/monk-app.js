/* ============================================================
   monk-app.js
   "The Urban Monk Rule" — navigation + interactions.

   Storage: uses this project's own js/back4app-client.js
   (its own Back4App app, entirely separate from any other
   project) via the generic fetchClass / createInClass /
   updateInClass helpers, against these classes:

     MonkDay          — one row per date: checklist state
     MonkPlaceNote    — observation notes
     MonkJournalEntry — journal entries
     MonkActivity     — every other logged practice (craft,
                        joy, solitude, stewardship, learning,
                        presence, attention taps, random practice)

   If Back4App is unreachable (offline, keys not filled in
   yet), everything still works against an in-memory cache for
   the session, it just won't persist across reloads.
   ============================================================ */

(function () {
  "use strict";

  var todayStr = dateStr(new Date());

  var cache = {
    days: {},          // date -> {objectId, date, morningItems, eveningItems}
    placeNotes: [],
    journalEntries: [],
    activities: []
  };

  /* ---------------- date helpers ---------------- */

  function dateStr(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function addDays(d, n) {
    var copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  }
  function daysAgo(n) { return dateStr(addDays(new Date(), -n)); }

  // stable "random" pick for the day, so home doesn't reshuffle on every reload
  function seededPick(arr, seedStr) {
    var seed = 0;
    for (var i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    return arr[seed % arr.length];
  }
  function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------------- navigation ---------------- */

  var sections = Array.prototype.slice.call(document.querySelectorAll('.monk-section'));
  var navList = document.getElementById('monk-nav-list');
  var mobileNav = document.getElementById('monk-mobile-nav');

  sections.forEach(function (sec, i) {
    var title = sec.getAttribute('data-title');

    var li = document.createElement('li');
    var btn = document.createElement('button');
    btn.innerHTML = '<span class="chapter-num">' + romanNumeral(i + 1) + '</span>' + title;
    btn.setAttribute('data-target', sec.id);
    li.appendChild(btn);
    navList.appendChild(li);

    var opt = document.createElement('option');
    opt.value = sec.id;
    opt.textContent = title;
    mobileNav.appendChild(opt);
  });

  function romanNumeral(n) {
    var vals = [10, 9, 5, 4, 1], syms = ['X', 'IX', 'V', 'IV', 'I'];
    var out = '';
    for (var i = 0; i < vals.length; i++) {
      while (n >= vals[i]) { out += syms[i]; n -= vals[i]; }
    }
    return out;
  }

  function showSection(id) {
    sections.forEach(function (sec) { sec.classList.toggle('active', sec.id === id); });
    Array.prototype.forEach.call(navList.querySelectorAll('button'), function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-target') === id);
    });
    mobileNav.value = id;
    window.scrollTo(0, 0);
  }

  navList.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-target]');
    if (btn) showSection(btn.getAttribute('data-target'));
  });
  mobileNav.addEventListener('change', function () { showSection(mobileNav.value); });

  /* ---------------- persistence helpers ---------------- */

  function logActivity(category, label) {
    var entry = { date: todayStr, category: category, label: label || '' };
    cache.activities.push(entry);
    renderProgress();
    createInClass('MonkActivity', entry).then(function (res) {
      entry.objectId = res.objectId;
    }).catch(function (err) { console.warn('MonkActivity save failed:', err.message); });
  }

  function saveDay(field, items) {
    var existing = cache.days[todayStr];
    var fields = {};
    fields[field] = items;
    if (existing && existing.objectId) {
      updateInClass('MonkDay', existing.objectId, fields).catch(function (err) {
        console.warn('MonkDay update failed:', err.message);
      });
    } else {
      var payload = { date: todayStr, morningItems: [], eveningItems: [] };
      payload[field] = items;
      createInClass('MonkDay', payload).then(function (res) {
        cache.days[todayStr] = Object.assign({ objectId: res.objectId }, payload);
      }).catch(function (err) { console.warn('MonkDay create failed:', err.message); });
    }
  }

  /* ---------------- HOME ---------------- */

  // Picked once per load (seeded so a reload same-day shows the same
  // vow/quote); the quote can still be cycled by hand via its button.
  var currentQuote = seededPick(MONK.quotes, todayStr + 'q');
  var currentVowText = seededPick(MONK.vows, todayStr + 'v');

  function renderHome() {
    document.getElementById('home-date').textContent =
      new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('home-quote').textContent = '"' + currentQuote + '"';
    document.getElementById('home-vow').textContent = currentVowText;
    document.getElementById('home-morning-reminder').textContent = MONK.morningReminder;
    document.getElementById('home-evening-reminder').textContent = MONK.eveningReminder;
    refreshHomeDynamic();
  }

  // Just the parts that change as the day goes on — safe to call
  // repeatedly (e.g. after a checklist toggle elsewhere) without
  // resetting the quote or re-attaching any listeners.
  function refreshHomeDynamic() {
    var streak = computeStreak();
    document.getElementById('home-streak').textContent = streak + ' day' + (streak === 1 ? '' : 's');
    renderStreakDots();
    renderVowState();
  }

  function renderStreakDots() {
    var set = activeDateSet();
    var html = '';
    for (var i = 6; i >= 0; i--) {
      var d = daysAgo(i);
      var cls = 'monk-streak-dot' + (set[d] ? ' filled' : '') + (i === 0 ? ' today' : '');
      html += '<span class="' + cls + '" title="' + d + '"></span>';
    }
    document.getElementById('home-streak-dots').innerHTML = html;
  }

  function vowKeptToday() {
    return cache.activities.some(function (a) { return a.category === 'vow' && a.date === todayStr; });
  }

  function renderVowState() {
    var card = document.getElementById('home-vow-card');
    var btn = document.getElementById('home-vow-btn');
    if (vowKeptToday()) {
      card.classList.add('kept');
      btn.textContent = 'Kept Today';
      btn.disabled = true;
    } else {
      card.classList.remove('kept');
      btn.textContent = 'Mark as Kept';
      btn.disabled = false;
    }
  }

  // Wired exactly once from renderAll() — never re-attached on
  // later renderHome() calls, so a click can never double-fire.
  function wireHomeInteractions() {
    document.getElementById('home-vow-btn').addEventListener('click', function () {
      if (vowKeptToday()) return;
      logActivity('vow', currentVowText);
      refreshHomeDynamic();
    });
    document.getElementById('home-quote-new').addEventListener('click', function () {
      currentQuote = randomPick(MONK.quotes);
      document.getElementById('home-quote').textContent = '"' + currentQuote + '"';
    });
    document.getElementById('home-morning-reminder-btn').addEventListener('click', function () { showSection('sec-rhythm'); });
    document.getElementById('home-evening-reminder-btn').addEventListener('click', function () { showSection('sec-rhythm'); });
  }

  function activeDateSet() {
    var set = {};
    Object.keys(cache.days).forEach(function (d) {
      var day = cache.days[d];
      if ((day.morningItems && day.morningItems.length) || (day.eveningItems && day.eveningItems.length)) set[d] = true;
    });
    cache.placeNotes.forEach(function (n) { set[n.date] = true; });
    cache.journalEntries.forEach(function (j) { set[j.date] = true; });
    cache.activities.forEach(function (a) { set[a.date] = true; });
    return set;
  }

  function computeStreak() {
    var set = activeDateSet();
    var cursor = new Date();
    if (!set[dateStr(cursor)]) cursor = addDays(cursor, -1);
    var streak = 0;
    while (set[dateStr(cursor)]) {
      streak++;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  /* ---------------- RHYTHM ---------------- */

  function renderRhythm() {
    var day = cache.days[todayStr] || { morningItems: [], eveningItems: [] };
    renderChecklist('rhythm-morning', MONK.rhythm.morning, day.morningItems || [], 'morningItems');
    renderChecklist('rhythm-evening', MONK.rhythm.evening, day.eveningItems || [], 'eveningItems');
  }

  function renderChecklist(ulId, items, checkedIds, field) {
    var ul = document.getElementById(ulId);
    ul.innerHTML = '';
    items.forEach(function (item) {
      var li = document.createElement('li');
      var checked = checkedIds.indexOf(item.id) !== -1;
      li.innerHTML =
        '<label><input type="checkbox" data-id="' + item.id + '"' + (checked ? ' checked' : '') + '><span>' + item.label + '</span></label>';
      ul.appendChild(li);
    });
    Array.prototype.forEach.call(ul.querySelectorAll('input[type=checkbox]'), function (cb) {
      cb.addEventListener('change', function () {
        var day = cache.days[todayStr] || { date: todayStr, morningItems: [], eveningItems: [] };
        var list = day[field] || [];
        var id = cb.getAttribute('data-id');
        if (cb.checked) {
          if (list.indexOf(id) === -1) list.push(id);
        } else {
          list = list.filter(function (x) { return x !== id; });
        }
        day[field] = list;
        cache.days[todayStr] = day;
        saveDay(field, list);
        renderHome();
        renderProgress();
      });
    });
  }

  /* ---------------- PLACE ---------------- */

  var currentPlacePrompt = randomPick(MONK.placePrompts);

  function renderPlacePrompt() {
    document.getElementById('place-prompt').textContent = currentPlacePrompt;
  }
  function renderPlaceEntries() {
    var wrap = document.getElementById('place-entries');
    wrap.innerHTML = '';
    if (!cache.placeNotes.length) { wrap.innerHTML = '<p class="monk-empty">No observations yet.</p>'; return; }
    cache.placeNotes.slice().reverse().forEach(function (n) {
      var div = document.createElement('div');
      div.className = 'monk-entry';
      div.innerHTML = '<p class="monk-entry-date">' + n.date + ' &middot; ' + n.prompt + '</p><p class="monk-entry-body"></p>';
      div.querySelector('.monk-entry-body').textContent = n.note;
      wrap.appendChild(div);
    });
  }

  document.getElementById('place-new').addEventListener('click', function () {
    currentPlacePrompt = randomPick(MONK.placePrompts);
    renderPlacePrompt();
  });
  document.getElementById('place-save').addEventListener('click', function () {
    var textarea = document.getElementById('place-note');
    var text = textarea.value.trim();
    if (!text) return;
    var entry = { date: todayStr, prompt: currentPlacePrompt, note: text };
    cache.placeNotes.push(entry);
    textarea.value = '';
    renderPlaceEntries();
    renderHome();
    renderProgress();
    createInClass('MonkPlaceNote', entry).catch(function (err) { console.warn('MonkPlaceNote save failed:', err.message); });
  });

  /* ---------------- confirmation helper ---------------- */
  // Shared by every "mark done" button: shows a brief "Logged" state
  // and disables itself for that window, so a click always gives
  // visible feedback and a rapid double-click (or any code path
  // firing the handler more than once) can never log a duplicate.

  function withConfirmation(btn, onConfirm, confirmLabel) {
    var originalLabel = btn.textContent;
    var busy = false;
    btn.addEventListener('click', function () {
      if (busy) return;
      busy = true;
      onConfirm();
      btn.textContent = confirmLabel || 'Logged \u2713';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = originalLabel;
        btn.disabled = false;
        busy = false;
      }, 1100);
    });
  }

  /* ---------------- PRESENCE / SOLITUDE / HUMILITY / STEWARDSHIP / JOY ---------------- */
  // Same shape: pick a random prompt, optional "done" logs an activity.

  function wireRandomCard(promptElId, newBtnId, doneBtnId, list, category) {
    var current = randomPick(list);
    var el = document.getElementById(promptElId);
    el.textContent = current;
    document.getElementById(newBtnId).addEventListener('click', function () {
      current = randomPick(list);
      el.textContent = current;
    });
    if (doneBtnId) {
      withConfirmation(document.getElementById(doneBtnId), function () {
        logActivity(category, current);
      });
    }
  }

  /* ---------------- LEARNING ---------------- */

  function renderLearning() {
    var select = document.getElementById('learning-category');
    Object.keys(MONK.learning).forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      select.appendChild(opt);
    });
    var currentTopic = randomPick(MONK.learning[select.value]);
    var topicEl = document.getElementById('learning-topic');
    topicEl.textContent = currentTopic;

    function pickNew() {
      currentTopic = randomPick(MONK.learning[select.value]);
      topicEl.textContent = currentTopic;
    }
    select.addEventListener('change', pickNew);
    document.getElementById('learning-new').addEventListener('click', pickNew);
    withConfirmation(document.getElementById('learning-done'), function () {
      logActivity('learning', select.value + ': ' + currentTopic);
    });
  }

  /* ---------------- CRAFT ---------------- */

  var currentCraft = '';

  function renderCraftGroups() {
    var wrap = document.getElementById('craft-groups');
    wrap.innerHTML = '';
    Object.keys(MONK.craft).forEach(function (cat) {
      var group = document.createElement('div');
      group.className = 'monk-group';
      group.innerHTML = '<p class="monk-group-title">' + cat + '</p><div class="monk-tag-row"></div>';
      var row = group.querySelector('.monk-tag-row');
      MONK.craft[cat].forEach(function (item) {
        var tag = document.createElement('button');
        tag.className = 'monk-tag';
        tag.textContent = item;
        var tagBusy = false;
        tag.addEventListener('click', function () {
          if (tagBusy) return;
          tagBusy = true;
          tag.classList.add('done');
          logActivity('craft', item);
        });
        row.appendChild(tag);
      });
      wrap.appendChild(group);
    });
  }

  function pickCraft() {
    var cats = Object.keys(MONK.craft);
    var cat = randomPick(cats);
    currentCraft = randomPick(MONK.craft[cat]);
    document.getElementById('craft-prompt').textContent = cat + ': ' + currentCraft;
  }
  document.getElementById('craft-new').addEventListener('click', pickCraft);
  withConfirmation(document.getElementById('craft-done'), function () {
    if (!currentCraft) { pickCraft(); return; }
    logActivity('craft', currentCraft);
  });

  /* ---------------- ATTENTION ---------------- */

  function renderAttention() {
    ['reached', 'noticed', 'focused'].forEach(function (type) {
      var count = cache.activities.filter(function (a) {
        return a.category === 'attention-' + type && a.date >= daysAgo(6);
      }).length;
      document.getElementById('attn-n-' + type).textContent = count;
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.monk-counter-btn'), function (btn) {
    btn.addEventListener('click', function () {
      logActivity('attention-' + btn.getAttribute('data-attn'), '');
      renderAttention();
    });
  });

  /* ---------------- JOURNAL ---------------- */

  function renderJournalEntries() {
    var wrap = document.getElementById('journal-entries');
    wrap.innerHTML = '';
    if (!cache.journalEntries.length) { wrap.innerHTML = '<p class="monk-empty">No entries yet.</p>'; return; }
    cache.journalEntries.slice().reverse().forEach(function (j) {
      var div = document.createElement('div');
      div.className = 'monk-entry';
      div.innerHTML = '<p class="monk-entry-date">' + j.date + '</p><p class="monk-entry-body"></p>';
      div.querySelector('.monk-entry-body').textContent = j.text;
      wrap.appendChild(div);
    });
  }
  document.getElementById('journal-save').addEventListener('click', function () {
    var textarea = document.getElementById('journal-text');
    var text = textarea.value.trim();
    if (!text) return;
    var entry = { date: todayStr, text: text };
    cache.journalEntries.push(entry);
    textarea.value = '';
    renderJournalEntries();
    renderHome();
    renderProgress();
    createInClass('MonkJournalEntry', entry).catch(function (err) { console.warn('MonkJournalEntry save failed:', err.message); });
  });

  /* ---------------- RANDOM PRACTICE ---------------- */

  document.getElementById('random-generate').addEventListener('click', function () {
    var rhythmTask = randomPick(MONK.rhythm.morning.concat(MONK.rhythm.evening)).label;
    var observation = randomPick(MONK.placePrompts);
    var stewardship = randomPick(MONK.stewardshipActs);
    var craftCats = Object.keys(MONK.craft);
    var craftCat = randomPick(craftCats);
    var craft = randomPick(MONK.craft[craftCat]);
    var conversation = randomPick(MONK.humilityPrompts);
    var joy = randomPick(MONK.joys);

    var list = document.getElementById('random-list');
    list.innerHTML = [
      ['Rhythm', rhythmTask],
      ['Observation', observation],
      ['Stewardship', stewardship],
      ['Craft', craftCat + ': ' + craft],
      ['Conversation', conversation],
      ['Joy', joy]
    ].map(function (pair) {
      return '<li><span class="monk-card-label">' + pair[0] + '</span>' + pair[1] + '</li>';
    }).join('');

    document.getElementById('random-card').style.display = 'block';
    var doneBtn = document.getElementById('random-done');
    doneBtn.textContent = 'Mark Today\u2019s Practice Complete';
    doneBtn.disabled = false;
    doneBtn.onclick = function () {
      doneBtn.onclick = null;
      logActivity('randomPractice', rhythmTask + ' / ' + observation + ' / ' + stewardship + ' / ' + craft + ' / ' + conversation + ' / ' + joy);
      doneBtn.textContent = 'Logged \u2713';
      doneBtn.disabled = true;
    };
  });

  /* ---------------- PROGRESS ---------------- */

  function renderProgress() {
    var checklistCompleted = 0;
    Object.keys(cache.days).forEach(function (d) {
      var day = cache.days[d];
      checklistCompleted += (day.morningItems || []).length + (day.eveningItems || []).length;
    });
    var craftsCompleted = cache.activities.filter(function (a) { return a.category === 'craft'; }).length;
    var journalCount = cache.journalEntries.length;
    var stewardshipCount = cache.activities.filter(function (a) { return a.category === 'stewardship'; }).length;
    var observationDays = {};
    cache.placeNotes.forEach(function (n) { observationDays[n.date] = true; });
    var observationDayCount = Object.keys(observationDays).length;
    var randomPracticeCount = cache.activities.filter(function (a) { return a.category === 'randomPractice'; }).length;
    var joyCount = cache.activities.filter(function (a) { return a.category === 'joy'; }).length;
    var solitudeCount = cache.activities.filter(function (a) { return a.category === 'solitude'; }).length;

    var rows = [
      ['Checklist items completed', checklistCompleted],
      ['Crafts completed', craftsCompleted],
      ['Journal entries', journalCount],
      ['Acts of stewardship', stewardshipCount],
      ['Observation days', observationDayCount],
      ['Random practices completed', randomPracticeCount],
      ['Joy moments', joyCount],
      ['Solitude practices', solitudeCount]
    ];
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }).concat([1]));

    var wrap = document.getElementById('progress-bars');
    wrap.innerHTML = rows.map(function (r) {
      var pct = Math.round((r[1] / max) * 100);
      return '<div class="monk-progress-row">' +
        '<div class="monk-progress-label"><span>' + r[0] + '</span><span>' + r[1] + '</span></div>' +
        '<div class="monk-progress-track"><div class="monk-progress-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
    }).join('');
  }

  /* ---------------- init ---------------- */

  function init() {
    Promise.all([
      fetchClass('MonkDay').catch(function () { return []; }),
      fetchClass('MonkPlaceNote', 'date').catch(function () { return []; }),
      fetchClass('MonkJournalEntry', 'date').catch(function () { return []; }),
      fetchClass('MonkActivity', 'date').catch(function () { return []; })
    ]).then(function (results) {
      var days = results[0], placeNotes = results[1], journalEntries = results[2], activities = results[3];
      days.forEach(function (row) {
        cache.days[row.date] = {
          objectId: row.objectId,
          date: row.date,
          morningItems: row.morningItems || [],
          eveningItems: row.eveningItems || []
        };
      });
      cache.placeNotes = placeNotes.map(function (r) { return { objectId: r.objectId, date: r.date, prompt: r.prompt, note: r.note }; });
      cache.journalEntries = journalEntries.map(function (r) { return { objectId: r.objectId, date: r.date, text: r.text }; });
      cache.activities = activities.map(function (r) { return { objectId: r.objectId, date: r.date, category: r.category, label: r.label }; });
    }).catch(function (err) {
      // Only catches problems loading/parsing the fetched data above.
      // renderAll() itself is called exactly once below regardless of
      // which branch ran, so a hiccup here can never double-wire buttons.
      console.warn('Could not load from Back4App, starting with an empty session:', err.message);
    }).then(function () {
      renderAll();
    });
  }

  function renderAll() {
    renderHome();
    wireHomeInteractions();
    renderRhythm();
    renderPlacePrompt();
    renderPlaceEntries();
    wireRandomCard('presence-prompt', 'presence-new', 'presence-done', MONK.presencePrompts, 'presence');
    wireRandomCard('solitude-prompt', 'solitude-new', 'solitude-done', MONK.solitudePractices, 'solitude');
    wireRandomCard('humility-prompt', 'humility-new', null, MONK.humilityPrompts, 'humility');
    wireRandomCard('stewardship-prompt', 'stewardship-new', 'stewardship-done', MONK.stewardshipActs, 'stewardship');
    wireRandomCard('joy-prompt', 'joy-new', 'joy-done', MONK.joys, 'joy');
    renderLearning();
    renderCraftGroups();
    pickCraft();
    renderAttention();
    renderJournalEntries();
    renderProgress();
    showSection('sec-home');
  }

  init();
})();
