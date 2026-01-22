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
    description: `Given an array of N integers, calculate and print the sum of all elements.

**Input Format:**
- First line: N (number of elements)
- Second line: N space-separated integers

**Output Format:**
- A single integer representing the sum

**Constraints:**
- 1 ≤ N ≤ 10^5
- -10^6 ≤ arr[i] ≤ 10^6

**Example:**
Input:
5
1 2 3 4 5

Output:
15

**Explanation:** 1 + 2 + 3 + 4 + 5 = 15`,
    hidden_input: "7\n-3 15 8 -12 6 21 -7",
    expected_output: "28"
  },
  {
    title: "Reverse a String",
    difficulty: "easy",
    description: `Given a string S, print the reversed string.

**Input Format:**
- A single line containing string S

**Output Format:**
- The reversed string

**Constraints:**
- 1 ≤ |S| ≤ 10^4
- S contains only alphanumeric characters

**Example:**
Input:
programming

Output:
gnimmargorp

**Explanation:** The characters are reversed from end to start.`,
    hidden_input: "DataStructures2024",
    expected_output: "4202serutcurtSataD"
  },
  {
    title: "Check Palindrome",
    difficulty: "easy",
    description: `Given a string S, determine if it reads the same forwards and backwards (case-insensitive, ignoring spaces).

**Input Format:**
- A single line containing string S

**Output Format:**
- Print "YES" if palindrome, "NO" otherwise

**Constraints:**
- 1 ≤ |S| ≤ 10^4

**Example 1:**
Input:
RaceCar

Output:
YES

**Example 2:**
Input:
Hello

Output:
NO

**Explanation:** "racecar" reversed is still "racecar" (ignoring case).`,
    hidden_input: "A man a plan a canal Panama",
    expected_output: "YES"
  },
  {
    title: "Find Factorial",
    difficulty: "easy",
    description: `Given a non-negative integer N, calculate N! (N factorial).

**Input Format:**
- A single integer N

**Output Format:**
- The factorial of N

**Constraints:**
- 0 ≤ N ≤ 20

**Example:**
Input:
6

Output:
720

**Explanation:** 6! = 6 × 5 × 4 × 3 × 2 × 1 = 720

**Note:** 0! = 1 by definition.`,
    hidden_input: "12",
    expected_output: "479001600"
  },
  {
    title: "Count Vowels",
    difficulty: "easy",
    description: `Given a string S, count the number of vowels (a, e, i, o, u) in it. Count both uppercase and lowercase vowels.

**Input Format:**
- A single line containing string S

**Output Format:**
- An integer representing the count of vowels

**Constraints:**
- 1 ≤ |S| ≤ 10^4

**Example:**
Input:
Competitive Programming

Output:
8

**Explanation:** o, e, i, i, e, o, a, i = 8 vowels`,
    hidden_input: "MUET Code Arena Championship 2024",
    expected_output: "12"
  },
  {
    title: "Find Maximum and Minimum",
    difficulty: "easy",
    description: `Given an array of N integers, find both the maximum and minimum elements.

**Input Format:**
- First line: N (number of elements)
- Second line: N space-separated integers

**Output Format:**
- Two space-separated integers: maximum and minimum

**Constraints:**
- 1 ≤ N ≤ 10^5
- -10^9 ≤ arr[i] ≤ 10^9

**Example:**
Input:
6
3 7 2 9 1 5

Output:
9 1

**Explanation:** Maximum is 9, minimum is 1.`,
    hidden_input: "8\n-45 78 12 -89 0 156 -23 67",
    expected_output: "156 -89"
  },
  {
    title: "Even or Odd",
    difficulty: "easy",
    description: `Given N integers, for each integer print whether it's EVEN or ODD.

**Input Format:**
- First line: N (count of numbers)
- Next N lines: One integer per line

**Output Format:**
- N lines, each containing "EVEN" or "ODD"

**Constraints:**
- 1 ≤ N ≤ 100
- -10^9 ≤ number ≤ 10^9

**Example:**
Input:
4
42
17
-8
0

Output:
EVEN
ODD
EVEN
EVEN

**Note:** Zero is considered EVEN. Negative numbers follow the same rule.`,
    hidden_input: "5\n1000000\n-777\n0\n123456789\n-2",
    expected_output: "EVEN\nODD\nEVEN\nODD\nEVEN"
  },
  {
    title: "Count Words",
    difficulty: "easy",
    description: `Given a sentence, count the number of words. Words are separated by single spaces.

**Input Format:**
- A single line containing the sentence

**Output Format:**
- An integer representing word count

**Constraints:**
- 1 ≤ |sentence| ≤ 10^4
- No leading/trailing spaces
- Words separated by exactly one space

**Example:**
Input:
The quick brown fox jumps over the lazy dog

Output:
9

**Explanation:** There are 9 words in this sentence.`,
    hidden_input: "Data Structures and Algorithms are fundamental to Computer Science",
    expected_output: "9"
  },
  {
    title: "Sum of Digits",
    difficulty: "easy",
    description: `Given a positive integer N, calculate the sum of all its digits.

**Input Format:**
- A single positive integer N

**Output Format:**
- Sum of digits of N

**Constraints:**
- 1 ≤ N ≤ 10^18

**Example:**
Input:
9876543210

Output:
45

**Explanation:** 9+8+7+6+5+4+3+2+1+0 = 45`,
    hidden_input: "123456789012345",
    expected_output: "60"
  },
  {
    title: "FizzBuzz",
    difficulty: "easy",
    description: `Print numbers from 1 to N with the following rules:
- If divisible by 3, print "Fizz"
- If divisible by 5, print "Buzz"  
- If divisible by both 3 and 5, print "FizzBuzz"
- Otherwise, print the number

**Input Format:**
- A single integer N

**Output Format:**
- N lines of output following the rules above

**Constraints:**
- 1 ≤ N ≤ 100

**Example:**
Input:
15

Output:
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz`,
    hidden_input: "20",
    expected_output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz"
  },

  // ===== MEDIUM (10) =====
  {
    title: "Two Sum",
    difficulty: "medium",
    description: `Given an array of N integers and a target sum T, find two distinct indices i and j such that arr[i] + arr[j] = T.

**Input Format:**
- First line: N (array size) and T (target sum)
- Second line: N space-separated integers

**Output Format:**
- Two space-separated 0-based indices (smaller index first)
- Print "-1" if no solution exists

**Constraints:**
- 2 ≤ N ≤ 10^4
- -10^9 ≤ arr[i], T ≤ 10^9
- Exactly one solution exists (if any)

**Example:**
Input:
4 9
2 7 11 15

Output:
0 1

**Explanation:** arr[0] + arr[1] = 2 + 7 = 9`,
    hidden_input: "6 15\n3 8 12 7 5 10",
    expected_output: "1 3"
  },
  {
    title: "Find All Duplicates",
    difficulty: "medium",
    description: `Given an array of N integers where each integer is between 1 and N (inclusive), some elements appear twice while others appear once. Find all elements that appear twice.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- Space-separated duplicates in sorted order
- Print "NONE" if no duplicates

**Constraints:**
- 1 ≤ N ≤ 10^5
- 1 ≤ arr[i] ≤ N

**Example:**
Input:
8
4 3 2 7 8 2 3 1

Output:
2 3

**Explanation:** 2 and 3 appear twice each.`,
    hidden_input: "10\n1 5 3 7 9 5 3 8 3 2",
    expected_output: "3 5"
  },
  {
    title: "Dutch National Flag",
    difficulty: "medium",
    description: `Given an array containing only 0s, 1s, and 2s, sort it in-place in O(n) time using the Dutch National Flag algorithm (single pass).

**Input Format:**
- First line: N (array size)
- Second line: N space-separated integers (only 0, 1, 2)

**Output Format:**
- Sorted array, space-separated

**Constraints:**
- 1 ≤ N ≤ 10^5

**Example:**
Input:
8
2 0 1 2 1 0 0 1

Output:
0 0 0 1 1 1 2 2

**Hint:** Use three pointers - low, mid, high.`,
    hidden_input: "15\n1 0 2 1 0 2 2 0 1 1 0 2 1 0 2",
    expected_output: "0 0 0 0 0 1 1 1 1 1 2 2 2 2 2"
  },
  {
    title: "Longest Common Prefix",
    difficulty: "medium",
    description: `Given N strings, find the longest common prefix among all strings.

**Input Format:**
- First line: N (number of strings)
- Next N lines: One string per line

**Output Format:**
- The longest common prefix
- Print "NONE" if no common prefix exists

**Constraints:**
- 1 ≤ N ≤ 200
- 1 ≤ |string| ≤ 200

**Example:**
Input:
3
flower
flow
flight

Output:
fl

**Explanation:** "fl" is common to all three strings.`,
    hidden_input: "4\ninterstellar\ninternet\ninternal\ninterface",
    expected_output: "inter"
  },
  {
    title: "Remove Duplicates In-Place",
    difficulty: "medium",
    description: `Given a sorted array, remove duplicates in-place such that each element appears only once. Return the new length and the modified array.

**Input Format:**
- First line: N
- Second line: N sorted space-separated integers

**Output Format:**
- First line: New length K
- Second line: First K elements of modified array

**Constraints:**
- 1 ≤ N ≤ 10^4
- -10^4 ≤ arr[i] ≤ 10^4

**Example:**
Input:
7
1 1 2 2 2 3 3

Output:
3
1 2 3`,
    hidden_input: "12\n0 0 1 1 1 2 2 3 3 4 4 4",
    expected_output: "5\n0 1 2 3 4"
  },
  {
    title: "Rotate Array",
    difficulty: "medium",
    description: `Given an array of N elements, rotate it to the right by K steps.

**Input Format:**
- First line: N and K
- Second line: N space-separated integers

**Output Format:**
- Rotated array, space-separated

**Constraints:**
- 1 ≤ N ≤ 10^5
- 0 ≤ K ≤ 10^9

**Example:**
Input:
7 3
1 2 3 4 5 6 7

Output:
5 6 7 1 2 3 4

**Explanation:** After 3 right rotations: [5,6,7,1,2,3,4]

**Hint:** K might be larger than N. Use K % N.`,
    hidden_input: "8 11\n10 20 30 40 50 60 70 80",
    expected_output: "60 70 80 10 20 30 40 50"
  },
  {
    title: "Majority Element",
    difficulty: "medium",
    description: `Given an array of N elements, find the element that appears more than ⌊N/2⌋ times (the majority element). Use Boyer-Moore Voting Algorithm for O(1) space.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- The majority element
- Print "NONE" if no majority exists

**Constraints:**
- 1 ≤ N ≤ 10^5
- The majority element is guaranteed to exist

**Example:**
Input:
7
3 2 3 3 1 3 3

Output:
3

**Explanation:** 3 appears 5 times, which is > 7/2 = 3.`,
    hidden_input: "11\n5 5 7 5 7 5 5 7 5 7 5",
    expected_output: "5"
  },
  {
    title: "Move Zeros",
    difficulty: "medium",
    description: `Given an array of N integers, move all zeros to the end while maintaining the relative order of non-zero elements. Do this in-place without making a copy.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- Modified array, space-separated

**Constraints:**
- 1 ≤ N ≤ 10^4

**Example:**
Input:
5
0 1 0 3 12

Output:
1 3 12 0 0

**Explanation:** Non-zeros maintain order: 1, 3, 12. Zeros moved to end.`,
    hidden_input: "10\n0 0 1 0 2 0 0 3 0 4",
    expected_output: "1 2 3 4 0 0 0 0 0 0"
  },
  {
    title: "Product Except Self",
    difficulty: "medium",
    description: `Given an array of N integers, return an array where each element is the product of all elements except itself. Solve without using division and in O(n) time.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- Result array, space-separated

**Constraints:**
- 2 ≤ N ≤ 10^5
- -30 ≤ arr[i] ≤ 30
- Product fits in 32-bit integer

**Example:**
Input:
4
1 2 3 4

Output:
24 12 8 6

**Explanation:** 
- result[0] = 2×3×4 = 24
- result[1] = 1×3×4 = 12
- result[2] = 1×2×4 = 8
- result[3] = 1×2×3 = 6`,
    hidden_input: "5\n2 3 0 5 4",
    expected_output: "0 0 120 0 0"
  },
  {
    title: "Container With Most Water",
    difficulty: "medium",
    description: `Given N non-negative integers representing heights of vertical lines at positions 0 to N-1, find two lines that together with the x-axis forms a container that holds the most water.

**Input Format:**
- First line: N
- Second line: N space-separated heights

**Output Format:**
- Maximum water that can be contained

**Constraints:**
- 2 ≤ N ≤ 10^5
- 0 ≤ height[i] ≤ 10^4

**Example:**
Input:
9
1 8 6 2 5 4 8 3 7

Output:
49

**Explanation:** Lines at index 1 (height 8) and index 8 (height 7) form the container. Area = min(8,7) × (8-1) = 7 × 7 = 49`,
    hidden_input: "10\n4 3 2 1 4 5 6 7 8 1",
    expected_output: "32"
  },

  // ===== HARD (10) =====
  {
    title: "Valid Parentheses",
    difficulty: "hard",
    description: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

A string is valid if:
1. Open brackets are closed by the same type of brackets
2. Open brackets are closed in the correct order
3. Every close bracket has a corresponding open bracket

**Input Format:**
- A single string of brackets

**Output Format:**
- "VALID" or "INVALID"

**Constraints:**
- 1 ≤ |S| ≤ 10^4

**Example 1:**
Input:
{[()]}

Output:
VALID

**Example 2:**
Input:
([)]

Output:
INVALID

**Hint:** Use a stack data structure.`,
    hidden_input: "{{[[(())]]}}[]{}()",
    expected_output: "VALID"
  },
  {
    title: "Generate Fibonacci",
    difficulty: "hard",
    description: `Generate the first N Fibonacci numbers. Use memoization or dynamic programming for efficiency.

**Input Format:**
- A single integer N

**Output Format:**
- N space-separated Fibonacci numbers

**Constraints:**
- 1 ≤ N ≤ 50

**Example:**
Input:
10

Output:
0 1 1 2 3 5 8 13 21 34

**Note:** F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)`,
    hidden_input: "20",
    expected_output: "0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 1597 2584 4181"
  },
  {
    title: "Next Greater Element",
    difficulty: "hard",
    description: `For each element in the array, find the next greater element (NGE). NGE for an element x is the first greater element on its right side. If no greater element exists, output -1.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- N space-separated integers (NGE for each element)

