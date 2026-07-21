import pb from '@/lib/pocketbaseClient.js';

export const checkDataHealth = async () => {
  const results = [];
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayIso = now.toISOString();

  const checkCollection = async (collectionName, checks) => {
    try {
      const totalRes = await pb.collection(collectionName).getList(1, 1, { $autoCancel: false });
      const totalRecords = totalRes.totalItems;
      const issues = [];

      for (const check of checks) {
        try {
          const res = await pb.collection(collectionName).getList(1, 1, { filter: check.filter, $autoCancel: false });
          if (res.totalItems > 0) {
            issues.push({
              type: check.name,
              count: res.totalItems,
              severity: check.severity,
              filter: check.filter
            });
          }
        } catch (err) {
          // Ignore filter errors if field doesn't exist
        }
      }

      results.push({
        collection: collectionName,
        totalRecords,
        issues
      });
    } catch (error) {
      console.error(`Failed to check collection ${collectionName}:`, error);
    }
  };

  await Promise.all([
    checkCollection('blog_posts', [
      { name: 'Drafts older than 14 days', filter: `status = 'Draft' && updated < "${fourteenDaysAgo}"`, severity: 'Warning' },
      { name: 'Scheduled missing date', filter: `status = 'Scheduled' && scheduledDate = ""`, severity: 'Critical' },
      { name: 'Scheduled in the past', filter: `status = 'Scheduled' && scheduledDate < "${todayIso}"`, severity: 'Critical' },
      { name: 'Missing slug', filter: `slug = ""`, severity: 'Critical' }
    ]),
    checkCollection('social_posts', [
      { name: 'Drafts older than 14 days', filter: `status = 'Draft' && updated < "${fourteenDaysAgo}"`, severity: 'Warning' },
      { name: 'Scheduled missing date', filter: `status = 'Scheduled' && scheduledDate = ""`, severity: 'Critical' },
      { name: 'Scheduled in the past', filter: `status = 'Scheduled' && scheduledDate < "${todayIso}"`, severity: 'Critical' },
      { name: 'Failed posts older than 7 days', filter: `status = 'Failed' && updated < "${sevenDaysAgo}"`, severity: 'Warning' }
    ]),
    checkCollection('projects', [
      { name: 'Public but missing slug', filter: `publicVisibility = true && slug = ""`, severity: 'Critical' },
      { name: 'Active but no timeline', filter: `status = 'Active' && timeline = ""`, severity: 'Info' }
    ]),
    checkCollection('tasks', [
      { name: 'Overdue tasks', filter: `status != 'Completed' && status != 'Archived' && dueDate != "" && dueDate < "${todayIso}"`, severity: 'Warning' },
      { name: 'Missing priority', filter: `priority = ""`, severity: 'Info' }
    ]),
    checkCollection('campaigns', [
      { name: 'Active but missing dates', filter: `status = 'Active' && (startDate = "" || endDate = "")`, severity: 'Critical' }
    ])
  ]);

  return results;
};