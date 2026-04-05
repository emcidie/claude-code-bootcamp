const modules = [
  {
    id: 1,
    title: 'What is AI & Claude Code?',
    duration: '15 min',
    description: 'Discover what AI is, how it works, and what makes Claude Code a game-changer for building software.',
    tutorContext: `You are helping with Module 1: "What is AI & Claude Code?"

This module covers:
- What AI is in simple terms (smart assistant that learned from millions of texts)
- What Large Language Models (LLMs) are
- The difference between Claude (chatbot) and Claude Code (developer tool)
- Why Claude Code is powerful for beginners: describe what you want in plain English

The student is working on these exercises:
1. Chat with you (the tutor) to understand AI concepts
2. Brainstorm what they could build with Claude Code

Key concepts to reinforce:
- AI is not magic — it's pattern recognition at massive scale
- Claude Code works WITH your files directly, unlike a regular chatbot
- You don't need to know how to code to use Claude Code`,
    content: `
<h2>Welcome to the Claude Code Bootcamp!</h2>
<p>Before we start building things, let's understand what AI actually is and what Claude Code can do for you.</p>

<h3>What is Artificial Intelligence?</h3>
<p>Think of AI as a very smart assistant that has read millions of books, websites, and code repositories. It learned patterns from all that reading, and now it can:</p>
<ul>
  <li>Understand what you type in plain English</li>
  <li>Write code, explain concepts, and solve problems</li>
  <li>Have back-and-forth conversations</li>
</ul>

<h3>What is Claude?</h3>
<p><strong>Claude</strong> is an AI assistant made by Anthropic. It's designed to be helpful, harmless, and honest. You might have used it as a chatbot on claude.ai.</p>

<h3>What is Claude Code?</h3>
<p><strong>Claude Code</strong> takes things further. Instead of just chatting, Claude Code can:</p>
<ul>
  <li>Read files on your computer</li>
  <li>Create new files and folders</li>
  <li>Edit existing code</li>
  <li>Run commands in your terminal</li>
  <li>Help you build entire applications</li>
</ul>
<p>It's like having a programming expert sitting next to you who also does the typing!</p>

<h3>Why This Matters for Beginners</h3>
<p>With Claude Code, you describe <strong>what</strong> you want in plain English, and it writes the code for you. You learn by seeing what it produces and asking it to explain. No prior coding experience needed.</p>

<div class="exercise">
  <h4>Exercise 1.1: Explore AI Concepts (5 min)</h4>
  <ol>
    <li>Use the chatbot tutor on the right</li>
    <li>Ask: <em>"Explain AI to me like I'm 10 years old"</em></li>
    <li>Then ask: <em>"What makes Claude Code different from ChatGPT?"</em></li>
    <li>Read the responses carefully — this is your first conversation with an AI!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 1.2: Brainstorm Use Cases (5 min)</h4>
  <ol>
    <li>Ask the tutor: <em>"Give me 5 things I could build with Claude Code as a beginner"</em></li>
    <li>Pick the one that excites you most</li>
    <li>Ask: <em>"How would Claude Code help me build [the thing you picked]?"</em></li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>Can you explain AI to a friend in one sentence?</li>
    <li>What is the difference between Claude (the chatbot) and Claude Code (the dev tool)?</li>
  </ul>
</div>`,
    questions: [
      'Explain AI in one sentence, as if you were telling a friend.',
      'What is the difference between Claude (the chatbot) and Claude Code (the developer tool)?'
    ]
  },
  {
    id: 2,
    title: 'Setting Up Claude Code',
    duration: '15 min',
    description: 'Install Claude Code on your computer and get it ready to use.',
    tutorContext: `You are helping with Module 2: "Setting Up Claude Code"

This module covers:
- Opening a terminal (command line)
- What npm is (app store for code tools)
- Installing Claude Code via npm
- Authenticating with an API key

The student is working on these exercises:
1. Open their terminal
2. Verify Node.js is installed
3. Install Claude Code with npm
4. Authenticate and run their first command

Key concepts to reinforce:
- The terminal is just a text-based way to talk to your computer
- npm is like an app store but for developer tools
- An API key is like a password that lets Claude Code connect to Claude's brain in the cloud
- If something goes wrong, help them troubleshoot step by step`,
    content: `
<h2>Let's Get Claude Code Installed</h2>
<p>Don't worry — we'll go step by step, and if anything goes wrong, your AI tutor is right here to help.</p>

<h3>What You Need</h3>
<ul>
  <li><strong>Node.js</strong> (version 18 or higher) — this should already be installed</li>
  <li><strong>A terminal</strong> — the text-based interface to your computer</li>
</ul>

<h3>Key Terms</h3>
<ul>
  <li><strong>Terminal:</strong> A text-based way to talk to your computer. Instead of clicking buttons, you type commands.</li>
  <li><strong>npm:</strong> Node Package Manager — think of it as an app store for code tools.</li>
  <li><strong>API Key:</strong> A secret password that lets Claude Code talk to Claude's brain in the cloud.</li>
</ul>

<div class="exercise">
  <h4>Exercise 2.1: Open Your Terminal (3 min)</h4>
  <ol>
    <li><strong>Mac:</strong> Press <code>Cmd + Space</code>, type "Terminal", press Enter</li>
    <li><strong>Windows:</strong> Press <code>Win + X</code>, select "Windows PowerShell" or "Terminal"</li>
    <li>Type <code>node --version</code> and press Enter</li>
    <li>You should see something like <code>v22.x.x</code></li>
    <li>If you see an error, ask the tutor for help!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 2.2: Install Claude Code (5 min)</h4>
  <ol>
    <li>In your terminal, type: <code>npm install -g @anthropic-ai/claude-code</code></li>
    <li>Wait for it to finish (may take 1-2 minutes)</li>
    <li>Type: <code>claude --version</code> to verify it installed</li>
    <li>If you see a version number, you're good to go!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 2.3: Authenticate and Configure (5 min)</h4>
  <ol>
    <li>Type <code>claude</code> in your terminal to start Claude Code</li>
    <li>Follow the login prompts</li>
    <li>Enter your API key when asked</li>
    <li>You should see the Claude Code prompt waiting for your input</li>
    <li>Type <code>/help</code> to see available commands</li>
    <li>Type <code>/exit</code> to leave for now</li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>What command installs Claude Code?</li>
    <li>What does an API key do?</li>
  </ul>
</div>`,
    questions: [
      'What command do you type to install Claude Code?',
      'What does an API key do and why is it needed?'
    ]
  },
  {
    id: 3,
    title: 'Your First Conversation',
    duration: '15 min',
    description: 'Have your very first real conversation with Claude Code and learn how context works.',
    tutorContext: `You are helping with Module 3: "Your First Conversation with Claude Code"

This module covers:
- What a prompt is (the message you send)
- How context works (Claude Code sees files in your folder)
- How conversation memory works within a session

The student is working on these exercises:
1. Create a practice folder and start Claude Code in it
2. Have a friendly introductory conversation
3. Ask coding questions and see how Claude Code responds
4. Test follow-up questions to see conversation memory

Key concepts to reinforce:
- Better prompts = better results
- Claude Code can see files in your current folder
- It remembers what you said earlier in the same session
- Each new session starts fresh (no memory of previous sessions)`,
    content: `
<h2>Your First Real Conversation</h2>
<p>Claude Code is installed. Let's have your very first conversation! Think of it like texting a very smart friend who happens to be a programming expert.</p>

<h3>Key Concepts</h3>
<ul>
  <li><strong>Prompt:</strong> The message you send to Claude Code. Better prompts = better results.</li>
  <li><strong>Context:</strong> Claude Code can see the files in your current folder and uses that to give better answers.</li>
  <li><strong>Conversation:</strong> Each session is a conversation. It remembers what you said earlier.</li>
</ul>

<div class="exercise">
  <h4>Exercise 3.1: Start a Conversation (5 min)</h4>
  <ol>
    <li>Open your terminal</li>
    <li>Create a practice folder: <code>mkdir bootcamp-practice && cd bootcamp-practice</code></li>
    <li>Start Claude Code: <code>claude</code></li>
    <li>Type: <em>"Hello! I'm a complete beginner. What can you help me with?"</em></li>
    <li>Read the response — notice how friendly and detailed it is</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 3.2: Ask Coding Questions (5 min)</h4>
  <ol>
    <li>Ask: <em>"What is HTML and why does it matter?"</em></li>
    <li>Then ask: <em>"Can you show me the simplest possible HTML page?"</em></li>
    <li>Notice: Claude Code shows you code but waits for your permission before creating files</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 3.3: Follow-up Questions (5 min)</h4>
  <ol>
    <li>Ask: <em>"What does each line of that HTML code do?"</em></li>
    <li>Ask: <em>"What would happen if I removed the body tag?"</em></li>
    <li>Notice how Claude Code remembers the HTML example — that's conversation context!</li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>How do you start Claude Code?</li>
    <li>Does Claude Code remember what you said 5 messages ago in the same session? (Yes!)</li>
    <li>Does Claude Code remember conversations from yesterday? (No — each session starts fresh)</li>
  </ul>
</div>`,
    questions: [
      'How do you start Claude Code in your terminal?',
      'Does Claude Code remember your conversation from a previous session? Explain why or why not.'
    ]
  },
  {
    id: 4,
    title: 'Understanding Prompts & Skills',
    duration: '20 min',
    description: 'Learn the art of writing good prompts and discover powerful slash commands.',
    tutorContext: `You are helping with Module 4: "Understanding Prompts & Skills"

This module covers:
- What makes a good prompt vs a bad prompt
- The anatomy of a good prompt: what you want + context + constraints + format
- Slash commands (/help, /clear, /compact)
- The refinement loop: start rough, then iterate

The student is working on these exercises:
1. Compare a bad prompt vs a good prompt and see the difference
2. Practice the refinement loop (iterating on results)
3. Explore slash commands

Key concepts to reinforce:
- "Make a website" is vague. "Create an HTML page with a blue header that says Welcome" is specific.
- The refinement loop is how professionals work: start with something, then improve it
- /compact is useful when conversations get long
- /clear resets the conversation entirely`,
    content: `
<h2>The Art of Writing Good Prompts</h2>
<p>The single most important skill when using Claude Code is writing good prompts. A vague prompt gives vague results. A clear prompt gives exactly what you want.</p>

<h3>Good Prompt Anatomy</h3>
<p>A great prompt includes:</p>
<ul>
  <li><strong>What you want:</strong> "Create an HTML page..."</li>
  <li><strong>Context:</strong> "...with a blue header that says Welcome..."</li>
  <li><strong>Constraints:</strong> "...using only inline CSS..."</li>
  <li><strong>Format:</strong> "...saved as index.html"</li>
</ul>

<h3>Slash Commands</h3>
<p>Claude Code has built-in shortcuts:</p>
<ul>
  <li><code>/help</code> — See all available commands</li>
  <li><code>/clear</code> — Reset the conversation (start fresh)</li>
  <li><code>/compact</code> — Summarize a long conversation to free up memory</li>
</ul>

<div class="exercise">
  <h4>Exercise 4.1: Bad Prompt vs Good Prompt (7 min)</h4>
  <ol>
    <li>Start Claude Code in your <code>bootcamp-practice</code> folder</li>
    <li>Try this bad prompt: <em>"make a website"</em></li>
    <li>See how Claude Code has to guess what you want</li>
    <li>Now try this good prompt: <em>"Create a single HTML file called hello.html with a centered heading that says 'My First Page', a paragraph that introduces me (use placeholder text), and make the background light blue using inline CSS"</em></li>
    <li>Compare the results — which was more useful?</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 4.2: The Refinement Loop (7 min)</h4>
  <ol>
    <li>Look at the page Claude Code created</li>
    <li>Ask: <em>"Change the heading color to dark red"</em></li>
    <li>Then: <em>"Add a bulleted list of 3 hobbies below the paragraph"</em></li>
    <li>Then: <em>"Make the font larger and use the Arial font family"</em></li>
    <li>This is the refinement loop — start rough, then iterate!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 4.3: Explore Slash Commands (6 min)</h4>
  <ol>
    <li>Type <code>/help</code> to see all available commands</li>
    <li>Try <code>/clear</code> to reset the conversation</li>
    <li>Ask the tutor: <em>"What are the 5 most useful slash commands for beginners?"</em></li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>What makes a prompt "good"?</li>
    <li>What does <code>/compact</code> do and when would you use it?</li>
  </ul>
</div>`,
    questions: [
      'What are the four parts of a good prompt?',
      'What does the /compact command do and when would you use it?'
    ]
  },
  {
    id: 5,
    title: 'File Operations',
    duration: '20 min',
    description: 'Learn how Claude Code reads, creates, and edits real files on your computer.',
    tutorContext: `You are helping with Module 5: "File Operations — Reading, Creating, Editing"

This module covers:
- How Claude Code reads existing files
- Creating new files by describing what you want
- Editing files by telling Claude Code what to change
- Understanding file paths and working directories
- The permission model (Claude Code asks before modifying files)

The student is working on these exercises:
1. Ask Claude Code to list and read files
2. Create new files (text file and JSON file)
3. Edit existing files and review diffs

Key concepts to reinforce:
- Claude Code always asks permission before modifying files
- File paths are like addresses for files on your computer
- The working directory is the folder you're "in" when you start Claude Code
- You describe WHAT you want changed, not HOW to change it`,
    content: `
<h2>Working with Real Files</h2>
<p>This is where Claude Code becomes really powerful. Instead of just chatting, it can work with real files on your computer — reading, creating, and editing them.</p>

<h3>Key Concepts</h3>
<ul>
  <li><strong>File path:</strong> The address of a file (e.g., <code>/Users/you/Documents/hello.html</code>)</li>
  <li><strong>Working directory:</strong> The folder you're "in" when you start Claude Code</li>
  <li><strong>Permission model:</strong> Claude Code always asks before modifying your files</li>
</ul>

<div class="exercise">
  <h4>Exercise 5.1: Read Existing Files (5 min)</h4>
  <ol>
    <li>Make sure you're in <code>bootcamp-practice</code> with the files from Module 4</li>
    <li>Start Claude Code</li>
    <li>Ask: <em>"What files are in this folder?"</em></li>
    <li>Ask: <em>"Read hello.html and explain what each part does"</em></li>
    <li>Notice how Claude Code reads your actual file and gives a specific explanation</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 5.2: Create New Files (7 min)</h4>
  <ol>
    <li>Ask: <em>"Create a file called about-me.txt with a short bio. Use my name [your name] and make up some fun facts"</em></li>
    <li>Claude Code will show you the content and ask permission — say yes</li>
    <li>Ask: <em>"Now create a file called shopping-list.json with 5 grocery items in JSON format"</em></li>
    <li>Check your folder — these are real files now!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 5.3: Edit Files (8 min)</h4>
  <ol>
    <li>Ask: <em>"Open about-me.txt and add a section called 'Goals' with 3 goals for this bootcamp"</em></li>
    <li>Review the diff (changes shown). Say yes to apply.</li>
    <li>Ask: <em>"In shopping-list.json, add prices to each item and add 2 more items"</em></li>
    <li>Ask: <em>"Read both files back to me so I can verify the changes"</em></li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>Why does Claude Code show you changes before applying them?</li>
    <li>What is a "working directory"?</li>
  </ul>
</div>`,
    questions: [
      'Why does Claude Code show you changes before applying them to your files?',
      'What is a "working directory" and why does it matter?'
    ]
  },
  {
    id: 6,
    title: 'Building a Simple Web Page',
    duration: '25 min',
    description: 'Build a real personal portfolio page entirely by giving instructions to Claude Code.',
    tutorContext: `You are helping with Module 6: "Building a Simple Web Page with Claude Code"

This module covers:
- What HTML is (the structure of a web page)
- What CSS is (the styling — colors, fonts, layout)
- Iterative development: build basic first, then improve
- Building a personal portfolio page from scratch

The student is working on these exercises:
1. Create a complete portfolio page with a single prompt
2. Customize colors, text, and add hover effects
3. Add JavaScript interactivity (form alert, dark mode toggle)

Key concepts to reinforce:
- HTML = skeleton/structure, CSS = styling, JavaScript = interactivity
- The workflow: prompt → review → approve → test in browser → refine
- You can open HTML files directly in a browser by double-clicking them
- Iterative development is how professionals work too`,
    content: `
<h2>Build a Real Web Page!</h2>
<p>Time for the fun part — building a real, functional web page! You'll create a personal portfolio entirely by giving instructions to Claude Code. No coding knowledge required.</p>

<h3>Quick Concepts</h3>
<ul>
  <li><strong>HTML:</strong> The skeleton/structure of a web page</li>
  <li><strong>CSS:</strong> The styling (colors, fonts, layout)</li>
  <li><strong>JavaScript:</strong> The interactivity (buttons, animations)</li>
</ul>

<div class="exercise">
  <h4>Exercise 6.1: Create the Basic Page (8 min)</h4>
  <ol>
    <li>In your <code>bootcamp-practice</code> folder, start Claude Code</li>
    <li>Give this prompt: <em>"Create a personal portfolio web page called portfolio.html. Include: a navigation bar with links to About, Projects, and Contact sections. A hero section with my name in large text and a subtitle. An About section with a paragraph. A Projects section with 3 placeholder project cards. A Contact section with a form (name, email, message). Use modern CSS with a dark navy and white color scheme. Put all CSS in a style tag. Make it responsive."</em></li>
    <li>Say yes when Claude Code creates the file</li>
    <li>Open the file in your browser (double-click it)</li>
    <li>Look at what you just built with a single prompt!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 6.2: Customize It (10 min)</h4>
  <ol>
    <li>Ask: <em>"Change the color scheme to [your favorite color] and white"</em></li>
    <li>Ask: <em>"Replace the placeholder About text with: [write 2-3 sentences about yourself]"</em></li>
    <li>Ask: <em>"Make the project cards lift up with a shadow on hover"</em></li>
    <li>Ask: <em>"Add smooth scrolling when clicking navigation links"</em></li>
    <li>Refresh your browser after each change!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 6.3: Add Interactivity (7 min)</h4>
  <ol>
    <li>Ask: <em>"Add a JavaScript function that shows an alert saying 'Thank you!' when the contact form is submitted. Prevent actual submission."</em></li>
    <li>Ask: <em>"Add a dark mode toggle button in the nav that switches themes"</em></li>
    <li>Test both features in your browser</li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>What is the workflow? (prompt → review → approve → test → refine)</li>
    <li>Could you describe any web page to Claude Code and have it build it?</li>
  </ul>
</div>`,
    questions: [
      'Describe the iterative development workflow when building with Claude Code.',
      'What are the three main web technologies (HTML, CSS, JavaScript) and what does each one do?'
    ]
  },
  {
    id: 7,
    title: 'Working with Git & GitHub',
    duration: '20 min',
    description: 'Learn version control basics and push your code to GitHub using Claude Code.',
    tutorContext: `You are helping with Module 7: "Working with Git & GitHub"

This module covers:
- What Git is (version control — "save game" for code)
- What a repository, commit, and push are
- What GitHub is (cloud backup for your code)
- Using Claude Code to run Git commands in plain English

The student is working on these exercises:
1. Initialize a Git repo and make an initial commit
2. Make changes, commit them, view the log
3. Create a GitHub repo and push code

Key concepts to reinforce:
- Git tracks every change to your files, like a detailed undo history
- A commit is a snapshot — you can always go back to it
- GitHub stores your code in the cloud so it's safe and shareable
- Claude Code handles all the Git commands for you — just describe what you want`,
    content: `
<h2>Version Control with Git & GitHub</h2>
<p>Git is like a "save game" system for your code. GitHub is the cloud backup. Claude Code can do all the Git commands for you — just tell it what you want in plain English.</p>

<h3>Key Terms</h3>
<ul>
  <li><strong>Git:</strong> Tracks every change to your files</li>
  <li><strong>Repository (repo):</strong> A project folder tracked by Git</li>
  <li><strong>Commit:</strong> A saved snapshot of your project</li>
  <li><strong>GitHub:</strong> A website that stores your repos in the cloud</li>
  <li><strong>Push:</strong> Upload your commits to GitHub</li>
</ul>

<div class="exercise">
  <h4>Exercise 7.1: Initialize a Git Repo (5 min)</h4>
  <ol>
    <li>Make sure you're in <code>bootcamp-practice</code> with Claude Code running</li>
    <li>Ask: <em>"Initialize a Git repository and commit all current files"</em></li>
    <li>Claude Code will run git init, git add, and git commit for you</li>
    <li>Ask: <em>"Show me the Git log"</em></li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 7.2: Make Changes and Commit (7 min)</h4>
  <ol>
    <li>Ask: <em>"Add a footer to portfolio.html that says 'Built at Claude Code Bootcamp 2026'"</em></li>
    <li>Then: <em>"Commit this change with the message 'Add footer to portfolio'"</em></li>
    <li>Ask: <em>"Show me the Git log again"</em> — notice there are now two commits</li>
    <li>Ask: <em>"Show me the difference between the two commits"</em></li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 7.3: Push to GitHub (8 min)</h4>
  <ol>
    <li>Go to github.com, create a new empty repository called <code>bootcamp-practice</code></li>
    <li>Ask Claude Code: <em>"Add a remote origin pointing to my GitHub repo and push all commits"</em></li>
    <li>Refresh your GitHub page — your code is now online!</li>
    <li>Ask: <em>"Create a README.md that describes this project, then commit and push it"</em></li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>What is the difference between a commit and a push?</li>
    <li>Why is version control useful?</li>
  </ul>
</div>`,
    questions: [
      'What is the difference between a commit and a push?',
      'Why is version control useful when building software?'
    ]
  },
  {
    id: 8,
    title: 'Tips, Tricks & Next Steps',
    duration: '20 min',
    description: 'Power user tips, common pitfalls, and planning your next project.',
    tutorContext: `You are helping with Module 8: "Tips, Tricks & Next Steps"

This module covers:
- CLAUDE.md files (standing instructions for Claude Code)
- Context window management (/compact)
- Debugging with Claude Code
- Planning your next project

The student is working on these exercises:
1. Create a CLAUDE.md file and see how it affects Claude Code's behavior
2. Learn power user tips from the tutor
3. Plan their next project with Claude Code's help

Key concepts to reinforce:
- CLAUDE.md is a special file that gives Claude Code standing instructions for your project
- /compact helps when conversations get very long
- When code has errors, just paste the error message and ask Claude Code to fix it
- The best way to learn is to build real projects that interest you`,
    content: `
<h2>Level Up Your Claude Code Skills</h2>
<p>You've learned the fundamentals! Now let's talk about power user tips, common pitfalls, and what to build next.</p>

<h3>CLAUDE.md — Your Project Instructions</h3>
<p>A <code>CLAUDE.md</code> file in your project folder gives Claude Code standing instructions. It reads this file automatically every time you start a session.</p>

<h3>Managing Long Conversations</h3>
<p>Claude Code has a "context window" — it can only process so much text at once. Use <code>/compact</code> to summarize and free up space.</p>

<div class="exercise">
  <h4>Exercise 8.1: Create a CLAUDE.md File (7 min)</h4>
  <ol>
    <li>Start Claude Code in <code>bootcamp-practice</code></li>
    <li>Ask: <em>"Create a CLAUDE.md file for this project. Include: this is a beginner's portfolio project, it uses HTML/CSS/JS with no frameworks, the main file is portfolio.html, and code style should be simple with lots of comments"</em></li>
    <li>Ask: <em>"Now add detailed code comments to every section of portfolio.html"</em></li>
    <li>Notice how Claude Code follows the CLAUDE.md instructions!</li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 8.2: Power User Tips (6 min)</h4>
  <ol>
    <li>Ask the tutor: <em>"What are the top 10 tips for using Claude Code effectively?"</em></li>
    <li>Ask: <em>"What are the most common mistakes beginners make?"</em></li>
    <li>Ask: <em>"How do I use Claude Code for debugging when my code has errors?"</em></li>
  </ol>
</div>

<div class="exercise">
  <h4>Exercise 8.3: Plan Your Next Project (7 min)</h4>
  <ol>
    <li>Think of something you want to build (a blog, a game, a tool for work)</li>
    <li>Ask Claude Code: <em>"Help me plan a project for [your idea]. What files would I need? What technology should I use? Give me a step-by-step plan."</em></li>
    <li>Save the plan: <em>"Save that project plan to a file called next-project-plan.md"</em></li>
  </ol>
</div>

<div class="check-understanding">
  <h4>Check Your Understanding</h4>
  <ul>
    <li>What goes in a CLAUDE.md file?</li>
    <li>When should you use <code>/compact</code>?</li>
    <li>What will you build first after this bootcamp?</li>
  </ul>
</div>

<h3>Congratulations!</h3>
<p>You've completed the Claude Code Bootcamp! You now know how to:</p>
<ul>
  <li>Install and set up Claude Code</li>
  <li>Write effective prompts</li>
  <li>Create, read, and edit files</li>
  <li>Build web pages from scratch</li>
  <li>Use Git and GitHub for version control</li>
  <li>Configure projects with CLAUDE.md</li>
</ul>
<p>The best way to keep learning? <strong>Build something!</strong> Pick a project that excites you and start building with Claude Code today.</p>`,
    questions: [
      'What is a CLAUDE.md file and how does Claude Code use it?',
      'When should you use /compact and why?',
      'What is the first project you plan to build after this bootcamp and why?'
    ]
  }
];

module.exports = modules;