**Constraints:**
- 1 ≤ N ≤ 10^5
- 1 ≤ arr[i] ≤ 10^9

**Example:**
Input:
4
4 5 2 25

Output:
5 25 25 -1

**Explanation:**
- 4 → 5 (next greater)
- 5 → 25 (next greater)
- 2 → 25 (next greater)
- 25 → -1 (no greater element)

**Hint:** Use a stack for O(n) solution.`,
    hidden_input: "8\n11 13 21 3 8 5 17 9",
    expected_output: "13 21 -1 8 17 17 -1 -1"
  },
  {
    title: "Merge Two Sorted Arrays",
    difficulty: "hard",
    description: `Given two sorted arrays, merge them into a single sorted array without using extra space proportional to N+M (merge in-place conceptually).

**Input Format:**
- First line: N M (sizes of arrays)
- Second line: N sorted integers (array 1)
- Third line: M sorted integers (array 2)

**Output Format:**
- Single sorted merged array, space-separated

**Constraints:**
- 1 ≤ N, M ≤ 10^5
- -10^9 ≤ arr[i] ≤ 10^9

**Example:**
Input:
4 5
1 3 5 7
2 4 6 8 10

Output:
1 2 3 4 5 6 7 8 10`,
    hidden_input: "6 7\n-15 -3 0 8 22 100\n-20 -10 5 12 50 75 200",
    expected_output: "-20 -15 -10 -3 0 5 8 12 22 50 75 100 200"
  },
  {
    title: "Evaluate Postfix Expression",
    difficulty: "hard",
    description: `Evaluate a postfix (Reverse Polish Notation) expression.

