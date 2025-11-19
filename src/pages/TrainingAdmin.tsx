import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface TrainingContent {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  quiz_data: QuizQuestion[];
  passing_score: number;
  active: boolean;
  created_at: string;
}

const TrainingAdmin = () => {
  const [trainings, setTrainings] = useState<TrainingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 }
  ]);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      const { data, error } = await supabase
        .from('training_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainings((data || []).map(item => ({
        ...item,
        quiz_data: item.quiz_data as unknown as QuizQuestion[]
      })));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading trainings",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex] = value;
    setQuizQuestions(updated);
  };

  const createTraining = async () => {
    if (!title || quizQuestions.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Please provide a title and at least one quiz question",
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      const { error } = await supabase
        .from('training_content')
        .insert([{
          organization_id: profile.organization_id,
          title,
          description,
          video_url: videoUrl || null,
          quiz_data: quizQuestions as any,
          passing_score: passingScore,
          created_by: user.id,
          active: true,
        }]);

      if (error) throw error;

      toast({
        title: "Training created",
        description: "Training content has been created successfully",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setPassingScore(70);
      setQuizQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);

      fetchTrainings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Creation failed",
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleActive = async (trainingId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('training_content')
        .update({ active: !currentStatus })
        .eq('id', trainingId);

      if (error) throw error;

      toast({
        title: "Training updated",
        description: `Training ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchTrainings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage security awareness training content
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Training
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Training</DialogTitle>
              <DialogDescription>
                Add training content with video and quiz questions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Phishing Awareness Training"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the training..."
                />
              </div>

              <div>
                <Label htmlFor="video">Video URL (YouTube, Vimeo, etc.)</Label>
                <Input
                  id="video"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label htmlFor="passing">Passing Score (%)</Label>
                <Input
                  id="passing"
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Quiz Questions</Label>
                  <Button onClick={addQuestion} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {quizQuestions.map((q, qIndex) => (
                  <Card key={qIndex}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                        {quizQuestions.length > 1 && (
                          <Button
                            onClick={() => removeQuestion(qIndex)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Enter your question..."
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      />

                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                            className="w-4 h-4"
                          />
                          <Input
                            placeholder={`Option ${oIndex + 1}`}
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={createTraining} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Training
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {trainings.map((training) => (
          <Card key={training.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{training.title}</CardTitle>
                  <CardDescription>{training.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(training.id, training.active)}
                  >
                    {training.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Quiz Questions</p>
                  <p className="font-medium">{training.quiz_data.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Passing Score</p>
                  <p className="font-medium">{training.passing_score}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">
                    {training.active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-gray-600">Inactive</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(training.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrainingAdmin;