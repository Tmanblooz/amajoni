import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
}

interface Completion {
  score: number;
  passed: boolean;
  completed_at: string;
}

const Training = () => {
  const [trainings, setTrainings] = useState<TrainingContent[]>([]);
  const [completions, setCompletions] = useState<Record<string, Completion>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<TrainingContent | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      const { data, error } = await supabase
        .from('training_content')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const trainingsData = (data || []).map(item => ({
        ...item,
        quiz_data: item.quiz_data as unknown as QuizQuestion[]
      }));
      setTrainings(trainingsData);

      // Fetch user completions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: completionsData } = await supabase
          .from('training_completions')
          .select('training_id, score, passed, completed_at')
          .eq('user_id', user.id);

        if (completionsData) {
          const completionsMap: Record<string, Completion> = {};
          completionsData.forEach(c => {
            completionsMap[c.training_id] = {
              score: c.score,
              passed: c.passed,
              completed_at: c.completed_at
            };
          });
          setCompletions(completionsMap);
        }
      }
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

  const startTraining = (training: TrainingContent) => {
    setSelectedTraining(training);
    setAnswers({});
    setShowResults(false);
  };

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    setAnswers({ ...answers, [questionIndex]: answerIndex });
  };

  const submitQuiz = async () => {
    if (!selectedTraining) return;

    // Calculate score
    let correct = 0;
    selectedTraining.quiz_data.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / selectedTraining.quiz_data.length) * 100);
    const passed = score >= selectedTraining.passing_score;

    setQuizScore(score);
    setShowResults(true);
    setSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-training', {
        body: {
          training_id: selectedTraining.id,
          answers: answers,
        },
      });

      if (error) throw error;

      const score = data.score;
      const passed = data.passed;

      toast({
        title: passed ? "Congratulations!" : "Quiz Completed",
        description: passed
          ? `You passed with ${score}%`
          : `You scored ${score}%. You need ${selectedTraining.passing_score}% to pass.`,
        variant: passed ? "default" : "destructive",
      });

      fetchTrainings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedTraining) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{selectedTraining.title}</h1>
          <Button variant="outline" onClick={() => setSelectedTraining(null)}>
            Back to Training List
          </Button>
        </div>

        {selectedTraining.description && (
          <p className="text-muted-foreground">{selectedTraining.description}</p>
        )}

        {selectedTraining.video_url && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Training Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <iframe
                  src={selectedTraining.video_url}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title="Training Video"
                />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
            <CardDescription>
              Answer all questions to complete the training (Passing score: {selectedTraining.passing_score}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedTraining.quiz_data.map((question, qIndex) => (
              <div key={qIndex} className="space-y-3">
                <Label className="text-base font-semibold">
                  {qIndex + 1}. {question.question}
                </Label>
                <RadioGroup
                  value={answers[qIndex]?.toString()}
                  onValueChange={(value) => selectAnswer(qIndex, parseInt(value))}
                  disabled={showResults}
                >
                  {question.options.map((option, oIndex) => (
                    <div
                      key={oIndex}
                      className={`flex items-center space-x-2 p-3 rounded-lg border ${
                        showResults
                          ? oIndex === question.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : answers[qIndex] === oIndex
                            ? 'border-red-500 bg-red-50'
                            : ''
                          : ''
                      }`}
                    >
                      <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}-o${oIndex}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                      {showResults && oIndex === question.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {showResults && answers[qIndex] === oIndex && oIndex !== question.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            {showResults && (
              <div className="pt-6 border-t">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-2xl font-bold">Your Score: {quizScore}%</p>
                    <Progress value={quizScore} className="mt-2" />
                  </div>
                  {quizScore >= selectedTraining.passing_score ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-6 w-6" />
                      <p className="text-lg font-semibold">You Passed!</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <XCircle className="h-6 w-6" />
                      <p className="text-lg font-semibold">You need {selectedTraining.passing_score}% to pass</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!showResults && (
              <Button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length !== selectedTraining.quiz_data.length || submitting}
                className="w-full"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Awareness Training</h1>
        <p className="text-muted-foreground mt-2">
          Complete these training modules to improve your security awareness
        </p>
      </div>

      <div className="grid gap-4">
        {trainings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No training content available at this time
            </CardContent>
          </Card>
        ) : (
          trainings.map((training) => {
            const completion = completions[training.id];
            return (
              <Card key={training.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {training.title}
                        {completion?.passed && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </CardTitle>
                      {training.description && (
                        <CardDescription className="mt-2">{training.description}</CardDescription>
                      )}
                    </div>
                    <Button
                      onClick={() => startTraining(training)}
                      variant={completion?.passed ? "outline" : "default"}
                    >
                      {completion?.passed ? "Retake" : "Start Training"}
                    </Button>
                  </div>
                </CardHeader>
                {completion && (
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Score</p>
                        <p className="font-medium">{completion.score}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={`font-medium ${completion.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {completion.passed ? 'Passed' : 'Failed'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">
                          {new Date(completion.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Training;