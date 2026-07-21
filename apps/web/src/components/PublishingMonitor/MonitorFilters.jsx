import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function MonitorFilters({ filters, setFilters }) {
  const handleReset = () => {
    setFilters({
      platform: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const activeFilterCount = [
    filters.platform !== 'all',
    filters.status !== 'all',
    filters.dateFrom !== '',
    filters.dateTo !== ''
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between transition-all">
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto items-start sm:items-center">
        <div className="w-full sm:w-[160px]">
          <Select value={filters.platform} onValueChange={(val) => setFilters({ ...filters, platform: val })}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">X (Twitter)</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[160px]">
          <Select value={filters.status} onValueChange={(val) => setFilters({ ...filters, status: val })}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="retrying">Retrying</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input 
            type="date" 
            value={filters.dateFrom} 
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full sm:w-[140px] bg-background text-sm"
            title="From Date"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <Input 
            type="date" 
            value={filters.dateTo} 
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full sm:w-[140px] bg-background text-sm"
            title="To Date"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        {activeFilterCount > 0 && (
          <span className="text-sm font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}