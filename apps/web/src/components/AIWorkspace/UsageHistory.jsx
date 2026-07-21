import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Zap, CheckCircle2, XCircle, History } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function UsageHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let filter = '';
      if (filterType !== 'all') {
        filter = `contentType = "${filterType}"`;
      }
      
      const records = await pb.collection('ai_usage').getList(1, 50, {
        filter,
        sort: '-created',
        $autoCancel: false
      });
      setHistory(records.items);
    } catch (error) {
      toast.error('Failed to load usage history');
    } finally {
      setLoading(false);
    }
  };

  const totalTokens = history.reduce((acc, curr) => acc + (curr.tokensUsed || 0), 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full max-w-sm" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-4">
          <Card className="border-border shadow-sm min-w-[200px]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Tokens Used</p>
                <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm min-w-[200px]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Generations</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="Blog">Blog</SelectItem>
            <SelectItem value="Social">Social</SelectItem>
            <SelectItem value="Newsletter">Newsletter</SelectItem>
            <SelectItem value="Press">Press</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Model</th>
                  <th className="px-6 py-4 font-medium">Tokens</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                      No generation history found.
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 text-foreground font-medium">
                        {format(new Date(record.created), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-background">{record.contentType}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="capitalize">{record.provider}</span> • {record.model}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {record.tokensUsed?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {(record.generationTime / 1000).toFixed(1)}s
                      </td>
                      <td className="px-6 py-4 text-right">
                        {record.success ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" /> Failed
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}