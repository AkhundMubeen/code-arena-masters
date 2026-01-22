import { useState } from 'react';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sprout, CheckCircle2 } from 'lucide-react';

interface SeedDatabaseProps {
  compact?: boolean;
  onSeeded?: () => void;
}

const DSA_QUESTIONS = [
  // ===== EASY (10) =====
  {
    title: "Sum of Array",
    difficulty: "easy",
    description: "Given a list of space-separated integers, print their sum.",
    hidden_input: "1 2 3 4 5",
    expected_output: "15"
  },
  {
    title: "Reverse a String",
    difficulty: "easy",
    description: "Given a string, print it reversed.",
    hidden_input: "hello",
    expected_output: "olleh"
  },
  {
    title: "Check Palindrome",
    difficulty: "easy",
    description: "Given a string, print 'YES' if it's a palindrome, 'NO' otherwise.",
    hidden_input: "racecar",
    expected_output: "YES"
  },
  {
    title: "Find Factorial",
    difficulty: "easy",
    description: "Given an integer n, print its factorial.",
    hidden_input: "5",
    expected_output: "120"
  },
  {
    title: "Count Vowels",
    difficulty: "easy",
    description: "Given a string, print the count of vowels (a, e, i, o, u).",
    hidden_input: "programming",
    expected_output: "3"
  },
  {
    title: "Find Maximum",
    difficulty: "easy",
    description: "Given a list of space-separated integers, print the maximum value.",
    hidden_input: "3 7 2 9 1 5",
    expected_output: "9"
  },
  {
    title: "Even or Odd",
    difficulty: "easy",
    description: "Given an integer, print 'EVEN' if even, 'ODD' otherwise.",
    hidden_input: "42",
    expected_output: "EVEN"
  },
  {
    title: "Count Words",
    difficulty: "easy",
    description: "Given a sentence, print the number of words.",
    hidden_input: "Hello World from Lovable",
    expected_output: "4"
  },
  {
    title: "Sum of Digits",
    difficulty: "easy",
    description: "Given a positive integer, print the sum of its digits.",
    hidden_input: "12345",
    expected_output: "15"
  },
  {
    title: "First and Last Character",
    difficulty: "easy",
    description: "Given a string, print the first and last character separated by a space.",
    hidden_input: "algorithm",
    expected_output: "a m"
  },

  // ===== MEDIUM (10) =====
  {
    title: "Two Sum",
    difficulty: "medium",
    description: "Given an array of integers and a target sum on separate lines, print the indices (0-based) of two numbers that add up to the target, space-separated.",
    hidden_input: "2 7 11 15\n9",
    expected_output: "0 1"
  },
  {
    title: "Find Duplicates",
    difficulty: "medium",
    description: "Given a list of space-separated integers, print the duplicate values in sorted order, space-separated. Print 'NONE' if no duplicates.",
    hidden_input: "1 2 3 2 4 3 5",
    expected_output: "2 3"
  },
  {
    title: "Sort 0s, 1s, and 2s",
    difficulty: "medium",
    description: "Given an array containing only 0s, 1s, and 2s, print the sorted array space-separated.",
    hidden_input: "2 0 1 2 1 0 0 1",
    expected_output: "0 0 0 1 1 1 2 2"
  },
  {
    title: "Longest Common Prefix",
    difficulty: "medium",
    description: "Given multiple strings on separate lines, print the longest common prefix. Print empty line if none.",
    hidden_input: "flower\nflow\nflight",
    expected_output: "fl"
  },
  {
    title: "Remove Duplicates from Sorted Array",
    difficulty: "medium",
    description: "Given a sorted array, print the array with duplicates removed, space-separated.",
    hidden_input: "1 1 2 2 2 3 4 4 5",
    expected_output: "1 2 3 4 5"
  },
  {
    title: "Rotate Array",
    difficulty: "medium",
    description: "Given an array and k (on separate lines), print the array rotated right by k positions.",
    hidden_input: "1 2 3 4 5 6 7\n3",
    expected_output: "5 6 7 1 2 3 4"
  },
  {
    title: "Majority Element",
    difficulty: "medium",
    description: "Given an array, print the element that appears more than n/2 times. Guaranteed to exist.",
    hidden_input: "3 2 3 3 1 3 3",
    expected_output: "3"
  },
  {
    title: "Move Zeros",
    difficulty: "medium",
    description: "Given an array, move all zeros to the end while maintaining order of non-zero elements. Print space-separated.",
    hidden_input: "0 1 0 3 12",
    expected_output: "1 3 12 0 0"
  },
  {
    title: "Product Except Self",
    difficulty: "medium",
    description: "Given an array, print an array where each element is the product of all elements except itself, space-separated.",
    hidden_input: "1 2 3 4",
    expected_output: "24 12 8 6"
  },
  {
    title: "Container With Most Water",
    difficulty: "medium",
    description: "Given heights of vertical lines, print the maximum water that can be contained between any two lines.",
    hidden_input: "1 8 6 2 5 4 8 3 7",
    expected_output: "49"
  },

  // ===== HARD (10) =====
  {
    title: "Valid Parentheses",
    difficulty: "hard",
    description: "Given a string containing just '(', ')', '{', '}', '[' and ']', print 'VALID' if the brackets are balanced, 'INVALID' otherwise.",
    hidden_input: "{[()]}",
    expected_output: "VALID"
  },
  {
    title: "Generate Fibonacci",
    difficulty: "hard",
    description: "Given n, print the first n Fibonacci numbers space-separated.",
    hidden_input: "10",
    expected_output: "0 1 1 2 3 5 8 13 21 34"
  },
  {
    title: "Next Greater Element",
    difficulty: "hard",
    description: "For each element in the array, print the next greater element to its right. Print -1 if none exists.",
    hidden_input: "4 5 2 25",
    expected_output: "5 25 25 -1"
  },
  {
    title: "Reverse Linked List Simulation",
    difficulty: "hard",
    description: "Given space-separated integers representing a linked list, print them in reverse order.",
    hidden_input: "1 2 3 4 5",
    expected_output: "5 4 3 2 1"
  },
  {
    title: "Merge Two Sorted Arrays",
    difficulty: "hard",
    description: "Given two sorted arrays on separate lines, print the merged sorted array.",
    hidden_input: "1 3 5 7\n2 4 6 8",
    expected_output: "1 2 3 4 5 6 7 8"
  },
  {
    title: "Evaluate Postfix Expression",
    difficulty: "hard",
    description: "Given a postfix expression with space-separated tokens, print the result.",
    hidden_input: "2 3 + 4 *",
    expected_output: "20"
  },
  {
    title: "Min Stack Operations",
    difficulty: "hard",
    description: "Given operations (push X, pop, getMin) on separate lines, print the result of each getMin operation on separate lines.",
    hidden_input: "push 5\npush 3\npush 7\ngetMin\npop\ngetMin",
    expected_output: "3\n3"
  },
  {
    title: "Queue Using Stacks",
    difficulty: "hard",
    description: "Simulate queue operations using stack logic. Given operations (enqueue X, dequeue), print each dequeued value.",
    hidden_input: "enqueue 1\nenqueue 2\ndequeue\nenqueue 3\ndequeue",
    expected_output: "1\n2"
  },
  {
    title: "Binary Search",
    difficulty: "hard",
    description: "Given a sorted array and target (on separate lines), print the index of target or -1 if not found.",
    hidden_input: "1 3 5 7 9 11 13\n7",
    expected_output: "3"
  },
  {
    title: "Find Peak Element",
    difficulty: "hard",
    description: "Given an array, print the index of any peak element (element greater than neighbors).",
    hidden_input: "1 2 3 1",
    expected_output: "2"
  },

  // ===== BEAST (10) =====
  {
    title: "Climbing Stairs",
    difficulty: "beast",
    description: "Given n stairs, print the number of distinct ways to climb to the top if you can take 1 or 2 steps at a time.",
    hidden_input: "5",
    expected_output: "8"
  },
  {
    title: "0/1 Knapsack",
    difficulty: "beast",
    description: "Given capacity, then n items with weight and value pairs on separate lines, print maximum value achievable.",
    hidden_input: "50\n10 60\n20 100\n30 120",
    expected_output: "220"
  },
  {
    title: "Longest Increasing Subsequence",
    difficulty: "beast",
    description: "Given an array, print the length of the longest strictly increasing subsequence.",
    hidden_input: "10 9 2 5 3 7 101 18",
    expected_output: "4"
  },
  {
    title: "Coin Change",
    difficulty: "beast",
    description: "Given coins (first line) and amount (second line), print minimum coins needed. Print -1 if impossible.",
    hidden_input: "1 2 5\n11",
    expected_output: "3"
  },
  {
    title: "Maximum Subarray Sum",
    difficulty: "beast",
    description: "Given an array, print the maximum sum of any contiguous subarray (Kadane's Algorithm).",
    hidden_input: "-2 1 -3 4 -1 2 1 -5 4",
    expected_output: "6"
  },
  {
    title: "Edit Distance",
    difficulty: "beast",
    description: "Given two strings on separate lines, print the minimum number of operations (insert, delete, replace) to convert first to second.",
    hidden_input: "horse\nros",
    expected_output: "3"
  },
  {
    title: "Unique Paths",
    difficulty: "beast",
    description: "Given m and n (grid dimensions) on separate lines, print the number of unique paths from top-left to bottom-right.",
    hidden_input: "3\n7",
    expected_output: "28"
  },
  {
    title: "House Robber",
    difficulty: "beast",
    description: "Given house values, print maximum money you can rob without robbing adjacent houses.",
    hidden_input: "2 7 9 3 1",
    expected_output: "12"
  },
  {
    title: "Word Break",
    difficulty: "beast",
    description: "Given a string and dictionary words (comma-separated on second line), print 'YES' if string can be segmented, 'NO' otherwise.",
    hidden_input: "leetcode\nleet,code",
    expected_output: "YES"
  },
  {
    title: "Minimum Path Sum",
    difficulty: "beast",
    description: "Given a grid (rows on separate lines, space-separated values), print the minimum path sum from top-left to bottom-right.",
    hidden_input: "1 3 1\n1 5 1\n4 2 1",
    expected_output: "7"
  }
];

