-- Seed first module: Variables and Types
INSERT INTO modules (slug, title, description, sequence_order) VALUES
  ('variables-types', 'Variables and Types', 'Learn how to store and work with data in JavaScript', 1);

-- Get the module ID for foreign key references
DO $$
DECLARE
  mod_id uuid;
BEGIN
  SELECT id INTO mod_id FROM modules WHERE slug = 'variables-types';

  -- Lesson 1: What are variables?
  INSERT INTO lessons (module_id, slug, title, sequence_order, estimated_minutes, difficulty, content, exercise) VALUES
    (
      mod_id,
      'variables-intro',
      'What are Variables?',
      1,
      10,
      'easy',
      '{
        "sections": [
          {
            "type": "explanation",
            "title": "Variables are containers for data",
            "text": "Think of a variable as a labeled box where you can store information. The label is the variable name, and whatever you put inside is the value. You can change what''s inside the box, look at it, or use it in calculations."
          },
          {
            "type": "code_example",
            "title": "Creating a variable",
            "text": "In JavaScript, you create a variable using the let keyword, followed by a name you choose:",
            "code": "let greeting = \"Hello, World!\";\nconsole.log(greeting);",
            "output": "Hello, World!"
          },
          {
            "type": "explanation",
            "text": "The equals sign (=) is called the assignment operator. It puts the value on the right into the variable on the left."
          },
          {
            "type": "code_example",
            "title": "Changing a variable",
            "text": "You can update what''s stored in a variable:",
            "code": "let score = 10;\nconsole.log(score);\n\nscore = 25;\nconsole.log(score);",
            "output": "10\n25"
          }
        ]
      }',
      '{
        "description": "Create a variable called ''message'' and assign it the text \"I am learning JavaScript!\"",
        "starterCode": "// Create your variable below\n",
        "solution": "let message = \"I am learning JavaScript!\";\nconsole.log(message);",
        "testCases": [
          {"name": "Variable ''message'' should exist", "expectedOutput": ""},
          {"name": "Should print the correct message", "expectedOutput": "I am learning JavaScript!"}
        ],
        "hints": [
          {"level": 1, "text": "Start with the keyword ''let'' followed by the variable name."},
          {"level": 2, "text": "Use the equals sign to assign a value: let message = ...", "code": "let message = "},
          {"level": 3, "text": "Put your text in quotes:", "code": "let message = \"I am learning JavaScript!\";"}
        ]
      }'
    );

  -- Lesson 2: let vs const
  INSERT INTO lessons (module_id, slug, title, sequence_order, estimated_minutes, difficulty, content, exercise) VALUES
    (
      mod_id,
      'let-const',
      'let vs const',
      2,
      8,
      'easy',
      '{
        "sections": [
          {
            "type": "explanation",
            "title": "Two ways to declare variables",
            "text": "JavaScript gives you two main keywords for creating variables: let and const. The difference is whether you can change the value later."
          },
          {
            "type": "code_example",
            "title": "let - values can change",
            "text": "Use let when you need to update the value later:",
            "code": "let count = 1;\ncount = 2;\ncount = 3;\nconsole.log(count);",
            "output": "3"
          },
          {
            "type": "code_example",
            "title": "const - values stay the same",
            "text": "Use const when the value should never change:",
            "code": "const PI = 3.14159;\nconsole.log(PI);",
            "output": "3.14159"
          },
          {
            "type": "explanation",
            "title": "Best practice",
            "text": "Start with const by default. Only use let if you know you need to change the value. This helps prevent bugs from accidentally changing values."
          }
        ]
      }',
      '{
        "description": "Create a constant called ''APP_NAME'' with the value \"AI Coding Tutor\", and a variable called ''lessonCount'' starting at 0.",
        "starterCode": "// Create a constant for the app name\n\n// Create a variable for lesson count\n",
        "solution": "const APP_NAME = \"AI Coding Tutor\";\nlet lessonCount = 0;\n\nconsole.log(APP_NAME);\nconsole.log(lessonCount);",
        "testCases": [
          {"name": "APP_NAME should be a constant with correct value", "expectedOutput": "AI Coding Tutor"},
          {"name": "lessonCount should start at 0", "expectedOutput": "0"}
        ],
        "hints": [
          {"level": 1, "text": "Constants use the keyword ''const'' instead of ''let''."},
          {"level": 2, "text": "Constant names are often written in UPPER_CASE by convention.", "code": "const APP_NAME = "},
          {"level": 3, "text": "The lesson count should use ''let'' since it might change later.", "code": "let lessonCount = 0;"}
        ]
      }'
    );

  -- Lesson 3: Data Types
  INSERT INTO lessons (module_id, slug, title, sequence_order, estimated_minutes, difficulty, content, exercise) VALUES
    (
      mod_id,
      'data-types',
      'Data Types: Strings, Numbers, Booleans',
      3,
      12,
      'easy',
      '{
        "sections": [
          {
            "type": "explanation",
            "title": "JavaScript has different types of data",
            "text": "Not all data is the same. Text is different from numbers, and both are different from true/false values. JavaScript has three basic types you''ll use constantly."
          },
          {
            "type": "code_example",
            "title": "Strings - text data",
            "text": "Strings are text, wrapped in quotes (single or double):",
            "code": "let name = \"Alice\";\nlet greeting = ''Hello'';\nconsole.log(name);\nconsole.log(greeting);",
            "output": "Alice\nHello"
          },
          {
            "type": "code_example",
            "title": "Numbers - numeric data",
            "text": "Numbers are written without quotes. They can be whole numbers or decimals:",
            "code": "let age = 25;\nlet price = 9.99;\nconsole.log(age);\nconsole.log(price);",
            "output": "25\n9.99"
          },
          {
            "type": "code_example",
            "title": "Booleans - true or false",
            "text": "Booleans can only be true or false. They''re used for decisions:",
            "code": "let isLoggedIn = true;\nlet hasError = false;\nconsole.log(isLoggedIn);\nconsole.log(hasError);",
            "output": "true\nfalse"
          },
          {
            "type": "explanation",
            "title": "Why types matter",
            "text": "The type determines what you can do with the data. You can add numbers together, but adding strings concatenates them. Knowing your types helps avoid bugs."
          }
        ]
      }',
      '{
        "description": "Create three variables: a string ''username'' with value \"coder123\", a number ''level'' with value 5, and a boolean ''isPremium'' with value false.",
        "starterCode": "// Create a string for username\n\n// Create a number for level\n\n// Create a boolean for premium status\n",
        "solution": "const username = \"coder123\";\nconst level = 5;\nconst isPremium = false;\n\nconsole.log(username);\nconsole.log(level);\nconsole.log(isPremium);",
        "testCases": [
          {"name": "username should be the string \"coder123\"", "expectedOutput": "coder123"},
          {"name": "level should be the number 5", "expectedOutput": "5"},
          {"name": "isPremium should be false", "expectedOutput": "false"}
        ],
        "hints": [
          {"level": 1, "text": "Strings need quotes around them, numbers and booleans don''t."},
          {"level": 2, "text": "Booleans are written as true or false (no quotes, lowercase).", "code": "const isPremium = false;"},
          {"level": 3, "text": "Here''s the complete solution:", "code": "const username = \"coder123\";\nconst level = 5;\nconst isPremium = false;"}
        ]
      }'
    );
