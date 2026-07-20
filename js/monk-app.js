/* ============================================================
   monk-app.js
   "The Urban Monk Rule", navigation + interactions.

   Storage: uses this project's own js/back4app-client.js
   (its own Back4App app, entirely separate from any other
   project) via the generic fetchClass / createInClass /
   updateInClass helpers, against these classes:

     MonkDay, one row per date: checklist state
     MonkPlaceNote, observation notes
     MonkJournalEntry, journal entries
     MonkActivity, every other logged practice (craft,
                           joy, solitude, stewardship, learning,
                           presence, attention taps, random
                           practice, vow, sourdough recipes tried,
                           watchlist items watched, plant stage
                           advances)
     MonkPlant, plants: name, species, current stage
     MonkSourdoughFeeding, starter feeding log
     MonkWatchlistItem, watchlist: title, note, watched
     MonkBook, reading list: title, author, status
     MonkBookNote, annotations against a book: quote,
                           note, page
     MonkWishlistItem, wishlist: name, price, note, dateAdded,
                           checks (purpose/aesthetic/notPlastic)
     MonkDharmaEntry, contemplation journal: date, prompt, note

   MonkDay also carries a third checklist field, preceptItems,
   for the Dharma chapter's daily precept reflections, same
   shape as morningItems/eveningItems.

   The Wishlist chapter's daily savings rate isn't Back4App data, it's just a pacing number, stored in localStorage under
   'monkWishlistDailyRate'.

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
    activities: [],
    plants: [],
    sourdoughLog: [],
    watchlist: [],
    books: [],
    bookNotes: [],
    wishlist: [],
    dharmaEntries: []
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

  // Shuffle bag: draws every item from a list in random order before
  // any item repeats, then reshuffles and starts a new pass. Used
  // anywhere a "give me another one" button exists, so cycling
  // through prompts doesn't feel repetitive within a session.
  function makeBag(list) {
    var bag = [];
    function refill() {
      bag = list.slice();
      for (var i = bag.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
      }
    }
    return function next() {
      if (!bag.length) refill();
      return bag.pop();
    };
  }

  function flattenCraft() {
    var pool = [];
    Object.keys(MONK.craft).forEach(function (cat) {
      MONK.craft[cat].forEach(function (item) { pool.push({ cat: cat, item: item }); });
    });
    return pool;
  }

  // One bag per pool of prompts/practices. Learning is keyed per
  // category since the pool depends on which category is selected.
  var bags = {
    quote: makeBag(MONK.quotes),
    worldQuestion: makeBag(MONK.worldQuestions),
    place: makeBag(MONK.placePrompts),
    presence: makeBag(MONK.presencePrompts),
    solitude: makeBag(MONK.solitudePractices),
    humility: makeBag(MONK.humilityPrompts),
    stewardship: makeBag(MONK.stewardshipActs),
    joy: makeBag(MONK.joys),
    craft: makeBag(flattenCraft()),
    rhythmTask: makeBag(MONK.rhythm.morning.concat(MONK.rhythm.evening)),
    gatha: makeBag(MONK.gathas),
    dharma: makeBag(MONK.dharmaPrompts)
  };
  var learningBags = {};
  function learningBag(cat) {
    if (!learningBags[cat]) learningBags[cat] = makeBag(MONK.learning[cat]);
    return learningBags[cat];
  }

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

    // Keep each section's own "Chapter N" eyebrow in lockstep with
    // the sidebar numbering, both come from this same loop, so
    // inserting or reordering a chapter can never desync the two.
    var eyebrowNum = sec.querySelector('.chapter-eyebrow-num');
    if (eyebrowNum) eyebrowNum.textContent = 'Chapter ' + romanNumeral(i + 1);
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
      var payload = { date: todayStr, morningItems: [], eveningItems: [], preceptItems: [] };
      payload[field] = items;
      createInClass('MonkDay', payload).then(function (res) {
        cache.days[todayStr] = Object.assign({ objectId: res.objectId }, payload);
      }).catch(function (err) { console.warn('MonkDay create failed:', err.message); });
    }
  }

  /* ---------------- HOME ---------------- */

  // Picked once per load (seeded so a reload same-day shows the same
  // vow/quote); both can still be cycled by hand via their buttons.
  var currentQuote = seededPick(MONK.quotes, todayStr + 'q');
  var currentVowText = seededPick(MONK.vows, todayStr + 'v');
  var currentWorldQuestion = seededPick(MONK.worldQuestions, todayStr + 'w');

  function greeting() {
    var h = new Date().getHours();
    if (h < 5) return 'Still up.';
    if (h < 12) return 'Good morning.';
    if (h < 17) return 'Good afternoon.';
    if (h < 21) return 'Good evening.';
    return 'Winding down.';
  }

  function renderHome() {
    document.getElementById('home-greeting').textContent = greeting();
    document.getElementById('home-date').textContent =
      new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('home-quote').textContent = '"' + currentQuote + '"';
    document.getElementById('home-vow').textContent = currentVowText;
    document.getElementById('home-question').textContent = currentWorldQuestion;
    document.getElementById('home-morning-reminder').textContent = MONK.morningReminder;
    document.getElementById('home-evening-reminder').textContent = MONK.eveningReminder;
    document.getElementById('home-dharma-reminder').textContent = MONK.dharmaReminder;
    refreshHomeDynamic();
  }

  // Just the parts that change as the day goes on, safe to call
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

  // Wired exactly once from renderAll(), never re-attached on
  // later renderHome() calls, so a click can never double-fire.
  function wireHomeInteractions() {
    document.getElementById('home-vow-btn').addEventListener('click', function () {
      if (vowKeptToday()) return;
      logActivity('vow', currentVowText);
      refreshHomeDynamic();
    });
    document.getElementById('home-quote-new').addEventListener('click', function () {
      currentQuote = bags.quote();
      document.getElementById('home-quote').textContent = '"' + currentQuote + '"';
    });
    document.getElementById('home-morning-reminder-btn').addEventListener('click', function () { showSection('sec-rhythm'); });
    document.getElementById('home-evening-reminder-btn').addEventListener('click', function () { showSection('sec-rhythm'); });
    document.getElementById('home-dharma-reminder-btn').addEventListener('click', function () { showSection('sec-dharma'); });

    // World Question: the actual reason to open this page. Cyclable,
    // and answerable inline, a reply saves straight into the Journal
    // tagged with the question, so reflection and journaling are one
    // motion instead of two.
    document.getElementById('home-question-new').addEventListener('click', function () {
      currentWorldQuestion = bags.worldQuestion();
      document.getElementById('home-question').textContent = currentWorldQuestion;
      document.getElementById('home-question-answer').value = '';
    });
    document.getElementById('home-question-reveal').addEventListener('click', function () {
      var wrap = document.getElementById('home-question-reflect');
      var open = wrap.style.display !== 'none';
      wrap.style.display = open ? 'none' : 'block';
      this.textContent = open ? 'Reflect on This' : 'Never mind';
      if (!open) document.getElementById('home-question-answer').focus();
    });
    withConfirmation(document.getElementById('home-question-save'), function () {
      var textarea = document.getElementById('home-question-answer');
      var text = textarea.value.trim();
      if (!text) return;
      var entry = { date: todayStr, text: 'Q: ' + currentWorldQuestion + '\n' + text };
      cache.journalEntries.push(entry);
      textarea.value = '';
      document.getElementById('home-question-reflect').style.display = 'none';
      document.getElementById('home-question-reveal').textContent = 'Reflect on This';
      renderJournalEntries();
      renderHome();
      renderProgress();
      createInClass('MonkJournalEntry', entry).catch(function (err) { console.warn('MonkJournalEntry save failed:', err.message); });
    }, 'Saved \u2713');
  }

  function activeDateSet() {
    var set = {};
    Object.keys(cache.days).forEach(function (d) {
      var day = cache.days[d];
      if ((day.morningItems && day.morningItems.length) || (day.eveningItems && day.eveningItems.length) || (day.preceptItems && day.preceptItems.length)) set[d] = true;
    });
    cache.placeNotes.forEach(function (n) { set[n.date] = true; });
    cache.journalEntries.forEach(function (j) { set[j.date] = true; });
    cache.activities.forEach(function (a) { set[a.date] = true; });
    cache.dharmaEntries.forEach(function (n) { set[n.date] = true; });
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

  /* ---------------- DHARMA ---------------- */

  var sitState = { practiceId: MONK.meditationPractices[0].id, duration: MONK.sitDefaultDuration, remaining: 0, total: 0, intervalId: null };
  var mettaIndex = 0;
  var malaCount = 0;
  var currentGatha = bags.gatha();
  var currentDharmaPrompt = bags.dharma();

  function formatClock(totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var s = totalSeconds % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function sitMinutesFromLabel(label) {
    var m = /([0-9]+)\s*min/.exec(label || '');
    return m ? parseInt(m[1], 10) : 0;
  }

  function renderSitChoices() {
    var practiceRow = document.getElementById('dharma-practice-row');
    practiceRow.innerHTML = '';
    MONK.meditationPractices.forEach(function (p) {
      var btn = document.createElement('button');
      btn.className = 'monk-tag' + (p.id === sitState.practiceId ? ' done' : '');
      btn.textContent = p.label;
      btn.title = p.note;
      btn.addEventListener('click', function () {
        sitState.practiceId = p.id;
        renderSitChoices();
      });
      practiceRow.appendChild(btn);
    });

    var durationRow = document.getElementById('dharma-duration-row');
    durationRow.innerHTML = '';
    MONK.sitDurations.forEach(function (n) {
      var btn = document.createElement('button');
      btn.className = 'monk-tag' + (n === sitState.duration ? ' done' : '');
      btn.textContent = n + ' min';
      btn.addEventListener('click', function () {
        sitState.duration = n;
        renderSitChoices();
      });
      durationRow.appendChild(btn);
    });
  }

  function renderSitStats() {
    var sits = cache.activities.filter(function (a) { return a.category === 'meditation'; });
    var totalMinutes = sits.reduce(function (sum, a) { return sum + sitMinutesFromLabel(a.label); }, 0);
    document.getElementById('dharma-sit-stats').textContent = sits.length
      ? ('You\u2019ve sat ' + sits.length + ' time' + (sits.length === 1 ? '' : 's') + ', ' + totalMinutes + ' minute' + (totalMinutes === 1 ? '' : 's') + ' total.')
      : 'No sits logged yet. Begin when you\u2019re ready.';
  }

  function endSit(completed) {
    clearInterval(sitState.intervalId);
    var elapsedSeconds = sitState.total - sitState.remaining;
    var elapsedMinutes = Math.round(elapsedSeconds / 60);
    var practice = MONK.meditationPractices.filter(function (p) { return p.id === sitState.practiceId; })[0];
    var label = completed
      ? practice.label + ', ' + sitState.duration + ' min'
      : practice.label + ', ' + elapsedMinutes + ' of ' + sitState.duration + ' min';
    if (completed || elapsedMinutes > 0) logActivity('meditation', label);
    playBell();
    document.getElementById('dharma-breath-circle').classList.remove('running');
    document.getElementById('dharma-sit-active').style.display = 'none';
    document.getElementById('dharma-sit-setup').style.display = 'block';
    renderSitStats();
    renderProgress();
  }

  function renderMetta() {
    var item = MONK.mettaSequence[mettaIndex];
    document.getElementById('dharma-metta-stage').textContent = item.stage;
    document.getElementById('dharma-metta-phrase').textContent = item.phrase;
  }

  function renderMalaStats() {
    var rounds = cache.activities.filter(function (a) { return a.category === 'mala-round'; }).length;
    document.getElementById('dharma-mala-stats').textContent = rounds
      ? (rounds + ' round' + (rounds === 1 ? '' : 's') + ' completed.')
      : 'A round is 108. Tap along with a mantra, a breath, or just a beat.';
  }

  function renderGatha() {
    document.getElementById('dharma-gatha').textContent = currentGatha;
  }

  function renderPrecepts() {
    var day = cache.days[todayStr] || { preceptItems: [] };
    renderChecklist('dharma-precepts', MONK.precepts, day.preceptItems || [], 'preceptItems');
  }

  function renderDharmaPrompt() {
    document.getElementById('dharma-prompt').textContent = currentDharmaPrompt;
  }
  function renderDharmaEntries() {
    var wrap = document.getElementById('dharma-entries');
    wrap.innerHTML = '';
    if (!cache.dharmaEntries.length) { wrap.innerHTML = '<p class="monk-empty">No reflections yet.</p>'; return; }
    cache.dharmaEntries.slice().reverse().forEach(function (n) {
      var div = document.createElement('div');
      div.className = 'monk-entry';
      div.innerHTML = '<p class="monk-entry-date">' + n.date + ' &middot; ' + n.prompt + '</p><p class="monk-entry-body"></p>';
      div.querySelector('.monk-entry-body').textContent = n.note;
      wrap.appendChild(div);
    });
  }

  function renderDharma() {
    renderSitChoices();
    renderSitStats();
    renderMetta();
    renderMalaStats();
    renderGatha();
    renderPrecepts();
    renderDharmaPrompt();
    renderDharmaEntries();
  }

  // Wired once, the sit timer especially can't tolerate being
  // re-attached on every render, or a tick would fire multiple times.
  function wireDharmaInteractions() {
    withConfirmation(document.getElementById('dharma-refuge-btn'), function () {
      logActivity('refuge', '');
    }, 'Refuge Taken \u2713');

    document.getElementById('dharma-sit-start').addEventListener('click', function () {
      sitState.total = sitState.duration * 60;
      sitState.remaining = sitState.total;
      document.getElementById('dharma-sit-setup').style.display = 'none';
      document.getElementById('dharma-sit-active').style.display = 'block';
      document.getElementById('dharma-sit-timer').textContent = formatClock(sitState.remaining);
      var circle = document.getElementById('dharma-breath-circle');
      circle.classList.toggle('running', document.getElementById('dharma-visual-toggle').checked);
      playBell();
      sitState.intervalId = setInterval(function () {
        sitState.remaining--;
        document.getElementById('dharma-sit-timer').textContent = formatClock(sitState.remaining);
        if (sitState.remaining <= 0) endSit(true);
      }, 1000);
    });
    document.getElementById('dharma-sit-end').addEventListener('click', function () { endSit(false); });

    document.getElementById('dharma-metta-next').addEventListener('click', function () {
      mettaIndex = (mettaIndex + 1) % MONK.mettaSequence.length;
      renderMetta();
    });

    document.getElementById('dharma-mala-btn').addEventListener('click', function () {
      malaCount++;
      document.getElementById('dharma-mala-n').textContent = malaCount;
      if (malaCount >= 108) {
        var btn = document.getElementById('dharma-mala-btn');
        btn.classList.add('complete');
        playBell();
        logActivity('mala-round', '');
        renderProgress();
        setTimeout(function () {
          malaCount = 0;
          document.getElementById('dharma-mala-n').textContent = malaCount;
          btn.classList.remove('complete');
          renderMalaStats();
        }, 900);
      }
    });
    document.getElementById('dharma-mala-reset').addEventListener('click', function () {
      malaCount = 0;
      document.getElementById('dharma-mala-n').textContent = malaCount;
      document.getElementById('dharma-mala-btn').classList.remove('complete');
    });

    document.getElementById('dharma-gatha-new').addEventListener('click', function () {
      currentGatha = bags.gatha();
      renderGatha();
    });

    document.getElementById('dharma-new').addEventListener('click', function () {
      currentDharmaPrompt = bags.dharma();
      renderDharmaPrompt();
    });
    document.getElementById('dharma-save').addEventListener('click', function () {
      var textarea = document.getElementById('dharma-note');
      var text = textarea.value.trim();
      if (!text) return;
      var entry = { date: todayStr, prompt: currentDharmaPrompt, note: text };
      cache.dharmaEntries.push(entry);
      textarea.value = '';
      renderDharmaEntries();
      renderHome();
      renderProgress();
      createInClass('MonkDharmaEntry', entry).catch(function (err) { console.warn('MonkDharmaEntry save failed:', err.message); });
    });
  }

  /* ---------------- MOVEMENT ---------------- */
  // Unlike Sourdough/Tea's "tried once" tag, a routine is meant to
  // be repeated, so completion here logs every time rather than
  // gating after the first click. The tag still fills in once you've
  // done it at least once, as a quiet visual note, but stays
  // clickable. Removal works the same way as everywhere else
  // (a MonkActivity row, keyed by title).

  function renderMovement() {
    var wrap = document.getElementById('movement-tags');
    wrap.innerHTML = '';
    var done = {}, removed = {};
    cache.activities.forEach(function (a) {
      if (a.category === 'movement') done[a.label] = true;
      if (a.category === 'movement-removed') removed[a.label] = true;
    });
    var visible = MONK.movementRoutines.filter(function (r) { return !removed[r.title]; });
    if (!visible.length) {
      wrap.innerHTML = '<p class="monk-empty">Nothing left on this list. Everything here has been removed.</p>';
      return;
    }
    visible.forEach(function (routine) {
      var tag = document.createElement('button');
      tag.className = 'monk-tag' + (done[routine.title] ? ' done' : '');
      tag.textContent = routine.title;
      tag.addEventListener('click', function () { openMovementModal(routine); });
      wrap.appendChild(tag);
    });
  }

  function openMovementModal(routine) {
    var html =
      '<h2></h2>' +
      '<h3>What You\u2019ll Need</h3><ul></ul>' +
      '<h3>The Routine</h3><ol></ol>' +
      '<div class="monk-modal-actions">' +
      '<button class="monk-btn primary" id="modal-movement-done-btn">Mark Today\u2019s Routine Complete</button>' +
      '<button class="monk-quiet-link" id="modal-movement-remove-btn">Remove from list</button>' +
      '</div>';
    openModal(html);
    modalBody.querySelector('h2').textContent = routine.title;
    var ul = modalBody.querySelector('ul');
    routine.ingredients.forEach(function (i) {
      var li = document.createElement('li');
      li.textContent = i;
      ul.appendChild(li);
    });
    var ol = modalBody.querySelector('ol');
    routine.steps.forEach(function (s) {
      var li = document.createElement('li');
      li.textContent = s;
      ol.appendChild(li);
    });

    withConfirmation(modalBody.querySelector('#modal-movement-done-btn'), function () {
      logActivity('movement', routine.title);
      renderProgress();
      renderMovement();
    }, 'Logged for Today \u2713');

    modalBody.querySelector('#modal-movement-remove-btn').addEventListener('click', function () {
      logActivity('movement-removed', routine.title);
      closeModal();
      renderMovement();
    });
  }

  /* ---------------- PLACE ---------------- */

  var currentPlacePrompt = bags.place();

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
    currentPlacePrompt = bags.place();
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

  /* ---------------- bell chime (sit timer + mala) ---------------- */
  // A soft, decaying tone built from a fundamental plus two quiet
  // overtones, no audio file needed, and it only ever fires from a
  // real click, so autoplay restrictions are never a problem.

  var bellCtx = null;
  function playBell() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!bellCtx) {
      try { bellCtx = new AC(); } catch (e) { return; }
    }
    var ctx = bellCtx;
    var now = ctx.currentTime;
    var master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.32, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
    master.connect(ctx.destination);
    [480, 725, 1200].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      var partial = ctx.createGain();
      partial.gain.value = i === 0 ? 1 : 0.3 / (i + 1);
      osc.connect(partial);
      partial.connect(master);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  /* ---------------- modal helper ---------------- */
  // One overlay, reused by anything that needs a popup (currently
  // just the sourdough recipe cards). Body content is passed in as
  // an HTML string built by the caller.

  var modalOverlay = document.getElementById('monk-modal-overlay');
  var modalBody = document.getElementById('monk-modal-body');

  function openModal(html) {
    modalBody.innerHTML = html;
    modalOverlay.style.display = 'flex';
  }
  function closeModal() {
    modalOverlay.style.display = 'none';
    modalBody.innerHTML = '';
  }
  document.getElementById('monk-modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.style.display !== 'none') closeModal();
  });

  /* ---------------- PRESENCE / SOLITUDE / HUMILITY / STEWARDSHIP / JOY ---------------- */
  // Same shape: pick a random prompt, optional "done" logs an activity.

  function wireRandomCard(promptElId, newBtnId, doneBtnId, drawFn, category) {
    var current = drawFn();
    var el = document.getElementById(promptElId);
    el.textContent = current;
    document.getElementById(newBtnId).addEventListener('click', function () {
      current = drawFn();
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
    var currentTopic = learningBag(select.value)();
    var topicEl = document.getElementById('learning-topic');
    topicEl.textContent = currentTopic;

    function pickNew() {
      currentTopic = learningBag(select.value)();
      topicEl.textContent = currentTopic;
    }
    select.addEventListener('change', pickNew);
    document.getElementById('learning-new').addEventListener('click', pickNew);
    withConfirmation(document.getElementById('learning-done'), function () {
      logActivity('learning', select.value + ': ' + currentTopic);
    });
  }

  /* ---------------- READING ---------------- */
  // Books and their annotations are linked by object reference in
  // memory (same trick as plants/watchlist: cache.bookNotes[i].book
  // points straight at the book object it belongs to), and by
  // Back4App objectId once both sides have been saved for real.

  var BOOK_STATUSES = ['Want to Read', 'Reading', 'Finished'];

  function ensureBookPersisted(b, afterSaved) {
    if (b.objectId) { afterSaved(); return; }
    createInClass('MonkBook', { title: b.title, author: b.author, status: b.status }).then(function (res) {
      b.objectId = res.objectId;
      afterSaved();
    }).catch(function (err) { console.warn('MonkBook create failed:', err.message); afterSaved(); });
  }

  function persistBookStatus(b) {
    if (b.objectId) {
      updateInClass('MonkBook', b.objectId, { status: b.status }).catch(function (err) { console.warn('MonkBook update failed:', err.message); });
    } else {
      ensureBookPersisted(b, function () {});
    }
  }

  function renderReading() {
    var wrap = document.getElementById('book-list');
    wrap.innerHTML = '';
    if (!cache.books.length) {
      wrap.innerHTML = '<p class="monk-empty">Nothing on the shelf yet. Add a book above.</p>';
      return;
    }
    cache.books.forEach(function (b) {
      var card = document.createElement('div');
      card.className = 'monk-book-card' + (b.open ? ' open' : '');
      card.innerHTML =
        '<button class="monk-book-header" type="button">' +
        '<span class="monk-book-titles"><span class="monk-book-title"></span><span class="monk-book-author"></span></span>' +
        '<span class="monk-book-status"></span>' +
        '<span class="monk-book-chevron">\u203A</span>' +
        '</button>' +
        '<div class="monk-book-body">' +
        '<div class="monk-annotation-form">' +
        '<textarea class="monk-textarea note-quote" placeholder="A line worth keeping..." style="min-height:64px"></textarea>' +
        '<input class="monk-input note-page" placeholder="Page, optional">' +
        '<textarea class="monk-textarea note-note" placeholder="What it means to you, optional" style="min-height:64px"></textarea>' +
        '<button class="monk-btn primary note-add">Save to Book</button>' +
        '</div>' +
        '<div class="book-annotations"></div>' +
        '<button class="monk-quiet-link monk-book-remove">Remove Book</button>' +
        '</div>';

      card.querySelector('.monk-book-title').textContent = b.title;
      card.querySelector('.monk-book-author').textContent = b.author || '';
      var statusBtn = card.querySelector('.monk-book-status');
      statusBtn.textContent = b.status;
      statusBtn.classList.toggle('finished', b.status === 'Finished');

      card.querySelector('.monk-book-header').addEventListener('click', function () {
        b.open = !b.open;
        renderReading();
      });

      statusBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = BOOK_STATUSES.indexOf(b.status);
        var nextStatus = BOOK_STATUSES[(idx + 1) % BOOK_STATUSES.length];
        b.status = nextStatus;
        if (nextStatus === 'Finished') logActivity('book-finished', b.title);
        persistBookStatus(b);
        renderReading();
      });

      // Annotations belonging to this book
      var notesWrap = card.querySelector('.book-annotations');
      var notesForBook = cache.bookNotes.filter(function (n) { return n.book === b; });
      if (notesForBook.length) {
        notesForBook.slice().reverse().forEach(function (n) {
          var ann = document.createElement('div');
          ann.className = 'monk-annotation';
          ann.innerHTML =
            '<p class="monk-annotation-quote"></p>' +
            '<p class="monk-annotation-meta"></p>' +
            (n.note ? '<p class="monk-annotation-note"></p>' : '') +
            '<button class="monk-quiet-link ann-remove">Remove</button>';
          ann.querySelector('.monk-annotation-quote').textContent = n.quote;
          ann.querySelector('.monk-annotation-meta').textContent = n.date + (n.page ? ' \u00b7 p. ' + n.page : '');
          if (n.note) ann.querySelector('.monk-annotation-note').textContent = n.note;
          ann.querySelector('.ann-remove').addEventListener('click', function () {
            cache.bookNotes = cache.bookNotes.filter(function (x) { return x !== n; });
            renderReading();
            if (n.objectId) deleteInClass('MonkBookNote', n.objectId).catch(function (err) { console.warn('MonkBookNote delete failed:', err.message); });
          });
          notesWrap.appendChild(ann);
        });
      } else {
        notesWrap.innerHTML = '<p class="monk-empty">No quotes or notes saved yet.</p>' + notesWrap.innerHTML;
      }

      card.querySelector('.note-add').addEventListener('click', function () {
        var quoteInput = card.querySelector('.note-quote');
        var pageInput = card.querySelector('.note-page');
        var noteInput = card.querySelector('.note-note');
        var quote = quoteInput.value.trim();
        var note = noteInput.value.trim();
        if (!quote && !note) return;
        var entry = { book: b, quote: quote, page: pageInput.value.trim(), note: note, date: todayStr };
        cache.bookNotes.push(entry);
        logActivity('reading', b.title);
        renderReading();
        ensureBookPersisted(b, function () {
          createInClass('MonkBookNote', { bookId: b.objectId, quote: entry.quote, page: entry.page, note: entry.note, date: entry.date })
            .then(function (res) { entry.objectId = res.objectId; })
            .catch(function (err) { console.warn('MonkBookNote save failed:', err.message); });
        });
      });

      card.querySelector('.monk-book-remove').addEventListener('click', function () {
        var removedNotes = cache.bookNotes.filter(function (n) { return n.book === b; });
        cache.books = cache.books.filter(function (x) { return x !== b; });
        cache.bookNotes = cache.bookNotes.filter(function (n) { return n.book !== b; });
        renderReading();
        if (b.objectId) deleteInClass('MonkBook', b.objectId).catch(function (err) { console.warn('MonkBook delete failed:', err.message); });
        removedNotes.forEach(function (n) {
          if (n.objectId) deleteInClass('MonkBookNote', n.objectId).catch(function (err) { console.warn('MonkBookNote delete failed:', err.message); });
        });
      });

      wrap.appendChild(card);
    });
  }

  document.getElementById('book-add').addEventListener('click', function () {
    var titleInput = document.getElementById('book-title-input');
    var authorInput = document.getElementById('book-author-input');
    var title = titleInput.value.trim();
    if (!title) return;
    var entry = { title: title, author: authorInput.value.trim(), status: BOOK_STATUSES[0], open: true };
    cache.books.push(entry);
    titleInput.value = '';
    authorInput.value = '';
    renderReading();
    ensureBookPersisted(entry, function () {});
  });

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
    var pick = bags.craft();
    currentCraft = pick.item;
    document.getElementById('craft-prompt').textContent = pick.cat + ': ' + pick.item;
  }
  document.getElementById('craft-new').addEventListener('click', pickCraft);
  withConfirmation(document.getElementById('craft-done'), function () {
    if (!currentCraft) { pickCraft(); return; }
    logActivity('craft', currentCraft);
  });

  /* ---------------- PLANTS ---------------- */
  // Each plant is rendered fresh on every change (list fully rebuilt),
  // so per-card buttons never accumulate duplicate listeners.

  function renderPlants() {
    var wrap = document.getElementById('plant-list');
    wrap.innerHTML = '';
    if (!cache.plants.length) {
      wrap.innerHTML = '<p class="monk-empty">Nothing planted yet. Add one above.</p>';
      return;
    }
    cache.plants.forEach(function (p) {
      var stageIndex = Math.max(0, MONK.plantStages.indexOf(p.stage));
      var segHtml = MONK.plantStages.map(function (s, i) {
        return '<div class="monk-stage-seg' + (i <= stageIndex ? ' filled' : '') + '"></div>';
      }).join('');
      var labelHtml = MONK.plantStages.map(function (s) { return '<span>' + s + '</span>'; }).join('');

      var card = document.createElement('div');
      card.className = 'monk-plant-card';
      card.innerHTML =
        '<p class="monk-plant-name"></p>' +
        (p.species ? '<p class="monk-plant-species"></p>' : '') +
        '<div class="monk-stage-row">' + segHtml + '</div>' +
        '<div class="monk-stage-label-row">' + labelHtml + '</div>' +
        '<div class="monk-plant-actions">' +
        '<button class="monk-btn advance-btn"></button>' +
        '<button class="monk-quiet-link remove-btn">Remove</button>' +
        '</div>';
      card.querySelector('.monk-plant-name').textContent = p.name;
      if (p.species) card.querySelector('.monk-plant-species').textContent = p.species;

      var advanceBtn = card.querySelector('.advance-btn');
      var atLastStage = stageIndex >= MONK.plantStages.length - 1;
      advanceBtn.textContent = atLastStage ? 'Harvestable' : 'Advance to ' + MONK.plantStages[stageIndex + 1];
      advanceBtn.disabled = atLastStage;
      advanceBtn.addEventListener('click', function () {
        if (atLastStage) return;
        var newStage = MONK.plantStages[stageIndex + 1];
        p.stage = newStage;
        logActivity('plant', p.name + ' \u2192 ' + newStage);
        renderPlants();
        if (p.objectId) {
          updateInClass('MonkPlant', p.objectId, { stage: newStage }).catch(function (err) { console.warn('MonkPlant update failed:', err.message); });
        }
      });

      card.querySelector('.remove-btn').addEventListener('click', function () {
        cache.plants = cache.plants.filter(function (x) { return x !== p; });
        renderPlants();
        if (p.objectId) {
          deleteInClass('MonkPlant', p.objectId).catch(function (err) { console.warn('MonkPlant delete failed:', err.message); });
        }
      });

      wrap.appendChild(card);
    });
  }

  document.getElementById('plant-add').addEventListener('click', function () {
    var nameInput = document.getElementById('plant-name-input');
    var speciesInput = document.getElementById('plant-species-input');
    var name = nameInput.value.trim();
    if (!name) return;
    var species = speciesInput.value.trim();
    var entry = { name: name, species: species, stage: MONK.plantStages[0] };
    cache.plants.push(entry);
    nameInput.value = '';
    speciesInput.value = '';
    renderPlants();
    createInClass('MonkPlant', entry).then(function (res) { entry.objectId = res.objectId; })
      .catch(function (err) { console.warn('MonkPlant create failed:', err.message); });
  });

  /* ---------------- SOURDOUGH ---------------- */

  function renderSourdough() {
    renderSourdoughLog();
    renderRecipeTagList('sourdough-discard-tags', MONK.sourdoughDiscardRecipes, 'sourdough-discard', renderSourdough);
    renderRecipeTagList('sourdough-recipe-tags', MONK.sourdoughRecipes, 'sourdough-recipe', renderSourdough);
  }

  function renderSourdoughLog() {
    var lastEl = document.getElementById('sourdough-last-fed');
    if (cache.sourdoughLog.length) {
      var last = cache.sourdoughLog[cache.sourdoughLog.length - 1];
      var daysSince = Math.round((new Date(todayStr) - new Date(last.date)) / 86400000);
      var when = daysSince <= 0 ? 'today' : daysSince === 1 ? 'yesterday' : daysSince + ' days ago';
      lastEl.textContent = 'Last fed ' + when + '.';
    } else {
      lastEl.textContent = 'No feedings logged yet.';
    }

    var wrap = document.getElementById('sourdough-log-entries');
    wrap.innerHTML = '';
    if (!cache.sourdoughLog.length) { wrap.innerHTML = '<p class="monk-empty">No feedings yet.</p>'; return; }
    cache.sourdoughLog.slice().reverse().slice(0, 20).forEach(function (f) {
      var div = document.createElement('div');
      div.className = 'monk-entry';
      div.innerHTML = '<p class="monk-entry-date"></p><p class="monk-entry-body"></p>';
      div.querySelector('.monk-entry-date').textContent = f.date;
      div.querySelector('.monk-entry-body').textContent = f.note || 'Fed.';
      wrap.appendChild(div);
    });
  }

  document.getElementById('sourdough-log').addEventListener('click', function () {
    var noteInput = document.getElementById('sourdough-note-input');
    var entry = { date: todayStr, note: noteInput.value.trim() };
    cache.sourdoughLog.push(entry);
    noteInput.value = '';
    renderSourdoughLog();
    logActivity('sourdough-feed', entry.note);
    createInClass('MonkSourdoughFeeding', entry).then(function (res) { entry.objectId = res.objectId; })
      .catch(function (err) { console.warn('MonkSourdoughFeeding save failed:', err.message); });
  });

  // Shared by Sourdough's two recipe lists and Tea's blend list: a
  // row of tags. Clicking one opens the full recipe in a popup
  // rather than marking it tried right away. "Tried" and "removed"
  // are both tracked as MonkActivity rows (same mechanism as Craft),
  // keyed by the recipe's title, so no new schema is needed for
  // either. `onChange` re-renders whichever list called this, and
  // the label args let the modal say "Blend"/"Steeping" for Tea
  // instead of "Ingredients"/"Method".
  function renderRecipeTagList(wrapId, recipes, category, onChange, ingredientsLabel, stepsLabel) {
    var wrap = document.getElementById(wrapId);
    wrap.innerHTML = '';
    var tried = {}, removed = {};
    cache.activities.forEach(function (a) {
      if (a.category === category) tried[a.label] = true;
      if (a.category === category + '-removed') removed[a.label] = true;
    });
    var visible = recipes.filter(function (r) { return !removed[r.title]; });
    if (!visible.length) {
      wrap.innerHTML = '<p class="monk-empty">Nothing left on this list. Everything here has been removed.</p>';
      return;
    }
    visible.forEach(function (recipe) {
      var tag = document.createElement('button');
      tag.className = 'monk-tag' + (tried[recipe.title] ? ' done' : '');
      tag.textContent = recipe.title;
      tag.addEventListener('click', function () {
        openRecipeModal(recipe, category, !!tried[recipe.title], onChange, ingredientsLabel, stepsLabel);
      });
      wrap.appendChild(tag);
    });
  }

  function openRecipeModal(recipe, category, alreadyTried, onChange, ingredientsLabel, stepsLabel) {
    var html =
      '<h2></h2>' +
      '<h3>' + (ingredientsLabel || 'Ingredients') + '</h3><ul></ul>' +
      '<h3>' + (stepsLabel || 'Method') + '</h3><ol></ol>' +
      '<div class="monk-modal-actions">' +
      '<button class="monk-btn primary" id="modal-tried-btn"></button>' +
      '<button class="monk-quiet-link" id="modal-remove-btn">Remove from list</button>' +
      '</div>';
    openModal(html);
    modalBody.querySelector('h2').textContent = recipe.title;
    var ul = modalBody.querySelector('ul');
    recipe.ingredients.forEach(function (i) {
      var li = document.createElement('li');
      li.textContent = i;
      ul.appendChild(li);
    });
    var ol = modalBody.querySelector('ol');
    recipe.steps.forEach(function (s) {
      var li = document.createElement('li');
      li.textContent = s;
      ol.appendChild(li);
    });

    var triedBtn = modalBody.querySelector('#modal-tried-btn');
    var tried = alreadyTried;
    triedBtn.textContent = tried ? 'Tried \u2713' : 'Mark as Tried';
    triedBtn.disabled = tried;
    triedBtn.addEventListener('click', function () {
      if (tried) return;
      tried = true;
      logActivity(category, recipe.title);
      triedBtn.textContent = 'Tried \u2713';
      triedBtn.disabled = true;
      renderProgress();
      if (onChange) onChange();
    });

    modalBody.querySelector('#modal-remove-btn').addEventListener('click', function () {
      logActivity(category + '-removed', recipe.title);
      closeModal();
      if (onChange) onChange();
    });
  }

  /* ---------------- TEA ---------------- */

  function renderTea() {
    renderRecipeTagList('tea-tags', MONK.teaBlends, 'tea-blend', renderTea, 'Blend', 'Steeping');
  }

  /* ---------------- WATCHLIST ---------------- */

  function renderWatchlist() {
    var ul = document.getElementById('watch-list');
    ul.innerHTML = '';
    if (!cache.watchlist.length) {
      ul.innerHTML = '<li class="monk-empty" style="border:none">Nothing on the list yet.</li>';
      return;
    }
    cache.watchlist.forEach(function (w) {
      var li = document.createElement('li');
      li.className = 'row';
      li.innerHTML =
        '<label><input type="checkbox"' + (w.watched ? ' checked' : '') + '><span></span></label>' +
        '<button class="monk-quiet-link">Remove</button>';
      li.querySelector('span').textContent = w.title + (w.note ? ': ' + w.note : '');

      li.querySelector('input').addEventListener('change', function (e) {
        w.watched = e.target.checked;
        ensureWatchlistPersisted(w, function () {
          updateInClass('MonkWatchlistItem', w.objectId, { watched: w.watched }).catch(function (err) { console.warn('MonkWatchlistItem update failed:', err.message); });
        });
        if (w.watched) logActivity('watchlist', w.title);
        renderWatchlist();
      });

      li.querySelector('.monk-quiet-link').addEventListener('click', function () {
        var hadId = w.objectId;
        cache.watchlist = cache.watchlist.filter(function (x) { return x !== w; });
        renderWatchlist();
        if (hadId) deleteInClass('MonkWatchlistItem', hadId).catch(function (err) { console.warn('MonkWatchlistItem delete failed:', err.message); });
      });

      ul.appendChild(li);
    });
  }

  // Starter suggestions live only in memory until you actually touch
  // one, then it's saved for real, same as anything you add yourself.
  function ensureWatchlistPersisted(w, afterSaved) {
    if (w.objectId) { afterSaved(); return; }
    createInClass('MonkWatchlistItem', { title: w.title, note: w.note, watched: w.watched }).then(function (res) {
      w.objectId = res.objectId;
      afterSaved();
    }).catch(function (err) { console.warn('MonkWatchlistItem create failed:', err.message); });
  }

  document.getElementById('watch-add').addEventListener('click', function () {
    var titleInput = document.getElementById('watch-title-input');
    var noteInput = document.getElementById('watch-note-input');
    var title = titleInput.value.trim();
    if (!title) return;
    var entry = { title: title, note: noteInput.value.trim(), watched: false };
    cache.watchlist.push(entry);
    titleInput.value = '';
    noteInput.value = '';
    renderWatchlist();
    createInClass('MonkWatchlistItem', entry).then(function (res) { entry.objectId = res.objectId; })
      .catch(function (err) { console.warn('MonkWatchlistItem save failed:', err.message); });
  });

  document.getElementById('watch-surprise').addEventListener('click', function () {
    var el = document.getElementById('watch-suggestion');
    var unwatched = cache.watchlist.filter(function (w) { return !w.watched; });
    if (!unwatched.length) {
      el.textContent = 'Nothing waiting, add something above.';
    } else {
      var pick = unwatched[Math.floor(Math.random() * unwatched.length)];
      el.textContent = '"' + pick.title + '"' + (pick.note ? ': ' + pick.note : '');
    }
    el.style.display = 'block';
  });

  /* ---------------- WISHLIST ---------------- */
  // The waiting period is derived, not stored: days required =
  // price / daily rate, days waited = today minus dateAdded. The
  // rate itself is a pacing number, not real budget tracking, so
  // it lives in localStorage rather than Back4App.

  var WISHLIST_RATE_KEY = 'monkWishlistDailyRate';

  function getWishlistRate() {
    var stored = parseFloat(localStorage.getItem(WISHLIST_RATE_KEY));
    return isNaN(stored) || stored <= 0 ? MONK.wishlistDefaultDailyRate : stored;
  }
  function setWishlistRate(v) {
    localStorage.setItem(WISHLIST_RATE_KEY, String(v));
  }

  function daysSince(dateString) {
    var d = Math.round((new Date(todayStr) - new Date(dateString)) / 86400000);
    return Math.max(0, d);
  }

  function ensureWishlistPersisted(w, afterSaved) {
    if (w.objectId) { afterSaved(); return; }
    createInClass('MonkWishlistItem', {
      name: w.name, price: w.price, note: w.note, dateAdded: w.dateAdded, checks: w.checks
    }).then(function (res) { w.objectId = res.objectId; afterSaved(); })
      .catch(function (err) { console.warn('MonkWishlistItem create failed:', err.message); afterSaved(); });
  }

  function renderWishlist() {
    document.getElementById('wishlist-rate-input').value = getWishlistRate();

    var wrap = document.getElementById('wishlist-list');
    wrap.innerHTML = '';
    if (!cache.wishlist.length) {
      wrap.innerHTML = '<p class="monk-empty">Nothing waiting on this list. Add something above and give it a few days.</p>';
      return;
    }
    var rate = getWishlistRate();

    cache.wishlist.forEach(function (w) {
      var price = parseFloat(w.price) || 0;
      var waited = daysSince(w.dateAdded);
      var needed = price > 0 ? Math.ceil(price / rate) : 0;
      var ready = waited >= needed;
      var pct = needed > 0 ? Math.min(100, Math.round((waited / needed) * 100)) : 100;

      var card = document.createElement('div');
      card.className = 'monk-wish-card';
      card.innerHTML =
        '<div class="monk-wish-head"><p class="monk-wish-name"></p><p class="monk-wish-price"></p></div>' +
        (w.note ? '<p class="monk-wish-note"></p>' : '') +
        '<ul class="monk-wish-checks"></ul>' +
        '<p class="monk-wish-wait"></p>' +
        '<div class="monk-wish-track"><div class="monk-wish-fill"></div></div>' +
        '<div class="monk-wish-actions">' +
        '<button class="monk-btn primary wish-bought"></button>' +
        '<button class="monk-quiet-link wish-remove">Remove</button>' +
        '</div>';

      card.querySelector('.monk-wish-name').textContent = w.name;
      card.querySelector('.monk-wish-price').textContent = price > 0 ? '$' + price.toFixed(2) : '';
      if (w.note) card.querySelector('.monk-wish-note').textContent = w.note;

      var checksUl = card.querySelector('.monk-wish-checks');
      MONK.wishlistChecks.forEach(function (c) {
        var li = document.createElement('li');
        var checked = !!w.checks[c.id];
        li.innerHTML = '<label><input type="checkbox" data-check="' + c.id + '"' + (checked ? ' checked' : '') + '><span></span></label>';
        li.querySelector('span').textContent = c.label;
        li.querySelector('input').addEventListener('change', function (e) {
          w.checks[c.id] = e.target.checked;
          if (w.objectId) updateInClass('MonkWishlistItem', w.objectId, { checks: w.checks }).catch(function (err) { console.warn('MonkWishlistItem update failed:', err.message); });
        });
        checksUl.appendChild(li);
      });

      var waitEl = card.querySelector('.monk-wish-wait');
      waitEl.classList.toggle('ready', ready);
      if (needed <= 0) {
        waitEl.textContent = 'Added ' + waited + ' day' + (waited === 1 ? '' : 's') + ' ago.';
      } else if (ready) {
        waitEl.textContent = 'Waiting period met. ' + waited + ' of ' + needed + ' days at $' + rate + ' a day.';
      } else {
        waitEl.textContent = (needed - waited) + ' day' + (needed - waited === 1 ? '' : 's') + ' to go. ' + waited + ' of ' + needed + ' days at $' + rate + ' a day.';
      }
      card.querySelector('.monk-wish-fill').style.width = pct + '%';

      var boughtBtn = card.querySelector('.wish-bought');
      boughtBtn.textContent = 'Bought It';
      boughtBtn.addEventListener('click', function () {
        logActivity('wishlist-bought', w.name);
        cache.wishlist = cache.wishlist.filter(function (x) { return x !== w; });
        renderWishlist();
        if (w.objectId) deleteInClass('MonkWishlistItem', w.objectId).catch(function (err) { console.warn('MonkWishlistItem delete failed:', err.message); });
      });

      card.querySelector('.wish-remove').addEventListener('click', function () {
        cache.wishlist = cache.wishlist.filter(function (x) { return x !== w; });
        renderWishlist();
        if (w.objectId) deleteInClass('MonkWishlistItem', w.objectId).catch(function (err) { console.warn('MonkWishlistItem delete failed:', err.message); });
      });

      wrap.appendChild(card);
    });
  }

  document.getElementById('wishlist-rate-save').addEventListener('click', function () {
    var input = document.getElementById('wishlist-rate-input');
    var v = parseFloat(input.value);
    if (isNaN(v) || v <= 0) return;
    setWishlistRate(v);
    renderWishlist();
  });

  document.getElementById('wish-add').addEventListener('click', function () {
    var nameInput = document.getElementById('wish-name-input');
    var priceInput = document.getElementById('wish-price-input');
    var noteInput = document.getElementById('wish-note-input');
    var name = nameInput.value.trim();
    if (!name) return;
    var checks = {};
    MONK.wishlistChecks.forEach(function (c) { checks[c.id] = false; });
    var entry = { name: name, price: priceInput.value.trim(), note: noteInput.value.trim(), dateAdded: todayStr, checks: checks };
    cache.wishlist.push(entry);
    nameInput.value = '';
    priceInput.value = '';
    noteInput.value = '';
    renderWishlist();
    ensureWishlistPersisted(entry, function () {});
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
    var rhythmTask = bags.rhythmTask().label;
    var observation = bags.place();
    var stewardship = bags.stewardship();
    var craftPick = bags.craft();
    var craftCat = craftPick.cat, craft = craftPick.item;
    var conversation = bags.humility();
    var joy = bags.joy();

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
    var booksFinished = cache.activities.filter(function (a) { return a.category === 'book-finished'; }).length;
    var passagesSaved = cache.bookNotes.length;
    var itemsBought = cache.activities.filter(function (a) { return a.category === 'wishlist-bought'; }).length;
    var sitsCompleted = cache.activities.filter(function (a) { return a.category === 'meditation'; }).length;
    var minutesMeditated = cache.activities
      .filter(function (a) { return a.category === 'meditation'; })
      .reduce(function (sum, a) { return sum + sitMinutesFromLabel(a.label); }, 0);
    var malaRounds = cache.activities.filter(function (a) { return a.category === 'mala-round'; }).length;
    var contemplationsWritten = cache.dharmaEntries.length;
    var movementCompletions = cache.activities.filter(function (a) { return a.category === 'movement'; }).length;
    var teaBlendsTried = cache.activities.filter(function (a) { return a.category === 'tea-blend'; }).length;

    var rows = [
      ['Checklist items completed', checklistCompleted],
      ['Crafts completed', craftsCompleted],
      ['Journal entries', journalCount],
      ['Acts of stewardship', stewardshipCount],
      ['Observation days', observationDayCount],
      ['Random practices completed', randomPracticeCount],
      ['Joy moments', joyCount],
      ['Solitude practices', solitudeCount],
      ['Books finished', booksFinished],
      ['Passages saved', passagesSaved],
      ['Wishlist purchases (after waiting)', itemsBought],
      ['Sits completed', sitsCompleted],
      ['Minutes meditated', minutesMeditated],
      ['Mala rounds completed', malaRounds],
      ['Contemplations written', contemplationsWritten],
      ['Movement routines completed', movementCompletions],
      ['Tea blends tried', teaBlendsTried]
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
      fetchClass('MonkActivity', 'date').catch(function () { return []; }),
      fetchClass('MonkPlant').catch(function () { return []; }),
      fetchClass('MonkSourdoughFeeding', 'date').catch(function () { return []; }),
      fetchClass('MonkWatchlistItem').catch(function () { return []; }),
      fetchClass('MonkBook').catch(function () { return []; }),
      fetchClass('MonkBookNote', 'date').catch(function () { return []; }),
      fetchClass('MonkWishlistItem').catch(function () { return []; }),
      fetchClass('MonkDharmaEntry', 'date').catch(function () { return []; })
    ]).then(function (results) {
      var days = results[0], placeNotes = results[1], journalEntries = results[2], activities = results[3];
      var plants = results[4], sourdoughLog = results[5], watchlist = results[6];
      var books = results[7], bookNotes = results[8], wishlistItems = results[9];
      var dharmaEntries = results[10];
      days.forEach(function (row) {
        cache.days[row.date] = {
          objectId: row.objectId,
          date: row.date,
          morningItems: row.morningItems || [],
          eveningItems: row.eveningItems || [],
          preceptItems: row.preceptItems || []
        };
      });
      cache.placeNotes = placeNotes.map(function (r) { return { objectId: r.objectId, date: r.date, prompt: r.prompt, note: r.note }; });
      cache.journalEntries = journalEntries.map(function (r) { return { objectId: r.objectId, date: r.date, text: r.text }; });
      cache.activities = activities.map(function (r) { return { objectId: r.objectId, date: r.date, category: r.category, label: r.label }; });
      cache.plants = plants.map(function (r) { return { objectId: r.objectId, name: r.name, species: r.species || '', stage: r.stage || MONK.plantStages[0] }; });
      cache.sourdoughLog = sourdoughLog.map(function (r) { return { objectId: r.objectId, date: r.date, note: r.note || '' }; });
      // Fresh installs get the starter suggestions; once anything's
      // been added, only the user's own saved items are shown.
      cache.watchlist = watchlist.length
        ? watchlist.map(function (r) { return { objectId: r.objectId, title: r.title, note: r.note || '', watched: !!r.watched }; })
        : MONK.watchlistStarter.map(function (w) { return { title: w.title, note: w.note, watched: false }; });

      cache.books = books.map(function (r) { return { objectId: r.objectId, title: r.title, author: r.author || '', status: r.status || BOOK_STATUSES[0], open: false }; });
      cache.bookNotes = bookNotes.map(function (r) {
        var parent = cache.books.filter(function (b) { return b.objectId === r.bookId; })[0];
        return parent ? { objectId: r.objectId, book: parent, quote: r.quote || '', page: r.page || '', note: r.note || '', date: r.date } : null;
      }).filter(function (n) { return n; });
      cache.wishlist = wishlistItems.map(function (r) {
        var checks = {};
        MONK.wishlistChecks.forEach(function (c) { checks[c.id] = !!(r.checks && r.checks[c.id]); });
        return { objectId: r.objectId, name: r.name, price: r.price || '', note: r.note || '', dateAdded: r.dateAdded || todayStr, checks: checks };
      });
      cache.dharmaEntries = dharmaEntries.map(function (r) { return { objectId: r.objectId, date: r.date, prompt: r.prompt, note: r.note }; });
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
    renderMovement();
    renderDharma();
    wireDharmaInteractions();
    renderPlacePrompt();
    renderPlaceEntries();
    wireRandomCard('presence-prompt', 'presence-new', 'presence-done', bags.presence, 'presence');
    wireRandomCard('solitude-prompt', 'solitude-new', 'solitude-done', bags.solitude, 'solitude');
    wireRandomCard('humility-prompt', 'humility-new', null, bags.humility, 'humility');
    wireRandomCard('stewardship-prompt', 'stewardship-new', 'stewardship-done', bags.stewardship, 'stewardship');
    wireRandomCard('joy-prompt', 'joy-new', 'joy-done', bags.joy, 'joy');
    renderLearning();
    renderReading();
    renderCraftGroups();
    pickCraft();
    renderPlants();
    renderSourdough();
    renderTea();
    renderWatchlist();
    renderWishlist();
    renderAttention();
    renderJournalEntries();
    renderProgress();
    showSection('sec-home');
  }

  init();
})();