**Input Format:**
- Space-separated tokens (operands and operators)
- Operators: +, -, *, /

**Output Format:**
- Integer result (truncate toward zero for division)

**Constraints:**
- Valid expression guaranteed
- No division by zero
- Result fits in 32-bit integer

**Example:**
Input:
2 3 + 4 * 6 -

Output:
14

**Explanation:** 
- 2 3 + → 5
- 5 4 * → 20
- 20 6 - → 14`,
    hidden_input: "5 1 2 + 4 * + 3 -",
    expected_output: "14"
  },
  {
    title: "Min Stack",
    difficulty: "hard",
    description: `Implement a stack that supports push, pop, and retrieving the minimum element in O(1) time.

**Input Format:**
- First line: N (number of operations)
- Next N lines: Operations (PUSH x, POP, MIN)

**Output Format:**
- For each MIN operation, print the minimum element

**Constraints:**
- 1 ≤ N ≤ 10^4
- -10^9 ≤ x ≤ 10^9
- POP and MIN called on non-empty stack

**Example:**
Input:
7
PUSH 5
PUSH 3
PUSH 7
MIN
POP
POP
MIN

Output:
3
5`,
    hidden_input: "10\nPUSH 10\nPUSH 5\nMIN\nPUSH 3\nMIN\nPOP\nMIN\nPOP\nMIN\nPOP",
    expected_output: "5\n3\n5\n10"
  },
  {
    title: "Binary Search",
    difficulty: "hard",
    description: `Implement binary search to find the index of a target element in a sorted array. If the target appears multiple times, return the first (leftmost) occurrence.

