import { extension_settings, getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';
import { loadWorldInfo, saveWorldInfo, createWorldInfoEntry, world_names } from '../../../world-info.js';

const KEY = 'outfit_tagger';
const DEFAULTS = {
    profileId: '',
    opacity: 0.9,
    categories: ['Outfit', 'Accessories', 'Uniform', 'Footwear', 'Headwear', 'Legwear'],
    prompt: 'Look at the picture and describe ONLY the clothing and worn items of the main character as short lowercase NovelAI/Danbooru-style tags (2-5 words each, include colors, materials, patterns). Sort them into these groups: {{categories}}. Omit empty groups. Do not describe the person, pose or background. Reply with JSON only: {"GroupName": ["tag", "tag"]}',
    library: [],
};
const state = { img: '', groups: {} };
const S = () => extension_settings[KEY];
const esc = s => $('<div>').text(s).html();
const keys = () => [...new Set([...S().categories, ...Object.keys(state.groups)])];
const fmt = g => Object.entries(g).filter(([, v]) => v.length).map(([k, v]) => `${k}(${v.map(t => `"${t}"`).join(', ')})`).join('\n\n');

const readFile = f => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
const resize = (src, max, q) => new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => {
        const r = Math.min(1, max / Math.max(i.width, i.height));
        const c = document.createElement('canvas');
        c.width = Math.round(i.width * r); c.height = Math.round(i.height * r);
        c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL('image/jpeg', q));
    };
    i.onerror = rej; i.src = src;
});
async function copy(text) {
    try { await navigator.clipboard.writeText(text); } catch {
        const t = $('<textarea>').val(text).appendTo('body'); t[0].select(); document.execCommand('copy'); t.remove();
    }
    toastr.success('Copied');
}
async function setImage(src) {
    state.img = await resize(src, 1024, 0.85);
    $('#ot_prev').attr('src', state.img).show();
}

function renderGroups() {
    const ks = keys();
    $('#ot_groups').html(ks.map((k, gi) => `<div class="ot-group" data-g="${gi}"><b>${esc(k)}</b>
        <div class="ot-chips">${(state.groups[k] || []).map((t, i) => `<span class="ot-chip" data-i="${i}">${esc(t)} <i class="fa-solid fa-xmark"></i></span>`).join('')}</div>
        <div class="ot-row"><input class="text_pole ot-add" placeholder="+ add tag, Enter" style="flex:1"><span class="menu_button ot-copyg">Copy</span></div></div>`).join(''));
}

async function generate() {
    const ctx = getContext();
    if (!state.img) return toastr.warning('Add a picture first');
    if (!S().profileId) return toastr.warning('Choose a profile');
    const prompt = S().prompt.replace('{{categories}}', S().categories.join(', '));
    $('#ot_go').text('Working...').css('pointer-events', 'none');
    try {
        const out = await ctx.ConnectionManagerRequestService.sendRequest(S().profileId,
            [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: state.img } }] }],
            1500, { stream: false, extractData: true, includePreset: true, includeInstruct: false });
        const j = JSON.parse((out.content || '').match(/\{[\s\S]*\}/)[0]);
        state.groups = {};
        for (const [k, v] of Object.entries(j)) if (Array.isArray(v)) state.groups[k] = v.map(String);
        renderGroups();
    } catch (e) { console.error(e); toastr.error('Failed: ' + (e.message || e)); }
    $('#ot_go').text('Describe').css('pointer-events', '');
}

