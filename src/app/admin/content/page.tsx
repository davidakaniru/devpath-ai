"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  Loader,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type ResourceType = "ARTICLE" | "VIDEO" | "DOCUMENTATION" | "PROJECT";

interface Track {
  id: string;
  name: string;
  description: string | null;
  _count: { topics: number };
}

interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
}

interface Topic {
  id: string;
  trackId: string;
  title: string;
  description: string | null;
  difficultyLevel: DifficultyLevel;
  prerequisiteTopicId: string | null;
  prerequisiteTopic: { id: string; title: string } | null;
  resources: Resource[];
}

const DIFFICULTY_OPTIONS: DifficultyLevel[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];
const RESOURCE_TYPE_OPTIONS: ResourceType[] = [
  "ARTICLE",
  "VIDEO",
  "DOCUMENTATION",
  "PROJECT",
];

const difficultyStyles: Record<DifficultyLevel, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERMEDIATE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCED: "bg-destructive/15 text-destructive border-destructive/30",
};

const inputClass =
  "w-full rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary/50";

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

const AdminContentPage = () => {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [tracksError, setTracksError] = useState("");
  const [showAddTrack, setShowAddTrack] = useState(false);

  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [topicsByTrack, setTopicsByTrack] = useState<Record<string, Topic[]>>(
    {},
  );
  const [topicsLoadingFor, setTopicsLoadingFor] = useState<string | null>(
    null,
  );
  const [topicsError, setTopicsError] = useState("");
  const [showAddTopicFor, setShowAddTopicFor] = useState<string | null>(null);

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [showAddResourceFor, setShowAddResourceFor] = useState<string | null>(
    null,
  );

  async function loadTracks() {
    try {
      const res = await fetch("/api/admin/tracks");
      const data = await res.json();
      if (!res.ok) {
        setTracksError(data.error ?? "Failed to load tracks.");
        return;
      }
      setTracksError("");
      setTracks(data.tracks);
    } catch {
      setTracksError("Failed to load tracks.");
    }
  }

  useEffect(() => {
    loadTracks();
  }, []);

  async function loadTopics(trackId: string) {
    setTopicsLoadingFor(trackId);
    setTopicsError("");
    try {
      const res = await fetch(`/api/admin/topics?trackId=${trackId}`);
      const data = await res.json();
      if (!res.ok) {
        setTopicsError(data.error ?? "Failed to load topics.");
        return;
      }
      setTopicsByTrack((prev) => ({ ...prev, [trackId]: data.topics }));
    } catch {
      setTopicsError("Failed to load topics.");
    } finally {
      setTopicsLoadingFor(null);
    }
  }

  function toggleTrack(trackId: string) {
    if (expandedTrackId === trackId) {
      setExpandedTrackId(null);
      return;
    }
    setExpandedTrackId(trackId);
    setExpandedTopicId(null);
    if (!topicsByTrack[trackId]) loadTopics(trackId);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Content
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage learning tracks, topics, and resources.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddTrack((prev) => !prev)}>
          <Plus className="h-4 w-4" /> New Track
        </Button>
      </div>

      {tracksError && (
        <p className="text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
          {tracksError}
        </p>
      )}

      {showAddTrack && (
        <AddTrackForm
          onCancel={() => setShowAddTrack(false)}
          onCreated={() => {
            setShowAddTrack(false);
            loadTracks();
          }}
        />
      )}

      {!tracks ? (
        <div className="flex h-[30vh] items-center justify-center">
          <Loader size={28} className="animate-spin text-primary" />
        </div>
      ) : tracks.length === 0 ? (
        <p className="rounded-xl border-2 border-border bg-card p-6 text-sm text-muted-foreground">
          No tracks yet. Create one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="rounded-xl border-2 border-border bg-card"
            >
              <TrackRow
                track={track}
                expanded={expandedTrackId === track.id}
                onToggle={() => toggleTrack(track.id)}
                onUpdated={loadTracks}
                onDeleted={loadTracks}
              />

              {expandedTrackId === track.id && (
                <div className="border-t border-border p-4">
                  {topicsError && (
                    <p className="mb-3 text-[13px] text-destructive bg-destructive/8 border border-destructive/15 rounded-xl px-3.5 py-2.5">
                      {topicsError}
                    </p>
                  )}

                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Topics
                    </h3>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() =>
                        setShowAddTopicFor((prev) =>
                          prev === track.id ? null : track.id,
                        )
                      }
                    >
                      <Plus className="h-3.5 w-3.5" /> New Topic
                    </Button>
                  </div>

                  {showAddTopicFor === track.id && (
                    <div className="mb-3">
                      <AddTopicForm
                        trackId={track.id}
                        existingTopics={topicsByTrack[track.id] ?? []}
                        onCancel={() => setShowAddTopicFor(null)}
                        onCreated={() => {
                          setShowAddTopicFor(null);
                          loadTopics(track.id);
                        }}
                      />
                    </div>
                  )}

                  {topicsLoadingFor === track.id ? (
                    <div className="flex justify-center py-6">
                      <Loader
                        size={20}
                        className="animate-spin text-primary"
                      />
                    </div>
                  ) : (topicsByTrack[track.id]?.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No topics in this track yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {topicsByTrack[track.id].map((topic) => (
                        <div
                          key={topic.id}
                          className="rounded-lg border border-border bg-surface/40"
                        >
                          <TopicRow
                            topic={topic}
                            expanded={expandedTopicId === topic.id}
                            onToggle={() =>
                              setExpandedTopicId((prev) =>
                                prev === topic.id ? null : topic.id,
                              )
                            }
                            existingTopics={topicsByTrack[track.id]}
                            onUpdated={() => loadTopics(track.id)}
                            onDeleted={() => loadTopics(track.id)}
                          />

                          {expandedTopicId === topic.id && (
                            <div className="border-t border-border p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Resources
                                </h4>
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() =>
                                    setShowAddResourceFor((prev) =>
                                      prev === topic.id ? null : topic.id,
                                    )
                                  }
                                >
                                  <Plus className="h-3.5 w-3.5" /> New Resource
                                </Button>
                              </div>

                              {showAddResourceFor === topic.id && (
                                <div className="mb-2">
                                  <AddResourceForm
                                    topicId={topic.id}
                                    onCancel={() =>
                                      setShowAddResourceFor(null)
                                    }
                                    onCreated={() => {
                                      setShowAddResourceFor(null);
                                      loadTopics(track.id);
                                    }}
                                  />
                                </div>
                              )}

                              {topic.resources.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No resources yet.
                                </p>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  {topic.resources.map((resource) => (
                                    <ResourceRow
                                      key={resource.id}
                                      resource={resource}
                                      onUpdated={() => loadTopics(track.id)}
                                      onDeleted={() => loadTopics(track.id)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function TrackRow({
  track,
  expanded,
  onToggle,
  onUpdated,
  onDeleted,
}: {
  track: Track;
  expanded: boolean;
  onToggle: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(track.name);
  const [description, setDescription] = useState(track.description ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tracks/${track.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to update track.");
        return;
      }
      setEditing(false);
      onUpdated();
    } catch {
      setError("Failed to update track.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete track "${track.name}"?`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tracks/${track.id}`, {
        method: "DELETE",
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to delete track.");
        return;
      }
      onDeleted();
    } catch {
      setError("Failed to delete track.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Track name"
        />
        <textarea
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button size="xs" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4">
      <button
        onClick={onToggle}
        className="flex flex-1 items-center gap-3 text-left cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">{track.name}</p>
          {track.description && (
            <p className="text-sm text-muted-foreground">
              {track.description}
            </p>
          )}
        </div>
      </button>
      <span className="text-xs text-muted-foreground">
        {track._count.topics} topic{track._count.topics === 1 ? "" : "s"}
      </span>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => {
          setName(track.name);
          setDescription(track.description ?? "");
          setEditing(true);
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={remove}
        disabled={deleting}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
}

function AddTrackForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to create track.");
        return;
      }
      onCreated();
    } catch {
      setError("Failed to create track.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-border bg-card p-4">
      <input
        className={inputClass}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Track name"
        autoFocus
      />
      <textarea
        className={inputClass}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="xs" onClick={create} disabled={saving || !name.trim()}>
          {saving ? "Creating…" : "Create"}
        </Button>
        <Button size="xs" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TopicRow({
  topic,
  expanded,
  onToggle,
  existingTopics,
  onUpdated,
  onDeleted,
}: {
  topic: Topic;
  expanded: boolean;
  onToggle: () => void;
  existingTopics: Topic[];
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(topic.title);
  const [description, setDescription] = useState(topic.description ?? "");
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(
    topic.difficultyLevel,
  );
  const [prerequisiteTopicId, setPrerequisiteTopicId] = useState(
    topic.prerequisiteTopicId ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          difficultyLevel,
          prerequisiteTopicId: prerequisiteTopicId || null,
        }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to update topic.");
        return;
      }
      setEditing(false);
      onUpdated();
    } catch {
      setError("Failed to update topic.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete topic "${topic.title}"?`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/topics/${topic.id}`, {
        method: "DELETE",
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to delete topic.");
        return;
      }
      onDeleted();
    } catch {
      setError("Failed to delete topic.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 p-3">
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Topic title"
        />
        <textarea
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
        />
        <select
          className={inputClass}
          value={difficultyLevel}
          onChange={(e) =>
            setDifficultyLevel(e.target.value as DifficultyLevel)
          }
        >
          {DIFFICULTY_OPTIONS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={prerequisiteTopicId}
          onChange={(e) => setPrerequisiteTopicId(e.target.value)}
        >
          <option value="">No prerequisite</option>
          {existingTopics
            .filter((t) => t.id !== topic.id)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
        </select>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button size="xs" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3">
      <button
        onClick={onToggle}
        className="flex flex-1 items-center gap-3 text-left cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">{topic.title}</p>
          {topic.prerequisiteTopic && (
            <p className="text-xs text-muted-foreground">
              Requires: {topic.prerequisiteTopic.title}
            </p>
          )}
        </div>
      </button>
      <span
        className={cn(
          "inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
          difficultyStyles[topic.difficultyLevel],
        )}
      >
        {topic.difficultyLevel.toLowerCase()}
      </span>
      <span className="text-xs text-muted-foreground">
        {topic.resources.length} resource
        {topic.resources.length === 1 ? "" : "s"}
      </span>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => {
          setTitle(topic.title);
          setDescription(topic.description ?? "");
          setDifficultyLevel(topic.difficultyLevel);
          setPrerequisiteTopicId(topic.prerequisiteTopicId ?? "");
          setEditing(true);
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={remove}
        disabled={deleting}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
}

function AddTopicForm({
  trackId,
  existingTopics,
  onCancel,
  onCreated,
}: {
  trackId: string;
  existingTopics: Topic[];
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] =
    useState<DifficultyLevel>("BEGINNER");
  const [prerequisiteTopicId, setPrerequisiteTopicId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId,
          title,
          description: description || null,
          difficultyLevel,
          prerequisiteTopicId: prerequisiteTopicId || null,
        }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to create topic.");
        return;
      }
      onCreated();
    } catch {
      setError("Failed to create topic.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface/40 p-3">
      <input
        className={inputClass}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Topic title"
        autoFocus
      />
      <textarea
        className={inputClass}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
      />
      <select
        className={inputClass}
        value={difficultyLevel}
        onChange={(e) => setDifficultyLevel(e.target.value as DifficultyLevel)}
      >
        {DIFFICULTY_OPTIONS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
      <select
        className={inputClass}
        value={prerequisiteTopicId}
        onChange={(e) => setPrerequisiteTopicId(e.target.value)}
      >
        <option value="">No prerequisite</option>
        {existingTopics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="xs" onClick={create} disabled={saving || !title.trim()}>
          {saving ? "Creating…" : "Create"}
        </Button>
        <Button size="xs" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ResourceRow({
  resource,
  onUpdated,
  onDeleted,
}: {
  resource: Resource;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(resource.title);
  const [type, setType] = useState<ResourceType>(resource.type);
  const [url, setUrl] = useState(resource.url);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, url }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to update resource.");
        return;
      }
      setEditing(false);
      onUpdated();
    } catch {
      setError("Failed to update resource.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete resource "${resource.title}"?`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, {
        method: "DELETE",
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to delete resource.");
        return;
      }
      onDeleted();
    } catch {
      setError("Failed to delete resource.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Resource title"
        />
        <select
          className={inputClass}
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
        >
          {RESOURCE_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button size="xs" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm">
      <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        {resource.type}
      </span>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 truncate text-foreground/90 hover:text-primary"
      >
        {resource.title}
      </a>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => {
          setTitle(resource.title);
          setType(resource.type);
          setUrl(resource.url);
          setEditing(true);
        }}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={remove}
        disabled={deleting}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
}

function AddResourceForm({
  topicId,
  onCancel,
  onCreated,
}: {
  topicId: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ResourceType>("ARTICLE");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, title, type, url }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) {
        setError(data.error ?? "Failed to create resource.");
        return;
      }
      onCreated();
    } catch {
      setError("Failed to create resource.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-2.5">
      <input
        className={inputClass}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Resource title"
        autoFocus
      />
      <select
        className={inputClass}
        value={type}
        onChange={(e) => setType(e.target.value as ResourceType)}
      >
        {RESOURCE_TYPE_OPTIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input
        className={inputClass}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://…"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          size="xs"
          onClick={create}
          disabled={saving || !title.trim() || !url.trim()}
        >
          {saving ? "Creating…" : "Create"}
        </Button>
        <Button size="xs" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default AdminContentPage;