**Input Format:**
- First line: N (array size)
- Second line: N sorted integers
- Third line: Target value

**Output Format:**
- Index of target (0-based), or -1 if not found

**Constraints:**
- 1 ≤ N ≤ 10^5
- -10^9 ≤ arr[i], target ≤ 10^9

**Example:**
Input:
7
1 2 2 2 3 4 5
2

Output:
1

**Explanation:** First occurrence of 2 is at index 1.`,
    hidden_input: "10\n-50 -20 0 15 15 15 30 45 60 100\n15",
    expected_output: "3"
  },
  {
    title: "Find Peak Element",
    difficulty: "hard",
    description: `A peak element is an element that is strictly greater than its neighbors. Given an array, find any peak element and return its index. Use O(log n) time complexity.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- Index of any peak element

**Constraints:**
- 1 ≤ N ≤ 10^5
- -2^31 ≤ arr[i] ≤ 2^31 - 1
- arr[i] ≠ arr[i+1] for all valid i

**Example:**
Input:
5
1 2 3 1 0

Output:
2

**Explanation:** arr[2] = 3 is a peak (3 > 2 and 3 > 1).

**Note:** Multiple peaks may exist. Return any one.`,
    hidden_input: "8\n1 3 2 4 6 5 7 8",
    expected_output: "7"
  },
  {
    title: "Spiral Matrix",
    difficulty: "hard",
    description: `Given an M×N matrix, return all elements in spiral order (clockwise from outside to inside).

