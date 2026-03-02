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
    description: `### Problem Statement
Given an array of integers, find the sum of its elements.

**Input Format:**
A single line containing space-separated integers.

**Output Format:**
Print a single integer representing the sum.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`
- \`-10^6 ≤ arr[i] ≤ 10^6\`

**Example 1:**
\`\`\`
Input: 1 2 3 4 5
Output: 15
\`\`\`

**Explanation:** 1 + 2 + 3 + 4 + 5 = 15`,
    hidden_input: "-3 15 8 -12 6 21 -7",
    expected_output: "28",
    default_code_python: `def calculate_sum(arr):
    # Write your code here
    pass

if __name__ == '__main__':
    arr = list(map(int, input().split()))
    result = calculate_sum(arr)
    print(result)`,
    default_code_java: `import java.util.*;

public class Main {
    public static int calculateSum(int[] arr) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] input = scanner.nextLine().split(" ");
        int[] arr = new int[input.length];
        for (int i = 0; i < input.length; i++) {
            arr[i] = Integer.parseInt(input[i]);
        }
        System.out.println(calculateSum(arr));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int calculateSum(vector<int> arr) {
    // Write your code here
    return 0;
}

int main() {
    int num;
    vector<int> arr;
    while (cin >> num) {
        arr.push_back(num);
    }
    cout << calculateSum(arr) << endl;
    return 0;
}`
  },
  {
    title: "Reverse a String",
    difficulty: "easy",
    description: `### Problem Statement
Given a string S, print the reversed string.

**Input Format:**
A single line containing string S.

**Output Format:**
The reversed string.

**Constraints:**
- \`1 ≤ |S| ≤ 10^4\`
- S contains only alphanumeric characters

**Example 1:**
\`\`\`
Input: programming
Output: gnimmargorp
\`\`\``,
    hidden_input: "DataStructures2024",
    expected_output: "4202serutcurtSataD",
    default_code_python: `def reverse_string(s):
    # Write your code here
    pass

if __name__ == '__main__':
    s = input().strip()
    print(reverse_string(s))`,
    default_code_java: `import java.util.*;

public class Main {
    public static String reverseString(String s) {
        // Write your code here
        return "";
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.nextLine().trim();
        System.out.println(reverseString(s));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
using namespace std;

string reverseString(string s) {
    // Write your code here
    return "";
}

int main() {
    string s;
    getline(cin, s);
    cout << reverseString(s) << endl;
    return 0;
}`
  },
  {
    title: "Check Palindrome",
    difficulty: "easy",
    description: `### Problem Statement
Given a string S, determine if it reads the same forwards and backwards (case-insensitive, ignoring spaces).

**Input Format:**
A single line containing string S.

**Output Format:**
Print \`YES\` if palindrome, \`NO\` otherwise.

**Constraints:**
- \`1 ≤ |S| ≤ 10^4\`

**Example 1:**
\`\`\`
Input: RaceCar
Output: YES
\`\`\`

**Example 2:**
\`\`\`
Input: Hello
Output: NO
\`\`\``,
    hidden_input: "A man a plan a canal Panama",
    expected_output: "YES",
    default_code_python: `def is_palindrome(s):
    # Write your code here
    pass

if __name__ == '__main__':
    s = input().strip()
    print("YES" if is_palindrome(s) else "NO")`,
    default_code_java: `import java.util.*;

public class Main {
    public static boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.nextLine().trim();
        System.out.println(isPalindrome(s) ? "YES" : "NO");
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Write your code here
    return false;
}

int main() {
    string s;
    getline(cin, s);
    cout << (isPalindrome(s) ? "YES" : "NO") << endl;
    return 0;
}`
  },
  {
    title: "Find Factorial",
    difficulty: "easy",
    description: `### Problem Statement
Given a non-negative integer N, calculate N! (N factorial).

**Input Format:**
A single integer N.

**Output Format:**
The factorial of N.

**Constraints:**
- \`0 ≤ N ≤ 20\`

**Example 1:**
\`\`\`
Input: 6
Output: 720
\`\`\`

**Note:** \`0! = 1\` by definition.`,
    hidden_input: "12",
    expected_output: "479001600",
    default_code_python: `def factorial(n):
    # Write your code here
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(factorial(n))`,
    default_code_java: `import java.util.*;

public class Main {
    public static long factorial(int n) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println(factorial(n));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << factorial(n) << endl;
    return 0;
}`
  },
  {
    title: "Count Vowels",
    difficulty: "easy",
    description: `### Problem Statement
Given a string S, count the number of vowels (a, e, i, o, u). Count both uppercase and lowercase.

**Input Format:**
A single line containing string S.

**Output Format:**
An integer representing the count of vowels.

**Constraints:**
- \`1 ≤ |S| ≤ 10^4\`

**Example 1:**
\`\`\`
Input: Competitive Programming
Output: 8
\`\`\``,
    hidden_input: "UNI Code Arena Championship 2024",
    expected_output: "12",
    default_code_python: `def count_vowels(s):
    # Write your code here
    pass

if __name__ == '__main__':
    s = input().strip()
    print(count_vowels(s))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int countVowels(String s) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.nextLine().trim();
        System.out.println(countVowels(s));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
using namespace std;

int countVowels(string s) {
    // Write your code here
    return 0;
}

int main() {
    string s;
    getline(cin, s);
    cout << countVowels(s) << endl;
    return 0;
}`
  },
  {
    title: "Find Maximum and Minimum",
    difficulty: "easy",
    description: `### Problem Statement
Given an array of N integers, find both the maximum and minimum elements.

**Input Format:**
- First line: N (number of elements)
- Second line: N space-separated integers

**Output Format:**
Two space-separated integers: maximum and minimum.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`
- \`-10^9 ≤ arr[i] ≤ 10^9\`

**Example 1:**
\`\`\`
Input:
6
3 7 2 9 1 5
Output: 9 1
\`\`\``,
    hidden_input: "8\n-45 78 12 -89 0 156 -23 67",
    expected_output: "156 -89",
    default_code_python: `def find_max_min(arr):
    # Return (maximum, minimum) as a tuple
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    mx, mn = find_max_min(arr)
    print(mx, mn)`,
    default_code_java: `import java.util.*;

public class Main {
    public static int[] findMaxMin(int[] arr) {
        // Return array of [max, min]
        return new int[]{0, 0};
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int[] result = findMaxMin(arr);
        System.out.println(result[0] + " " + result[1]);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

pair<int,int> findMaxMin(vector<int>& arr) {
    // Return {max, min}
    return {0, 0};
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto [mx, mn] = findMaxMin(arr);
    cout << mx << " " << mn << endl;
    return 0;
}`
  },
  {
    title: "Even or Odd",
    difficulty: "easy",
    description: `### Problem Statement
Given N integers, for each integer print whether it's \`EVEN\` or \`ODD\`.

**Input Format:**
- First line: N (count of numbers)
- Next N lines: One integer per line

**Output Format:**
N lines, each containing \`EVEN\` or \`ODD\`.

**Constraints:**
- \`1 ≤ N ≤ 100\`

**Example 1:**
\`\`\`
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
\`\`\`

**Note:** Zero is considered EVEN.`,
    hidden_input: "5\n1000000\n-777\n0\n123456789\n-2",
    expected_output: "EVEN\nODD\nEVEN\nODD\nEVEN",
    default_code_python: `def classify(num):
    # Return "EVEN" or "ODD"
    pass

if __name__ == '__main__':
    n = int(input().strip())
    for _ in range(n):
        num = int(input().strip())
        print(classify(num))`,
    default_code_java: `import java.util.*;

public class Main {
    public static String classify(int num) {
        // Return "EVEN" or "ODD"
        return "";
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        for (int i = 0; i < n; i++) {
            int num = Integer.parseInt(scanner.nextLine().trim());
            System.out.println(classify(num));
        }
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
using namespace std;

string classify(int num) {
    // Return "EVEN" or "ODD"
    return "";
}

int main() {
    int n, num;
    cin >> n;
    for (int i = 0; i < n; i++) {
        cin >> num;
        cout << classify(num) << endl;
    }
    return 0;
}`
  },
  {
    title: "Count Words",
    difficulty: "easy",
    description: `### Problem Statement
Given a sentence, count the number of words. Words are separated by single spaces.

**Input Format:**
A single line containing the sentence.

**Output Format:**
An integer representing word count.

**Constraints:**
- \`1 ≤ |sentence| ≤ 10^4\`
- No leading/trailing spaces

**Example 1:**
\`\`\`
Input: The quick brown fox jumps over the lazy dog
Output: 9
\`\`\``,
    hidden_input: "Data Structures and Algorithms are fundamental to Computer Science",
    expected_output: "9",
    default_code_python: `def count_words(sentence):
    # Write your code here
    pass

if __name__ == '__main__':
    sentence = input().strip()
    print(count_words(sentence))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int countWords(String sentence) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String sentence = scanner.nextLine().trim();
        System.out.println(countWords(sentence));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
using namespace std;

int countWords(string sentence) {
    // Write your code here
    return 0;
}

int main() {
    string sentence;
    getline(cin, sentence);
    cout << countWords(sentence) << endl;
    return 0;
}`
  },
  {
    title: "Sum of Digits",
    difficulty: "easy",
    description: `### Problem Statement
Given a positive integer N, calculate the sum of all its digits.

**Input Format:**
A single positive integer N.

**Output Format:**
Sum of digits of N.

**Constraints:**
- \`1 ≤ N ≤ 10^18\`

**Example 1:**
\`\`\`
Input: 9876543210
Output: 45
\`\`\`

**Explanation:** 9+8+7+6+5+4+3+2+1+0 = 45`,
    hidden_input: "123456789012345",
    expected_output: "60",
    default_code_python: `def sum_of_digits(n):
    # Write your code here
    pass

if __name__ == '__main__':
    n = input().strip()
    print(sum_of_digits(n))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int sumOfDigits(String n) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String n = scanner.nextLine().trim();
        System.out.println(sumOfDigits(n));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
using namespace std;

int sumOfDigits(string n) {
    // Write your code here
    return 0;
}

int main() {
    string n;
    cin >> n;
    cout << sumOfDigits(n) << endl;
    return 0;
}`
  },
  {
    title: "FizzBuzz",
    difficulty: "easy",
    description: `### Problem Statement
Print numbers from 1 to N with these rules:
- If divisible by 3, print \`Fizz\`
- If divisible by 5, print \`Buzz\`
- If divisible by both, print \`FizzBuzz\`
- Otherwise, print the number

**Input Format:**
A single integer N.

**Output Format:**
N lines of output following the rules above.

**Constraints:**
- \`1 ≤ N ≤ 100\`

**Example 1:**
\`\`\`
Input: 5
Output:
1
2
Fizz
4
Buzz
\`\`\``,
    hidden_input: "20",
    expected_output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz",
    default_code_python: `def fizzbuzz(n):
    # Print FizzBuzz from 1 to n
    pass

if __name__ == '__main__':
    n = int(input().strip())
    fizzbuzz(n)`,
    default_code_java: `import java.util.*;

public class Main {
    public static void fizzbuzz(int n) {
        // Print FizzBuzz from 1 to n
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        fizzbuzz(n);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
using namespace std;

void fizzbuzz(int n) {
    // Print FizzBuzz from 1 to n
}

int main() {
    int n;
    cin >> n;
    fizzbuzz(n);
    return 0;
}`
  },

  // ===== MEDIUM (10) =====
  {
    title: "Two Sum",
    difficulty: "medium",
    description: `### Problem Statement
Given an array of N integers and a target sum T, find two distinct indices i and j such that \`arr[i] + arr[j] = T\`.

**Input Format:**
- First line: N (array size) and T (target sum)
- Second line: N space-separated integers

**Output Format:**
Two space-separated 0-based indices (smaller index first). Print \`-1\` if no solution exists.

**Constraints:**
- \`2 ≤ N ≤ 10^4\`
- Exactly one solution exists (if any)

**Example 1:**
\`\`\`
Input:
4 9
2 7 11 15
Output: 0 1
\`\`\`

**Explanation:** \`arr[0] + arr[1] = 2 + 7 = 9\``,
    hidden_input: "6 15\n3 8 12 7 5 10",
    expected_output: "1 3",
    default_code_python: `def two_sum(arr, target):
    # Return (index1, index2) or (-1,) if not found
    pass

if __name__ == '__main__':
    first_line = input().split()
    n, target = int(first_line[0]), int(first_line[1])
    arr = list(map(int, input().split()))
    result = two_sum(arr, target)
    if result and len(result) == 2:
        print(result[0], result[1])
    else:
        print(-1)`,
    default_code_java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] arr, int target) {
        // Return int[]{index1, index2} or int[]{-1}
        return new int[]{-1};
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] fl = scanner.nextLine().trim().split(" ");
        int n = Integer.parseInt(fl[0]);
        int target = Integer.parseInt(fl[1]);
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int[] result = twoSum(arr, target);
        if (result.length == 2) System.out.println(result[0] + " " + result[1]);
        else System.out.println(-1);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

