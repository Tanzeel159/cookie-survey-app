"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { saveToFirestore } from "@/lib/firestore";
import { FaInfoCircle as Info } from "react-icons/fa";

// List of websites to visit
const WEBSITES = [
  "https://www.ikea.com",
  "https://www.aa.com",
  "https://www.dishoom.com",
  "https://www.fifa.com/en",
  "https://www.mcdonalds.com/us/en-us.html",
  "https://www.klaviyo.com/",
  "https://www.catan.com"
];

// Cookie consent options
const COOKIE_OPTIONS = [
  { id: "accept-all", label: "Accept All" },
  { id: "reject-all", label: "Reject All" },
  { id: "manage-preferences", label: "Only Necessary | Manage Preferences | Customize Cookies" },
  { id: "no-action", label: "No Action" }
];

interface InteractionRecord {
  userId: string;
  timestamp: string;
  website: string;
  selection: string;
  timeSpent: number;
}

export default function Home() {
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const [currentWebsiteIndex, setCurrentWebsiteIndex] = useState(-1);
  const [showWebsite, setShowWebsite] = useState(false);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [selection, setSelection] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [records, setRecords] = useState<InteractionRecord[]>([]);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [isWebsiteWindowOpen, setIsWebsiteWindowOpen] = useState(false);
  const [websiteWindow, setWebsiteWindow] = useState<Window | null>(null);

  // Handle website window closing
  useEffect(() => {
    const checkWindowClosed = setInterval(() => {
      if (isWebsiteWindowOpen && websiteWindow && websiteWindow.closed) {
        setIsWebsiteWindowOpen(false);
        handleWebsiteClosed();
      }
    }, 500);

    return () => clearInterval(checkWindowClosed);
  }, [isWebsiteWindowOpen, websiteWindow]);

  // Start the study by opening the first website
  const startStudy = () => {
    setCurrentWebsiteIndex(0);
    openWebsite(0);
  };

  // Open a website in a new window
  const openWebsite = (index: number) => {
    if (index >= WEBSITES.length) {
      setShowCompletionDialog(true);
      return;
    }

    setStartTime(Date.now());
    setShowWebsite(true);
    
    const newWindow = window.open(
      WEBSITES[index],
      "CookieConsentWindow",
      "width=1000,height=800,resizable=yes,scrollbars=yes"
    );
    
    setWebsiteWindow(newWindow);
    setIsWebsiteWindowOpen(true);
  };

  // Handle when the website window is closed
  const handleWebsiteClosed = () => {
    setShowWebsite(false);
    setShowSelectionDialog(true);
  };

  // Handle selection of cookie option
  const handleSelectionSubmit = () => {
    if (!selection) return;

    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    
    const newRecord: InteractionRecord = {
      userId,
      timestamp: new Date().toISOString(),
      website: WEBSITES[currentWebsiteIndex],
      selection,
      timeSpent
    };
    
    setRecords([...records, newRecord]);
    
    // Save to Firestore
    saveToFirestore(newRecord).catch(error => {
      console.error("Failed to save to Firestore:", error);
    });
    
    setShowSelectionDialog(false);
    setSelection("");
    
    // Move to next website
    const nextIndex = currentWebsiteIndex + 1;
    setCurrentWebsiteIndex(nextIndex);
    
    if (nextIndex < WEBSITES.length) {
      setTimeout(() => openWebsite(nextIndex), 500);
    } else {
      setShowCompletionDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Cookie Consent Interaction Study</h1>
        
        {currentWebsiteIndex === -1 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
              <CardDescription>Please follow these steps to complete the survey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">Survey Process:</h3>
                <ol className="space-y-4 list-decimal pl-5 text-left">
                  <li className="text-base">
                    Click the <strong>&quot;Participate&quot;</strong> button below to begin the survey.
                  </li>
                  <li className="text-base">
                    A website will open in a <strong>new Incognito window</strong>. You&apos;ll see a cookie consent banner on this website.
                  </li>
                  <li className="text-base">
                    <strong>Interact with the cookie banner</strong> according to your preferences.
                  </li>
                  <li className="text-base">
                    <strong>Close the website window</strong> after interacting with the banner. This is important to proceed!
                  </li>
                  <li className="text-base">
                    Answer the survey questions about your experience.
                  </li>
                  <li className="text-base">
                    The next website will <strong>automatically open</strong> after you submit your answers.
                  </li>
                  <li className="text-base">
                    Repeat this process until you&apos;ve completed all seven websites and proceed to the survey.
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800">Important Note</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      You must close each website window after interacting with the cookie banner for the survey to proceed to the next website.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded"
                onClick={startStudy}
              >
                Participate
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Button 
            size="lg" 
            className="mb-12 bg-green-600 hover:bg-green-700"
            onClick={() => openWebsite(currentWebsiteIndex)}
            disabled={showWebsite || showSelectionDialog}
          >
            Start / Next Website
          </Button>
        )}
        
        {records.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <Table className="border-collapse border border-slate-200 w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="border">User ID</TableHead>
                  <TableHead className="border">Timestamp</TableHead>
                  <TableHead className="border">Website</TableHead>
                  <TableHead className="border">Accept All</TableHead>
                  <TableHead className="border">Reject All</TableHead>
                  <TableHead className="border">Manage Preferences</TableHead>
                  <TableHead className="border">No Action</TableHead>
                  <TableHead className="border">Time Spent (seconds)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="border">{record.userId}</TableCell>
                    <TableCell className="border">{new Date(record.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="border">{record.website}</TableCell>
                    <TableCell className="border text-center">
                      {record.selection === "Accept All" ? "✓" : ""}
                    </TableCell>
                    <TableCell className="border text-center">
                      {record.selection === "Reject All" ? "✓" : ""}
                    </TableCell>
                    <TableCell className="border text-center">
                      {record.selection === "Only Necessary | Manage Preferences | Customize Cookies" ? "✓" : ""}
                    </TableCell>
                    <TableCell className="border text-center">
                      {record.selection === "No Action" ? "✓" : ""}
                    </TableCell>
                    <TableCell className="border">{record.timeSpent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Cookie Selection Dialog */}
        <Dialog open={showSelectionDialog} onOpenChange={setShowSelectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold mb-4">Which cookie option did you select?</DialogTitle>
            </DialogHeader>
            <RadioGroup value={selection} onValueChange={setSelection} className="space-y-4">
              {COOKIE_OPTIONS.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <div className="relative flex items-center">
                    <RadioGroupItem 
                      value={option.label} 
                      id={option.id} 
                      className="h-5 w-5 border-2 border-slate-400 text-primary"
                    />
                    <Label 
                      htmlFor={option.id} 
                      className="ml-2 text-lg font-medium"
                    >
                      {option.label}
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
            <Button 
              onClick={handleSelectionSubmit} 
              className="w-full mt-4"
              disabled={!selection}
            >
              Submit
            </Button>
          </DialogContent>
        </Dialog>
        
        {/* Completion Dialog */}
        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold mb-4">Thank you for participating!</DialogTitle>
            </DialogHeader>
            <p className="mb-4">
              You have completed the cookie consent interaction study. Please proceed to the survey to provide additional feedback.
            </p>
            <Button 
              onClick={() => window.open("https://heyform.net/f/TYZB4zVs", "_blank")}
              className="w-full"
            >
              Proceed to Survey
            </Button>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}