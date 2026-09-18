import { useState, useEffect, useRef } from "react";
import { Voicemail, Play, Pause, Trash2, PhoneCall, Clock, Check, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVoIPStore } from "@/lib/voip-store";

export function VoicemailCenter() {
  const voicemails = useVoIPStore((state) => state.voicemails);
  const deleteVoicemail = useVoIPStore((state) => state.deleteVoicemail);
  const markVoicemailAsListened = useVoIPStore((state) => state.markVoicemailAsListened);

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredVoicemails = voicemails.filter((voicemail) => {
    const matchesSearch =
      voicemail.fromNumber.includes(searchQuery) ||
      voicemail.phoneNumber.includes(searchQuery) ||
      (voicemail.transcription && voicemail.transcription.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      filter === "all" ||
      (filter === "unlistened" && !voicemail.listened) ||
      (filter === "listened" && voicemail.listened);
    return matchesSearch && matchesFilter;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handlePlayPause = (id: string) => {
    const voicemail = voicemails.find(vm => vm.id === id);
    if (!voicemail) return;

    if (playingId === id) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Play new audio
      const audio = new Audio(voicemail.recordingUrl);
      audio.play().catch(err => {
        console.error("Failed to play audio:", err);
        alert("Failed to play voicemail. Check the recording URL.");
      });
      audioRef.current = audio;
      setPlayingId(id);

      // Auto-reset when audio ends
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        audioRef.current = null;
      });
    }
  };

  const handleMarkAsListened = (id: string) => {
    markVoicemailAsListened(id);
  };

  const handleDelete = (id: string) => {
    deleteVoicemail(id);
  };

  const unlistenedCount = voicemails.filter((vm) => !vm.listened).length;

  // Cleanup audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">RellePhone Voicemail</h2>
          <p className="text-muted-foreground">
            {unlistenedCount > 0 ? `${unlistenedCount} unheard messages` : "All messages heard"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Voicemail Messages</CardTitle>
              <CardDescription>Listen to and manage voicemail</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search voicemails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unlistened">Unheard</SelectItem>
                  <SelectItem value="listened">Heard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredVoicemails.map((voicemail) => (
              <div
                key={voicemail.id}
                className={`p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors ${
                  !voicemail.listened ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Voicemail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{voicemail.fromNumber}</p>
                        {!voicemail.listened && (
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Via {voicemail.phoneNumber}</span>
                        <span>•</span>
                        <span>{formatTime(voicemail.timestamp)}</span>
                        <span>•</span>
                        <span>{formatDuration(voicemail.duration)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePlayPause(voicemail.id)}
                    >
                      {playingId === voicemail.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {voicemail.transcription && (
                  <div className="mb-3 p-3 bg-accent/30 rounded text-sm">
                    <p className="text-muted-foreground mb-1">Transcription:</p>
                    <p>{voicemail.transcription}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <PhoneCall className="mr-1 h-3 w-3" />
                    Call Back
                  </Button>
                  {!voicemail.listened && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsListened(voicemail.id)}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Mark as Heard
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(voicemail.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}