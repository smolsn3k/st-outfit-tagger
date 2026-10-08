# Outfit Tagger

A SillyTavern extension that makes describing outfits for **NovelAI** easier. Give it a picture, and a vision model turns the clothing into short Danbooru/NovelAI-style tags you can edit, copy, and reuse.

## What it does

- Reads an image (upload, paste, or the character's avatar) and lists only the worn items: clothing, colors, materials, patterns. It ignores the person, pose, and background.
- Outputs lowercase tags of 2-5 words, ready to paste into a NovelAI prompt.
- Lets you tidy the result: click a tag to remove it, type to add one.
- Saves outfits to a searchable library with a thumbnail, name, and your own tags.
- Sends the result to the character note or a lorebook entry.

## Install

1. In SillyTavern, open **Extensions → Install extension**.
2. Paste the repo URL: `https://github.com/smolsn3k/st-outfit-tagger`
3. Reload SillyTavern.

## Requirements

A **Connection Manager profile** (Chat Completion) that uses a **vision-capable model**. The extension sends the image through that profile.

## Usage

1. Click the wand menu (Extensions menu) and choose **Outfit Tagger**.
2. Pick your vision connection profile.
3. Add a picture with **Picture**, paste an image, or press **Char avatar**.
4. Press **Describe**.
5. Edit the tags, then copy, send, or save them.

## Modes

Switch with the tabs at the top of the panel.

**Categories**
Tags are sorted into groups. The defaults are Outfit, Accessories, Uniform, Footwear, Headwear, and Legwear. You can change the list in **Settings**.

**Whole outfit**
All tags go into one single line. The line's name is editable (default "Outfit") and is used when copying or sending.

## Output format

Each group is written as a name followed by quoted tags:

```
Outfit("white blouse", "black pleated skirt")

Footwear("brown loafers", "white socks")
```

In Whole outfit mode there is just one line:

```
Outfit("white blouse", "black pleated skirt", "brown loafers")
```

## Buttons

| Button | Action |
| --- | --- |
| Copy all / Copy | Copies everything, or one group |
| To char note | Appends the tags to the character's depth note |
| To lorebook | Creates an entry in the chosen lorebook, keyed by the outfit name |
| Save outfit + picture | Stores the outfit in the library |

## Settings

- **Categories:** comma-separated group names (Categories mode).
- **Prompt:** the instruction sent to the model. `{{categories}}` is replaced with your category list. Whole outfit mode has its own prompt.
- **Reset defaults:** restores the prompts and categories. Your library, profile, mode, and line name are kept.
- **Opacity slider:** adjusts the panel transparency.

## Tips

- If the reply has no tags, check the browser console for the raw model output.
- Small or unclear images give weaker results. A clear full-body or upper-body shot works best.
- Adjust the prompt if your model adds things you don't want.

## License

AGPL-3.0. See `LICENSE`.
