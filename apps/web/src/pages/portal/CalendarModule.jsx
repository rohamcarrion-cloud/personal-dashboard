import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, addDays, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, FileText, Share2, Mail, PartyPopper, Newspaper, Target, CheckCircle2, Archive } from 'lucide-react';

const CalendarModule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [allContent, setAllContent] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [typeFilter, setTypeFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  
  const [dayModalOpen, setDayModalOpen] = useState(false);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const opts = { $autoCancel: false, expand: 'campaignId' };

      const [eventsData, blogData, socialData, newsletterData, pressData] = await Promise.all([
        pb.collection('events').getFullList({ filter: `date != ""`, ...opts }).catch(() => []),
        pb.collection('blog_posts').getFullList({ filter: `scheduledDate != ""`, ...opts }).catch(() => []),
        pb.collection('social_posts').getFullList({ filter: `scheduledDate != ""`, ...opts }).catch(() => []),
        pb.collection('newsletter_campaigns').getFullList({ filter: `scheduledDate != ""`, ...opts }).catch(() => []),
        pb.collection('press_media').getFullList({ filter: `followUpDate != ""`, ...opts }).catch(() => []),
      ]);

      const normalizeItem = (item, type, dateField, color, icon) => {
        const rawDate = item[dateField];
        if (!rawDate) return null;
        
        const parsedDate = new Date(rawDate);
        if (isNaN(parsedDate.getTime())) return null;

        return {
          ...item,
          unifiedType: type,
          unifiedDate: parsedDate,
          color,
          icon
        };
      };

      const combined = [
        ...eventsData.map(e => normalizeItem(e, 'Event', 'date', 'bg-orange-500/10 text-orange-700 border-orange-200', PartyPopper)),
        ...blogData.map(b => normalizeItem(b, 'Blog', 'scheduledDate', 'bg-blue-500/10 text-blue-700 border-blue-200', FileText)),
        ...socialData.map(s => normalizeItem(s, 'Social', 'scheduledDate', 'bg-purple-500/10 text-purple-700 border-purple-200', Share2)),
        ...newsletterData.map(n => normalizeItem(n, 'Newsletter', 'scheduledDate', 'bg-green-500/10 text-green-700 border-green-200', Mail)),
        ...pressData.map(p => normalizeItem(p, 'Press', 'followUpDate', 'bg-red-500/10 text-red-700 border-red-200', Newspaper)),
      ].filter(Boolean);

      setAllContent(combined.sort((a, b) => a.unifiedDate - b.unifiedDate));
    } catch (error) {
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = allContent.filter(item => {
    if (typeFilter !== 'all' && item.unifiedType !== typeFilter) return false;
    if (typeFilter === 'Social' && platformFilter !== 'all') {
      if (!item.title.toLowerCase().includes(platformFilter.toLowerCase())) return false;
    }
    return true;
  });

  const getItemsForDate = (date) => {
    return filteredContent.filter(item => isSameDay(item.unifiedDate, date));
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setDayModalOpen(true);
  };

  const handleQuickAction = async (item, action) => {
    try {
      const collectionMap = {
        'Social': 'social_posts',
        'Blog': 'blog_posts',
        'Newsletter': 'newsletter_campaigns',
        'Event': 'events',
        'Press': 'press_media'
      };
      const coll = collectionMap[item.unifiedType];
      if (!coll) return;

      if (action === 'publish') {
        const payload = item.unifiedType === 'Press' ? { pitchStatus: 'Published' } : { status: 'Published' };
        await pb.collection(coll).update(item.id, payload, { $autoCancel: false });
        toast.success('Marked as published');
      } else if (action === 'archive') {
        const payload = item.unifiedType === 'Press' ? { pitchStatus: 'Archived' } : { status: 'Archived' };
        await pb.collection(coll).update(item.id, payload, { $autoCancel: false });
        toast.success('Archived');
      }
      fetchCalendarData();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  const today = new Date();
  today.setHours(0,0,0,0);
  const upcoming30Days = filteredContent.filter(item => {
    return item.unifiedDate >= today && item.unifiedDate <= addDays(today, 30);
  });

  if (loading) {
    return <div className="space-y-4 max-w-7xl mx-auto"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Unified Calendar</h1>
        <p className="text-muted-foreground">View and manage all scheduled content, events, and campaigns in one place.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border shadow-sm items-start sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">Type:</span>
          {['all', 'Blog', 'Social', 'Newsletter', 'Event', 'Press'].map(type => (
            <Button 
              key={type} 
              variant={typeFilter === type ? 'default' : 'outline'} 
              size="sm"
              onClick={() => { setTypeFilter(type); if(type !== 'Social') setPlatformFilter('all'); }}
              className="rounded-full h-8"
            >
              {type === 'all' ? 'All Types' : type}
            </Button>
          ))}
        </div>

        {typeFilter === 'Social' && (
          <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-4 mt-1 sm:mt-0 w-full sm:w-auto">
             <span className="text-sm font-medium text-muted-foreground mr-2">Platform:</span>
             {['all', 'LinkedIn', 'Twitter', 'Facebook', 'Instagram'].map(plat => (
               <Button
                 key={plat}
                 variant={platformFilter === plat ? 'secondary' : 'ghost'}
                 size="sm"
                 onClick={() => setPlatformFilter(plat)}
                 className="h-8 text-xs"
               >
                 {plat === 'all' ? 'All Platforms' : plat}
               </Button>
             ))}
          </div>
        )}
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="calendar">Month View</TabsTrigger>
          <TabsTrigger value="upcoming">30-Day List</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6 outline-none">
          <Card className="apple-card border border-border shadow-sm overflow-hidden">
            <CardContent className="p-0 sm:p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { if(date) handleDayClick(date); }}
                className="w-full max-w-full"
                classNames={{
                  months: "w-full flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "w-full space-y-4",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex w-full",
                  head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-full h-14 sm:h-28 border border-border/50",
                  day: "h-full w-full p-1 font-normal aria-selected:opacity-100 hover:bg-muted flex flex-col items-start justify-start",
                  day_selected: "bg-primary/5 text-foreground hover:bg-primary/10 focus:bg-primary/10",
                  day_today: "bg-accent text-accent-foreground font-bold",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dayItems = getItemsForDate(date);
                    return (
                      <div className="w-full h-full flex flex-col items-start">
                        <span className="mb-1 ml-1 font-medium">{date.getDate()}</span>
                        <div className="flex flex-col gap-1 w-full px-1 overflow-hidden">
                          {dayItems.slice(0, 3).map((item, i) => (
                            <div key={i} className={`text-[10px] px-1.5 py-0.5 rounded truncate w-full text-left border ${item.color}`}>
                              {item.title}
                            </div>
                          ))}
                          {dayItems.length > 3 && (
                            <div className="text-[10px] text-muted-foreground font-medium ml-1">
                              +{dayItems.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4 outline-none">
          {upcoming30Days.length === 0 ? (
            <div className="text-center py-16 bg-muted rounded-xl border border-border">
              <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No upcoming content</h3>
              <p className="text-muted-foreground">Your schedule is clear for the next 30 days.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcoming30Days.map(item => {
                const Icon = item.icon;
                const isPublished = item.status === 'Published' || item.pitchStatus === 'Published';
                return (
                  <div key={item.id} className="bg-card border border-border hover:bg-muted/50 transition-colors p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-4 group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg text-foreground truncate max-w-[300px]">{item.title}</h4>
                          <Badge variant="outline" className={item.color}>{item.unifiedType}</Badge>
                          <Badge variant={isPublished ? 'default' : 'secondary'}>{item.status || item.pitchStatus}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center font-medium">
                            <CalendarIcon className="w-3.5 h-3.5 mr-1.5"/> 
                            {format(item.unifiedDate, 'MMM d, yyyy h:mm a')}
                          </span>
                          {item.expand?.campaignId && (
                            <span className="flex items-center text-primary">
                              <Target className="w-3.5 h-3.5 mr-1.5"/> {item.expand.campaignId.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      {!isPublished && (
                        <Button variant="secondary" size="sm" onClick={() => handleQuickAction(item, 'publish')}>
                          <CheckCircle2 className="w-4 h-4 mr-1.5"/> Publish
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleQuickAction(item, 'archive')}>
                        <Archive className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={dayModalOpen} onOpenChange={setDayModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-primary"/>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {getItemsForDate(selectedDate).length === 0 ? (
              <p className="text-muted-foreground py-8 text-center bg-muted/30 rounded-xl border border-border">No items scheduled for this day.</p>
            ) : (
              getItemsForDate(selectedDate).map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-foreground text-lg leading-tight">{item.title}</h4>
                          <span className="text-sm font-medium text-foreground whitespace-nowrap ml-4">
                            {format(item.unifiedDate, 'h:mm a')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={item.color}>{item.unifiedType}</Badge>
                          <Badge variant="secondary">{item.status || item.pitchStatus}</Badge>
                        </div>
                        {item.expand?.campaignId && (
                          <div className="mt-3 inline-flex items-center px-2.5 py-1 rounded-md bg-primary/5 text-primary text-xs font-medium border border-primary/20">
                            <Target className="w-3 h-3 mr-1.5"/> Campaign: {item.expand.campaignId.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarModule;