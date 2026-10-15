# Outfit Tagger

A SillyTavern extension that makes describing outfits for **NovelAI** easier. Give it a picture, and a vision model turns the clothing into short Danbooru/NovelAI-style tags you can edit, copy, and reuse.

## What it does

- Reads an image (upload, paste, or the character's avatar) and lists either the worn items (clothing, colors, materials, patterns) or the character's physical appearance, depending on the mode.
- Outputs lowercase tags of 2-5 words, ready to paste into a NovelAI prompt.
- Lets you tidy the result: click a tag to remove it, type to add one.
- Saves results to a searchable library with a thumbnail, name, and your own tags.
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

**Appearance**
Describes the character's body and face instead of the clothes: age, build, height, skin, face, hair, eyes. Like Whole outfit it is one renamable line (default "Appearance") with its own prompt. Example output:

```
Appearance("adult", "slim body", "long wavy black hair", "dark blue eyes", "165cm height")
```

**Pose**
Describes only the pose: posture, head tilt, arms, hands, legs, gaze, body orientation. One renamable line (default "Pose") with its own prompt.

```
Pose("standing", "hand on hip", "head tilt", "looking at viewer")
```

**Custom**
Tick the aspects you want described. Each ticked aspect becomes its own group: Pose, Clothes, Appearance, Expression, Background, Vibe, Aesthetics, Lighting, Camera angle, Colors, Props. You can also type extra aspects (comma separated) in the field below the checkboxes. The model is told to describe only what is ticked.

```
Pose("sitting", "crossed legs")
Lighting("soft light", "warm tones", "backlit")
Background("classroom", "window", "bokeh")
```

## Output format

Pick it from the **Output format** dropdown above the Copy button:

| Option | Result |
| --- | --- |
| `name("tag", "tag")` | `clothes("shoes", "coat")` |
| `name(tag, tag)` | `clothes(shoes, coat)` |
| `name: tag, tag` | `clothes: shoes, coat` |
| `tag, tag (no names)` | `shoes, coat` |

The format applies to Copy, To char note, To lorebook, and library search.

## Details field

The text box under the buttons works in every mode. Write what you want added or watched for (for example `femboy, feminine face, 165cm, curtain bangs`) and it is sent to the model along with the prompt. Leave it empty to use the prompt alone. The text is remembered between sessions.

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
| Clear all / Clear | Clear all empties every group, the picture, and the name and library tag fields. Clear empties one group |
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