END $$;

-- Module 2: Operators and Expressions
INSERT INTO modules (slug, title, description, sequence_order) VALUES
  ('operators', 'Operators and Expressions', 'Learn how to perform calculations and combine values', 2);

DO $$
DECLARE
  mod_id uuid;
BEGIN
  SELECT id INTO mod_id FROM modules WHERE slug = 'operators';

  INSERT INTO lessons (module_id, slug, title, sequence_order, estimated_minutes, difficulty, content, exercise) VALUES
    (
      mod_id,
      'arithmetic-operators',
      'Arithmetic Operators',
      1,
      10,
      'easy',
      '{
        "sections": [
          {"type": "explanation", "title": "Math in JavaScript", "text": "JavaScript can perform mathematical calculations using arithmetic operators."},
          {"type": "code_example", "title": "Basic operators", "text": "Here are the main arithmetic operators:", "code": "console.log(10 + 5);  // Addition\nconsole.log(10 - 5);  // Subtraction\nconsole.log(10 * 5);  // Multiplication\nconsole.log(10 / 5);  // Division", "output": "15\n5\n50\n2"},
          {"type": "code_example", "title": "Remainder operator", "text": "The % operator gives you the remainder after division:", "code": "console.log(10 % 3);  // remainder 1\nconsole.log(8 % 2);   // remainder 0", "output": "1\n0"}
        ]
      }',
      '{
        "description": "Calculate and print: the sum of 25 and 17, and the product of 6 and 7.",
        "starterCode": "// Calculate the sum of 25 and 17\n\n// Calculate the product of 6 and 7\n",
        "solution": "console.log(25 + 17);\nconsole.log(6 * 7);",
        "testCases": [
          {"name": "Sum should be 42", "expectedOutput": "42"}
        ],
        "hints": [
          {"level": 1, "text": "Use + for addition and * for multiplication."},
          {"level": 2, "text": "Print results with console.log()", "code": "console.log(25 + 17);"}
        ]
      }'
    ),
    (
      mod_id,
      'string-concatenation',
      'Combining Strings',
      2,
      8,
      'easy',
      '{
        "sections": [
          {"type": "explanation", "title": "Joining strings together", "text": "You can combine strings using the + operator. This is called concatenation."},
          {"type": "code_example", "title": "Basic concatenation", "text": "Use + to join strings:", "code": "let firstName = \"Alice\";\nlet lastName = \"Smith\";\nconsole.log(firstName + \" \" + lastName);", "output": "Alice Smith"},
          {"type": "code_example", "title": "Template literals", "text": "A cleaner way is to use template literals with backticks:", "code": "let name = \"Bob\";\nlet age = 25;\nconsole.log(`${name} is ${age} years old`);", "output": "Bob is 25 years old"}
        ]
      }',
      '{
        "description": "Create variables city=\"Tokyo\" and country=\"Japan\". Print them as \"Tokyo, Japan\".",
        "starterCode": "// Create city and country variables\n\n// Print as \"City, Country\"\n",
        "solution": "const city = \"Tokyo\";\nconst country = \"Japan\";\nconsole.log(`${city}, ${country}`);",
        "testCases": [
          {"name": "Should print Tokyo, Japan", "expectedOutput": "Tokyo, Japan"}
        ],
        "hints": [
          {"level": 1, "text": "Create two variables with const or let."},
          {"level": 2, "text": "Use template literals: `${variable}`", "code": "console.log(`${city}, ${country}`);"}
        ]
      }'
    ),
    (
      mod_id,
      'comparison-operators',
      'Comparison Operators',
      3,
      10,
      'easy',
      '{
        "sections": [
          {"type": "explanation", "title": "Comparing values", "text": "Comparison operators compare two values and return true or false."},
          {"type": "code_example", "title": "Equality and inequality", "text": "Use === to check if values are equal:", "code": "console.log(5 === 5);   // true\nconsole.log(5 === 3);   // false\nconsole.log(5 !== 3);   // true", "output": "true\nfalse\ntrue"},
          {"type": "code_example", "title": "Greater and less than", "text": "Compare which value is bigger:", "code": "console.log(10 > 5);    // true\nconsole.log(10 < 5);    // false", "output": "true\nfalse"}
        ]
      }',
      '{
        "description": "Check if 100 is greater than 50, and if \"hello\" equals \"hello\". Print both results.",
        "starterCode": "// Is 100 greater than 50?\n\n// Does \"hello\" equal \"hello\"?\n",
        "solution": "console.log(100 > 50);\nconsole.log(\"hello\" === \"hello\");",
        "testCases": [
          {"name": "100 > 50 should be true", "expectedOutput": "true"}
        ],
        "hints": [
          {"level": 1, "text": "Use > for greater than, === for equality."},
          {"level": 2, "text": "Strings can be compared with === too."}
        ]
      }'
    );
