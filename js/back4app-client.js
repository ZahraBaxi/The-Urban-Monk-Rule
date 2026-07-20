/* ============================================================
   back4app-client.js, The Urban Monk Rule

   Same Back4App app/keys as the wardrobe project (reusing that
   connection rather than standing up a new app), and the same
   generic REST pattern (fetchClass / createInClass /
   updateInClass / deleteInClass against Back4App's Parse REST
   API). Data is kept separate by project through distinct
   Parse class names (MonkDay, MonkPlaceNote, MonkJournalEntry,
   MonkActivity, MonkPlant, MonkSourdoughFeeding,
   MonkWatchlistItem) that don't overlap with the wardrobe's
   Garment/Repair/Outfit/etc classes in that same app.
   ============================================================ */

var B4A_ID = 'rLyvaf4wL6oXTKqKyOXLLHjQJWBAU2aJqmOb08Pg';
var B4A_KEY = 'w4NctSGaJFTBRPWfbgDPxd07EIvJzQVBLiNhjwOI';

var B4A_URL = 'https://parseapi.back4app.com';

function b4aHeaders(extra) {
  return Object.assign(
    {
      'X-Parse-Application-Id': B4A_ID,
      'X-Parse-Client-Key': B4A_KEY
    },
    extra || {}
  );
}

/* ---------------- generic class CRUD ---------------- */
// Every chapter of the Rule (checklist days, place notes,
// journal entries, logged activities) uses this same shape of
// operations, so it's shared rather than repeated per class.

async function fetchClass(className, order) {
  var results = [];
  var skip = 0;
  var limit = 1000;
  while (true) {
    var qs = 'limit=' + limit + '&skip=' + skip + (order ? '&order=' + order : '');
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