**Input Format:**
- First line: M N (rows, columns)
- Next M lines: N space-separated integers each

**Output Format:**
- All elements in spiral order, space-separated

**Constraints:**
- 1 ≤ M, N ≤ 100

**Example:**
Input:
3 4
1 2 3 4
5 6 7 8
9 10 11 12

Output:
1 2 3 4 8 12 11 10 9 5 6 7`,
    hidden_input: "4 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16",
    expected_output: "1 2 3 4 8 12 16 15 14 13 9 5 6 7 11 10"
  },
  {
    title: "LRU Cache",
    difficulty: "hard",
    description: `Implement an LRU (Least Recently Used) Cache with capacity C.

Operations:
- GET x: Return value of key x, or -1 if not found
- PUT x y: Insert/update key x with value y

**Input Format:**
- First line: C (capacity) and N (operations)
- Next N lines: GET x or PUT x y

**Output Format:**
- For each GET, print the result

**Constraints:**
- 1 ≤ C ≤ 100
- 1 ≤ N ≤ 10^4

**Example:**
Input:
2 6
PUT 1 10
PUT 2 20
GET 1
PUT 3 30
GET 2
GET 3

Output:
10
-1
30

**Explanation:** When PUT 3 is called, key 2 is evicted (LRU). GET 2 returns -1.`,
    hidden_input: "3 10\nPUT 1 100\nPUT 2 200\nPUT 3 300\nGET 2\nPUT 4 400\nGET 1\nGET 3\nGET 4\nPUT 5 500\nGET 2",
    expected_output: "200\n-1\n300\n400\n-1"
  },

  // ===== BEAST (10) =====
  {
    title: "Climbing Stairs (DP)",
    difficulty: "beast",
    description: `You are climbing a staircase with N steps. Each time you can climb 1, 2, or 3 steps. In how many distinct ways can you reach the top?