END $$;

-- Module 3: Functions
INSERT INTO modules (slug, title, description, sequence_order) VALUES
  ('functions', 'Functions', 'Learn how to write reusable blocks of code', 3);

DO $$
DECLARE
  mod_id uuid;
BEGIN
  SELECT id INTO mod_id FROM modules WHERE slug = 'functions';

  INSERT INTO lessons (module_id, slug, title, sequence_order, estimated_minutes, difficulty, content, exercise) VALUES
    (
      mod_id,
      'functions-intro',
      'What are Functions?',
      1,
      12,
      'easy',
      '{
        "sections": [
          {"type": "explanation", "title": "Functions are reusable code", "text": "A function is a block of code that you can run whenever you need it."},
          {"type": "code_example", "title": "Creating a function", "text": "Use the function keyword:", "code": "function sayHello() {\n  console.log(\"Hello!\");\n}\n\nsayHello();\nsayHello();", "output": "Hello!\nHello!"}
        ]
      }',
      '{
        "description": "Create a function called greet that prints \"Welcome to JavaScript!\". Call it once.",
        "starterCode": "// Define the greet function\n\n// Call the function\n",
        "solution": "function greet() {\n  console.log(\"Welcome to JavaScript!\");\n}\n\ngreet();",
        "testCases": [
          {"name": "Should print welcome message", "expectedOutput": "Welcome to JavaScript!"}
        ],
        "hints": [
          {"level": 1, "text": "Start with: function greet() { }"},
          {"level": 2, "text": "Put console.log inside the function."}
        ]
      }'
    ),
    (
      mod_id,
      'function-parameters',
      'Function Parameters',
      2,
      12,
      'medium',
      '{
        "sections": [
          {"type": "explanation", "title": "Passing data to functions", "text": "Parameters let you pass data into a function."},
          {"type": "code_example", "title": "Adding parameters", "text": "Put parameter names inside parentheses:", "code": "function greet(name) {\n  console.log(\"Hello, \" + name + \"!\");\n}\n\ngreet(\"Alice\");\ngreet(\"Bob\");", "output": "Hello, Alice!\nHello, Bob!"},
          {"type": "code_example", "title": "Multiple parameters", "text": "Separate parameters with commas:", "code": "function add(a, b) {\n  console.log(a + b);\n}\n\nadd(5, 3);", "output": "8"}
        ]
      }',
      '{
        "description": "Create a function multiply that takes two numbers and prints their product. Call it with 4 and 5.",
        "starterCode": "// Define multiply function with two parameters\n\n// Call it with 4 and 5\n",
        "solution": "function multiply(a, b) {\n  console.log(a * b);\n}\n\nmultiply(4, 5);",
        "testCases": [
          {"name": "multiply(4, 5) should print 20", "expectedOutput": "20"}
        ],
        "hints": [
          {"level": 1, "text": "Parameters go inside parentheses: function multiply(a, b)"},
          {"level": 2, "text": "Use * to multiply inside the function."}
        ]
      }'
    ),
    (
      mod_id,
      'return-values',
      'Return Values',
      3,
      12,
      'medium',
      '{
        "sections": [
          {"type": "explanation", "title": "Getting results from functions", "text": "Functions can return a value using the return keyword."},
          {"type": "code_example", "title": "Returning a value", "text": "The return statement sends a value back:", "code": "function double(num) {\n  return num * 2;\n}\n\nlet result = double(5);\nconsole.log(result);", "output": "10"}
        ]
      }',
      '{
        "description": "Create a function square that returns a number times itself. Print the square of 7.",
        "starterCode": "// Define square function that returns num * num\n\n// Print the square of 7\n",
        "solution": "function square(num) {\n  return num * num;\n}\n\nconsole.log(square(7));",
        "testCases": [
          {"name": "square(7) should return 49", "expectedOutput": "49"}
        ],
        "hints": [
          {"level": 1, "text": "Use return instead of console.log inside the function."},
          {"level": 2, "text": "return num * num; gives back the squared value."}
        ]
      }'
    );
