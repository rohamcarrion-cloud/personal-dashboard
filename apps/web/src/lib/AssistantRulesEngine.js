/**
 * Rule-based suggestion engine. Not AI model-powered.
 * 
 * This engine generates suggestions by analyzing patterns in your existing data
 * using deterministic rules. Each function examines specific conditions and
 * returns actionable suggestions based on those patterns.
 */

import pb from '@/lib/pocketbaseClient.js';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache = {
  timestamp: 0,
  data: null
};

const fetchAllData = async () => {
  const now = Date.now();
  if (cache.data && (now - cache.timestamp < CACHE_DURATION)) {
    return cache.data;
  }

  try {
    const [
      campaigns, projects, masterContent, blogPosts, socialPosts, 
      newsletters, pressMedia, contacts, tasks
    ] = await Promise.all([
      pb.collection('campaigns').getFullList({ $autoCancel: false }),
      pb.collection('projects').getFullList({ $autoCancel: false }),
      pb.collection('master_content').getFullList({ $autoCancel: false }),
      pb.collection('blog_posts').getFullList({ $autoCancel: false }),
      pb.collection('social_posts').getFullList({ $autoCancel: false }),
      pb.collection('newsletter_campaigns').getFullList({ $autoCancel: false }),
      pb.collection('press_media').getFullList({ $autoCancel: false }),
      pb.collection('contacts_opportunities').getFullList({ $autoCancel: false }),
      pb.collection('tasks').getFullList({ $autoCancel: false })
    ]);

    cache.data = {
      campaigns, projects, masterContent, blogPosts, socialPosts,
      newsletters, pressMedia, contacts, tasks
    };
    cache.timestamp = now;
    return cache.data;
  } catch (error) {
    console.error("Error fetching data for AssistantRulesEngine:", error);
    return null;
  }
};

/**
 * generateContentIdeas()
 * 
 * Rule: Identifies campaigns without recent content and projects without blog coverage.
 * - Analyzes campaigns with status='Active' that have no related master_content records
 * - Analyzes projects with status='Active' that have no related blog posts
 * Returns suggestions to create content for these gaps.
 */
export const generateContentIdeas = async () => {
  const data = await fetchAllData();
  if (!data) return [];
  
  const suggestions = [];
  
  // Rule: Active campaigns without master content
  data.campaigns.forEach(campaign => {
    const relatedMaster = data.masterContent.filter(m => m.campaignId === campaign.id);
    if (relatedMaster.length === 0 && campaign.status === 'Active') {
      suggestions.push({
        id: `idea-camp-${campaign.id}`,
        title: `Create content for ${campaign.name}`,
        description: `This active campaign has no master content. Consider drafting a core message.`,
        suggestionType: 'Content Idea',
        priority: 'High',
        actionType: 'Create Draft',
        actionData: { campaignId: campaign.id, title: `${campaign.name} Overview` }
      });
    }
  });

  // Rule: Active projects without blog posts
  data.projects.forEach(project => {
    const relatedBlogs = data.blogPosts.filter(b => b.title.includes(project.title));
    if (relatedBlogs.length === 0 && project.status === 'Active') {
      suggestions.push({
        id: `idea-proj-${project.id}`,
        title: `Blog Post: ${project.title} Update`,
        description: `Share an update about the active project "${project.title}".`,
        suggestionType: 'Content Idea',
        priority: 'Medium',
        actionType: 'Create Draft',
        actionData: { relatedProject: project.id, type: 'blog' }
      });
    }
  });

  return suggestions;
};

/**
 * generateNextActions()
 * 
 * Rule: Identifies content that needs immediate attention.
 * - Finds scheduled social posts with scheduledDate in the past (should be published)
 * - Identifies blog posts in Draft status for more than 14 days (stale drafts)
 * Returns actionable suggestions to move content forward.
 */
export const generateNextActions = async () => {
  const data = await fetchAllData();
  if (!data) return [];
  
  const suggestions = [];
  
  // Rule: Scheduled posts past their date should be published
  const now = new Date();
  data.socialPosts.forEach(post => {
    if (post.status === 'Scheduled' && post.scheduledDate && new Date(post.scheduledDate) <= now) {
      suggestions.push({
        id: `action-soc-${post.id}`,
        title: `Publish Scheduled Post`,
        description: `"${post.title}" is scheduled for past date. Review and publish.`,
        suggestionType: 'Action',
        priority: 'High',
        actionType: 'Update Status',
        actionData: { collection: 'social_posts', id: post.id, status: 'Published' }
      });
    }
  });

  // Rule: Drafts older than 14 days need review
  data.blogPosts.forEach(post => {
    if (post.status === 'Draft') {
      const draftAge = now - new Date(post.updated);
      if (draftAge > 14 * 24 * 60 * 60 * 1000) {
        suggestions.push({
          id: `action-blog-${post.id}`,
          title: `Review Stale Draft`,
          description: `Blog post "${post.title}" has been a draft for over 2 weeks.`,
          suggestionType: 'Action',
          priority: 'Low',
          actionType: 'Create Task',
          actionData: { title: `Review draft: ${post.title}` }
        });
      }
    }
  });

  return suggestions;
};

/**
 * generateCampaignHealth()
 * 
 * Rule: Analyzes campaign coverage across channels.
 * - Checks if active campaigns have social post coverage
 * - Checks if active campaigns have blog post coverage
 * Returns suggestions to fill missing channel coverage.
 */
export const generateCampaignHealth = async () => {
  const data = await fetchAllData();
  if (!data) return [];
  
  const suggestions = [];
  
  data.campaigns.forEach(campaign => {
    if (campaign.status !== 'Active') return;
    
    const relatedSocial = data.socialPosts.filter(s => s.campaignId === campaign.id);
    const relatedBlog = data.blogPosts.filter(b => b.campaignId === campaign.id);
    
    // Rule: Active campaigns should have social coverage
    if (relatedSocial.length === 0) {
      suggestions.push({
        id: `health-camp-soc-${campaign.id}`,
        title: `Missing Social Coverage`,
        description: `Campaign "${campaign.name}" has no social posts.`,
        suggestionType: 'Health',
        priority: 'Medium',
        actionType: 'Create Task',
        actionData: { title: `Create social posts for ${campaign.name}`, campaignId: campaign.id }
      });
    }
    
    // Rule: Active campaigns should have blog coverage
    if (relatedBlog.length === 0) {
      suggestions.push({
        id: `health-camp-blog-${campaign.id}`,
        title: `Missing Blog Coverage`,
        description: `Campaign "${campaign.name}" has no blog posts.`,
        suggestionType: 'Health',
        priority: 'Medium',
        actionType: 'Create Draft',
        actionData: { type: 'blog', campaignId: campaign.id }
      });
    }
  });

  return suggestions;
};

/**
 * generateFollowUpSuggestions()
 * 
 * Rule: Identifies contacts and press items needing follow-up.
 * - Checks if contact followUpDate is in the past (overdue)
 * - Checks if press items with status='Sent' have overdue followUpDate
 * - Prioritizes Investor contacts as Critical
 * Returns suggestions to schedule follow-ups.
 */
export const generateFollowUpSuggestions = async () => {
  const data = await fetchAllData();
  if (!data) return [];
  
  const suggestions = [];
  const now = new Date();
  
  // Rule: Contacts with overdue follow-up dates
  data.contacts.forEach(contact => {
    if (contact.followUpDate && new Date(contact.followUpDate) <= now) {
      suggestions.push({
        id: `follow-contact-${contact.id}`,
        title: `Follow up with ${contact.name}`,
        description: `Overdue follow-up for ${contact.contactType || 'contact'}.`,
        suggestionType: 'Follow-up',
        priority: contact.contactType === 'Investor' ? 'Critical' : 'High',
        actionType: 'Create Task',
        actionData: { title: `Follow up with ${contact.name}`, priority: 'High' }
      });
    }
  });

  // Rule: Press items with sent pitches and overdue follow-ups
  data.pressMedia.forEach(press => {
    if (press.followUpDate && new Date(press.followUpDate) <= now && press.pitchStatus === 'Sent') {
      suggestions.push({
        id: `follow-press-${press.id}`,
        title: `Follow up on Pitch: ${press.title}`,
        description: `Overdue follow-up for press pitch to ${press.outlet || 'outlet'}.`,
        suggestionType: 'Follow-up',
        priority: 'High',
        actionType: 'Create Task',
        actionData: { title: `Follow up pitch: ${press.title}` }
      });
    }
  });

  return suggestions;
};

/**
 * generateOverdueTasks()
 * 
 * Rule: Identifies tasks that are past their due date.
 * - Checks all tasks with status != 'Completed' and dueDate < today
 * - Prioritizes Critical tasks higher than others
 * Returns suggestions to complete or review overdue tasks.
 */
export const generateOverdueTasks = async () => {
  const data = await fetchAllData();
  if (!data) return [];
  
  const suggestions = [];
  const now = new Date();
  now.setHours(0,0,0,0);
  
  // Rule: Tasks past their due date that aren't completed
  data.tasks.forEach(task => {
    if (task.status !== 'Completed' && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (dueDate < now) {
        suggestions.push({
          id: `task-overdue-${task.id}`,
          title: `Overdue Task: ${task.title}`,
          description: `This task was due on ${dueDate.toLocaleDateString()}.`,
          suggestionType: 'Task',
          priority: task.priority === 'Critical' ? 'Critical' : 'High',
          actionType: 'Update Status',
          actionData: { collection: 'tasks', id: task.id, status: 'Completed' }
        });
      }
    }
  });

  return suggestions;
};

/**
 * generateRepurposingSuggestions()
 * 
 * Rule: Identifies content that can be repurposed across channels.
 * - Checks published blog posts without associated social posts
 * - Suggests creating social versions of blog content
 * Returns suggestions to maximize content value through repurposing.
 */
export const generateRepurposingSuggestions = async () => {
  const data = await fetchAllData();
  if (!data) return [];
  
  const suggestions = [];
  
  // Rule: Published blogs without social coverage should be repurposed
  data.blogPosts.forEach(blog => {
    if (blog.status === 'Published') {
      const relatedSocial = data.socialPosts.filter(s => s.relatedBlogPost === blog.id || (s.title && s.title.includes(blog.title)));
      if (relatedSocial.length === 0) {
        suggestions.push({
          id: `repurpose-blog-${blog.id}`,
          title: `Repurpose Blog to Social`,
          description: `"${blog.title}" has no associated social posts.`,
          suggestionType: 'Repurpose',
          priority: 'Medium',
          actionType: 'Create Draft',
          actionData: { type: 'social', sourceId: blog.id, title: `Social for: ${blog.title}` }
        });
      }
    }
  });

  return suggestions;
};