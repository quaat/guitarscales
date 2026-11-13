# Accidental defaults

Choose a sharp/flat display preference from the selected tonic and mode's
parent key signature. Manual changes apply until the root, scale family, or
mode changes. Explicit `accidental=sharp|flat` share links keep that preference
when opened; links without the parameter use the automatic default. Reset
returns to C Ionian with sharps. Changing scale family selects its first mode.

For the diatonic modes, these tonic spellings default to flats; all other
pitch classes default to sharps:

| Mode | Flat-side tonics |
| --- | --- |
| Ionian | F, Bb, Eb, Ab, Db, Gb |
| Dorian | G, C, F, Bb, Eb, Ab |
| Phrygian | A, D, G, C, F, Bb |
| Lydian | Bb, Eb, Ab, Db, Gb |
| Mixolydian | C, F, Bb, Eb, Ab, Db |
| Aeolian | D, G, C, F, Bb, Eb |
| Locrian | E, A, D, G, C, F |

To find a mode's parent major tonic, subtract its original major-scale degree
offset (0, 2, 4, 5, 7, 9, 11 semitones). For example, C Dorian belongs to Bb
major, F Lydian belongs to C major, and D Aeolian belongs to F major. The
zero-accidental signature uses the requested sharp default.

At the six-accidental enharmonic tie, prefer Gb major to F# major as requested.
Keep a natural B tonic on the sharp side: B Lydian belongs to F# major;
using Gb major would instead require calling the tonic Cb. The same natural
tonic preference applies to modes of the minor families at that tie.

Harmonic and ascending melodic minor use their underlying natural-minor key
signature; raised degrees are chromatic alterations, not a new signature.
Their modes inherit the signature of their parent minor tonic (subtract the
selected mode's original interval, then add three semitones to find the
relative major). Minor pentatonic modes and blues inherit the parent minor
signature; major pentatonic inherits the major signature.

Whole-tone and diminished scales have no unique diatonic key signature. For
these, tonic-major preference is a display convention, not a theory claim.
The manual accidental toggle remains available for every scale.

This setting alone does not implement contextual note spelling. For example,
F# major needs E#, and D harmonic minor needs both Bb and C#. Those require a
separate spelling change; neither a global sharp nor flat lookup can do it.

## References

Consulted the online Open Music Theory textbook source at commit
`a907aa015f7ec54b925ddb070d2d36aecd0dc705`:

- [Key signatures and the circle of fifths](https://github.com/OpenMusicTheory/openmusictheory.github.io/blob/a907aa015f7ec54b925ddb070d2d36aecd0dc705/keySignatures.md): signature order and relative major/minor keys.
- [Collections and scales](https://github.com/OpenMusicTheory/openmusictheory.github.io/blob/a907aa015f7ec54b925ddb070d2d36aecd0dc705/scales2.md): modes share a diatonic collection; symmetric collections.
- [Scales and scale degrees](https://github.com/OpenMusicTheory/openmusictheory.github.io/blob/a907aa015f7ec54b925ddb070d2d36aecd0dc705/scales.md): harmonic and melodic minor alterations.

The enharmonic tie-break and symmetric-scale fallback above are application
policies, rather than universal key-signature rules.