END $$;

-- Module 4: Control Flow
INSERT INTO modules (slug, title, description, sequence_order) VALUES
  ('control-flow', 'Control Flow', 'Learn how to make decisions and repeat actions', 4);

DO $$
DECLARE
  mod_id uuid;
BEGIN
  SELECT id INTO mod_id FROM modules WHERE slug = 'control-flow';

  INSERT INTO lessons (module_id, slug, title, sequence_order, estimated_minutes, difficulty, content, exercise) VALUES
    (
      mod_id,
      'if-statements',
      'If Statements',
      1,
      12,
      'easy',
      '{
        "sections": [
          {"type": "explanation", "title": "Making decisions", "text": "If statements let your code make decisions based on conditions."},
          {"type": "code_example", "title": "Basic if statement", "text": "Code runs only when condition is true:", "code": "let age = 18;\n\nif (age >= 18) {\n  console.log(\"You can vote!\");\n}", "output": "You can vote!"},
          {"type": "code_example", "title": "If-else", "text": "Use else for when condition is false:", "code": "let temp = 15;\n\nif (temp > 20) {\n  console.log(\"Warm\");\n} else {\n  console.log(\"Cold\");\n}", "output": "Cold"}
        ]
      }',
      '{
        "description": "Create score = 85. If score >= 70, print \"Pass\". Otherwise print \"Fail\".",
        "starterCode": "let score = 85;\n\n// Add your if-else statement\n",
        "solution": "let score = 85;\n\nif (score >= 70) {\n  console.log(\"Pass\");\n} else {\n  console.log(\"Fail\");\n}",
        "testCases": [
          {"name": "Score 85 should print Pass", "expectedOutput": "Pass"}
        ],
        "hints": [
          {"level": 1, "text": "Use >= for greater than or equal."},
          {"level": 2, "text": "Structure: if (condition) { } else { }"}
        ]
      }'
    ),
    (
      mod_id,
      'for-loops',
      'For Loops',
      2,
      15,
      'medium',
      '{
        "sections": [
          {"type": "explanation", "title": "Repeating code", "text": "Loops let you repeat code multiple times."},
          {"type": "code_example", "title": "Basic for loop", "text": "Three parts: start, condition, increment:", "code": "for (let i = 1; i <= 3; i++) {\n  console.log(i);\n}", "output": "1\n2\n3"}
        ]
      }',
      '{
        "description": "Write a for loop that prints numbers 1 through 5.",
        "starterCode": "// Write a for loop from 1 to 5\n",
        "solution": "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}",
        "testCases": [
          {"name": "Should print 1", "expectedOutput": "1"},
          {"name": "Should print 5", "expectedOutput": "5"}
        ],
        "hints": [
          {"level": 1, "text": "Start with: for (let i = 1; i <= 5; i++)"},
          {"level": 2, "text": "Put console.log(i) inside the curly braces."}
        ]
      }'
    ),
    (
      mod_id,
      'while-loops',
      'While Loops',
      3,
      12,
      'medium',
      '{
        "sections": [
          {"type": "explanation", "title": "Loop while condition is true", "text": "A while loop keeps running as long as its condition is true."},
          {"type": "code_example", "title": "Basic while loop", "text": "Checks condition before each run:", "code": "let count = 1;\n\nwhile (count <= 3) {\n  console.log(count);\n  count++;\n}", "output": "1\n2\n3"}
        ]
      }',
      '{
        "description": "Use a while loop to print \"Loading...\" exactly 3 times.",
        "starterCode": "let times = 0;\n\n// Write while loop\n",
        "solution": "let times = 0;\n\nwhile (times < 3) {\n  console.log(\"Loading...\");\n  times++;\n}",
        "testCases": [
          {"name": "Should print Loading...", "expectedOutput": "Loading..."}
        ],
        "hints": [
          {"level": 1, "text": "Check if times is less than 3."},
          {"level": 2, "text": "Don''t forget to increment times with times++"}
        ]
      }'
    );
END $$;
