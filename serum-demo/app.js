// A small, front-end-only Serum demo. Everything lives in memory and a reload
// resets it. Markup and classes mirror the real app so its stylesheet applies.
(function () {
  'use strict';

  var D = window.SERUM_DATA;
  var TODAY = new Date(D.today + 'T12:00:00');
  var P = JSON.parse(JSON.stringify(D.prospects)); // working copy
  var nextId = 1000;

  var NAMES = { lead: 'Lead', talking: 'Talking', trying: 'Trying it', proposal: 'Proposal sent', onhold: 'On hold',
    won: 'Won', switched: 'Switched', churned: 'Churned', notfit: 'Not a fit', lost: 'Lost' };
  var OPEN = ['lead', 'talking', 'trying', 'proposal'];
  var ALL = ['lead', 'talking', 'trying', 'proposal', 'onhold', 'won', 'churned', 'notfit', 'lost'];
  var ROUTE = { new: ['lead', 'talking', 'trying', 'proposal', 'won'], switch: ['talking', 'trying', 'switched'] };

  function ringPath(s) {
    var open = '<circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--c)" stroke-width="1.5"/>';
    var solid = '<circle cx="7" cy="7" r="6.25" fill="var(--c)"/>';
    switch (s) {
      case 'lead': return '<circle cx="7" cy="7" r="5.5" fill="none" stroke="var(--c)" stroke-width="1.5" stroke-dasharray="2 2"/>';
      case 'talking': return open + '<path d="M7 7V3.5A3.5 3.5 0 0 1 10.5 7Z" fill="var(--c)"/>';
      case 'trying': return open + '<path d="M7 7V3.5A3.5 3.5 0 0 1 7 10.5Z" fill="var(--c)"/>';
      case 'proposal': return open + '<path d="M7 7V3.5A3.5 3.5 0 1 1 3.5 7Z" fill="var(--c)"/>';
      case 'onhold': return solid + '<path d="M5.6 4.6v4.8M8.4 4.6v4.8" stroke="var(--on-c)" stroke-width="1.5" stroke-linecap="round"/>';
      case 'won': return solid + '<path d="M4.6 7.1l1.7 1.7 3.2-3.4" fill="none" stroke="var(--on-c)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
      case 'switched': return solid + '<path d="M4 7h5.6M7.6 4.8 9.8 7 7.6 9.2" fill="none" stroke="var(--on-c)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
      case 'churned': return solid + '<path d="M4.8 4.8l4.2 4.2M9.4 5.6v3.8H5.6" fill="none" stroke="var(--on-c)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>';
      case 'notfit': return solid + '<path d="M4.5 7h5" stroke="var(--on-c)" stroke-width="1.5" stroke-linecap="round"/>';
      default: return solid + '<path d="M5 5l4 4M9 5l-4 4" stroke="var(--on-c)" stroke-width="1.5" stroke-linecap="round"/>';
    }
  }
  function ring(s) { return '<svg class="ring st-' + s + '" viewBox="0 0 14 14" aria-hidden="true">' + ringPath(s) + '</svg>'; }
  function pill(s) { return '<span class="pill st-' + s + '">' + ring(s) + NAMES[s] + '</span>'; }
  var TICK = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8.2l2.3 2.3 4.7-5"/></svg>';
  var CARET = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6.5 8 10l3.5-3.5"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function plain(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent.trim(); }
  function money(n) { return '€' + n.toLocaleString('en-GB'); }
  function valueOf(p) { var m = plain(p.money).replace(/[^0-9]/g, ''); return m ? parseInt(m, 10) : 0; }
  function routeOf(p) { return p.switcher ? 'switch' : 'new'; }

  // --- days -----------------------------------------------------------------
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function dayFromOffset(n) { var d = new Date(TODAY); d.setDate(d.getDate() + n); return d; }
  function fmtDay(d) { return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  function offsetOf(label) {
    var t = label.toLowerCase(), m;
    if ((m = t.match(/(\d+) days? overdue/))) return -parseInt(m[1], 10);
    if (t.indexOf('today') >= 0) return 0;
    if (t.indexOf('tomorrow') >= 0) return 1;
    if ((m = label.match(/(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/))) {
      var d = new Date(TODAY.getFullYear(), MONTHS.indexOf(m[2]), parseInt(m[1], 10), 12);
      return Math.round((d - TODAY) / 864e5);
    }
    return null;
  }
  function dueLabel(n, short) {
    if (n === null) return 'No day';
    if (n < 0) return (-n) + (n === -1 ? ' day' : ' days') + ' overdue';
    if (n === 0) return short ? 'Today' : 'Due today';
    if (n === 1) return 'Tomorrow';
    return fmtDay(dayFromOffset(n));
  }
  function nowTime() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }

  // Each to-do knows its day as an offset from today, and whose it is.
  Object.keys(P).forEach(function (id) {
    var p = P[id];
    p.events = [];
    p.origNext = plain(p.next.replace(/<small.*$/, ''));
    p.origLate = (p.next.match(/<small class="late">.*?<\/small>/) || [''])[0];
    p.todos.forEach(function (t) {
      var txt = plain(t.sub);
      t.mine = /<\/span>You<\/span>/.test(t.sub);
      t.who = (t.sub.split(' · ')[0]) || '';
      t.offset = offsetOf(txt.split('·').slice(1).join('·'));
    });
    p.steps.forEach(function (s) { s.base = stripTicked(s.body); });
  });
  function stripTicked(body) { return body.replace(/<p class="step-sub ok">.*?<\/p>\s*/g, ''); }

  // --- pieces ---------------------------------------------------------------
  function nextStep(p) {
    if (OPEN.indexOf(p.stage) < 0) return '';
    var s = p.steps.filter(function (x) { return !x.done; })[0];
    if (!s) return '<span class="faint">Every step done</span>';
    return esc(s.title) + (s.title === p.origNext ? p.origLate : '');
  }
  function isLate(p) { return OPEN.indexOf(p.stage) >= 0 && nextStep(p).indexOf('class="late"') >= 0; }

  function moveMenu(p) {
    var items = ALL.filter(function (s) { return s !== p.stage; }).map(function (s) {
      return '<button class="mi st-' + s + '" type="submit" name="stage" value="' + s + '">' + ring(s) + NAMES[s] + '</button>';
    }).join('');
    return '<details class="row-menu move-menu"><summary aria-label="Move ' + esc(p.name) + ' to another stage">Move' + CARET + '</summary>' +
      '<form method="post" action="/prospects/' + p.id + '/stage"><div class="menu"><span class="menu-h" aria-hidden="true">Move to</span>' + items + '</div></form></details>';
  }
  function row(p) {
    var tag = p.switcher && (p.stage === 'talking' || p.stage === 'trying') ? '<span class="tag st-switched">Switcher</span>' : '';
    return '<div class="row" id="p-' + p.id + '" data-stage="' + p.stage + '">' +
      '<span class="co"><a class="row-link" href="/prospects/' + p.id + '">' + esc(p.name) + '</a>' + tag + '</span>' +
      '<span>' + pill(p.stage) + '</span>' +
      '<span class="r money">' + (p.money || '<span class="faint">Not known</span>') + '</span>' +
      '<span class="next">' + nextStep(p) + '</span>' +
      '<span>' + (p.last || '<span class="faint">None yet</span>') + '</span>' +
      '<span class="src">' + p.src + '</span>' + moveMenu(p) + '</div>';
  }
  function group(stage, list) {
    if (!list.length) return '';
    var total = list.reduce(function (a, p) { return a + valueOf(p); }, 0);
    return '<section class="group st-' + stage + '" aria-label="' + NAMES[stage] + '">' +
      '<div class="group-head"><span class="group-name">' + ring(stage) + NAMES[stage] + '<span class="n">' + list.length + '</span></span><span></span>' +
      '<span class="r money">' + (total ? money(total) : '') + '</span><span></span><span></span><span></span></div>' +
      '<div class="group-card">' + list.map(row).join('') + '</div></section>';
  }
  function table(stages) {
    var body = stages.map(function (s) { return group(s, byStage(s)); }).join('');
    if (!body) body = '<p class="faint" style="padding:24px 0">Nobody here yet. Move a prospect here from the Pipeline to see it.</p>';
    return '<div class="table-scroll"><div class="table"><div class="row head" aria-hidden="true"><span>Company</span><span>Status</span>' +
      '<span class="r">First-year value</span><span>Next step</span><span>Last contact</span><span>Source</span></div>' + body + '</div></div>';
  }
  function byStage(s) { return Object.keys(P).map(function (k) { return P[k]; }).filter(function (p) { return p.stage === s; }); }

  function card(s) {
    var list = byStage(s), total = list.reduce(function (a, p) { return a + valueOf(p); }, 0);
    var late = list.filter(isLate).length;
    return '<a class="card st-' + s + '" href="/?stage=' + s + '"><span class="card-mark" aria-hidden="true">' + ring(s) + '</span>' +
      '<span class="card-name">' + ring(s) + NAMES[s] + '</span><span class="card-count">' + list.length + '</span>' +
      '<span class="card-total">' + (total ? money(total) : 'No value yet') + '</span>' +
      '<span class="card-note' + (late ? ' late' : '') + '">' + (late ? late + (late === 1 ? ' step overdue' : ' steps overdue') : 'Every step on time') + '</span></a>';
  }
  function bar(title) {
    return '<header class="bar"><h1>' + title + '</h1><a class="btn primary" href="/prospects/new">Add a prospect <kbd>C</kbd></a></header>';
  }

  // --- pages ----------------------------------------------------------------
  function pipeline() {
    var open = OPEN.reduce(function (a, s) { return a.concat(byStage(s)); }, []);
    var total = open.reduce(function (a, p) { return a + valueOf(p); }, 0);
    return bar('Pipeline') + '<div class="cards">' + OPEN.map(card).join('') + '</div>' +
      '<div class="filters"><span></span><p class="in-play"><b>' + open.length + '</b> potential accounts · ' + money(total) + '</p></div>' +
      table(OPEN);
  }
  function view(stage) { return bar(NAMES[stage]) + table([stage]); }

  function todoPage() {
    var rows = [];
    Object.keys(P).forEach(function (k) {
      var p = P[k];
      p.todos.forEach(function (t) { if (t.mine && (!t.done || t.justDone)) rows.push({ p: p, t: t }); });
    });
    var groups = [['Overdue', function (n) { return n !== null && n < 0; }, 'late'], ['Today', function (n) { return n === 0; }, ''],
      ['Coming up', function (n) { return n !== null && n > 0; }, ''], ['No day', function (n) { return n === null; }, '']];
    var html = groups.map(function (g) {
      var list = rows.filter(function (r) { return g[1](r.t.offset); }).sort(function (a, b) { return (a.t.offset || 0) - (b.t.offset || 0); });
      if (!list.length) return '';
      return '<section class="tl-group" aria-label="' + g[0] + '"><h2 class="tl-head ' + g[2] + '">' + g[0] + ' <span class="n">' + list.length + '</span></h2><div class="group-card">' +
        list.map(function (r) {
          var n = r.t.offset, late = n !== null && n <= 0 ? ' late' : '';
          return '<div class="tl-row st-todo' + (r.t.done ? ' done' : '') + '"><form method="post" action="/prospects/' + r.p.id + '/todos/' + r.t.id + '">' +
            '<button class="tick" type="submit" aria-pressed="' + !!r.t.done + '" aria-label="' + esc(r.t.title) + ': mark as done">' + TICK + '</button></form>' +
            '<a class="tl-co" href="/prospects/' + r.p.id + '#todos">' + ring(r.p.stage) + '<span>' + esc(r.p.name) + '</span></a>' +
            '<span class="tl-what">' + esc(r.t.title) + '</span><span class="tl-day' + late + '">' + dueLabel(n) + '</span></div>';
        }).join('') + '</div></section>';
    }).join('');
    if (!html) html = '<p class="faint" style="padding:24px 0">Nothing to do. Nice.</p>';
    return bar('To do') + '<div class="tl-wrap"><div class="tl">' + html + '</div></div>';
  }

  function playbookCard(p) {
    if (!p.steps.length) return '';
    var done = p.steps.filter(function (s) { return s.done; }).length, n = p.steps.length;
    var lis = p.steps.map(function (s) {
      var body = s.done ? '<p class="step-title">' + esc(s.title) + '</p><p class="step-sub ok">Ticked by ' + (s.by || 'Vicky') + '</p>' : s.base;
      return '<li class="' + (s.done ? 'done' : '') + '"><form method="post" action="/prospects/' + p.id + '/steps/' + s.id + '">' +
        '<button class="tick" type="submit" aria-pressed="' + s.done + '" aria-label="' + esc(s.title) + ': ' + (s.done ? 'done. Mark as not done' : 'not done. Mark as done') + '">' + TICK + '</button></form>' +
        '<div class="step-body">' + body + '</div></li>';
    }).join('');
    return '<section class="playbook st-' + p.stage + '" id="playbook" aria-labelledby="pb-h"><div class="pb-head"><h2 id="pb-h">' + ring(p.stage) + NAMES[p.stage] + ' playbook</h2>' +
      '<span class="faint">' + done + ' of ' + n + ' done</span></div>' +
      '<svg class="pb-bar" aria-hidden="true"><rect class="pb-track" width="100%" height="100%" rx="2.5"/><rect class="pb-fill" width="' + Math.round(100 * done / n) + '%" height="100%" rx="2.5"/><rect class="pb-glint" width="18%" height="100%" rx="2.5"/></svg>' +
      '<ol class="steps">' + lis + '</ol></section>';
  }
  function todosCard(p) {
    if (!p.todos.length) return '<section class="todos nothing-yet" id="todos" aria-labelledby="td-h"><h2 class="vh" id="td-h">To-dos</h2>' + (p.todoFooter || '') + '</section>';
    var open = p.todos.filter(function (t) { return !t.done; }).length;
    var lis = p.todos.map(function (t) {
      var late = !t.done && t.offset !== null && t.offset < 0;
      return '<li class="' + (t.done ? 'done' : '') + '"><form method="post" action="/prospects/' + p.id + '/todos/' + t.id + '">' +
        '<button class="tick" type="submit" aria-pressed="' + !!t.done + '" aria-label="' + esc(t.title) + ': mark as done">' + TICK + '</button></form>' +
        '<div class="step-body"><p class="step-title">' + esc(t.title) + '</p><p class="step-sub' + (late ? ' late' : '') + '">' + t.who +
        (t.offset === null ? '' : ' · ' + dueLabel(t.offset, true).replace('Today', 'Today')) + '</p></div></li>';
    }).join('');
    return '<section class="todos" id="todos" aria-labelledby="td-h"><div class="pb-head"><h2 id="td-h">To-dos</h2><span class="faint">' + open + ' to do</span></div>' +
      '<ol class="steps">' + lis + '</ol>' + (p.todoFooter || '') + '</section>';
  }
  function statusCard(p) {
    var r = ROUTE[routeOf(p)], i = r.indexOf(p.stage);
    var opts = ALL.map(function (s) { return '<option value="' + s + '"' + (s === p.stage ? ' selected' : '') + '>' + NAMES[s] + '</option>'; }).join('');
    var route = i < 0 ? '' : '<div class="route" aria-hidden="true">' + r.map(function (s, k) {
      return '<i class="' + (k <= i ? 'on' : '') + (k === i ? ' now' : '') + '" title="' + NAMES[s] + '"></i>';
    }).join('') + '</div><p class="route-cap"><span>Step ' + (i + 1) + ' of ' + r.length + '</span>' + (i < r.length - 1 ? '<span>Next: ' + NAMES[r[i + 1]] + '</span>' : '') + '</p>';
    return '<section class="status-card st-' + p.stage + '" aria-label="Status"><span class="mark" aria-hidden="true">' + ring(p.stage) + '</span>' +
      '<form class="stage-form" method="post" action="/prospects/' + p.id + '/stage"><label class="label" for="stage">Status</label>' +
      '<div class="stage-pick st-' + p.stage + '">' + ring(p.stage) + '<select id="stage" name="stage" data-autosubmit>' + opts + '</select></div></form>' +
      route + p.when + '</section>';
  }
  function prospectPage(p) {
    var main = p.main.replace('<!--PB-->', playbookCard(p)).replace('<!--TD-->', todosCard(p));
    if (p.events.length) {
      var add = '', last = (main.match(/<li class="feed-day">.*?<h3>(.*?)<\/h3>/g) || []).pop() || '';
      if (last.indexOf(fmtDay(TODAY)) < 0) add = '<li class="feed-day"><span class="feed-dot"></span><h3>' + fmtDay(TODAY) + '</h3></li>';
      main = main.replace('<li class="ev now">', add + p.events.join('') + '<li class="ev now">');
    }
    return p.bar + '<div class="record">' + main + p.aside.replace('<!--ST-->', statusCard(p)) + '</div>';
  }

  // --- activity events ------------------------------------------------------
  function ev(p, html) { p.events.push(html); }
  function evTick(p, what) {
    ev(p, '<li class="ev-smalls"><ol><li class="ev small"><span class="ev-node quiet">' + TICK + '</span><div class="ev-what"><p class="ev-head">' + esc(what) +
      ' <span class="ev-by">Vicky</span></p></div><time class="ev-t">' + nowTime() + '</time></li></ol></li>');
  }
  function evMove(p, from) {
    ev(p, '<li class="ev stage st-' + p.stage + '"><span class="ev-node stage-node">' + ring(p.stage) + '</span><div class="ev-what"><p class="ev-head">Moved to ' + pill(p.stage) +
      '</p><p class="ev-meta">Vicky · from ' + NAMES[from] + '</p></div><time class="ev-t">' + nowTime() + '</time></li>');
  }
  function evNote(p, body) {
    ev(p, '<li class="ev note"><span class="ev-node accent"><svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h5.5L12 5v8.5H4zM6 8h4M6 10.5h4"/></svg></span>' +
      '<div class="ev-what"><p class="ev-head">Note</p><p class="ev-meta">Vicky</p><div class="box"><p class="prose">' + esc(body).replace(/\n/g, '<br>') + '</p></div></div><time class="ev-t">' + nowTime() + '</time></li>');
  }
  function evPlain(p, head) {
    ev(p, '<li class="ev"><span class="ev-node"><svg class="i" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="2" fill="currentColor" stroke="none"/></svg></span>' +
      '<div class="ev-what"><p class="ev-head">' + esc(head) + '</p><p class="ev-meta">Vicky</p></div><time class="ev-t">' + nowTime() + '</time></li>');
  }

  // --- actions --------------------------------------------------------------
  function stepsFor(p) {
    var r = (D.playbook[p.stage] || {})[routeOf(p)] || (D.playbook[p.stage] || {}).new || [];
    return r.map(function (s) {
      var base = '<p class="step-title">' + esc(s.title) + '</p>' + (s.sub ? '<p class="step-sub">' + s.sub + '</p>' : '') +
        (s.cmd ? '<p class="cmd"><code>' + s.cmd + ' ' + esc(p.name) + '</code></p>' : '') +
        (/^Ticked when/.test(s.auto) ? '<p class="step-sub soon">' + esc(s.auto) + '.</p>' : '');
      return { id: nextId++, title: s.title, done: false, base: base };
    });
  }
  function move(p, to) {
    if (!to || to === p.stage) return;
    var from = p.stage;
    p.stage = to;
    if ((to === 'talking' || to === 'trying') && /Switching/.test(p.src)) p.switcher = true;
    p.steps = stepsFor(p);
    evMove(p, from);
    toast(p.name + ' moved to ' + NAMES[to] + '.');
    if (to === 'won') celebrate();
  }
  function tickStep(p, sid) {
    var s = p.steps.filter(function (x) { return x.id === sid; })[0];
    if (!s) return;
    s.done = !s.done; s.by = 'Vicky';
    evTick(p, (s.done ? 'Ticked ' : 'Unticked ') + s.title);
  }
  function tickTodo(p, tid) {
    var t = p.todos.filter(function (x) { return x.id === tid; })[0];
    if (!t) return;
    t.done = !t.done;
    if (t.done) { evTick(p, 'Done: ' + t.title); t.justDone = true; setTimeout(function () { t.justDone = false; if (route().page === 'todo') render(); }, 900); }
  }
  function addTodo(p, form) {
    var title = (form.title && form.title.value || '').trim();
    if (!title) { toast('Say what needs doing first.'); return false; }
    var day = form.day && form.day.value, off = null;
    if (day) off = Math.round((new Date(day + 'T12:00:00') - TODAY) / 864e5);
    var sel = form.querySelector('select[name="for"]'), whoName = sel ? sel.options[sel.selectedIndex].text : 'You';
    var mine = whoName === 'You';
    var initials = mine ? 'VC' : whoName.split(' ').map(function (w) { return w[0]; }).join('');
    p.todos.push({ id: nextId++, title: title, done: false, offset: off, mine: mine,
      who: '<span class="todo-who"><span class="av hue-' + (mine ? 1 : 3) + '" aria-hidden="true">' + initials + '</span>' + esc(mine ? 'You' : whoName.split(' ')[0]) + '</span>' });
    evPlain(p, 'Added a to-do: ' + title);
    return true;
  }

  // --- router ---------------------------------------------------------------
  function route() {
    var h = (location.hash || '#/').slice(1), m;
    var path = h.split('#')[0];
    if ((m = path.match(/^\/prospects\/(\d+)/)) && P[m[1]]) return { page: 'prospect', p: P[m[1]] };
    if (path === '/todo') return { page: 'todo' };
    if ((m = path.match(/view=(\w+)/)) && NAMES[m[1]]) return { page: 'view', stage: m[1] };
    return { page: 'pipeline' };
  }
  function supported(href) {
    return /^\/(\?stage=\w+)?$/.test(href) || /^\/todo$/.test(href) || /^\/prospects\/\d+([#?].*)?$/.test(href) ||
      /^\/\?view=(won|switched|onhold|churned|notfit|lost)$/.test(href);
  }
  function go(href) { location.hash = href; }

  var mainEl, sideEl;
  function render() {
    var r = route(), html;
    if (r.page === 'prospect') html = prospectPage(r.p);
    else if (r.page === 'todo') html = todoPage();
    else if (r.page === 'view') html = view(r.stage);
    else html = pipeline();
    mainEl.innerHTML = html;
    document.title = (r.page === 'prospect' ? r.p.name : r.page === 'todo' ? 'To do' : r.page === 'view' ? NAMES[r.stage] : 'Pipeline') + ' · Serum demo';
    updateSide(r);
  }
  function updateSide(r) {
    var current = r.page === 'todo' ? '/todo' : r.page === 'view' ? '/?view=' + r.stage : r.page === 'pipeline' ? '/' : '';
    sideEl.querySelectorAll('.side-nav a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === current) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      var cnt = a.querySelector('.cnt'); if (!cnt) return;
      var m = href.match(/view=(\w+)/);
      if (href === '/') cnt.textContent = OPEN.reduce(function (n, s) { return n + byStage(s).length; }, 0);
      else if (m && NAMES[m[1]]) cnt.textContent = byStage(m[1]).length;
      else if (href === '/todo') {
        var due = 0, late = false;
        Object.keys(P).forEach(function (k) { P[k].todos.forEach(function (t) { if (t.mine && !t.done && t.offset !== null && t.offset <= 0) { due++; if (t.offset < 0) late = true; } }); });
        cnt.textContent = due; a.classList.toggle('late', late);
      }
    });
  }

  // --- toast and confetti ---------------------------------------------------
  var toastEl, toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  function celebrate() {
    var colours = ['--st-talking', '--st-trying', '--st-proposal', '--st-won'], wrap = document.createElement('div');
    wrap.className = 'demo-confetti';
    for (var i = 0; i < 40; i++) {
      var b = document.createElement('i');
      b.style.left = (Math.random() * 100) + '%'; b.style.background = 'var(' + colours[i % 4] + ')';
      b.style.animationDelay = (Math.random() * 0.3) + 's'; b.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      wrap.appendChild(b);
    }
    document.body.appendChild(wrap); setTimeout(function () { wrap.remove(); }, 2200);
  }
  var NOPE = "That part isn't in this demo. Try ticking steps, moving prospects or adding to-dos.";

  // --- events ---------------------------------------------------------------
  function onClick(e) {
    var a = e.target.closest('a');
    if (a) {
      var href = a.getAttribute('href');
      if (href === null) return;
      e.preventDefault();
      if (href.charAt(0) === '#') { var t = document.getElementById(href.slice(1)); if (t) t.scrollIntoView({ behavior: 'smooth' }); return; }
      if (supported(href)) go(href); else toast(NOPE);
      return;
    }
    var tb = e.target.closest('form.theme button');
    if (tb) {
      e.preventDefault();
      var v = tb.value;
      if (v === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v);
      tb.parentNode.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === tb); });
      return;
    }
  }
  function onSubmit(e) {
    var f = e.target, action = f.getAttribute('action') || '', m;
    e.preventDefault();
    var sub = e.submitter;
    if ((m = action.match(/^\/prospects\/(\d+)\/steps\/(\d+)$/))) { tickStep(P[m[1]], +m[2]); }
    else if ((m = action.match(/^\/prospects\/(\d+)\/todos\/(\d+)$/))) { tickTodo(P[m[1]], +m[2]); }
    else if ((m = action.match(/^\/prospects\/(\d+)\/todos$/))) { if (!addTodo(P[m[1]], f)) return; toast('To-do added.'); }
    else if ((m = action.match(/^\/prospects\/(\d+)\/stage$/))) { move(P[m[1]], sub && sub.value || (f.stage && f.stage.value)); }
    else if ((m = action.match(/^\/prospects\/(\d+)\/notes$/))) {
      var body = (f.body && f.body.value || '').trim();
      if (!body) { toast('Write the note first.'); return; }
      evNote(P[m[1]], body);
    }
    else if (/^\/search/.test(action)) { toast('Search isn\'t in this demo.'); return; }
    else { toast(NOPE); return; }
    var y = window.scrollY, my = mainEl.scrollTop;
    render();
    window.scrollTo(0, y); mainEl.scrollTop = my;
  }
  function onChange(e) {
    var s = e.target;
    if (!s.matches('select[data-autosubmit]')) return;
    var f = s.form;
    if (s.name === 'stage') { var m = f.getAttribute('action').match(/\/prospects\/(\d+)\//); move(P[m[1]], s.value); render(); }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.body.innerHTML = '<div class="app">' + D.side + '<main class="main" id="main"></main></div><div class="demo-toast" role="status" aria-live="polite"></div>';
    sideEl = document.querySelector('nav.side'); mainEl = document.getElementById('main'); toastEl = document.querySelector('.demo-toast');
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('change', onChange);
    window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); mainEl.scrollTop = 0; });
    render();
  });
})();
