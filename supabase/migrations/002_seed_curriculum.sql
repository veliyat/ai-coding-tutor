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