async function toNote() {
    const ctx = getContext(), id = ctx.characterId;
    if (id === undefined) return toastr.warning('No character selected');
    const dp = { prompt: '', depth: 4, role: 'system', ...(ctx.characters[id].data?.extensions?.depth_prompt || {}) };
    dp.prompt = (dp.prompt ? dp.prompt + '\n' : '') + fmt(state.groups);
    await ctx.writeExtensionField(id, 'depth_prompt', dp);
    $('#depth_prompt_prompt').val(dp.prompt);
    toastr.success('Added to character note');
}
async function toLore() {
    const name = $('#ot_lore').val();
    if (!name) return toastr.warning('Pick a lorebook');
    const data = await loadWorldInfo(name);
    const e = createWorldInfoEntry(name, data);
    const title = $('#ot_name').val() || 'Outfit';
    e.comment = title; e.key = [title]; e.content = fmt(state.groups);
    await saveWorldInfo(name, data, true);
    toastr.success('Added to lorebook');
}
async function save() {
    const name = $('#ot_name').val().trim() || 'Outfit ' + (S().library.length + 1);
    const tags = $('#ot_tags').val().split(',').map(s => s.trim()).filter(Boolean);
    const thumb = state.img ? await resize(state.img, 256, 0.7) : '';
    S().library.unshift({ id: Date.now(), name, tags, thumb, groups: structuredClone(state.groups) });
    saveSettingsDebounced(); renderLib(); toastr.success('Saved');
}
function renderLib() {
    const q = ($('#ot_search').val() || '').toLowerCase();
    const items = S().library.filter(o => !q || (o.name + ' ' + o.tags.join(' ') + ' ' + fmt(o.groups)).toLowerCase().includes(q));
    $('#ot_lib').html(items.map(o => `<div class="ot-item" data-id="${o.id}">${o.thumb ? `<img src="${o.thumb}">` : ''}
        <div class="grow"><b>${esc(o.name)}</b><br><small>${esc(o.tags.join(', '))}</small></div>
        <span class="menu_button ot-load">Load</span><span class="menu_button ot-cp">Copy</span><span class="menu_button ot-del fa-solid fa-trash"></span></div>`).join('') || '<small>Nothing saved</small>');
}

