import { ProcessedTicket, FeedbackEntry } from '@/types/ticket';
import { useTickets } from '@/contexts/TicketContext';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { EnvironmentalBadge } from '@/components/dashboard/EnvironmentalBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  X, 
  MapPin, 
  Clock, 
  Star, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  AlertTriangle,
  Zap,
  Target,
  TrendingUp,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';

interface TicketDetailDrawerProps {
  ticket: ProcessedTicket | null;
  onClose: () => void;
}

export function TicketDetailDrawer({ ticket, onClose }: TicketDetailDrawerProps) {
  const { addFeedback, feedback } = useTickets();
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const ticketFeedback = useMemo(() => {
    if (!ticket) return { correct: 0, wrong: 0, notes: 0 };
    const ticketEntries = feedback.filter(f => f.ticketId === ticket.ticket_id);
    return {
      correct: ticketEntries.filter(f => f.type === 'correct').length,
      wrong: ticketEntries.filter(f => f.type === 'wrong').length,
      notes: ticketEntries.filter(f => f.type === 'note').length,
    };
  }, [ticket, feedback]);

  const handleFeedback = (type: 'correct' | 'wrong') => {
    if (!ticket) return;
    const entry: FeedbackEntry = {
      ticketId: ticket.ticket_id,
      type,
      timestamp: new Date().toISOString(),
    };
    addFeedback(entry);
  };

  const handleAddNote = () => {
    if (!ticket || !noteText.trim()) return;
    const entry: FeedbackEntry = {
      ticketId: ticket.ticket_id,
      type: 'note',
      note: noteText.trim(),
      timestamp: new Date().toISOString(),
    };
    addFeedback(entry);
    setNoteText('');
    setShowNoteInput(false);
  };

  if (!ticket) return null;

  const { scoreBreakdown } = ticket;

  return (
    <Sheet open={!!ticket} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto scrollbar-thin">
        <SheetHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-mono">{ticket.ticket_id}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={ticket.riskLevel} showDot />
            <span className="text-2xl font-bold">{ticket.priorityScore.toFixed(0)}</span>
            <span className="text-sm text-muted-foreground">Priority Score</span>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {ticket.type.map((type) => (
                <Badge key={type} variant="secondary">{type.replace(/_/g, ' ')}</Badge>
              ))}
            </div>
            
            <p className="text-sm">{ticket.comment}</p>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <div>{ticket.address}</div>
                <div>{ticket.subdistrict}, {ticket.district}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                {format(new Date(ticket.timestamp), 'MMM dd, yyyy HH:mm')}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-4 h-4 text-risk-medium" />
                {ticket.star} / 5
              </div>
              {ticket.count_reopen > 0 && (
                <div className="flex items-center gap-1 text-risk-high">
                  <RefreshCw className="w-4 h-4" />
                  Reopened {ticket.count_reopen}x
                </div>
              )}
            </div>
          </div>

          {/* Photos */}
          {ticket.photo && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Photos</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  <img src={ticket.photo} alt="Issue" className="object-cover w-full h-full" />
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">Before</span>
                </div>
                {ticket.photo_after && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                    <img src={ticket.photo_after} alt="After resolution" className="object-cover w-full h-full" />
                    <span className="absolute bottom-1 left-1 text-[10px] bg-risk-low/80 text-white px-1.5 py-0.5 rounded">After</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* AI Explainability Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              AI Score Breakdown
            </h4>

            {/* Base Components */}
            <div className="space-y-3">
              {Object.entries(scoreBreakdown.baseComponents).map(([key, data]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono text-xs">
                      {(data.value * 100).toFixed(0)}% x {data.weight}
                    </span>
                  </div>
                  <Progress value={data.value * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {data.factors.slice(0, 2).join(' | ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Boosts */}
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Boosts Applied</h5>
              
              {scoreBreakdown.boosts.disasterRisk.value > 0 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-risk-critical/10 border border-risk-critical/20">
                  <AlertTriangle className="w-4 h-4 text-risk-critical mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-risk-critical">
                      Disaster Risk +{(scoreBreakdown.boosts.disasterRisk.value * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scoreBreakdown.boosts.disasterRisk.reason}
                    </div>
                  </div>
                </div>
              )}

              {scoreBreakdown.boosts.climateBoost.value > 0 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-accent/10 border border-accent/20">
                  <TrendingUp className="w-4 h-4 text-accent mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-accent">
                      Climate Boost +{(scoreBreakdown.boosts.climateBoost.value * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scoreBreakdown.boosts.climateBoost.reason}
                    </div>
                  </div>
                </div>
              )}

              {scoreBreakdown.boosts.disasterRisk.value === 0 && scoreBreakdown.boosts.climateBoost.value === 0 && (
                <div className="text-xs text-muted-foreground italic">No active boosts</div>
              )}
            </div>

            {/* Keyword Matches */}
            {scoreBreakdown.keywordMatches.length > 0 && (
              <div className="space-y-1">
                <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keyword Matches</h5>
                <div className="flex flex-wrap gap-1">
                  {scoreBreakdown.keywordMatches.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sensitive Place Proximity */}
            {scoreBreakdown.nearSensitivePlace.isNear && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-risk-high/10 border border-risk-high/20">
                <Target className="w-4 h-4 text-risk-high" />
                <div className="text-sm">
                  Near <span className="font-medium">{scoreBreakdown.nearSensitivePlace.placeType}</span>
                  <span className="text-muted-foreground"> ({scoreBreakdown.nearSensitivePlace.distance}m away)</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Environmental Impact */}
          {ticket.environmentalImpactTags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Environmental Impact</h4>
              <div className="flex flex-wrap gap-2">
                {ticket.environmentalImpactTags.map((impact) => (
                  <EnvironmentalBadge key={impact} impact={impact} />
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* AI Recommendation */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-risk-medium" />
              Recommended Action
            </h4>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm">{ticket.actionRecommendation}</p>
            </div>
          </div>

          <Separator />

          {/* Citizen Feedback */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Priority Feedback</h4>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => handleFeedback('correct')}
              >
                <ThumbsUp className="w-4 h-4" />
                Correct ({ticketFeedback.correct})
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => handleFeedback('wrong')}
              >
                <ThumbsDown className="w-4 h-4" />
                Wrong ({ticketFeedback.wrong})
              </Button>
            </div>

            {showNoteInput ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note about this priority..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddNote}>Add Note</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowNoteInput(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowNoteInput(true)}
              >
                <MessageSquare className="w-4 h-4" />
                Add Note ({ticketFeedback.notes})
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