**Input Format:**
- A single integer N

**Output Format:**
- Number of distinct ways (mod 10^9 + 7)

**Constraints:**
- 1 ≤ N ≤ 10^6

**Example:**
Input:
5

Output:
13

**Explanation:** Ways to climb 5 stairs:
1+1+1+1+1, 1+1+1+2, 1+1+2+1, 1+2+1+1, 2+1+1+1,
1+2+2, 2+1+2, 2+2+1, 1+1+3, 1+3+1, 3+1+1, 2+3, 3+2 = 13 ways

**Hint:** Use DP with recurrence: dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`,
    hidden_input: "25",
    expected_output: "2555757"
  },
  {
    title: "0/1 Knapsack",
    difficulty: "beast",
    description: `Given N items with weights and values, and a knapsack of capacity W, find the maximum value you can carry. Each item can only be taken once.

**Input Format:**
- First line: N W (items, capacity)
- Next N lines: weight value (for each item)

**Output Format:**
- Maximum value achievable

**Constraints:**
- 1 ≤ N ≤ 100
- 1 ≤ W ≤ 10^4
- 1 ≤ weight, value ≤ 1000

**Example:**
Input:
4 7
1 1
3 4
4 5
5 7

Output:
9

**Explanation:** Take items with (weight=3, value=4) and (weight=4, value=5). Total: weight=7, value=9`,
    hidden_input: "5 15\n2 10\n5 20\n6 25\n8 30\n3 12",
    expected_output: "67"
  },
  {
    title: "Longest Increasing Subsequence",
    difficulty: "beast",
    description: `Find the length of the longest strictly increasing subsequence in an array. Use O(n log n) algorithm.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- Length of LIS

**Constraints:**
- 1 ≤ N ≤ 10^5
- -10^9 ≤ arr[i] ≤ 10^9

**Example:**
Input:
8
10 9 2 5 3 7 101 18

Output:
4

**Explanation:** LIS is [2, 3, 7, 18] or [2, 3, 7, 101] or [2, 5, 7, 18], etc. Length = 4.

**Hint:** Use binary search with patience sorting.`,
    hidden_input: "15\n3 10 2 1 20 4 6 8 5 7 9 11 12 14 13",
    expected_output: "9"
  },
  {
    title: "Coin Change",
    difficulty: "beast",
    description: `Given coins of different denominations and a total amount, find the minimum number of coins needed to make that amount. You have infinite supply of each coin.

**Input Format:**
- First line: N (number of coin types)
- Second line: N space-separated coin values
- Third line: Target amount

**Output Format:**
- Minimum coins needed, or -1 if impossible

**Constraints:**
- 1 ≤ N ≤ 12
- 1 ≤ coins[i] ≤ 2^31 - 1
- 0 ≤ amount ≤ 10^4

**Example:**
Input:
3
1 2 5
11

Output:
3

**Explanation:** 11 = 5 + 5 + 1 (3 coins)`,
    hidden_input: "4\n1 5 10 25\n63",
    expected_output: "6"
  },
  {
    title: "Maximum Subarray Sum (Kadane's)",
    difficulty: "beast",
    description: `Find the contiguous subarray with the largest sum and return both the sum and the subarray indices.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- First line: Maximum sum
- Second line: Start and end indices (0-based, inclusive)

**Constraints:**
- 1 ≤ N ≤ 10^5
- -10^4 ≤ arr[i] ≤ 10^4

**Example:**
Input:
9
-2 1 -3 4 -1 2 1 -5 4

Output:
6
3 6

