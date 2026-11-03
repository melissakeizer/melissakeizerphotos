// The public feed follows editorial rows and page breaks, not image dimensions
// or a moving page-size threshold. Empty placeholders belong only in drafts.
export function resolvePhotoStreamPlan(plan, notes, questionCatalog) {
  const notesByImage = new Map(notes.map(note => [note.image, note]));
  const qaById = new Map(questionCatalog.map(block => [block.id, block]));
  const seen = new Set(), rowIds = new Set(), pageIds = new Set();
  const landscapeImages = new Set(), rowsByImage = new Map(), questionsByImage = new Map();
  if (plan.version !== 2 || !plan.pages?.length) throw new Error('PhotoStream needs explicit pages');
  const pages = plan.pages.map(page => {
    if (!page.id || pageIds.has(page.id)) throw new Error('Duplicate or missing PhotoStream page ID');
    pageIds.add(page.id);
    const pageNotes = [], pendingQuestions = [];
    for (const row of page.rows) {
      if (!row.id || rowIds.has(row.id)) throw new Error('Duplicate or missing PhotoStream row ID');
      rowIds.add(row.id);
      if (row.kind === 'qa') {
        const block = qaById.get(row.sourceId);
        if (!block) throw new Error(`Unfinished Q&A must stay in the private plan: ${row.topic}`);
        const groups = row.answerGroups ?? block.items.map((_, index) => [index]);
        const indexes = groups.flat();
        if (indexes.length !== block.items.length || new Set(indexes).size !== indexes.length || indexes.some(i => !Number.isInteger(i) || !block.items[i])) throw new Error('Q&A grouping must preserve every existing answer');
        if (row.questions.length !== groups.length) throw new Error('Q&A questions and answers do not match');
        pendingQuestions.push({ ...block, hidden: false, label: row.topic, items: groups.map((group, index) => ({ question: row.questions[index], answer: group.map(i => block.items[i].answer).join(' ') })) });
        continue;
      }
      if (!['pair', 'landscape'].includes(row.kind) || row.photos?.length !== (row.kind === 'pair' ? 2 : 1) || row.photos.some(image => !image)) throw new Error('Incomplete PhotoStream row');
      for (const image of row.photos) {
        if (seen.has(image)) throw new Error(`Duplicate PhotoStream photo: ${image}`);
        const note = notesByImage.get(image);
        if (!note) throw new Error(`PhotoStream plan references a missing entry: ${image}`);
        if (pendingQuestions.length) questionsByImage.set(image, pendingQuestions.splice(0).map(block => ({ ...block, beforeImage: image })));
        if (row.kind === 'landscape') landscapeImages.add(image);
        rowsByImage.set(image, row.id);
        seen.add(image); pageNotes.push(note);
      }
    }
    if (pendingQuestions.length || !pageNotes.length) throw new Error('PhotoStream page must contain photos and no trailing Q&A');
    return pageNotes;
  });
  return { pages, landscapeImages, rowsByImage, questionsByImage };
}
