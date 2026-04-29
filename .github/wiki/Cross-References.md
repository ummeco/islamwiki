# Cross-References

Islam.wiki links related content across sections. A Quran ayah links to relevant Hadith. A Hadith links back to the ayah it explains. A person's biography links to the Hadith they narrated.

## Quran to Hadith

On every ayah page, related Hadith are shown in a sidebar. The mapping is built from:

1. **Tafsir citations** -- Ibn Kathir's tafsir frequently cites specific Hadith to explain an ayah. These citations are extracted and stored as explicit references.
2. **Hadith text matching** -- Hadith that directly quote a Quranic phrase are linked bidirectionally.
3. **Seerah context** -- Hadith describing the circumstances of revelation (Asbab al-Nuzul) are linked to the relevant ayah.

## Hadith to Quran

On every Hadith page, related Quranic ayahs are shown where:

- The Hadith text contains a direct Quran quotation
- The Hadith was narrated in the context of explaining a specific ayah
- The Hadith tafsir links it to an ayah in the database

## People to content

Biographical entries link to:

- **Hadith narrated** -- every Hadith narrated by a person links back to their biography
- **Hadith about them** -- Hadith where the person is the subject, not just the narrator
- **Seerah events** -- events on the timeline where they participated
- **Teachers and students** -- other scholars in the database who were their teachers or students

## Books to sources

Classical books that cite or interpret Quran and Hadith are linked to the specific ayahs and Hadith they reference, where identifiable.

## Data format

Cross-references are stored as explicit link records in the database:

```
iw_cross_refs (source_type, source_id, target_type, target_id, ref_type)
```

Where `ref_type` is one of: `tafsir_cite`, `direct_quote`, `subject`, `context`, `explains`.

## See Also

- [[Content-Sources]] -- source material for the reference data
- [[API-Reference]] -- access cross-reference data via API
- [[Search]] -- search surfaces cross-referenced content in results
