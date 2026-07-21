import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search, Calendar, MapPin, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { format, startOfDay } from 'date-fns';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');
  const [types, setTypes] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, typeFilter, dateFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const allRecords = await pb.collection('events').getList(1, 100, { $autoCancel: false });

      let filter = 'publicVisibility=true';
      const filters = [filter];
      
      if (searchTerm) filters.push(`(title ~ "${searchTerm}" || location ~ "${searchTerm}")`);
      if (typeFilter !== 'all') filters.push(`eventType = "${typeFilter}"`);
      
      const todayStr = startOfDay(new Date()).toISOString().split('T')[0];
      if (dateFilter === 'upcoming') {
        filters.push(`date >= "${todayStr}"`);
      } else if (dateFilter === 'past') {
        filters.push(`date < "${todayStr}"`);
      }
      
      const records = await pb.collection('events').getList(1, 50, {
        filter: filters.join(' && '),
        sort: dateFilter === 'past' ? '-date' : 'date',
        $autoCancel: false,
      });

      setEvents(records.items);

      if (types.length === 0) {
        const uniqueTypes = [...new Set(allRecords.items.filter(e => e.publicVisibility === true).map(e => e.eventType).filter(Boolean))];
        setTypes(uniqueTypes);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Events - Roham Carrion</title>
        <meta name="description" content="Upcoming speaking engagements, conferences, and public events." />
      </Helmet>

      <Header />

      <main className="flex-1 pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Events</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Speaking engagements, conferences, and public appearances.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl bg-card"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-card">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl bg-card">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
              <SelectItem value="all">All Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 w-full rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchEvents}>Try Again</Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Check back later for new announcements.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              return (
                <div key={event.id} className="apple-card p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-secondary text-secondary-foreground shrink-0">
                    <span className="text-sm font-semibold uppercase text-primary">{format(eventDate, 'MMM')}</span>
                    <span className="text-3xl font-bold">{format(eventDate, 'd')}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{event.eventType || 'Event'}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                        event.status === 'Completed' ? 'bg-secondary text-secondary-foreground' :
                        event.status === 'Cancelled' ? 'bg-destructive/10 text-destructive' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{event.title}</h3>
                    <p className="text-muted-foreground mb-4 max-w-3xl">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {event.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                      {(event.startTime || event.endTime) && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {event.registrationLink && event.status !== 'Completed' && event.status !== 'Cancelled' && (
                    <a 
                      href={event.registrationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shrink-0"
                    >
                      Register <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;