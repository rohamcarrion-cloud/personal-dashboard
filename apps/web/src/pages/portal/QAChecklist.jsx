import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, HelpCircle, Download, RotateCcw, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ModuleHeader from '@/components/ModuleHeader.jsx';

const CHECKLIST_DATA = {
  'ROUTES': [
    { id: 'r1', label: 'All public routes load without errors (/, /blog, /projects, etc.)' },
    { id: 'r2', label: 'All portal routes load without errors (/portal/command-center/...)' },
    { id: 'r3', label: 'Catch-all 404 route works and is styled correctly' },
    { id: 'r4', label: 'Protected routes redirect to login if unauthenticated' }
  ],
  'DATA': [
    { id: 'd1', label: 'Records save correctly to PocketBase' },
    { id: 'd2', label: 'Draft content older than 14 days is flagged in Analytics' },
    { id: 'd3', label: 'Public records missing slugs are flagged' },
    { id: 'd4', label: 'Scheduled records missing dates are flagged' }
  ],
  'RELATIONSHIPS': [
    { id: 'rel1', label: 'Campaigns link correctly to Master Content' },
    { id: 'rel2', label: 'Projects link correctly to Campaigns' },
    { id: 'rel3', label: 'Media Library assets link correctly to Projects' },
    { id: 'rel4', label: 'Orphaned records are detected in Analytics' }
  ],
  'PUBLIC WEBSITE': [
    { id: 'pw1', label: 'Blog page renders published posts' },
    { id: 'pw2', label: 'Projects page renders public projects' },
    { id: 'pw3', label: 'Events page renders public events' },
    { id: 'pw4', label: 'Contact form submits successfully' }
  ],
  'COMMAND CENTER': [
    { id: 'cc1', label: 'All modules have consistent ModuleHeader' },
    { id: 'cc2', label: 'All empty states use EmptyState component' },
    { id: 'cc3', label: 'Buttons have consistent styling and hover states' },
    { id: 'cc4', label: 'Sidebar navigation highlights active route' }
  ],
  'CONTENT ENGINE': [
    { id: 'ce1', label: 'Master content creation works' },
    { id: 'ce2', label: 'Platform-specific versions generate correctly' },
    { id: 'ce3', label: 'Drafts save to respective collections' }
  ],
  'PUBLISHING QUEUE': [
    { id: 'pq1', label: 'Bulk actions (Draft, Schedule, Publish) work' },
    { id: 'pq2', label: 'Status badges render correct colors' },
    { id: 'pq3', label: 'Manual publishing tools expand correctly' }
  ],
  'CALENDAR': [
    { id: 'cal1', label: 'Month view renders all scheduled items' },
    { id: 'cal2', label: '30-Day list view renders correctly' },
    { id: 'cal3', label: 'Clicking a day opens modal with details' }
  ],
  'MOBILE': [
    { id: 'm1', label: 'Sidebar collapses into hamburger menu' },
    { id: 'm2', label: 'Tables scroll horizontally or stack' },
    { id: 'm3', label: 'Modals and forms are usable on small screens' }
  ],
  'ERROR HANDLING': [
    { id: 'eh1', label: 'Skeleton loaders show during data fetch' },
    { id: 'eh2', label: 'Form submissions show loading state on buttons' },
    { id: 'eh3', label: 'Success/Error toasts appear after operations' },
    { id: 'eh4', label: 'Failed API calls show inline error states' }
  ]
};

const CACHE_KEY = 'qaChecklistState';

