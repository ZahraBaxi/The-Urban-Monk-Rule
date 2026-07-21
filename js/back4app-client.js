/* ============================================================
   back4app-client.js, The Urban Monk Rule

   Same Back4App app/keys as the wardrobe project (reusing that
   connection rather than standing up a new app), and the same
   generic REST pattern (fetchClass / createInClass /
   updateInClass / deleteInClass against Back4App's Parse REST
   API). Data is kept separate by project through distinct
   Parse class names (MonkDay, MonkPlaceNote, MonkJournalEntry,
   MonkActivity, and so on) that don't overlap with the
   wardrobe's Garment/Repair/Outfit/etc classes in that same app.

   Every row in every Monk class also carries an `owner` field
   (the logged-in username), and every read is filtered to that
   owner. That's how two different people can use this same
   deployed site and each only ever see their own data. It isn't
   bank-vault security (Back4App's class permissions are still
   set to public read/write), it's just enough separation for a
   personal tool that more than one person might use.
   ============================================================ */

var B4A_ID = 'rLyvaf4wL6oXTKqKyOXLLHjQJWBAU2aJqmOb08Pg';
var B4A_KEY = 'w4NctSGaJFTBRPWfbgDPxd07EIvJzQVBLiNhjwOI';

var B4A_URL = 'https://parseapi.back4app.com';

// Set once a login/signup succeeds. Every authenticated request
// carries it so Parse knows who's asking.
var B4A_SESSION_TOKEN = null;

function b4aHeaders(extra) {
  var base = {
    'X-Parse-Application-Id': B4A_ID,
    'X-Parse-Client-Key': B4A_KEY
  };
  if (B4A_SESSION_TOKEN) base['X-Parse-Session-Token'] = B4A_SESSION_TOKEN;
  return Object.assign(base, extra || {});
}

/* ---------------- auth ---------------- */

// Parse's built-in User class, not a custom Monk class, so
// signup/login/logout use their own endpoints rather than the
// generic CRUD helpers below.

async function b4aSignUp(username, password) {
  var res = await fetch(B4A_URL + '/users', {
    method: 'POST',
    headers: b4aHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ username: username, password: password })
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not create that account');
  B4A_SESSION_TOKEN = data.sessionToken;
  return { username: username, sessionToken: data.sessionToken };
}

async function b4aLogIn(username, password) {
  var qs = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password);
  var res = await fetch(B4A_URL + '/login?' + qs, { headers: b4aHeaders() });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Incorrect username or password');
  B4A_SESSION_TOKEN = data.sessionToken;
  return { username: data.username, sessionToken: data.sessionToken };
}

async function b4aValidateSession(sessionToken) {
  var res = await fetch(B4A_URL + '/users/me', {
    headers: b4aHeaders({ 'X-Parse-Session-Token': sessionToken })
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Session expired');
  B4A_SESSION_TOKEN = sessionToken;
  return { username: data.username, sessionToken: sessionToken };
}

async function b4aLogOut() {
  if (!B4A_SESSION_TOKEN) return;
  try {
    await fetch(B4A_URL + '/logout', { method: 'POST', headers: b4aHeaders() });
  } catch (e) {
    // fine either way, we're clearing the local token next regardless
  }
  B4A_SESSION_TOKEN = null;
}

/* ---------------- file upload (photos) ---------------- */

async function b4aUploadFile(filename, dataUrl) {
  var match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl || '');
  if (!match) throw new Error('Not a valid image');
  var contentType = match[1];
  var binary = atob(match[2]);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  var res = await fetch(B4A_URL + '/files/' + encodeURIComponent(filename), {
    method: 'POST',
    headers: b4aHeaders({ 'Content-Type': contentType }),
    body: bytes
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not upload that image');
  return data; // { name, url }
}

/* ---------------- generic class CRUD ---------------- */
// Every chapter of the Rule (checklist days, place notes,
// journal entries, logged activities) uses this same shape of
// operations, so it's shared rather than repeated per class.
// `where` is an optional Parse query constraint object, used by
// monk-app.js to scope every read to the logged-in user.

async function fetchClass(className, order, where) {
  var results = [];
  var skip = 0;
  var limit = 1000;
  while (true) {
    var qs = 'limit=' + limit + '&skip=' + skip + (order ? '&order=' + order : '');
    if (where) qs += '&where=' + encodeURIComponent(JSON.stringify(where));
    var res = await fetch(B4A_URL + '/classes/' + className + '?' + qs, { headers: b4aHeaders() });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || ('could not load ' + className));
    results = results.concat(data.results || []);
    if (!data.results || data.results.length < limit) break;
    skip += limit;
  }
  return results;
}

async function createInClass(className, fields) {
  var res = await fetch(B4A_URL + '/classes/' + className, {
    method: 'POST',
    headers: b4aHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(fields)
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || ('could not create ' + className + ' record'));
  return data; // { objectId, createdAt }
}

async function updateInClass(className, objectId, fields) {
  var res = await fetch(B4A_URL + '/classes/' + className + '/' + objectId, {
    method: 'PUT',
    headers: b4aHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(fields)
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || ('could not save ' + className + ' record'));
  return data;
}

async function deleteInClass(className, objectId) {
  var res = await fetch(B4A_URL + '/classes/' + className + '/' + objectId, {
    method: 'DELETE',
    headers: b4aHeaders()
  });
  if (!res.ok) {
    var data = await res.json().catch(function () { return {}; });
    throw new Error(data.error || ('could not delete ' + className + ' record'));
  }
  return true;
}