function openModal() {
    const ctx = getContext();
    const profs = (ctx.extensionSettings.connectionManager?.profiles || []).filter(p => p.mode === 'cc');
    $('#ot_overlay').remove();
    const root = $(`<div id="ot_overlay"><div id="ot_panel">
        <div class="ot-head"><b>Outfit Tagger</b><span id="ot_close" class="menu_button fa-solid fa-xmark"></span></div>
        <div class="ot-row"><i class="fa-solid fa-circle-half-stroke"></i><input id="ot_op" type="range" min="0.1" max="1" step="0.05"><small id="ot_opv"></small></div>
        <select id="ot_prof" class="text_pole"><option value="">Choose connection profile (vision model)</option>${profs.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>
        <div class="ot-row">
            <label class="menu_button"><i class="fa-solid fa-image"></i> Picture<input id="ot_file" type="file" accept="image/*" hidden></label>
            <span id="ot_avatar" class="menu_button"><i class="fa-solid fa-user"></i> Char avatar</span>
            <span id="ot_go" class="menu_button"><i class="fa-solid fa-wand-magic-sparkles"></i> Describe</span>
        </div>
        <small>Tip: you can also paste an image.</small>
        <img id="ot_prev" hidden>
        <div id="ot_groups"></div>
        <div class="ot-row"><span id="ot_copy" class="menu_button">Copy all</span><span id="ot_note" class="menu_button">To char note</span></div>
        <div class="ot-row"><select id="ot_lore" class="text_pole" style="flex:1">${(world_names || []).map(n => `<option>${esc(n)}</option>`).join('')}</select><span id="ot_tolore" class="menu_button">To lorebook</span></div>
        <input id="ot_name" class="text_pole" placeholder="Outfit name">
        <input id="ot_tags" class="text_pole" placeholder="Library tags, comma separated">
        <span id="ot_save" class="menu_button"><i class="fa-solid fa-floppy-disk"></i> Save outfit + picture</span>
        <details><summary>Library</summary><input id="ot_search" class="text_pole" placeholder="Search name / tags / items"><div id="ot_lib"></div></details>
        <details><summary>Settings</summary>
            <small>Categories (comma separated)</small><input id="ot_cats" class="text_pole">
            <small>Prompt ({{categories}} is replaced)</small><textarea id="ot_prompt" class="text_pole" rows="6"></textarea>
            <span id="ot_reset" class="menu_button">Reset defaults</span></details>
    </div></div>`).appendTo('body');

    const fit = () => root.css('--ot-vh', window.innerHeight + 'px');
    const applyOp = () => { root.css('--ot-a', S().opacity); $('#ot_opv').text(Math.round(S().opacity * 100) + '%'); };
    fit(); applyOp();
    $(window).off('resize.ot').on('resize.ot', fit);
    $('#ot_op').val(S().opacity).on('input', e => { S().opacity = +e.target.value; applyOp(); saveSettingsDebounced(); });
    $('#ot_prof').val(S().profileId).on('change', e => { S().profileId = e.target.value; saveSettingsDebounced(); });
    $('#ot_cats').val(S().categories.join(', ')).on('change', e => { S().categories = e.target.value.split(',').map(s => s.trim()).filter(Boolean); saveSettingsDebounced(); renderGroups(); });
    $('#ot_prompt').val(S().prompt).on('change', e => { S().prompt = e.target.value; saveSettingsDebounced(); });
    $('#ot_reset').on('click', () => { Object.assign(S(), structuredClone({ ...DEFAULTS, library: S().library, profileId: S().profileId })); saveSettingsDebounced(); openModal(); });
    $('#ot_close').on('click', () => { $(window).off('resize.ot'); root.remove(); });
    $('#ot_file').on('change', async e => { if (e.target.files[0]) await setImage(await readFile(e.target.files[0])); });
    root.on('paste', async e => { const f = [...(e.originalEvent.clipboardData?.files || [])].find(f => f.type.startsWith('image/')); if (f) await setImage(await readFile(f)); });
    $('#ot_avatar').on('click', async () => {
        const c = ctx.characters[ctx.characterId]; if (!c) return toastr.warning('No character selected');
        try { await setImage(await readFile(await (await fetch('/characters/' + encodeURIComponent(c.avatar))).blob())); } catch { toastr.error('Could not load avatar'); }
    });
    $('#ot_go').on('click', generate);
    $('#ot_copy').on('click', () => copy(fmt(state.groups)));
    $('#ot_note').on('click', toNote);
    $('#ot_tolore').on('click', toLore);
    $('#ot_save').on('click', save);
    $('#ot_search').on('input', renderLib);
    $('#ot_groups').on('click', '.ot-chip', function () {
        const k = keys()[$(this).closest('.ot-group').data('g')];
        state.groups[k].splice($(this).data('i'), 1); renderGroups();
    }).on('keydown', '.ot-add', function (e) {
        if (e.key !== 'Enter' || !this.value.trim()) return;
        const k = keys()[$(this).closest('.ot-group').data('g')];
        (state.groups[k] ||= []).push(this.value.trim()); renderGroups();
    }).on('click', '.ot-copyg', function () {
        const k = keys()[$(this).closest('.ot-group').data('g')];
        copy(fmt({ [k]: state.groups[k] || [] }));
    });
    $('#ot_lib').on('click', '.ot-load,.ot-cp,.ot-del', function () {
        const id = $(this).closest('.ot-item').data('id'), o = S().library.find(x => x.id === id);
        if ($(this).hasClass('ot-cp')) return copy(fmt(o.groups));
        if ($(this).hasClass('ot-del')) { S().library = S().library.filter(x => x.id !== id); saveSettingsDebounced(); return renderLib(); }
        state.groups = structuredClone(o.groups); state.img = o.thumb;
        $('#ot_prev').attr('src', o.thumb).toggle(!!o.thumb); $('#ot_name').val(o.name); $('#ot_tags').val(o.tags.join(', ')); renderGroups();
    });
    if (state.img) $('#ot_prev').attr('src', state.img).show();
    renderGroups(); renderLib();
}

jQuery(() => {
    extension_settings[KEY] = Object.assign(structuredClone(DEFAULTS), extension_settings[KEY] || {});
    $('#extensionsMenu').append('<div id="ot_wand" class="list-group-item flex-container flexGap5"><div class="fa-solid fa-shirt extensionsMenuExtensionButton"></div><span>Outfit Tagger</span></div>');
    $('#ot_wand').on('click', openModal);
});