export default function QAChecklist() {
  const [state, setState] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse QA state');
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(state));
    }
  }, [state, mounted]);

  const updateItem = (categoryId, itemId, field, value) => {
    setState(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [itemId]: {
          ...(prev[categoryId]?.[itemId] || { status: 'pending', notes: '' }),
          [field]: value
        }
      }
    }));
  };

  const resetChecklist = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      setState({});
      toast.success('Checklist reset');
    }
  };

  const exportReport = () => {
    let csv = 'Category,Task,Status,Notes\n';
    Object.entries(CHECKLIST_DATA).forEach(([category, items]) => {
      items.forEach(item => {
        const itemState = state[category]?.[item.id] || { status: 'pending', notes: '' };
        csv += `"${category}","${item.label}","${itemState.status}","${itemState.notes.replace(/"/g, '""')}"\n`;
      });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = React.useMemo(() => {
    let total = 0;
    let pass = 0;
    let fail = 0;
    let review = 0;

    Object.entries(CHECKLIST_DATA).forEach(([category, items]) => {
      items.forEach(item => {
        total++;
        const status = state[category]?.[item.id]?.status;
        if (status === 'pass') pass++;
        if (status === 'fail') fail++;
        if (status === 'review') review++;
      });
    });

    const completed = pass + fail + review;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return { total, pass, fail, review, completed, percentage };
  }, [state]);

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500 print:max-w-none print:p-0">
      <div className="print:hidden">
        <ModuleHeader 
          title="QA & Audit Checklist" 
          description="Comprehensive quality assurance checklist for platform launch."
          secondaryActions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-2"/> Print</Button>
              <Button variant="outline" size="sm" onClick={exportReport}><Download className="w-4 h-4 mr-2"/> Export</Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={resetChecklist}><RotateCcw className="w-4 h-4 mr-2"/> Reset</Button>
            </div>
          }
        />
      </div>

      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold">QA & Audit Report</h1>
        <p className="text-muted-foreground">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
      </div>

      <Card className="border-border shadow-sm sticky top-4 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 print:static print:shadow-none print:border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Overall Progress</span>
                <span>{stats.percentage}%</span>
              </div>
              <Progress value={stats.percentage} className="h-2" />
            </div>
            <div className="flex gap-4 text-sm font-medium">
              <div className="flex items-center gap-1.5 text-green-600"><CheckCircle2 className="w-4 h-4"/> {stats.pass} Pass</div>
              <div className="flex items-center gap-1.5 text-destructive"><XCircle className="w-4 h-4"/> {stats.fail} Fail</div>
              <div className="flex items-center gap-1.5 text-yellow-600"><HelpCircle className="w-4 h-4"/> {stats.review} Review</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {Object.entries(CHECKLIST_DATA).map(([category, items]) => (
          <Card key={category} className="border-border shadow-sm print:shadow-none print:border-b print:rounded-none">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/10 print:bg-transparent">
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {items.map(item => {
                const itemState = state[category]?.[item.id] || { status: 'pending', notes: '' };
                return (
                  <div key={item.id} className="p-4 flex flex-col lg:flex-row gap-4 hover:bg-muted/5 transition-colors print:break-inside-avoid">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground mb-2">{item.label}</p>
                      <Textarea 
                        placeholder="Add notes..." 
                        value={itemState.notes}
                        onChange={(e) => updateItem(category, item.id, 'notes', e.target.value)}
                        className="h-10 min-h-[40px] text-xs resize-none print:hidden"
                      />
                      {itemState.notes && <p className="hidden print:block text-xs text-muted-foreground mt-1">Notes: {itemState.notes}</p>}
                    </div>
                    <div className="flex items-start gap-2 shrink-0 print:hidden">
                      <Button 
                        variant={itemState.status === 'pass' ? 'default' : 'outline'} 
                        size="sm" 
                        className={itemState.status === 'pass' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => updateItem(category, item.id, 'status', 'pass')}
                      >
                        Pass
                      </Button>
                      <Button 
                        variant={itemState.status === 'fail' ? 'destructive' : 'outline'} 
                        size="sm"
                        onClick={() => updateItem(category, item.id, 'status', 'fail')}
                      >
                        Fail
                      </Button>
                      <Button 
                        variant={itemState.status === 'review' ? 'default' : 'outline'} 
                        size="sm"
                        className={itemState.status === 'review' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
                        onClick={() => updateItem(category, item.id, 'status', 'review')}
                      >
                        Review
                      </Button>
                    </div>
                    <div className="hidden print:block shrink-0 font-bold uppercase text-sm">
                      {itemState.status === 'pending' ? '[ ] PENDING' : `[X] ${itemState.status}`}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}