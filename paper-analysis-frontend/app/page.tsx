"use client";

import { useState } from "react";
import { analyzePapers } from "@/lib/api";
import type { PaperAnalysisResponse } from "@/types/paper";
import FeatureChart from "@/components/FeatureChart";
import PaperList from "@/components/PaperList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisData, setAnalysisData] =
    useState<PaperAnalysisResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    try {
      const data = await analyzePapers();
      setAnalysisData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Distinctive Features of Crime-reporting Papers - SERP
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-center">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Find Papers"
              )}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisData && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Total Papers Analyzed: {analysisData.data.totalPapersAnalyzed}
                </p>
                <FeatureChart data={analysisData.data.visualizationData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyzed Papers</CardTitle>
              </CardHeader>
              <CardContent>
                <PaperList papers={analysisData.data.papers} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
