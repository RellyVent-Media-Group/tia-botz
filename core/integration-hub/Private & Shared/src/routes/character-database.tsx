import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Plus,
  ChevronDown,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  User,
  Star,
  Zap
} from "lucide-react";
import { characters, getCharacterStats, type Character } from "@/lib/characters";
import { projects } from "@/lib/catalog";

export const Route = createFileRoute("/character-database")({
  component: CharacterDatabase,
});

function CharacterDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Filter characters based on search and filters
  const filteredCharacters = useMemo(() => {
    return characters.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          character.archetype.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          character.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRarity = selectedRarity === "all" || character.rarity === selectedRarity;
      const matchesStatus = selectedStatus === "all" || character.status === selectedStatus;
      const matchesEntityType = selectedEntityType === "all" || character.entityType.includes(selectedEntityType);
      
      return matchesSearch && matchesRarity && matchesStatus && matchesEntityType;
    });
  }, [searchTerm, selectedRarity, selectedStatus, selectedEntityType]);

  // Calculate statistics
  const stats = getCharacterStats();

  // Check if character has assets in catalog
  const hasAssets = (characterName: string) => {
    return projects.some(p => p.name === characterName);
  };

  const getAssetStatusIcon = (character: Character) => {
    if (hasAssets(character.name)) {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary": return "text-amber-400";
      case "Rare": return "text-purple-400";
      case "Common": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <div className="grain" aria-hidden="true" />
      <SiteNav />
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <ImageIcon className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Character Database</h1>
                <p className="text-slate-400 mt-1">Manage and track character assets</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/pricing">
                <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase Access
                </Button>
              </Link>
              <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white hover:bg-slate-700/50">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Character
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Total Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Legendary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-amber-400">{stats.legendary}</div>
                <Star className="w-6 h-6 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Rare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-purple-400">{stats.rare}</div>
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Common</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-blue-400">{stats.common}</div>
                <User className="w-6 h-6 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-400 text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-green-400">{stats.active}</div>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search characters by name, archetype, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Rarities</option>
                    <option value="Legendary">Legendary</option>
                    <option value="Rare">Rare</option>
                    <option value="Common">Common</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    value={selectedEntityType}
                    onChange={(e) => setSelectedEntityType(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Entity Types</option>
                    <option value="Primary">Primary Character</option>
                    <option value="Legendary">Legendary Entity</option>
                    <option value="Common">Common Entity</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character List */}
        <div className="space-y-4">
          {filteredCharacters.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No characters found</h3>
                <p className="text-slate-400">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredCharacters.map((character) => (
              <Card key={character.id} className="bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        {getAssetStatusIcon(character)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{character.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(character.rarity)} bg-slate-900/50`}>
                            {character.rarity}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                            {character.status}
                          </span>
                        </div>
                        <p className="text-slate-400 mb-3">{character.archetype}</p>
                        <p className="text-slate-500 text-sm mb-3 line-clamp-2">{character.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>Budget: ${character.allocatedBudget.toLocaleString()}</span>
                          <span>•</span>
                          <span>{character.entityType}</span>
                          <span>•</span>
                          <span>{character.gender}</span>
                          <span>•</span>
                          <span>{character.keyToolCategory.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">Catalog Assets</div>
                        <div className="flex gap-2">
                          <span className={`text-xs ${hasAssets(character.name) ? 'text-green-400' : 'text-red-400'}`}>
                            {hasAssets(character.name) ? 'In Catalog' : 'Not in Catalog'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                        onClick={() => setSelectedCharacter(character)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results count */}
        <div className="mt-6 text-center text-slate-400">
          Showing {filteredCharacters.length} of {characters.length} characters
        </div>

        {/* Character Detail Modal */}
        {selectedCharacter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCharacter(null)}>
            <Card className="bg-slate-800 border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white">{selectedCharacter.name}</CardTitle>
                    <CardDescription className="text-slate-400 mt-1">{selectedCharacter.archetype}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCharacter(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Rarity</div>
                    <div className={`text-lg font-semibold ${getRarityColor(selectedCharacter.rarity)}`}>
                      {selectedCharacter.rarity}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Status</div>
                    <div className="text-lg font-semibold text-green-400">
                      {selectedCharacter.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Gender</div>
                    <div className="text-lg font-semibold text-white">
                      {selectedCharacter.gender}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Budget</div>
                    <div className="text-lg font-semibold text-white">
                      ${selectedCharacter.allocatedBudget.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="text-slate-400 text-sm mb-2">Description</div>
                  <p className="text-white leading-relaxed">{selectedCharacter.description}</p>
                </div>

                {/* Entity Type */}
                <div>
                  <div className="text-slate-400 text-sm mb-2">Entity Type</div>
                  <div className="text-white">{selectedCharacter.entityType}</div>
                </div>

                {/* Key Tool Categories */}
                <div>
                  <div className="text-slate-400 text-sm mb-2">Key Tool Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.keyToolCategory.map((category, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Prompts */}
                <div>
                  <div className="text-slate-400 text-sm mb-3">AI Generation Prompts</div>
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-purple-400 text-xs mb-1">HOOK PROMPT</div>
                      <p className="text-slate-300 text-sm">{selectedCharacter.prompts.hook}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-purple-400 text-xs mb-1">BRANDING PROMPT</div>
                      <p className="text-slate-300 text-sm">{selectedCharacter.prompts.branding}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-purple-400 text-xs mb-1">TRUST PROMPT</div>
                      <p className="text-slate-300 text-sm">{selectedCharacter.prompts.trust}</p>
                    </div>
                  </div>
                </div>

                {/* Catalog Status */}
                <div>
                  <div className="text-slate-400 text-sm mb-2">Catalog Status</div>
                  <div className="flex items-center gap-2">
                    {hasAssets(selectedCharacter.name) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400">Character has assets in catalog</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">Character not yet in catalog</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}