**Explanation:** Subarray [4, -1, 2, 1] has sum 6 (indices 3 to 6).`,
    hidden_input: "12\n-5 4 -2 6 -8 10 -1 3 5 -3 2 1",
    expected_output: "17\n5 8"
  },
  {
    title: "Edit Distance",
    difficulty: "beast",
    description: `Given two strings, find the minimum number of operations (insert, delete, replace a character) required to convert string1 to string2.

**Input Format:**
- First line: String 1
- Second line: String 2

**Output Format:**
- Minimum number of operations

**Constraints:**
- 0 ≤ |string1|, |string2| ≤ 500

**Example:**
Input:
horse
ros

Output:
3

**Explanation:**
horse → rorse (replace 'h' with 'r')
rorse → rose (remove 'r')
rose → ros (remove 'e')`,
    hidden_input: "intention\nexecution",
    expected_output: "5"
  },
  {
    title: "Unique Paths with Obstacles",
    difficulty: "beast",
    description: `A robot is on an M×N grid and wants to reach bottom-right from top-left. It can only move right or down. Some cells have obstacles (1). Count unique paths.

**Input Format:**
- First line: M N
- Next M lines: N space-separated values (0=empty, 1=obstacle)

**Output Format:**
- Number of unique paths (mod 10^9 + 7)

**Constraints:**
- 1 ≤ M, N ≤ 100

**Example:**
Input:
3 3
0 0 0
0 1 0
0 0 0

Output:
2

**Explanation:** Two paths around the obstacle.`,
    hidden_input: "4 5\n0 0 0 0 0\n0 0 1 0 0\n0 1 0 0 0\n0 0 0 1 0",
    expected_output: "7"
  },
  {
    title: "House Robber",
    difficulty: "beast",
    description: `You are a robber planning to rob houses along a street. Each house has a certain amount of money. You cannot rob two adjacent houses (alarm triggers). Find maximum money you can rob.

**Input Format:**
- First line: N
- Second line: N space-separated integers (money in each house)

**Output Format:**
- Maximum money you can rob

**Constraints:**
- 1 ≤ N ≤ 100
- 0 ≤ nums[i] ≤ 400

**Example:**
Input:
5
2 7 9 3 1

Output:
12

**Explanation:** Rob houses 0, 2, 4: 2 + 9 + 1 = 12. Or houses 1, 3: 7 + 3 = 10. Maximum is 12.`,
    hidden_input: "10\n6 7 1 30 8 2 4 25 3 10",
    expected_output: "75"
  },
  {
    title: "Word Break",
    difficulty: "beast",
    description: `Given a string S and a dictionary of words, determine if S can be segmented into a space-separated sequence of one or more dictionary words.

**Input Format:**
- First line: String S
- Second line: N (dictionary size)
- Third line: N space-separated dictionary words

**Output Format:**
- "YES" if segmentable, "NO" otherwise

**Constraints:**
- 1 ≤ |S| ≤ 300
- 1 ≤ N ≤ 1000
- 1 ≤ |word| ≤ 20

**Example:**
Input:
leetcode
2
leet code

Output:
YES

**Explanation:** "leetcode" = "leet" + "code"`,
    hidden_input: "applepenapple\n3\napple pen pineapple",
    expected_output: "YES"
  },
  {
    title: "Minimum Path Sum",
    difficulty: "beast",
    description: `Given an M×N grid filled with non-negative numbers, find a path from top-left to bottom-right which minimizes the sum of all numbers along the path. You can only move right or down.

**Input Format:**
- First line: M N
- Next M lines: N space-separated integers

**Output Format:**
- Minimum path sum

**Constraints:**
- 1 ≤ M, N ≤ 200
- 0 ≤ grid[i][j] ≤ 100

**Example:**
Input:
3 3
1 3 1
1 5 1
4 2 1

Output:
7

**Explanation:** Path 1→3→1→1→1 has sum 7, but optimal is 1→1→5→2→1 = 10... Actually: 1→3→1→1→1 = 7. Wait, let me recalculate: 1→1→4→2→1 = 9, 1→3→1→1→1 = 7. Yes, 7 is minimum.`,
    hidden_input: "4 5\n1 2 3 4 5\n6 1 2 3 4\n7 8 1 2 3\n8 9 10 1 1",
    expected_output: "14"
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