pair<int,int> twoSum(vector<int>& arr, int target) {
    // Return {index1, index2} or {-1, -1}
    return {-1, -1};
}

int main() {
    int n, target;
    cin >> n >> target;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto [a, b] = twoSum(arr, target);
    if (a != -1) cout << a << " " << b << endl;
    else cout << -1 << endl;
    return 0;
}`
  },
  {
    title: "Find All Duplicates",
    difficulty: "medium",
    description: `### Problem Statement
Given an array of N integers where each is between 1 and N, find all elements that appear twice. Print them sorted.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
Space-separated duplicates in sorted order. Print \`NONE\` if no duplicates.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
8
4 3 2 7 8 2 3 1
Output: 2 3
\`\`\``,
    hidden_input: "10\n1 5 3 7 9 5 3 8 3 2",
    expected_output: "3 5",
    default_code_python: `def find_duplicates(arr):
    # Return sorted list of duplicates
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    result = find_duplicates(arr)
    print(' '.join(map(str, result)) if result else 'NONE')`,
    default_code_java: `import java.util.*;

public class Main {
    public static List<Integer> findDuplicates(int[] arr) {
        // Return sorted list of duplicates
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        List<Integer> result = findDuplicates(arr);
        if (result.isEmpty()) System.out.println("NONE");
        else {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < result.size(); i++) {
                if (i > 0) sb.append(" ");
                sb.append(result.get(i));
            }
            System.out.println(sb);
        }
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<int> findDuplicates(vector<int>& arr) {
    // Return sorted vector of duplicates
    return {};
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto result = findDuplicates(arr);
    if (result.empty()) cout << "NONE" << endl;
    else {
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) cout << " ";
            cout << result[i];
        }
        cout << endl;
    }
    return 0;
}`
  },
  {
    title: "Dutch National Flag",
    difficulty: "medium",
    description: `### Problem Statement
Given an array containing only 0s, 1s, and 2s, sort it in-place in O(n) time.

**Input Format:**
- First line: N
- Second line: N space-separated integers (only 0, 1, 2)

**Output Format:**
Sorted array, space-separated.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
8
2 0 1 2 1 0 0 1
Output: 0 0 0 1 1 1 2 2
\`\`\`

**Hint:** Use three pointers — low, mid, high.`,
    hidden_input: "15\n1 0 2 1 0 2 2 0 1 1 0 2 1 0 2",
    expected_output: "0 0 0 0 0 1 1 1 1 1 2 2 2 2 2",
    default_code_python: `def dutch_flag_sort(arr):
    # Sort arr in-place and return it
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    result = dutch_flag_sort(arr)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static void dutchFlagSort(int[] arr) {
        // Sort arr in-place
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        dutchFlagSort(arr);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(arr[i]);
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

void dutchFlagSort(vector<int>& arr) {
    // Sort arr in-place
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    dutchFlagSort(arr);
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << " ";
        cout << arr[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Longest Common Prefix",
    difficulty: "medium",
    description: `### Problem Statement
Given N strings, find the longest common prefix among all of them.

**Input Format:**
- First line: N (number of strings)
- Next N lines: One string per line

**Output Format:**
The longest common prefix. Print \`NONE\` if no common prefix.

**Constraints:**
- \`1 ≤ N ≤ 200\`, \`1 ≤ |string| ≤ 200\`

**Example 1:**
\`\`\`
Input:
3
flower
flow
flight
Output: fl
\`\`\``,
    hidden_input: "4\ninterstellar\ninternet\ninternal\ninterface",
    expected_output: "inter",
    default_code_python: `def longest_common_prefix(strs):
    # Return the longest common prefix string
    pass

if __name__ == '__main__':
    n = int(input().strip())
    strs = [input().strip() for _ in range(n)]
    result = longest_common_prefix(strs)
    print(result if result else 'NONE')`,
    default_code_java: `import java.util.*;

public class Main {
    public static String longestCommonPrefix(String[] strs) {
        // Return the longest common prefix
        return "";
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] strs = new String[n];
        for (int i = 0; i < n; i++) strs[i] = scanner.nextLine().trim();
        String result = longestCommonPrefix(strs);
        System.out.println(result.isEmpty() ? "NONE" : result);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

string longestCommonPrefix(vector<string>& strs) {
    // Return the longest common prefix
    return "";
}

int main() {
    int n;
    cin >> n;
    cin.ignore();
    vector<string> strs(n);
    for (int i = 0; i < n; i++) getline(cin, strs[i]);
    string result = longestCommonPrefix(strs);
    cout << (result.empty() ? "NONE" : result) << endl;
    return 0;
}`
  },
  {
    title: "Remove Duplicates In-Place",
    difficulty: "medium",
    description: `### Problem Statement
Given a sorted array, remove duplicates in-place. Return the new length and print the unique elements.

**Input Format:**
- First line: N
- Second line: N sorted space-separated integers

**Output Format:**
- First line: New length K
- Second line: First K unique elements

**Constraints:**
- \`1 ≤ N ≤ 10^4\`

**Example 1:**
\`\`\`
Input:
7
1 1 2 2 2 3 3
Output:
3
1 2 3
\`\`\``,
    hidden_input: "12\n0 0 1 1 1 2 2 3 3 4 4 4",
    expected_output: "5\n0 1 2 3 4",
    default_code_python: `def remove_duplicates(arr):
    # Return list of unique elements
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    result = remove_duplicates(arr)
    print(len(result))
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static List<Integer> removeDuplicates(int[] arr) {
        // Return list of unique elements
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        List<Integer> result = removeDuplicates(arr);
        System.out.println(result.size());
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(result.get(i));
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> removeDuplicates(vector<int>& arr) {
    // Return vector of unique elements
    return {};
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto result = removeDuplicates(arr);
    cout << result.size() << endl;
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Rotate Array",
    difficulty: "medium",
    description: `### Problem Statement
Given an array of N elements, rotate it to the right by K steps.

**Input Format:**
- First line: N and K
- Second line: N space-separated integers

**Output Format:**
Rotated array, space-separated.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`, \`0 ≤ K ≤ 10^9\`

**Example 1:**
\`\`\`
Input:
7 3
1 2 3 4 5 6 7
Output: 5 6 7 1 2 3 4
\`\`\`

**Hint:** K might be larger than N. Use \`K % N\`.`,
    hidden_input: "8 11\n10 20 30 40 50 60 70 80",
    expected_output: "60 70 80 10 20 30 40 50",
    default_code_python: `def rotate_array(arr, k):
    # Return the rotated array
    pass

if __name__ == '__main__':
    n, k = map(int, input().split())
    arr = list(map(int, input().split()))
    result = rotate_array(arr, k)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int[] rotateArray(int[] arr, int k) {
        // Return rotated array
        return arr;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] fl = scanner.nextLine().trim().split(" ");
        int n = Integer.parseInt(fl[0]);
        int k = Integer.parseInt(fl[1]);
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int[] result = rotateArray(arr, k);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> rotateArray(vector<int>& arr, int k) {
    // Return rotated array
    return arr;
}

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto result = rotateArray(arr, k);
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Majority Element",
    difficulty: "medium",
    description: `### Problem Statement
Given an array of N elements, find the element that appears more than ⌊N/2⌋ times (the majority element).

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
The majority element. Print \`NONE\` if no majority exists.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
7
3 2 3 3 1 3 3
Output: 3
\`\`\`

**Hint:** Use Boyer-Moore Voting Algorithm for O(1) space.`,
    hidden_input: "11\n5 5 7 5 7 5 5 7 5 7 5",
    expected_output: "5",
    default_code_python: `def majority_element(arr):
    # Return the majority element or None
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    result = majority_element(arr)
    print(result if result is not None else 'NONE')`,
    default_code_java: `import java.util.*;

public class Main {
    public static int majorityElement(int[] arr) {
        // Return majority element or Integer.MIN_VALUE if none
        return Integer.MIN_VALUE;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int result = majorityElement(arr);
        System.out.println(result == Integer.MIN_VALUE ? "NONE" : result);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int majorityElement(vector<int>& arr) {
    // Return majority element or INT_MIN if none
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << majorityElement(arr) << endl;
    return 0;
}`
  },
  {
    title: "Move Zeros",
    difficulty: "medium",
    description: `### Problem Statement
Given an array of N integers, move all zeros to the end while maintaining the relative order of non-zero elements.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
Modified array, space-separated.

**Constraints:**
- \`1 ≤ N ≤ 10^4\`

**Example 1:**
\`\`\`
Input:
5
0 1 0 3 12
Output: 1 3 12 0 0
\`\`\``,
    hidden_input: "10\n0 0 1 0 2 0 0 3 0 4",
    expected_output: "1 2 3 4 0 0 0 0 0 0",
    default_code_python: `def move_zeros(arr):
    # Move zeros to end in-place and return arr
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    result = move_zeros(arr)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static void moveZeros(int[] arr) {
        // Move zeros to end in-place
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        moveZeros(arr);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(arr[i]);
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

void moveZeros(vector<int>& arr) {
    // Move zeros to end in-place
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    moveZeros(arr);
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << " ";
        cout << arr[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Product Except Self",
    difficulty: "medium",
    description: `### Problem Statement
Given an array of N integers, return an array where each element is the product of all elements except itself. Solve without division in O(n) time.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
Result array, space-separated.

**Constraints:**
- \`2 ≤ N ≤ 10^5\`, \`-30 ≤ arr[i] ≤ 30\`

**Example 1:**
\`\`\`
Input:
4
1 2 3 4
Output: 24 12 8 6
\`\`\``,
    hidden_input: "5\n2 3 0 5 4",
    expected_output: "0 0 120 0 0",
    default_code_python: `def product_except_self(arr):
    # Return list of products
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    result = product_except_self(arr)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int[] productExceptSelf(int[] arr) {
        // Return array of products
        return new int[arr.length];
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int[] result = productExceptSelf(arr);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> productExceptSelf(vector<int>& arr) {
    // Return vector of products
    return vector<int>(arr.size(), 0);
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto result = productExceptSelf(arr);
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Container With Most Water",
    difficulty: "medium",
    description: `### Problem Statement
Given N non-negative integers representing heights of vertical lines, find two lines that together with the x-axis form a container holding the most water.

**Input Format:**
- First line: N
- Second line: N space-separated heights

**Output Format:**
Maximum water that can be contained.

**Constraints:**
- \`2 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
9
1 8 6 2 5 4 8 3 7
Output: 49
\`\`\`

**Explanation:** Lines at index 1 (h=8) and 8 (h=7): \`min(8,7) × (8-1) = 49\``,
    hidden_input: "10\n4 3 2 1 4 5 6 7 8 1",
    expected_output: "32",
    default_code_python: `def max_area(heights):
    # Return the maximum water area
    pass

if __name__ == '__main__':
    n = int(input().strip())
    heights = list(map(int, input().split()))
    print(max_area(heights))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int maxArea(int[] heights) {
        // Return the maximum water area
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] heights = new int[n];
        for (int i = 0; i < n; i++) heights[i] = Integer.parseInt(parts[i]);
        System.out.println(maxArea(heights));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int maxArea(vector<int>& heights) {
    // Return the maximum water area
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> heights(n);
    for (int i = 0; i < n; i++) cin >> heights[i];
    cout << maxArea(heights) << endl;
    return 0;
}`
  },

  // ===== HARD (10) =====
  {
    title: "Valid Parentheses",
    difficulty: "hard",
    description: `### Problem Statement
Given a string containing just \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

**Rules:**
1. Open brackets must be closed by the same type
2. Open brackets must be closed in the correct order

**Input Format:**
A single string of brackets.

**Output Format:**
\`VALID\` or \`INVALID\`

**Constraints:**
- \`1 ≤ |S| ≤ 10^4\`

**Example 1:**
\`\`\`
Input: {[()]}
Output: VALID
\`\`\`

**Example 2:**
\`\`\`
Input: ([)]
Output: INVALID
\`\`\``,
    hidden_input: "{{[[(())]]}}[]{}()",
    expected_output: "VALID",
    default_code_python: `def is_valid(s):
    # Return True if valid, False otherwise
    pass

if __name__ == '__main__':
    s = input().strip()
    print("VALID" if is_valid(s) else "INVALID")`,
    default_code_java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Return true if valid
        return false;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.nextLine().trim();
        System.out.println(isValid(s) ? "VALID" : "INVALID");
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isValid(string s) {
    // Return true if valid
    return false;
}

int main() {
    string s;
    getline(cin, s);
    cout << (isValid(s) ? "VALID" : "INVALID") << endl;
    return 0;
}`
  },
  {
    title: "Generate Fibonacci",
    difficulty: "hard",
    description: `### Problem Statement
Generate the first N Fibonacci numbers.

**Input Format:**
A single integer N.

**Output Format:**
N space-separated Fibonacci numbers.

**Constraints:**
- \`1 ≤ N ≤ 50\`

**Example 1:**
\`\`\`
Input: 10
Output: 0 1 1 2 3 5 8 13 21 34
\`\`\`

**Note:** F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)`,
    hidden_input: "20",
    expected_output: "0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 1597 2584 4181",
    default_code_python: `def fibonacci(n):
    # Return list of first n Fibonacci numbers
    pass

if __name__ == '__main__':
    n = int(input().strip())
    result = fibonacci(n)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static long[] fibonacci(int n) {
        // Return array of first n Fibonacci numbers
        return new long[n];
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        long[] result = fibonacci(n);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<long long> fibonacci(int n) {
    // Return vector of first n Fibonacci numbers
    return vector<long long>(n, 0);
}

int main() {
    int n;
    cin >> n;
    auto result = fibonacci(n);
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Next Greater Element",
    difficulty: "hard",
    description: `### Problem Statement
For each element in an array, find the **next greater element** (NGE) — the first greater element to its right. If none exists, output \`-1\`.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
N space-separated integers (NGE for each element).

**Constraints:**
- \`1 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
4
4 5 2 25
Output: 5 25 25 -1
\`\`\`

**Hint:** Use a stack for O(n) solution.`,
    hidden_input: "8\n11 13 21 3 8 5 17 9",
    expected_output: "13 21 -1 8 17 17 -1 -1",
    default_code_python: `def next_greater_element(arr):
    # Return list of NGEs
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    result = next_greater_element(arr)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int[] nextGreaterElement(int[] arr) {
        // Return array of NGEs
        return new int[arr.length];
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int[] result = nextGreaterElement(arr);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

vector<int> nextGreaterElement(vector<int>& arr) {
    // Return vector of NGEs
    return vector<int>(arr.size(), -1);
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto result = nextGreaterElement(arr);
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Merge Two Sorted Arrays",
    difficulty: "hard",
    description: `### Problem Statement
Given two sorted arrays, merge them into a single sorted array.

**Input Format:**
- First line: N M (sizes)
- Second line: N sorted integers
- Third line: M sorted integers

**Output Format:**
Single sorted merged array, space-separated.

**Constraints:**
- \`1 ≤ N, M ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
4 5
1 3 5 7
2 4 6 8 10
Output: 1 2 3 4 5 6 7 8 10
\`\`\``,
    hidden_input: "6 7\n-15 -3 0 8 22 100\n-20 -10 5 12 50 75 200",
    expected_output: "-20 -15 -10 -3 0 5 8 12 22 50 75 100 200",
    default_code_python: `def merge_sorted(arr1, arr2):
    # Return merged sorted array
    pass

if __name__ == '__main__':
    n, m = map(int, input().split())
    arr1 = list(map(int, input().split()))
    arr2 = list(map(int, input().split()))
    result = merge_sorted(arr1, arr2)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int[] mergeSorted(int[] arr1, int[] arr2) {
        // Return merged sorted array
        return new int[0];
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] fl = scanner.nextLine().trim().split(" ");
        int n = Integer.parseInt(fl[0]), m = Integer.parseInt(fl[1]);
        int[] arr1 = new int[n], arr2 = new int[m];
        String[] p1 = scanner.nextLine().trim().split(" ");
        String[] p2 = scanner.nextLine().trim().split(" ");
        for (int i = 0; i < n; i++) arr1[i] = Integer.parseInt(p1[i]);
        for (int i = 0; i < m; i++) arr2[i] = Integer.parseInt(p2[i]);
        int[] result = mergeSorted(arr1, arr2);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(" ");
            sb.append(result[i]);
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> mergeSorted(vector<int>& arr1, vector<int>& arr2) {
    // Return merged sorted vector
    return {};
}

int main() {
    int n, m;
    cin >> n >> m;
    vector<int> arr1(n), arr2(m);
    for (int i = 0; i < n; i++) cin >> arr1[i];
    for (int i = 0; i < m; i++) cin >> arr2[i];
    auto result = mergeSorted(arr1, arr2);
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "Evaluate Postfix Expression",
    difficulty: "hard",
    description: `### Problem Statement
Evaluate a postfix (Reverse Polish Notation) expression.

**Input Format:**
Space-separated tokens (operands and operators: \`+\`, \`-\`, \`*\`, \`/\`).

**Output Format:**
Integer result (truncate toward zero for division).

**Constraints:**
- Valid expression guaranteed, no division by zero

**Example 1:**
\`\`\`
Input: 2 3 + 4 * 6 -
Output: 14
\`\`\`

**Explanation:** \`2+3=5\`, \`5*4=20\`, \`20-6=14\``,
    hidden_input: "5 1 2 + 4 * + 3 -",
    expected_output: "14",
    default_code_python: `def eval_postfix(tokens):
    # Return integer result
    pass

if __name__ == '__main__':
    tokens = input().strip().split()
    print(eval_postfix(tokens))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int evalPostfix(String[] tokens) {
        // Return integer result
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] tokens = scanner.nextLine().trim().split(" ");
        System.out.println(evalPostfix(tokens));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <sstream>
#include <stack>
#include <string>
using namespace std;

int evalPostfix(vector<string>& tokens) {
    // Return integer result
    return 0;
}

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<string> tokens;
    string token;
    while (iss >> token) tokens.push_back(token);
    cout << evalPostfix(tokens) << endl;
    return 0;
}`
  },
  {
    title: "Min Stack",
    difficulty: "hard",
    description: `### Problem Statement
Implement a stack that supports \`PUSH x\`, \`POP\`, and \`MIN\` (retrieve minimum) all in O(1) time.

**Input Format:**
- First line: N (operations)
- Next N lines: \`PUSH x\`, \`POP\`, or \`MIN\`

**Output Format:**
For each \`MIN\` operation, print the current minimum.

**Constraints:**
- \`1 ≤ N ≤ 10^4\`

**Example 1:**
\`\`\`
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
5
\`\`\``,
    hidden_input: "10\nPUSH 10\nPUSH 5\nMIN\nPUSH 3\nMIN\nPOP\nMIN\nPOP\nMIN\nPOP",
    expected_output: "5\n3\n5\n10",
    default_code_python: `import sys

def solve(operations):
    # Implement MinStack and process operations
    # Print result for each MIN operation
    pass

if __name__ == '__main__':
    n = int(input().strip())
    operations = []
    for _ in range(n):
        operations.append(input().strip())
    solve(operations)`,
    default_code_java: `import java.util.*;

public class Main {
    public static void solve(String[] operations) {
        // Implement MinStack and process operations
        // Print result for each MIN operation
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] operations = new String[n];
        for (int i = 0; i < n; i++) operations[i] = scanner.nextLine().trim();
        solve(operations);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

void solve(vector<string>& operations) {
    // Implement MinStack and process operations
    // Print result for each MIN operation
}

int main() {
    int n;
    cin >> n;
    cin.ignore();
    vector<string> operations(n);
    for (int i = 0; i < n; i++) getline(cin, operations[i]);
    solve(operations);
    return 0;
}`
  },
  {
    title: "Binary Search",
    difficulty: "hard",
    description: `### Problem Statement
Implement binary search to find the **first (leftmost) occurrence** of a target in a sorted array.

**Input Format:**
- First line: N
- Second line: N sorted integers
- Third line: Target value

**Output Format:**
0-based index of first occurrence, or \`-1\` if not found.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
7
1 2 2 2 3 4 5
2
Output: 1
\`\`\``,
    hidden_input: "10\n-50 -20 0 15 15 15 30 45 60 100\n15",
    expected_output: "3",
    default_code_python: `def binary_search_left(arr, target):
    # Return index of first occurrence or -1
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    target = int(input().strip())
    print(binary_search_left(arr, target))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int binarySearchLeft(int[] arr, int target) {
        // Return index of first occurrence or -1
        return -1;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int target = Integer.parseInt(scanner.nextLine().trim());
        System.out.println(binarySearchLeft(arr, target));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int binarySearchLeft(vector<int>& arr, int target) {
    // Return index of first occurrence or -1
    return -1;
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    int target;
    cin >> target;
    cout << binarySearchLeft(arr, target) << endl;
    return 0;
}`
  },
  {
    title: "Find Peak Element",
    difficulty: "hard",
    description: `### Problem Statement
A peak element is strictly greater than its neighbors. Find any peak element's index in O(log n) time.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
Index of any peak element.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`
- \`arr[i] ≠ arr[i+1]\` for all valid i

**Example 1:**
\`\`\`
Input:
5
1 2 3 1 0
Output: 2
\`\`\`

**Note:** Multiple peaks may exist. Return any one.`,
    hidden_input: "8\n1 3 2 4 6 5 7 8",
    expected_output: "7",
    default_code_python: `def find_peak(arr):
    # Return index of any peak element
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    print(find_peak(arr))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int findPeak(int[] arr) {
        // Return index of any peak element
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        System.out.println(findPeak(arr));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int findPeak(vector<int>& arr) {
    // Return index of any peak element
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << findPeak(arr) << endl;
    return 0;
}`
  },
  {
    title: "Spiral Matrix",
    difficulty: "hard",
    description: `### Problem Statement
Given an M×N matrix, return all elements in spiral order (clockwise from outside to inside).

**Input Format:**
- First line: M N (rows, columns)
- Next M lines: N space-separated integers each

**Output Format:**
All elements in spiral order, space-separated.

**Constraints:**
- \`1 ≤ M, N ≤ 100\`

**Example 1:**
\`\`\`
Input:
3 4
1 2 3 4
5 6 7 8
9 10 11 12
Output: 1 2 3 4 8 12 11 10 9 5 6 7
\`\`\``,
    hidden_input: "4 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16",
    expected_output: "1 2 3 4 8 12 16 15 14 13 9 5 6 7 11 10",
    default_code_python: `def spiral_order(matrix):
    # Return list of elements in spiral order
    pass

if __name__ == '__main__':
    m, n = map(int, input().split())
    matrix = []
    for _ in range(m):
        row = list(map(int, input().split()))
        matrix.append(row)
    result = spiral_order(matrix)
    print(' '.join(map(str, result)))`,
    default_code_java: `import java.util.*;

public class Main {
    public static List<Integer> spiralOrder(int[][] matrix) {
        // Return list of elements in spiral order
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] dim = scanner.nextLine().trim().split(" ");
        int m = Integer.parseInt(dim[0]), n = Integer.parseInt(dim[1]);
        int[][] matrix = new int[m][n];
        for (int i = 0; i < m; i++) {
            String[] parts = scanner.nextLine().trim().split(" ");
            for (int j = 0; j < n; j++) matrix[i][j] = Integer.parseInt(parts[j]);
        }
        List<Integer> result = spiralOrder(matrix);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(result.get(i));
        }
        System.out.println(sb);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> spiralOrder(vector<vector<int>>& matrix) {
    // Return vector of elements in spiral order
    return {};
}

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            cin >> matrix[i][j];
    auto result = spiralOrder(matrix);
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}`
  },
  {
    title: "LRU Cache",
    difficulty: "hard",
    description: `### Problem Statement
Implement an LRU (Least Recently Used) Cache with capacity C.

**Operations:**
- \`GET x\`: Return value of key x, or \`-1\` if not found
- \`PUT x y\`: Insert/update key x with value y

**Input Format:**
- First line: C (capacity) and N (operations)
- Next N lines: \`GET x\` or \`PUT x y\`

**Output Format:**
For each \`GET\`, print the result.

**Constraints:**
- \`1 ≤ C ≤ 100\`, \`1 ≤ N ≤ 10^4\`

**Example 1:**
\`\`\`
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
\`\`\``,
    hidden_input: "3 10\nPUT 1 100\nPUT 2 200\nPUT 3 300\nGET 2\nPUT 4 400\nGET 1\nGET 3\nGET 4\nPUT 5 500\nGET 2",
    expected_output: "200\n-1\n300\n400\n-1",
    default_code_python: `def solve(capacity, operations):
    # Implement LRU Cache and process operations
    # Print result for each GET
    pass

if __name__ == '__main__':
    c, n = map(int, input().split())
    operations = []
    for _ in range(n):
        operations.append(input().strip())
    solve(c, operations)`,
    default_code_java: `import java.util.*;

public class Main {
    public static void solve(int capacity, String[] operations) {
        // Implement LRU Cache and process operations
        // Print result for each GET
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] fl = scanner.nextLine().trim().split(" ");
        int c = Integer.parseInt(fl[0]), n = Integer.parseInt(fl[1]);
        String[] operations = new String[n];
        for (int i = 0; i < n; i++) operations[i] = scanner.nextLine().trim();
        solve(c, operations);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

void solve(int capacity, vector<string>& operations) {
    // Implement LRU Cache and process operations
    // Print result for each GET
}

int main() {
    int c, n;
    cin >> c >> n;
    cin.ignore();
    vector<string> operations(n);
    for (int i = 0; i < n; i++) getline(cin, operations[i]);
    solve(c, operations);
    return 0;
}`
  },

  // ===== BEAST (10) =====
  {
    title: "Climbing Stairs (DP)",
    difficulty: "beast",
    description: `### Problem Statement
You are climbing a staircase with N steps. Each time you can climb 1, 2, or 3 steps. How many distinct ways can you reach the top?

**Input Format:**
A single integer N.

**Output Format:**
Number of distinct ways (mod \`10^9 + 7\`).

**Constraints:**
- \`1 ≤ N ≤ 10^6\`

**Example 1:**
\`\`\`
Input: 5
Output: 13
\`\`\`

**Hint:** \`dp[i] = dp[i-1] + dp[i-2] + dp[i-3]\``,
    hidden_input: "25",
    expected_output: "2555757",
    default_code_python: `def climb_stairs(n):
    # Return number of ways mod 10^9+7
    pass

if __name__ == '__main__':
    n = int(input().strip())
    print(climb_stairs(n))`,
    default_code_java: `import java.util.*;

public class Main {
    public static long climbStairs(int n) {
        // Return number of ways mod 10^9+7
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println(climbStairs(n));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
using namespace std;

long long climbStairs(int n) {
    // Return number of ways mod 10^9+7
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << climbStairs(n) << endl;
    return 0;
}`
  },
  {
    title: "0/1 Knapsack",
    difficulty: "beast",
    description: `### Problem Statement
Given N items with weights and values, and a knapsack of capacity W, find the maximum value. Each item can be taken at most once.

**Input Format:**
- First line: N W
- Next N lines: weight value

**Output Format:**
Maximum value achievable.

**Constraints:**
- \`1 ≤ N ≤ 100\`, \`1 ≤ W ≤ 10^4\`

**Example 1:**
\`\`\`
Input:
4 7
1 1
3 4
4 5
5 7
Output: 9
\`\`\`

**Explanation:** Take items (w=3,v=4) and (w=4,v=5). Total value=9.`,
    hidden_input: "5 15\n2 10\n5 20\n6 25\n8 30\n3 12",
    expected_output: "67",
    default_code_python: `def knapsack(n, capacity, items):
    # items is list of (weight, value)
    # Return maximum value
    pass

if __name__ == '__main__':
    n, w = map(int, input().split())
    items = []
    for _ in range(n):
        wt, val = map(int, input().split())
        items.append((wt, val))
    print(knapsack(n, w, items))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int knapsack(int n, int capacity, int[][] items) {
        // items[i] = {weight, value}
        // Return maximum value
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] fl = scanner.nextLine().trim().split(" ");
        int n = Integer.parseInt(fl[0]), w = Integer.parseInt(fl[1]);
        int[][] items = new int[n][2];
        for (int i = 0; i < n; i++) {
            String[] parts = scanner.nextLine().trim().split(" ");
            items[i][0] = Integer.parseInt(parts[0]);
            items[i][1] = Integer.parseInt(parts[1]);
        }
        System.out.println(knapsack(n, w, items));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int knapsack(int n, int capacity, vector<pair<int,int>>& items) {
    // items[i] = {weight, value}
    // Return maximum value
    return 0;
}

int main() {
    int n, w;
    cin >> n >> w;
    vector<pair<int,int>> items(n);
    for (int i = 0; i < n; i++) cin >> items[i].first >> items[i].second;
    cout << knapsack(n, w, items) << endl;
    return 0;
}`
  },
  {
    title: "Longest Increasing Subsequence",
    difficulty: "beast",
    description: `### Problem Statement
Find the length of the longest strictly increasing subsequence in an array. Use O(n log n) algorithm.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
Length of LIS.

**Constraints:**
- \`1 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
8
10 9 2 5 3 7 101 18
Output: 4
\`\`\`

**Explanation:** LIS is [2, 3, 7, 18]. Length = 4.`,
    hidden_input: "15\n3 10 2 1 20 4 6 8 5 7 9 11 12 14 13",
    expected_output: "9",
    default_code_python: `def lis_length(arr):
    # Return length of LIS
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    print(lis_length(arr))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int lisLength(int[] arr) {
        // Return length of LIS
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        System.out.println(lisLength(arr));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int lisLength(vector<int>& arr) {
    // Return length of LIS
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << lisLength(arr) << endl;
    return 0;
}`
  },
  {
    title: "Coin Change",
    difficulty: "beast",
    description: `### Problem Statement
Given coin denominations and a total amount, find the minimum number of coins needed. Infinite supply of each coin.

**Input Format:**
- First line: N (coin types)
- Second line: N coin values
- Third line: Target amount

**Output Format:**
Minimum coins needed, or \`-1\` if impossible.

**Constraints:**
- \`1 ≤ N ≤ 12\`, \`0 ≤ amount ≤ 10^4\`

**Example 1:**
\`\`\`
Input:
3
1 2 5
11
Output: 3
\`\`\`

**Explanation:** 11 = 5 + 5 + 1 (3 coins)`,
    hidden_input: "4\n1 5 10 25\n63",
    expected_output: "6",
    default_code_python: `def coin_change(coins, amount):
    # Return minimum coins or -1
    pass

if __name__ == '__main__':
    n = int(input().strip())
    coins = list(map(int, input().split()))
    amount = int(input().strip())
    print(coin_change(coins, amount))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int coinChange(int[] coins, int amount) {
        // Return minimum coins or -1
        return -1;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) coins[i] = Integer.parseInt(parts[i]);
        int amount = Integer.parseInt(scanner.nextLine().trim());
        System.out.println(coinChange(coins, amount));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int coinChange(vector<int>& coins, int amount) {
    // Return minimum coins or -1
    return -1;
}

int main() {
    int n;
    cin >> n;
    vector<int> coins(n);
    for (int i = 0; i < n; i++) cin >> coins[i];
    int amount;
    cin >> amount;
    cout << coinChange(coins, amount) << endl;
    return 0;
}`
  },
  {
    title: "Maximum Subarray Sum (Kadane's)",
    difficulty: "beast",
    description: `### Problem Statement
Find the contiguous subarray with the largest sum. Return the sum and the start/end indices.

**Input Format:**
- First line: N
- Second line: N space-separated integers

**Output Format:**
- First line: Maximum sum
- Second line: Start and end indices (0-based, inclusive)

**Constraints:**
- \`1 ≤ N ≤ 10^5\`

**Example 1:**
\`\`\`
Input:
9
-2 1 -3 4 -1 2 1 -5 4
Output:
6
3 6
\`\`\`

**Explanation:** Subarray [4, -1, 2, 1] has sum 6.`,
    hidden_input: "12\n-5 4 -2 6 -8 10 -1 3 5 -3 2 1",
    expected_output: "17\n5 8",
    default_code_python: `def max_subarray(arr):
    # Return (max_sum, start_index, end_index)
    pass

if __name__ == '__main__':
    n = int(input().strip())
    arr = list(map(int, input().split()))
    max_sum, start, end = max_subarray(arr)
    print(max_sum)
    print(start, end)`,
    default_code_java: `import java.util.*;

public class Main {
    public static int[] maxSubarray(int[] arr) {
        // Return {max_sum, start_index, end_index}
        return new int[]{0, 0, 0};
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(parts[i]);
        int[] result = maxSubarray(arr);
        System.out.println(result[0]);
        System.out.println(result[1] + " " + result[2]);
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

tuple<int,int,int> maxSubarray(vector<int>& arr) {
    // Return {max_sum, start_index, end_index}
    return {0, 0, 0};
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    auto [sum, s, e] = maxSubarray(arr);
    cout << sum << endl;
    cout << s << " " << e << endl;
    return 0;
}`
  },
  {
    title: "Edit Distance",
    difficulty: "beast",
    description: `### Problem Statement
Given two strings, find the minimum number of operations (insert, delete, replace) to convert string1 to string2.

**Input Format:**
- First line: String 1
- Second line: String 2

**Output Format:**
Minimum number of operations.

**Constraints:**
- \`0 ≤ |string| ≤ 500\`

**Example 1:**
\`\`\`
Input:
horse
ros
Output: 3
\`\`\`

**Explanation:** horse → rorse → rose → ros`,
    hidden_input: "intention\nexecution",
    expected_output: "5",
    default_code_python: `def edit_distance(s1, s2):
    # Return minimum operations
    pass

if __name__ == '__main__':
    s1 = input().strip()
    s2 = input().strip()
    print(edit_distance(s1, s2))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int editDistance(String s1, String s2) {
        // Return minimum operations
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s1 = scanner.nextLine().trim();
        String s2 = scanner.nextLine().trim();
        System.out.println(editDistance(s1, s2));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
using namespace std;

int editDistance(string s1, string s2) {
    // Return minimum operations
    return 0;
}

int main() {
    string s1, s2;
    getline(cin, s1);
    getline(cin, s2);
    cout << editDistance(s1, s2) << endl;
    return 0;
}`
  },
  {
    title: "Unique Paths with Obstacles",
    difficulty: "beast",
    description: `### Problem Statement
A robot is on an M×N grid. It can only move right or down. Some cells have obstacles (\`1\`). Count unique paths from top-left to bottom-right.

**Input Format:**
- First line: M N
- Next M lines: N values (0=empty, 1=obstacle)

**Output Format:**
Number of unique paths (mod \`10^9 + 7\`).

**Constraints:**
- \`1 ≤ M, N ≤ 100\`

**Example 1:**
\`\`\`
Input:
3 3
0 0 0
0 1 0
0 0 0
Output: 2
\`\`\``,
    hidden_input: "4 5\n0 0 0 0 0\n0 0 1 0 0\n0 1 0 0 0\n0 0 0 1 0",
    expected_output: "7",
    default_code_python: `def unique_paths(grid):
    # Return number of unique paths mod 10^9+7
    pass

if __name__ == '__main__':
    m, n = map(int, input().split())
    grid = []
    for _ in range(m):
        row = list(map(int, input().split()))
        grid.append(row)
    print(unique_paths(grid))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int uniquePaths(int[][] grid) {
        // Return number of unique paths mod 10^9+7
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] dim = scanner.nextLine().trim().split(" ");
        int m = Integer.parseInt(dim[0]), n = Integer.parseInt(dim[1]);
        int[][] grid = new int[m][n];
        for (int i = 0; i < m; i++) {
            String[] parts = scanner.nextLine().trim().split(" ");
            for (int j = 0; j < n; j++) grid[i][j] = Integer.parseInt(parts[j]);
        }
        System.out.println(uniquePaths(grid));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int uniquePaths(vector<vector<int>>& grid) {
    // Return number of unique paths mod 10^9+7
    return 0;
}

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> grid(m, vector<int>(n));
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            cin >> grid[i][j];
    cout << uniquePaths(grid) << endl;
    return 0;
}`
  },
  {
    title: "House Robber",
    difficulty: "beast",
    description: `### Problem Statement
You are robbing houses along a street. You cannot rob two adjacent houses. Find the maximum money you can rob.

**Input Format:**
- First line: N
- Second line: N space-separated integers (money in each house)

**Output Format:**
Maximum money.

**Constraints:**
- \`1 ≤ N ≤ 100\`, \`0 ≤ nums[i] ≤ 400\`

**Example 1:**
\`\`\`
Input:
5
2 7 9 3 1
Output: 12
\`\`\`

**Explanation:** Rob houses 0, 2, 4: 2+9+1=12`,
    hidden_input: "10\n6 7 1 30 8 2 4 25 3 10",
    expected_output: "75",
    default_code_python: `def house_robber(nums):
    # Return maximum money
    pass

if __name__ == '__main__':
    n = int(input().strip())
    nums = list(map(int, input().split()))
    print(house_robber(nums))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int houseRobber(int[] nums) {
        // Return maximum money
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(parts[i]);
        System.out.println(houseRobber(nums));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int houseRobber(vector<int>& nums) {
    // Return maximum money
    return 0;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << houseRobber(nums) << endl;
    return 0;
}`
  },
  {
    title: "Word Break",
    difficulty: "beast",
    description: `### Problem Statement
Given a string S and a dictionary, determine if S can be segmented into dictionary words.

**Input Format:**
- First line: String S
- Second line: N (dictionary size)
- Third line: N space-separated words

**Output Format:**
\`YES\` if segmentable, \`NO\` otherwise.

**Constraints:**
- \`1 ≤ |S| ≤ 300\`, \`1 ≤ N ≤ 1000\`

**Example 1:**
\`\`\`
Input:
leetcode
2
leet code
Output: YES
\`\`\``,
    hidden_input: "applepenapple\n3\napple pen pineapple",
    expected_output: "YES",
    default_code_python: `def word_break(s, word_dict):
    # Return True if segmentable
    pass

if __name__ == '__main__':
    s = input().strip()
    n = int(input().strip())
    word_dict = input().strip().split()
    print("YES" if word_break(s, word_dict) else "NO")`,
    default_code_java: `import java.util.*;

public class Main {
    public static boolean wordBreak(String s, Set<String> wordDict) {
        // Return true if segmentable
        return false;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String s = scanner.nextLine().trim();
        int n = Integer.parseInt(scanner.nextLine().trim());
        String[] words = scanner.nextLine().trim().split(" ");
        Set<String> wordDict = new HashSet<>(Arrays.asList(words));
        System.out.println(wordBreak(s, wordDict) ? "YES" : "NO");
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <string>
#include <vector>
#include <unordered_set>
#include <sstream>
using namespace std;

bool wordBreak(string s, unordered_set<string>& wordDict) {
    // Return true if segmentable
    return false;
}

int main() {
    string s;
    getline(cin, s);
    int n;
    cin >> n;
    cin.ignore();
    string line;
    getline(cin, line);
    istringstream iss(line);
    unordered_set<string> wordDict;
    string word;
    while (iss >> word) wordDict.insert(word);
    cout << (wordBreak(s, wordDict) ? "YES" : "NO") << endl;
    return 0;
}`
  },
  {
    title: "Minimum Path Sum",
    difficulty: "beast",
    description: `### Problem Statement
Given an M×N grid of non-negative numbers, find a path from top-left to bottom-right minimizing the sum. You can only move right or down.

**Input Format:**
- First line: M N
- Next M lines: N space-separated integers

**Output Format:**
Minimum path sum.

**Constraints:**
- \`1 ≤ M, N ≤ 200\`

**Example 1:**
\`\`\`
Input:
3 3
1 3 1
1 5 1
4 2 1
Output: 7
\`\`\`

**Explanation:** Path 1→3→1→1→1 = 7`,
    hidden_input: "4 5\n1 2 3 4 5\n6 1 2 3 4\n7 8 1 2 3\n8 9 10 1 1",
    expected_output: "14",
    default_code_python: `def min_path_sum(grid):
    # Return minimum path sum
    pass

if __name__ == '__main__':
    m, n = map(int, input().split())
    grid = []
    for _ in range(m):
        row = list(map(int, input().split()))
        grid.append(row)
    print(min_path_sum(grid))`,
    default_code_java: `import java.util.*;

public class Main {
    public static int minPathSum(int[][] grid) {
        // Return minimum path sum
        return 0;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] dim = scanner.nextLine().trim().split(" ");
        int m = Integer.parseInt(dim[0]), n = Integer.parseInt(dim[1]);
        int[][] grid = new int[m][n];
        for (int i = 0; i < m; i++) {
            String[] parts = scanner.nextLine().trim().split(" ");
            for (int j = 0; j < n; j++) grid[i][j] = Integer.parseInt(parts[j]);
        }
        System.out.println(minPathSum(grid));
        scanner.close();
    }
}`,
    default_code_cpp: `#include <iostream>
#include <vector>
using namespace std;

int minPathSum(vector<vector<int>>& grid) {
    // Return minimum path sum
    return 0;
}

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> grid(m, vector<int>(n));
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            cin >> grid[i][j];
    cout << minPathSum(grid) << endl;
    return 0;
}`
  }
];


export function SeedDatabase({ compact = false, onSeeded }: SeedDatabaseProps) {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
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

      const questionsToInsert = DSA_QUESTIONS.map(q => ({
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        hidden_input: q.hidden_input,
        expected_output: q.expected_output,
        default_code_python: q.default_code_python,
        default_code_java: q.default_code_java,
        default_code_cpp: q.default_code_cpp,
        competition_id: null
      }));

      const { error } = await db.from('questions').insert(questionsToInsert);

      if (error) throw error;

      setSeeded(true);
      toast({
        title: '🌱 Database Seeded!',
        description: `Successfully added ${DSA_QUESTIONS.length} DSA questions with boilerplate code.`
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
          Populate the database with 40 curated DSA questions with question-specific boilerplate code (10 Easy, 10 Medium, 10 Hard, 10 Beast)
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
