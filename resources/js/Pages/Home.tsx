import React, { useState, useEffect } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Progress } from "@/Components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Settings, Search } from "lucide-react";
import { Switch } from "@/Components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";

// Define interface for DNS record
interface DNSRecord {
  name: string;
  type: string;
  value: string;
  ttl: number;
  priority: number;
}

// Define interface for subdomains
interface SubdomainConfig {
  [key: string]: boolean;
}

const HomepageTool = () => {
  // Define default subdomains first
  const defaultSubdomains: SubdomainConfig = {
    www: true,
    mail: false,
    imap: false,
    smtp: false,
    autodiscover: false,
    ftp: false,
    pop3: false,
    webmail: false,
    cpanel: false,
  };

  // State declarations
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null);
  const [selectedSubdomains, setSelectedSubdomains] = useState<SubdomainConfig>(defaultSubdomains);

  // Load and save preferences using localStorage
  const loadStoredPreferences = () => {
    try {
      const stored = localStorage.getItem('subdomain_preferences');
      return stored ? JSON.parse(stored) : defaultSubdomains;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return defaultSubdomains;
    }
  };

  const toggleSubdomain = (key: string) => {
    const newPreferences: SubdomainConfig = {
      ...selectedSubdomains,
      [key]: !selectedSubdomains[key],
    };
    setSelectedSubdomains(newPreferences);
    try {
      localStorage.setItem('subdomain_preferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error);
    }
  };

  useEffect(() => {
    setSelectedSubdomains(loadStoredPreferences());
  }, []);

  const startProgressBar = () => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 3));
    }, 1000);
    setProgressTimer(timer);
  };

  const stopProgressBar = () => {
    if (progressTimer) {
      clearInterval(progressTimer);
      setProgressTimer(null);
    }
    setProgress(100);
    setTimeout(() => setProgress(0), 500);
  };

  const fetchDNSRecords = async () => {
    if (!domain.trim()) {
      setError("Please enter a valid domain.");
      return;
    }

    setLoading(true);
    setError("");
    startProgressBar();

    try {
      const response = await fetch("/dnslookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
        },
        body: JSON.stringify({
          domain,
          subdomains: Object.keys(selectedSubdomains).filter((key) => selectedSubdomains[key]),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch DNS records.");
        stopProgressBar();
        return;
      }

      const data = await response.json();
      setResults(data.records || []);
      stopProgressBar();
    } catch (error) {
      console.error("Error fetching DNS records:", error);
      setError("An unexpected error occurred. Please try again later.");
      stopProgressBar();
    } finally {
      setLoading(false);
    }
  };

  // Download buttons logic update
  const downloadFile = (format: string) => {
    const encodedRecords = encodeURIComponent(JSON.stringify(results));
    const url = `/download?domain=${domain}&format=${format}&records=${encodedRecords}`;
    window.location.href = url;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchDNSRecords();
    }
  };

  return (
    <div className="container mx-auto p-10 flex-grow">
      <h1 className="text-6xl font-extrabold tracking-tight text-[hsl(var(--text-standard))] text-center">
        <span className="block">The easiest way to</span>
        <span className=" pb-4 text-sky-500 sm:pb-5">View </span>
        <span className=" pb-5 sm:pb-5">and </span>
        <span className=" pb-5 text-sky-500 sm:pb-5">Export </span>
        <span className=" pb-5 sm:pb-5">DNS Records</span>
      </h1>
      <p className="text-center mt-6 mb-6">The perfect tool to Check, Monitor, Backup and Export DNS Records for Domain Names!</p>

      <Card className="border-y border-gray-700 bg-[hsl(var(--card))] w-full max-w-2xl mx-auto p-6 shadow sm:rounded-lg sm:border-x">
        <div className="flex items-center justify-center gap-4">
          {/* Input Field with Fetch Button */}
          <div className="relative w-full max-w-lg">
            <Input
              type="text"
              placeholder="Enter a domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full pr-[120px] focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] border-[hsl(var(--border))]"
            />
            <Button
              onClick={fetchDNSRecords}
              className="absolute right-0 top-0 h-full rounded-l-none bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))] transition-colors"
              disabled={loading}
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? "Loading..." : "Fetch Records"}
            </Button>
          </div>

          {/* Dropdown Menu */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(var(--accent-hover))]">
                <Settings className="h-4 w-4 mr-2" />
                Config
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Subdomain Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {Object.keys(selectedSubdomains).map((key) => (
                  <div key={key} className="flex items-center justify-between px-1">
                    <span className="text-sm font-medium">{key}</span>
                    <Switch
                      checked={selectedSubdomains[key]}
                      onCheckedChange={() => toggleSubdomain(key)}
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress Bar */}
        {loading && <Progress value={progress} className="mt-4" />}

        {error && <p className="text-center text-red-500 mt-4">{error}</p>}
      </Card>

      {results.length > 0 && (
        <Card className="relative border-y border-gray-700 bg-[hsl(var(--card))] w-full max-w-5xl mx-auto p-6 mt-6 shadow sm:rounded-lg sm:border-x overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{`${results.length} DNS Record${results.length !== 1 ? "s" : ""} Found`}</h2>
            <div className="flex gap-4">
              <Button
                onClick={() => downloadFile("csv")}
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))] transition-colors"
              >
                Download as CSV
              </Button>
              <Button
                onClick={() => downloadFile("zone")}
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))] transition-colors"
              >
                Download as DNS Zone File
              </Button>
            </div>
          </div>

          {/* Table section */}
          <div className="relative">
            <table className="w-full border-collapse text-left border border-[hsl(var(--border))]">
              <thead>
                <tr>
                  <th className="border border-[hsl(var(--border))] p-2">Name</th>
                  <th className="border border-[hsl(var(--border))] p-2 text-center">Type</th>
                  <th className="border border-[hsl(var(--border))] p-2">Data</th>
                  <th className="border border-[hsl(var(--border))] p-2 text-center">TTL</th>
                  <th className="border border-[hsl(var(--border))] p-2 text-center">Priority</th>
                </tr>
              </thead>
              <tbody>
                {results.map((record, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-[hsl(var(--muted))]"
                  >
                    <td className="border border-[hsl(var(--border))] p-2">{record.name}</td>
                    <td className="border border-[hsl(var(--border))] p-2 text-center">{record.type}</td>
                    <td className="border border-[hsl(var(--border))] p-2">{record.value}</td>
                    <td className="border border-[hsl(var(--border))] p-2 text-center">{record.ttl}</td>
                    <td className="border border-[hsl(var(--border))] p-2 text-center">{record.priority}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default HomepageTool;