export function SeedDatabase({ compact = false, onSeeded }: SeedDatabaseProps) {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      // Check if questions already exist
      const { data: existing, error: checkError } = await db
        .from('questions')
        .select('id')
        .is('competition_id', null)
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0 && !compact) {
        const confirmed = window.confirm(
          'Practice questions already exist. Do you want to add 40 more questions? (This will not delete existing ones)'
        );
        if (!confirmed) {
          setIsSeeding(false);
          return;
        }
      }

      // Insert all questions in batch
      const questionsToInsert = DSA_QUESTIONS.map(q => ({
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        hidden_input: q.hidden_input,
        expected_output: q.expected_output,
        competition_id: null
      }));

      const { error } = await db.from('questions').insert(questionsToInsert);

      if (error) throw error;

      setSeeded(true);
      toast({
        title: '🌱 Database Seeded!',
        description: `Successfully added ${DSA_QUESTIONS.length} DSA questions across all difficulty levels.`
      });
      onSeeded?.();
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: 'Seeding Failed',
        description: 'Could not seed the database. Check console for details.',
        variant: 'destructive'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  if (compact) {
    return (
      <Button 
        onClick={handleSeed} 
        disabled={isSeeding}
        size="sm"
        className="w-full neon-glow-green"
      >
        {isSeeding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Seeding...
          </>
        ) : (
          <>
            <Sprout className="mr-2 h-4 w-4" />
            Seed 40 Questions
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="glass-card border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-accent" />
          Seed Practice Questions
        </CardTitle>
        <CardDescription>
          Populate the database with 40 curated DSA questions (10 Easy, 10 Medium, 10 Hard, 10 Beast)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="p-2 rounded bg-primary/10 border border-primary/30">
              <span className="font-medium text-primary">Easy:</span> 10 questions
            </div>
            <div className="p-2 rounded bg-accent/10 border border-accent/30">
              <span className="font-medium text-accent">Medium:</span> 10 questions
            </div>
            <div className="p-2 rounded bg-destructive/10 border border-destructive/30">
              <span className="font-medium text-destructive">Hard:</span> 10 questions
            </div>
            <div className="p-2 rounded bg-destructive/20 border border-destructive/50">
              <span className="font-medium text-destructive">Beast:</span> 10 questions
            </div>
          </div>

          <Button 
            onClick={handleSeed} 
            disabled={isSeeding}
            className="w-full neon-glow-green"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : seeded ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Seed Again
              </>
            ) : (
              <>
                <Sprout className="mr-2 h-4 w-4" />
                Seed 40 DSA Questions
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
