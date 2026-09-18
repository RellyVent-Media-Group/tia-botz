import React, { useState } from "react";
import { BacklogItem } from "../types";
import { INITIAL_BACKLOG_ITEMS } from "../data/productionBacklogData";
import { 
  Table, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles 
} from "lucide-react";

export const ProjectBacklogView: React.FC = () => {
  const [items, setItems] = useState<BacklogItem[]>(INITIAL_BACKLOG_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkstream, setSelectedWorkstream] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // New item modal/inline form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("WS1-NEW-01");
  const [newWorkstream, setNewWorkstream] = useState<BacklogItem["workstream"]>("Content Production");
  const [newPriority, setNewPriority] = useState<BacklogItem["priority"]>("High");
  const [newAssignee, setNewAssignee] = useState("TaK$HuN");
  const [newHours, setNewHours] = useState(16);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkstream =
      selectedWorkstream === "All" || item.workstream === selectedWorkstream;
    const matchesStatus =
      selectedStatus === "All" || item.status === selectedStatus;
    return matchesSearch && matchesWorkstream && matchesStatus;
  });

  const totalHours = items.reduce((acc, item) => acc + item.estimatedHours, 0);
  const completedHours = items
    .filter((item) => item.status === "Completed")
    .reduce((acc, item) => acc + item.estimatedHours, 0);
  const overallProgress = Math.round((completedHours / totalHours) * 100) || 0;

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus: BacklogItem["status"] =
            item.status === "Completed"
              ? "In Progress"
              : item.status === "In Progress"
              ? "Review"
              : item.status === "Review"
              ? "Completed"
              : "In Progress";
          const nextPercentage = nextStatus === "Completed" ? 100 : item.completionPercentage;
          return { ...item, status: nextStatus, completionPercentage: nextPercentage };
        }
        return item;
      })
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: BacklogItem = {
      id: `task_${Date.now()}`,
      code: newCode,
      title: newTitle,
      workstream: newWorkstream,
      status: "In Progress",
      priority: newPriority,
      assignee: newAssignee,
      estimatedHours: Number(newHours),
      completionPercentage: 10,
      dependencies: [],
      deliverableFile: "NEW_DELIVERABLE.md",
      notes: "Created from master matrix UI.",
    };

    setItems([newItem, ...items]);
    setNewTitle("");
    setShowAddForm(false);
  };

  const handleExportCSV = () => {
    const headers = ["Code", "Title", "Workstream", "Status", "Priority", "Assignee", "Hours", "Progress%", "Deliverable"];
    const rows = items.map((i) => [
      i.code,
      `"${i.title.replace(/"/g, '""')}"`,
      i.workstream,
      i.status,
      i.priority,
      i.assignee,
      i.estimatedHours,
      i.completionPercentage,
      i.deliverableFile,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `chiefpilot_master_backlog_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
              <Table className="w-3.5 h-3.5 text-[#f27d26]" />
              <span>Full Master Project Backlog Spreadsheet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
              Production Matrix, Workstream Status & Velocity
            </h1>
            <p className="text-[#c8bbb0] text-sm max-w-2xl leading-relaxed">
              Cross-functional execution ledger tracking Universe Bible, AI Pipeline, Shadow Engine, Stop-Motion Fabrication, and Newsroom deliverables.
            </p>
          </div>

          {/* Velocity Metrics */}
          <div className="flex items-center gap-4 text-right font-mono">
            <div className="bg-[#0c0603] p-3 rounded-xl border border-[#f27d26]/20 shadow-inner">
              <div className="text-[10px] text-[#96897e]">Total Velocity</div>
              <div className="text-[#ffaa5e] font-bold text-lg">{completedHours} / {totalHours} hrs</div>
            </div>
            <div className="bg-[#0c0603] p-3 rounded-xl border border-[#f27d26]/20 shadow-inner">
              <div className="text-[10px] text-[#96897e]">Sprint Completion</div>
              <div className="text-emerald-400 font-bold text-lg">{overallProgress}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, Add, Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#140b07]/90 p-4 rounded-xl border border-[#f27d26]/20 shadow-xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#7e7065] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks, codes, assignees..."
            className="w-full bg-[#0c0603] border border-[#f27d26]/20 rounded-lg pl-9 pr-3 py-2 text-xs text-[#fcf8f5] placeholder-[#6d5f54] focus:outline-none focus:border-[#f27d26] font-mono shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedWorkstream}
            onChange={(e) => setSelectedWorkstream(e.target.value)}
            className="bg-[#0c0603] border border-[#f27d26]/20 text-[#d5c8be] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#f27d26] font-mono"
          >
            <option value="All">All Workstreams</option>
            <option value="Content Production">Content Production</option>
            <option value="AI Generation">AI Generation</option>
            <option value="Shadow Engine">Shadow Engine</option>
            <option value="Technical Infra">Technical Infra</option>
            <option value="Fabrication & Lighting">Fabrication & Lighting</option>
            <option value="News & Lore">News & Lore</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0c0603] border border-[#f27d26]/20 text-[#d5c8be] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#f27d26] font-mono"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Backlog">Backlog</option>
            <option value="Blocked">Blocked</option>
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-lg glow-btn-primary text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-[#0c0603] text-[#d5c8be] border border-[#f27d26]/20 font-mono text-xs flex items-center gap-1.5 hover:text-[#fcf8f5] hover:bg-[#1f110a] hover:border-[#f27d26]/40 transition-all cursor-pointer whitespace-nowrap shadow-inner"
          >
            <Download className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Add Task Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-[#140b07]/95 border border-[#f27d26]/40 rounded-2xl p-5 space-y-4 shadow-2xl backdrop-blur-xl">
          <div className="text-xs font-mono text-[#ffaa5e] font-bold uppercase">Log New Backlog Deliverable</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Task Code (e.g. WS1-UB-05)"
              className="bg-[#0c0603] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#fcf8f5] font-mono"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Deliverable Title..."
              className="sm:col-span-3 bg-[#0c0603] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#fcf8f5]"
            />
            <select
              value={newWorkstream}
              onChange={(e) => setNewWorkstream(e.target.value as any)}
              className="bg-[#0c0603] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#d5c8be] font-mono"
            >
              <option value="Content Production">Content Production</option>
              <option value="AI Generation">AI Generation</option>
              <option value="Shadow Engine">Shadow Engine</option>
              <option value="Technical Infra">Technical Infra</option>
              <option value="Fabrication & Lighting">Fabrication & Lighting</option>
              <option value="News & Lore">News & Lore</option>
            </select>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="bg-[#0c0603] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#d5c8be] font-mono"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input
              type="text"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              placeholder="Assignee (e.g. TaK$HuN)"
              className="bg-[#0c0603] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#fcf8f5] font-mono"
            />
            <input
              type="number"
              value={newHours}
              onChange={(e) => setNewHours(Number(e.target.value))}
              placeholder="Est Hours"
              className="bg-[#0c0603] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#fcf8f5] font-mono"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-lg bg-[#1a0f09] text-[#b8aba0] hover:text-white text-xs font-mono border border-[#f27d26]/15 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg glow-btn-primary font-bold text-xs font-mono cursor-pointer"
            >
              Save Deliverable
            </button>
          </div>
        </form>
      )}

      {/* Spreadsheet Table View */}
      <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0c0603]/90 border-b border-[#f27d26]/15 text-[#96897e] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Deliverable / Task</th>
                <th className="py-3.5 px-4">Workstream</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Assignee</th>
                <th className="py-3.5 px-4">Est Hours</th>
                <th className="py-3.5 px-4">Progress</th>
                <th className="py-3.5 px-4">File Deliverable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f27d26]/10">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#1a0f0a]/60 transition-colors">
                  <td className="py-3 px-4 text-[#ffaa5e] font-bold whitespace-nowrap">{item.code}</td>
                  <td className="py-3 px-4 font-sans font-medium text-[#fcf8f5] max-w-xs">{item.title}</td>
                  <td className="py-3 px-4 text-[#b8aba0] whitespace-nowrap">{item.workstream}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                        item.status === "Completed"
                          ? "bg-emerald-950/70 text-emerald-300 border border-emerald-800/50"
                          : item.status === "In Progress"
                          ? "bg-amber-950/70 text-[#ffaa5e] border border-amber-800/50"
                          : item.status === "Review"
                          ? "bg-blue-950/70 text-blue-300 border border-blue-800/50"
                          : "bg-[#0c0603] text-[#96897e] border border-[#f27d26]/15"
                      }`}
                    >
                      {item.status === "Completed" && <CheckCircle2 className="w-3 h-3" />}
                      {item.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        item.priority === "Critical"
                          ? "bg-rose-950/70 text-rose-300 border border-rose-800/50"
                          : item.priority === "High"
                          ? "bg-amber-950/70 text-amber-300 border border-amber-800/50"
                          : "bg-[#0c0603] text-[#b8aba0] border border-[#f27d26]/15"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#d5c8be] whitespace-nowrap">{item.assignee}</td>
                  <td className="py-3 px-4 text-[#96897e]">{item.estimatedHours} hrs</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#0c0603] h-1.5 rounded-full overflow-hidden border border-[#f27d26]/15">
                        <div
                          className="h-full bg-gradient-to-r from-[#f27d26] to-emerald-400 shadow-[0_0_6px_rgba(242,125,38,0.5)]"
                          style={{ width: `${item.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#96897e]">{item.completionPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#7e7065] text-[11px] font-mono whitespace-nowrap">
                    {item.deliverableFile}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
