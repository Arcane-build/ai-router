import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Zap, Shield, Globe, Coins, Users, TrendingUp, Brain, DollarSign, Settings, BarChart3, Menu, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchTools, fetchToolsByCategory, generateContent, type ModelInfo, type GenerateResponse } from "@/services/api";
import { toast } from "@/components/ui/sonner";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [generatedResult, setGeneratedResult] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationCost, setGenerationCost] = useState<number | null>(null);
  const [generationResponse, setGenerationResponse] = useState<GenerateResponse | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  // API state
  const [availableTools, setAvailableTools] = useState<Record<string, { models: ModelInfo[] }>>({});
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [toolsError, setToolsError] = useState<string | null>(null);
  const [categoryModels, setCategoryModels] = useState<ModelInfo[]>([]);
  const [isLoadingCategoryModels, setIsLoadingCategoryModels] = useState(false);

  // Fetch all tools on component mount
  useEffect(() => {
    const loadTools = async () => {
      setIsLoadingTools(true);
      setToolsError(null);
      try {
        const tools = await fetchTools();
        
        // Convert to the format expected by the component
        const toolsMap: Record<string, { models: ModelInfo[] }> = {};
        tools.forEach((category) => {
          toolsMap[category.category] = {
            models: category.models
          };
        });
        setAvailableTools(toolsMap);
      } catch (error: any) {
        console.error("Failed to load tools:", error);
        setToolsError(error.message || "Failed to load tools");
        toast.error("Failed to load tools", {
          description: error.message || "Please refresh the page to try again"
        });
      } finally {
        setIsLoadingTools(false);
      }
    };

    loadTools();
  }, []);

  const handleToolSelect = async (toolCategory: string) => {
    setSelectedTool(toolCategory);
    setUserQuery("");
    setShowPricing(false);
    setSelectedModel(null);
    setGeneratedResult("");
    setCategoryModels([]);
    
    // Fetch models for this category from API
    setIsLoadingCategoryModels(true);
    try {
      const models = await fetchToolsByCategory(toolCategory);
      setCategoryModels(models);
      
      // Also update availableTools for this category
      setAvailableTools(prev => ({
        ...prev,
        [toolCategory]: { models }
      }));
    } catch (error: any) {
      console.error(`Failed to load models for ${toolCategory}:`, error);
      toast.error(`Failed to load models for ${toolCategory}`, {
        description: error.message || "Please try again"
      });
    } finally {
      setIsLoadingCategoryModels(false);
    }
    
    // Auto-scroll to the interactive section
    setTimeout(() => {
      const interactiveSection = document.getElementById('interactive-tool-section');
      if (interactiveSection) {
        interactiveSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure the UI has updated
  };

  const handleQuerySubmit = () => {
    if (!userQuery.trim()) return;
    setShowPricing(true);
  };

  const handleModelSelect = async (model: ModelInfo) => {
    if (!selectedTool || !userQuery.trim()) {
      toast.error("Missing information", {
        description: "Please select a tool and enter a prompt"
      });
      return;
    }

    setSelectedModel(model);
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedResult("");
    setGenerationCost(null);
    setGenerationResponse(null);
    setGenerationProgress("Initializing...");
    
    // Check if it's a video model - set duration to 3 seconds
    const isVideoModel = selectedTool === "Video Creation";
    const additionalParams = isVideoModel ? { duration: 3 } : undefined;
    
    try {
      // Show progress for video generation
      if (isVideoModel) {
        setGenerationProgress("Submitting video generation request...");
        toast.info("Video generation started", {
          description: "This may take 2-5 minutes. Please wait..."
        });
      }
      
      // Call the real API
      const response = await generateContent({
        category: selectedTool,
        model: model.name,
        prompt: userQuery,
        additionalParams,
      });

      setGenerationResponse(response);
      setGenerationCost(response.cost || null);
      setGenerationProgress("");

      // Format result based on content type
      const resultText = formatGenerationResult(response, model, selectedTool);
      setGeneratedResult(resultText);

      toast.success("Generation completed!", {
        description: `Successfully generated using ${model.name}`
      });
    } catch (error: any) {
      console.error('Generation failed:', error);
      const errorMessage = error.message || "Failed to generate content. Please try again.";
      setGenerationError(errorMessage);
      setGenerationProgress("");
      toast.error("Generation failed", {
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  // Helper function to format generation result
  const formatGenerationResult = (response: GenerateResponse, _model: ModelInfo, category: string): string => {
    if (!response.data) {
      return "No result data received";
    }

    // Handle different response types based on category
    if (category === "Text Generation") {
      // Text generation returns text in different formats
      if (response.data.output) {
        return response.data.output;
      } else if (response.data.text) {
        return response.data.text;
      } else if (typeof response.data === 'string') {
        return response.data;
      } else {
        return JSON.stringify(response.data, null, 2);
      }
    } else if (category === "Image Creation") {
      // Image generation returns image URLs
      if (response.data.images && Array.isArray(response.data.images)) {
        return `Images generated: ${response.data.images.length} image(s)\n\n${response.data.images.map((img: any, i: number) => 
          `Image ${i + 1}: ${img.url || img.image?.url || JSON.stringify(img)}`
        ).join('\n')}`;
      } else if (response.data.image?.url) {
        return `Image generated: ${response.data.image.url}`;
      } else if (response.data.url) {
        return `Image generated: ${response.data.url}`;
      } else {
        return `Image generation completed. Response: ${JSON.stringify(response.data, null, 2)}`;
      }
    } else if (category === "Video Creation") {
      // Video generation returns video URLs
      if (response.data.video?.url) {
        return `Video generated: ${response.data.video.url}`;
      } else if (response.data.url) {
        return `Video generated: ${response.data.url}`;
      } else {
        return `Video generation completed. Response: ${JSON.stringify(response.data, null, 2)}`;
      }
    } else if (category === "Voice Synthesis") {
      // Voice/audio generation returns audio URLs
      if (response.data.audio?.url) {
        return `Audio generated: ${response.data.audio.url}`;
      } else if (response.data.url) {
        return `Audio generated: ${response.data.url}`;
      } else {
        return `Audio generation completed. Response: ${JSON.stringify(response.data, null, 2)}`;
      }
    }

    // Default: return formatted JSON
    return JSON.stringify(response.data, null, 2);
  };

  // Render generation result based on content type
  const renderGenerationResult = (response: GenerateResponse | null, category: string | null) => {
    if (!response || !response.data) {
      return (
        <div className="bg-white dark:bg-green-900/30 p-4 rounded border">
          <pre className="text-sm whitespace-pre-wrap text-green-700 dark:text-green-300">{generatedResult}</pre>
        </div>
      );
    }

    const data = response.data;

    // Handle images
    if (category === "Image Creation") {
      const imageUrls: string[] = [];
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((img: any) => {
          if (img.url) imageUrls.push(img.url);
          else if (img.image?.url) imageUrls.push(img.image.url);
        });
      } else if (data.image?.url) {
        imageUrls.push(data.image.url);
      } else if (data.url) {
        imageUrls.push(data.url);
      }

      if (imageUrls.length > 0) {
        return (
          <div className="bg-white dark:bg-green-900/30 p-4 rounded border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="space-y-2">
                  <img 
                    src={url} 
                    alt={`Generated image ${idx + 1}`}
                    className="w-full h-auto rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block text-center"
                  >
                    Open in new tab
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }

    // Handle videos
    if (category === "Video Creation") {
      const videoUrl = data.video?.url || data.url;
      if (videoUrl) {
        return (
          <div className="bg-white dark:bg-green-900/30 p-4 rounded border space-y-3">
            <video 
              src={videoUrl} 
              controls 
              className="w-full rounded-lg max-h-[500px]"
              preload="metadata"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="p-4 border border-destructive rounded-lg">
                      <p class="text-sm text-destructive mb-2">Video failed to load</p>
                      <a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-primary hover:underline">
                        Open video URL directly: ${videoUrl.substring(0, 50)}...
                      </a>
                    </div>
                  `;
                }
              }}
              onLoadedData={() => {
                console.log("✅ Video loaded successfully");
              }}
            />
            <div className="flex gap-2 justify-center">
              <a 
                href={videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline px-3 py-1.5 bg-primary/10 rounded"
              >
                Open in new tab
              </a>
              <a 
                href={videoUrl} 
                download
                className="text-xs text-primary hover:underline px-3 py-1.5 bg-primary/10 rounded"
              >
                Download video
              </a>
            </div>
          </div>
        );
      }
    }

    // Handle audio/voice
    if (category === "Voice Synthesis") {
      const audioUrl = data.audio?.url || data.url;
      if (audioUrl) {
        return (
          <div className="bg-white dark:bg-green-900/30 p-4 rounded border">
            <audio 
              src={audioUrl} 
              controls 
              className="w-full"
            />
            <a 
              href={audioUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline block text-center mt-2"
            >
              Download audio
            </a>
          </div>
        );
      }
    }

    // Default: text display
    return (
      <div className="bg-white dark:bg-green-900/30 p-4 rounded border">
        <pre className="text-sm whitespace-pre-wrap text-green-700 dark:text-green-300">{generatedResult}</pre>
      </div>
    );
  };

  const resetDemo = () => {
    setSelectedTool(null);
    setUserQuery("");
    setShowPricing(false);
    setSelectedModel(null);
    setGeneratedResult("");
    setIsGenerating(false);
    setGenerationError(null);
    setGenerationCost(null);
    setGenerationResponse(null);
    setCategoryModels([]);
    setGenerationProgress("");
  };

  const workflowSteps = [
    { step: "1", title: "Tell us what you want done", description: "Describe your task in natural language" },
    { step: "2", title: "We pick the right tool", description: "Our platform selects optimal AI tools automatically" },
    { step: "3", title: "Pay per action", description: "Transparent, real-time cost calculation" },
    { step: "4", title: "Receive output", description: "Get your results seamlessly delivered" }
  ];

  const toolCategories = [
    { 
      category: "Text Generation", 
      tools: [
        { name: "Claude", logo: "🤖" },
        { name: "ChatGPT", logo: "💬" },
        { name: "DeepSeek", logo: "🔍" }
      ],
      moreCount: 18
    },
    { 
      category: "Video Creation", 
      tools: [
        { name: "Runway", logo: "🎬" },
        { name: "Pika", logo: "🎥" },
        { name: "Sora", logo: "🌟" }
      ],
      moreCount: 12
    },
    { 
      category: "Voice Synthesis", 
      tools: [
        { name: "ElevenLabs", logo: "🎙️" },
        { name: "PlayHT", logo: "🔊" }
      ],
      moreCount: 8
    },
    { 
      category: "Audio Enhancement", 
      tools: [
        { name: "Adobe Enhance", logo: "🎵" }
      ],
      moreCount: 6
    },
    { 
      category: "Image Creation", 
      tools: [
        { name: "Midjourney", logo: "🎨" },
        { name: "Ideogram", logo: "🖼️" },
        { name: "Nano Banana Pro", logo: "🍌" }
      ],
      moreCount: 22
    },
    { 
      category: "Development", 
      tools: [
        { name: "Replit", logo: "💻" },
        { name: "Cursor", logo: "⚡" },
        { name: "GitHub Copilot", logo: "🐙" }
      ],
      moreCount: 15
    },
    { 
      category: "Productivity", 
      tools: [
        { name: "Fireflies", logo: "🔥" },
        { name: "Notion AI", logo: "📝" }
      ],
      moreCount: 9
    },
    { 
      category: "Research", 
      tools: [
        { name: "Perplexity", logo: "🔬" },
        { name: "Elicit", logo: "📊" }
      ],
      moreCount: 14
    }
  ];

  const architectureComponents = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Orchestration Layer",
      description: "Task parsing, tool selection, workflow routing, and failover logic"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Pricing Engine",
      description: "Real-time cost calculation, margin management, and settlement instructions"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Integration Layer",
      description: "Direct API calls, OAuth sessions, and frictionless tool integration"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Output Layer",
      description: "Result routing, media delivery, and workflow chaining"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Access",
      description: "Access any AI tool instantly without separate subscriptions"
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: "Pay Per Use",
      description: "Only pay for the actions you perform, no monthly fees"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Payments",
      description: "X402 micropayments ensure secure, instant transactions"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Unified Platform",
      description: "One platform for all your AI tool needs"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="font-bold text-xl gradient-text">AI Tooling Protocol</div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Integrations</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Discover</a>
              <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Profile</a>
            </div>
            <Button variant="outline" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden neural-network-bg">
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              The Unified
              <span className="gradient-text block">AI Interface Layer</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-2xl md:text-3xl font-semibold text-muted-foreground">Powered by</span>
              <img 
                src="https://www.x402.org/_next/image?url=%2Fx402-logo.png&w=640&q=75" 
                alt="X402 Logo" 
                className="h-12 md:h-16 w-auto filter brightness-110 hover:brightness-125 transition-all duration-300"
              />
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              The universal interface for AI tools. Don't think about models or tools, think in tasks. Pay per action, not subscription.
            </p>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 mb-8 max-w-2xl mx-auto border border-primary/20">
              <p className="text-muted-foreground italic">"Want to turn a script into a narrated video?"</p>
              <p className="text-sm text-muted-foreground mt-2">→ We automatically route to Claude + ElevenLabs + Runway</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                Read Whitepaper
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Discovery of the AI Tools Ecosystem Is Broken
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              The AI landscape has exploded with innovation. There are now over <span className="text-primary font-bold">14,000+ tools</span> covering every imaginable use case.
            </p>
          </div>

          {/* Tool Categories */}
          {isLoadingTools ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
              <span className="text-lg text-muted-foreground">Loading tools...</span>
            </div>
          ) : toolsError ? (
            <div className="text-center py-16">
              <p className="text-destructive mb-4">{toolsError}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16 max-w-6xl mx-auto">
              {toolCategories.map((category, index) => (
              <Card 
                key={index} 
                className="p-4 bg-card/50 border-muted hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-primary/50"
                onClick={() => handleToolSelect(category.category)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-primary mb-3">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {category.tools.map((tool, toolIndex) => (
                      <div key={toolIndex} className="flex items-center gap-2">
                        <span className="text-lg">{tool.logo}</span>
                        <span className="text-xs text-muted-foreground font-medium">{tool.name}</span>
                      </div>
                    ))}
                    <button className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors mt-3 w-full justify-center">
                      <span>{category.moreCount} more tools</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {/* Interactive Tool Interface */}
          {selectedTool && (
            <div id="interactive-tool-section" className="max-w-4xl mx-auto mt-16 space-y-6">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <span className="text-3xl">
                        {selectedTool === "Text Generation" && "💬"}
                        {selectedTool === "Image Creation" && "🎨"}
                        {selectedTool === "Video Creation" && "🎬"}
                        {selectedTool === "Voice Synthesis" && "🎙️"}
                        {selectedTool === "Audio Enhancement" && "🎵"}
                        {selectedTool === "Development" && "💻"}
                      </span>
                      Try {selectedTool}
                    </CardTitle>
                    <Button variant="outline" onClick={resetDemo}>
                      ← Back
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {!showPricing ? (
                    // Query Input Step
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-lg font-medium">What would you like to create?</label>
                        <Textarea
                          placeholder={`Describe your ${selectedTool.toLowerCase()} task...`}
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          className="min-h-[120px] text-base"
                        />
                      </div>
                      <Button 
                        onClick={handleQuerySubmit}
                        disabled={!userQuery.trim()}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg py-6"
                      >
                        Continue to Model Selection →
                      </Button>
                    </div>
                  ) : (
                    // Model Selection with Pricing
                    <div className="space-y-6">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Your Query:</p>
                        <p className="font-medium">"{userQuery}"</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Choose your preferred model:</h3>
                        {isLoadingCategoryModels ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                            <span className="text-muted-foreground">Loading models...</span>
                          </div>
                        ) : (
                          <div className="grid gap-4">
                            {(categoryModels.length > 0 ? categoryModels : (availableTools[selectedTool]?.models || [])).map((model, index) => (
                            <Card 
                              key={index}
                              className={`p-6 transition-all duration-300 hover:shadow-lg border-2 ${
                                isGenerating 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'cursor-pointer hover:border-primary/50'
                              } ${
                                selectedModel?.name === model.name 
                                  ? 'border-primary bg-primary/5' 
                                  : 'border-muted'
                              }`}
                              onClick={() => !isGenerating && handleModelSelect(model)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-4xl">{model.logo}</div>
                                  <div>
                                    <h4 className="font-semibold text-lg">{model.name}</h4>
                                    <p className="text-sm text-muted-foreground">{model.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary">{model.price}</div>
                                  <div className="text-xs text-muted-foreground">per task</div>
                                </div>
                              </div>
                              {isGenerating && selectedModel?.name === model.name && (
                                <div className="mt-4 space-y-2">
                                  <div className="flex items-center gap-2 text-primary">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm font-medium">Processing your request...</span>
                                  </div>
                                  {generationProgress && (
                                    <p className="text-xs text-muted-foreground ml-6">{generationProgress}</p>
                                  )}
                                  {selectedTool === "Video Creation" && (
                                    <div className="ml-6 space-y-1">
                                      <p className="text-xs text-muted-foreground">
                                        ⏱️ Video generation can take 2-5 minutes
                                      </p>
                                      <div className="w-full bg-muted rounded-full h-1.5">
                                        <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Card>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {generationError && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">❌ Generation Failed</h4>
                          <div className="bg-white dark:bg-red-900/30 p-4 rounded border">
                            <p className="text-sm text-red-700 dark:text-red-300">{generationError}</p>
                          </div>
                          <Button 
                            onClick={() => {
                              setGenerationError(null);
                              setSelectedModel(null);
                            }}
                            className="mt-4 bg-red-600 hover:bg-red-700"
                          >
                            Try Again
                          </Button>
                        </div>
                      )}

                      {generatedResult && !generationError && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-green-800 dark:text-green-200">✅ Task Completed!</h4>
                            {generationCost && (
                              <Badge variant="outline" className="bg-green-100 dark:bg-green-900/50">
                                Cost: ${generationCost.toFixed(6)}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Display result based on content type */}
                          {renderGenerationResult(generationResponse, selectedTool)}
                          
                          <div className="mt-4 flex gap-2">
                            <Button 
                              onClick={resetDemo}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Try Another Tool →
                            </Button>
                            <Button 
                              onClick={() => {
                                setGeneratedResult("");
                                setGenerationResponse(null);
                                setGenerationCost(null);
                                setSelectedModel(null);
                              }}
                              variant="outline"
                            >
                              Generate Again
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              A Platform That Abstracts Away Complexity
            </h2>

            
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 max-w-4xl mx-auto">
              <CardContent className="pt-6">

                <div className="grid md:grid-cols-4 gap-4 text-center">
                  <div className="p-4">
                    <div className="text-3xl mb-2">💬</div>
                    <p className="font-semibold">Tell us what you want done</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl mb-2">🤖</div>
                    <p className="font-semibold">We'll pick the right tool</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl mb-2">💳</div>
                    <p className="font-semibold">Pay per action</p>
                  </div>
                  <div className="p-4">
                    <div className="text-3xl mb-2">✨</div>
                    <p className="font-semibold">Receive output</p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-6 italic">
                  Don't think about models or tools, think in tasks.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Steps */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {workflowSteps.map((item, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl animate-pulse-glow">
                      {item.step}
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* X402 Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">
              X402 as the Economic Layer
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Built for Microtransactions
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Traditional financial systems cannot perform real-time sub-cent payments, maintain multi-rail settlement, or support automated machine-triggered instructions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader>
                <CardTitle className="text-2xl text-accent mb-4">X402 Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    A2A payment flows
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    AP2 interoperability with cards
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    Optional crypto settlement
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    Compliance-native design
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    Instant fund locking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    Multi-party settlement
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-primary mb-4">Real-Time Example</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  In a workflow involving Claude, ElevenLabs, and Runway, X402 can:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Record each action ($0.002 - $0.75)</li>
                  <li>• Allocate appropriate payments</li>
                  <li>• Direct margin to platform</li>
                  <li>• Settle with tool providers</li>
                  <li className="font-medium text-primary">• All in real time</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">


            <p className="text-xl text-muted-foreground">
              Four core components work together to create a seamless, unified environment for AI tool interaction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {architectureComponents.map((component, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-all duration-300 animate-float" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader>
                  <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit text-primary">
                    {component.icon}
                  </div>
                  <CardTitle className="text-xl">{component.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{component.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-muted-foreground">
              Our platform creates value for users, tool providers, and the entire AI ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 animate-float" style={{animationDelay: `${index * 0.2}s`}}>
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit text-primary">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl">For Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Lower friction, instant access to any AI tool, and pay-per-use pricing
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <CardHeader>
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-accent" />
                <CardTitle className="text-2xl">For Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Increased revenue, reduced customer acquisition costs, and broader market reach
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-2xl">For Ecosystem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Enables the agent economy with seamless tool integration and micropayments
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform AI Tool Access?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join us in building the unified consumption layer for the agent economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg">
                Get Early Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-xl gradient-text mb-4">AI Tooling Protocol</div>
              <p className="text-sm text-muted-foreground">
                The unified interface for AI tools. Pay per action, not subscription.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">X (Twitter)</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 AI Tooling Protocol. Powered by X402 micropayments.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
