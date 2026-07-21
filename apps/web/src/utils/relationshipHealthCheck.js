import pb from '@/lib/pocketbaseClient.js';

export const checkRelationshipHealth = async () => {
  const results = [];

  const checkRelation = async (name, parentColl, childColl, relationField) => {
    try {
      const parents = await pb.collection(parentColl).getFullList({ fields: 'id', $autoCancel: false });
      const children = await pb.collection(childColl).getFullList({ fields: `id,${relationField}`, $autoCancel: false });

      const parentIds = new Set(parents.map(p => p.id));
      let connectedCount = 0;
      let orphanedCount = 0;
      let brokenCount = 0;

      // Check children for broken links (referencing a parent that doesn't exist)
      children.forEach(child => {
        const refId = child[relationField];
        if (refId) {
          if (parentIds.has(refId)) {
            connectedCount++;
          } else {
            brokenCount++;
          }
        }
      });

      // Check parents for orphans (no children referencing them)
      const referencedParentIds = new Set(children.map(c => c[relationField]).filter(Boolean));
      parents.forEach(parent => {
        if (!referencedParentIds.has(parent.id)) {
          orphanedCount++;
        }
      });

      const totalPossible = parents.length + children.length;
      const healthScore = totalPossible === 0 ? 100 : Math.round(((totalPossible - brokenCount) / totalPossible) * 100);

      results.push({
        relationship: name,
        parentCount: parents.length,
        connectedCount,
        orphanedCount,
        brokenCount,
        healthScore: Math.max(0, Math.min(100, healthScore))
      });
    } catch (error) {
      console.error(`Failed to check relationship ${name}:`, error);
      results.push({
        relationship: name,
        parentCount: 0,
        connectedCount: 0,
        orphanedCount: 0,
        brokenCount: 0,
        healthScore: 0,
        error: error.message
      });
    }
  };

  await Promise.all([
    checkRelation('Campaigns → Master Content', 'campaigns', 'master_content', 'campaignId'),
    checkRelation('Campaigns → Social Posts', 'campaigns', 'social_posts', 'campaignId'),
    checkRelation('Campaigns → Blog Posts', 'campaigns', 'blog_posts', 'campaignId'),
    checkRelation('Campaigns → Newsletters', 'campaigns', 'newsletter_campaigns', 'campaignId'),
    checkRelation('Campaigns → Press Media', 'campaigns', 'press_media', 'campaignId'),
    checkRelation('Projects → Campaigns', 'projects', 'campaigns', 'relatedProject'),
    checkRelation('Projects → Media Library', 'projects', 'media_library', 'relatedProject'),
    checkRelation('Projects → Tasks', 'projects', 'tasks', 'relatedProject')
  ]);

  return results;
};